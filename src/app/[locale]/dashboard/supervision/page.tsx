import { getCurrentUser } from "@/lib/auth";
import { redirect, Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect as nextRedirect } from "next/navigation";
import { Banknote, Eye, HardHat, Wallet, CheckCircle2, Briefcase } from "lucide-react";
import { createSupervisionPayment } from "@/lib/payment";

const prisma = db as any;

async function createSupervisionRequest(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user || user.role !== "OWNER") return;

  const projectId = formData.get("projectId") as string;
  const locale = (formData.get("locale") as string) || "ar";
  if (!projectId) return;

  try {
    const existing = await prisma.supervisionRequest.findFirst({ where: { projectId, requestedBy: user.id } });
    if (existing) return;

    const session = await createSupervisionPayment(
      user.id,
      projectId,
      user.email,
      user.email.split("@")[0],
      locale,
    );

    if (session.paymentUrl) {
      nextRedirect(session.paymentUrl);
    }
    nextRedirect(`/${locale}/dashboard/supervision?paymentError=supervision_request_failed`);
  } catch (error) {
    console.error('[createSupervisionRequest] DB query failed:', error);
    nextRedirect(`/${locale}/dashboard/supervision?paymentError=supervision_request_failed`);
  }

  revalidatePath("/dashboard/supervision");
}

async function createSupervisionRequestFromWallet(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user || user.role !== "OWNER") return;

  const projectId = formData.get("projectId") as string;
  const locale = (formData.get("locale") as string) || "ar";
  if (!projectId) return;

  try {
    const existing = await prisma.supervisionRequest.findFirst({ where: { projectId, requestedBy: user.id } });
    if (existing) return;

    const walletTx = await prisma.walletTransaction.findMany({ where: { userId: user.id, status: "completed" } });
    const balance = walletTx.reduce((sum: number, tx: any) => sum + (tx.type === "FUND" ? tx.amount : tx.type === "DEDUCT" ? -tx.amount : 0), 0);
    if (balance < 150) {
      nextRedirect(`/${locale}/dashboard/supervision?paymentError=owner_wallet_low`);
    }

    await prisma.supervisionRequest.create({
      data: { projectId, requestedBy: user.id, requestFee: 150, status: "OPEN" },
    });

    await prisma.walletTransaction.create({
      data: {
        userId: user.id,
        type: "DEDUCT",
        amount: 150,
        purpose: "SUPERVISION_REQUEST_FEE",
        referenceId: projectId,
        status: "completed",
      },
    });

    const supervisors = await prisma.engineerProfile.findMany({
      where: { specialization: { in: ["SUPERVISOR", "BOTH"] }, verificationStatus: "VERIFIED" },
      select: { userId: true },
    });

    if (supervisors.length > 0) {
      await prisma.notification.createMany({
        data: supervisors.map((sup: any) => ({
          userId: sup.userId,
          type: "GENERAL",
          title: "New supervision request",
          titleAr: "طلب إشراف جديد",
          message: "A new project needs supervision. Check it out!",
          messageAr: "مشروع جديد يحتاج إشراف. تحقق منه!",
          link: "/dashboard/supervision",
        })),
      });
    }

    nextRedirect(`/${locale}/dashboard/supervision?payment=wallet_success`);
  } catch (error) {
    console.error('[createSupervisionRequestFromWallet] DB query failed:', error);
    nextRedirect(`/${locale}/dashboard/supervision?paymentError=supervision_request_failed`);
  }
}

async function submitSupervisionBid(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user || user.role !== "ENGINEER") return;

  const requestId = formData.get("requestId") as string;
  const proposedFee = parseFloat(formData.get("proposedFee") as string);
  const estimatedDuration = parseInt(formData.get("estimatedDuration") as string) || null;
  const proposalText = ((formData.get("proposalText") as string) || "").trim() || null;

  if (!requestId || !Number.isFinite(proposedFee) || proposedFee <= 0) return;

  try {
    const [request, engineer] = await Promise.all([
      prisma.supervisionRequest.findUnique({ where: { id: requestId } }),
      prisma.engineerProfile.findUnique({ where: { userId: user.id } }),
    ]);

    if (!request || request.status !== "OPEN" || !engineer) return;
    if (engineer.verificationStatus !== "VERIFIED") return;
    if (!["SUPERVISOR", "BOTH"].includes(engineer.specialization)) return;
    if (engineer.walletBalance < 500 || engineer.supervisionBidCredits < 1) return;

    const existingBid = await prisma.supervisionBid.findUnique({
      where: { supervisionRequestId_engineerId: { supervisionRequestId: requestId, engineerId: engineer.id } },
    });
    if (existingBid) return;

    await prisma.supervisionBid.create({
      data: {
        supervisionRequestId: requestId,
        engineerId: engineer.id,
        proposedFee,
        estimatedDuration,
        proposalText,
        status: "SUBMITTED",
        creditsUsed: 1,
      },
    });

    await prisma.engineerProfile.update({
      where: { id: engineer.id },
      data: { supervisionBidCredits: { decrement: 1 } },
    });

    await prisma.notification.create({
      data: {
        userId: request.requestedBy,
        type: "GENERAL",
        title: "New supervision bid received",
        titleAr: "تم استلام عرض إشراف جديد",
        message: "A supervisor submitted a bid on your supervision request.",
        messageAr: "قام مهندس مشرف بتقديم عرض على طلب الإشراف الخاص بك.",
        link: "/dashboard/supervision",
      },
    });
  } catch (error) {
    console.error('[submitSupervisionBid] DB query failed:', error);
  }

  revalidatePath("/dashboard/supervision");
}

async function awardSupervisionBid(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user || user.role !== "OWNER") return;

  const requestId = formData.get("requestId") as string;
  const bidId = formData.get("bidId") as string;
  if (!requestId || !bidId) return;

  try {
    const request = await prisma.supervisionRequest.findUnique({
      where: { id: requestId },
      include: {
        bids: {
          include: {
            engineer: {
              select: {
                id: true,
                userId: true,
                fullName: true,
                fullNameAr: true,
                specialization: true,
                yearsExperience: true,
                ratingAverage: true,
                reviewCount: true,
                walletBalance: true,
              },
            },
          },
        },
      },
    });

    if (!request || request.requestedBy !== user.id || request.status !== "OPEN") return;

    const winningBid = request.bids.find((bid: any) => bid.id === bidId && bid.status === "SUBMITTED");
    if (!winningBid || !winningBid.engineer || winningBid.engineer.walletBalance < 500) return;

    await prisma.engineerProfile.update({
      where: { id: winningBid.engineer.id },
      data: { walletBalance: { decrement: 500 } },
    });

    await prisma.walletTransaction.create({
      data: {
        userId: winningBid.engineer.userId,
        type: "DEDUCT",
        amount: 500,
        purpose: "SUPERVISION_WIN_FEE",
        referenceId: requestId,
        status: "completed",
      },
    });

    await prisma.supervisionRequest.update({
      where: { id: requestId },
      data: {
        status: "ASSIGNED",
        assignedTo: winningBid.engineer.userId,
        awardedBidId: winningBid.id,
      },
    });

    await prisma.supervisionBid.updateMany({
      where: { supervisionRequestId: requestId, id: { not: winningBid.id } },
      data: { status: "REJECTED" },
    });

    await prisma.supervisionBid.update({
      where: { id: winningBid.id },
      data: { status: "AWARDED", awardedAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        userId: winningBid.engineer.userId,
        type: "GENERAL",
        title: "You won the supervision request",
        titleAr: "لقد فزت بطلب الإشراف",
        message: "Your supervision bid has been selected. 500 SAR was charged from your wallet.",
        messageAr: "تم اختيار عرض الإشراف الخاص بك. تم خصم 500 ر.س من محفظتك.",
        link: "/dashboard/supervision",
      },
    });

    const losingUserIds = request.bids
      .filter((bid: any) => bid.id !== winningBid.id)
      .map((bid: any) => bid.engineer?.userId)
      .filter(Boolean) as string[];

    if (losingUserIds.length > 0) {
      await prisma.notification.createMany({
        data: losingUserIds.map((userId) => ({
          userId,
          type: "GENERAL",
          title: "Another supervision bid was selected",
          titleAr: "تم اختيار عرض إشراف آخر",
          message: "Your bid was not selected for this supervision request. Your used bid credit remains consumed.",
          messageAr: "لم يتم اختيار عرضك لطلب الإشراف هذا. تم استهلاك رصيد العرض المستخدم فقط.",
          link: "/dashboard/supervision",
        })),
      });
    }
  } catch (error) {
    console.error('[awardSupervisionBid] DB query failed:', error);
  }

  revalidatePath("/dashboard/supervision");
}

function formatDate(date: Date | string, locale: string) {
  return new Date(date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US");
}

export default async function SupervisionPage({
  searchParams,
}: {
  searchParams?: Promise<{ paymentError?: string; payment?: string }>;
}) {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/auth/login", locale });
  const isRtl = locale === "ar";
  const params = (await searchParams) || {};

  const isOwner = user.role === "OWNER";
  const isEngineer = user.role === "ENGINEER";

  let ownerProjects: any[] = [];
  let ownerRequests: any[] = [];
  let openRequests: any[] = [];
  let engineerProfile: any = null;
  let ownerWalletBalance = 0;

  try {
    if (isOwner) {
      const ownerProfile = await prisma.ownerProfile.findUnique({ where: { userId: user.id } });
      if (ownerProfile) {
        ownerProjects = await prisma.project.findMany({
          where: { ownerId: ownerProfile.id, status: { in: ["AWARDED", "IN_PROGRESS"] } },
          select: { id: true, title: true, titleAr: true },
        });
      }
      ownerRequests = await prisma.supervisionRequest.findMany({
        where: { requestedBy: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          project: {
            select: { id: true, title: true, titleAr: true, description: true, descriptionAr: true, status: true },
          },
          bids: {
            orderBy: { submittedAt: "desc" },
            include: {
              engineer: {
                select: {
                  id: true,
                  userId: true,
                  fullName: true,
                  fullNameAr: true,
                  specialization: true,
                  yearsExperience: true,
                  ratingAverage: true,
                  reviewCount: true,
                  walletBalance: true,
                },
              },
            },
          },
        },
      });

      const ownerWalletTx = await prisma.walletTransaction.findMany({ where: { userId: user.id, status: "completed" } });
      ownerWalletBalance = ownerWalletTx.reduce((sum: number, tx: any) => sum + (tx.type === "FUND" ? tx.amount : tx.type === "DEDUCT" ? -tx.amount : 0), 0);
    }

    if (isEngineer) {
      engineerProfile = await prisma.engineerProfile.findUnique({ where: { userId: user.id } });
      openRequests = await prisma.supervisionRequest.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          project: {
            select: {
              id: true,
              title: true,
              titleAr: true,
              description: true,
              descriptionAr: true,
              status: true,
              budgetMin: true,
              budgetMax: true,
              currency: true,
            },
          },
          bids: { select: { id: true, engineerId: true, status: true } },
        },
      });
    }
  } catch (error) {
    console.error('[SupervisionPage] DB query failed:', error);
  }

  const canEngineerBid =
    !!engineerProfile &&
    engineerProfile.verificationStatus === "VERIFIED" &&
    ["SUPERVISOR", "BOTH"].includes(engineerProfile.specialization) &&
    engineerProfile.walletBalance >= 500 &&
    engineerProfile.supervisionBidCredits > 0;
  const walletBlocked = !!engineerProfile && engineerProfile.walletBalance < 500;
  const creditsBlocked = !!engineerProfile && engineerProfile.supervisionBidCredits < 1;

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1C5963, #2A7B88)", padding: "2rem 0" }}>
        <div className="container-app">
          <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem", textDecoration: "none" }}>
            ← {isRtl ? "العودة" : "Back"}
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Eye style={{ width: "24px", height: "24px" }} />
            {isRtl ? "طلبات الإشراف" : "Supervision Requests"}
          </h1>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem", maxWidth: "1100px" }}>
        {params.paymentError && (
          <div className="card" style={{ padding: "1rem 1.25rem", marginBottom: "1rem", border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.25rem" }}>
              {isRtl ? "تعذر إنشاء طلب الإشراف" : "Unable to create supervision request"}
            </div>
            <div style={{ fontSize: "0.8125rem" }}>
              {params.paymentError === "owner_wallet_low"
                ? (isRtl ? "رصيد المحفظة غير كافٍ. أضف 150 ر.س أو ادفع عبر بوابة الدفع." : "Wallet balance is insufficient. Add 150 SAR or pay through the payment gateway.")
                : (isRtl ? "تعذر بدء أو إتمام عملية الدفع الخاصة بطلب الإشراف. تحقق من إعدادات الدفع ثم حاول مرة أخرى." : "Could not start or complete the supervision request payment. Please verify payment configuration and try again.")}
            </div>
          </div>
        )}

        {params.payment && (
          <div className="card" style={{ padding: "1rem 1.25rem", marginBottom: "1rem", border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>
              {params.payment === "wallet_success"
                ? (isRtl ? "تم إنشاء طلب الإشراف بنجاح والدفع من المحفظة." : "Supervision request created successfully and paid from wallet.")
                : (isRtl ? "تمت معالجة الدفع بنجاح." : "Payment was processed successfully.")}
            </div>
          </div>
        )}

        {isOwner && (
          <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
                {isRtl ? "طلب إشراف جديد" : "Request New Supervision"}
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                {isRtl ? "رسوم الطلب 150 ر.س — سيتم إشعار المهندسين المشرفين المؤهلين" : "Request fee is 150 SAR — eligible supervisor engineers will be notified"}
              </p>
              <div style={{ marginBottom: "1rem", padding: "0.875rem 1rem", borderRadius: "var(--radius-md)", background: ownerWalletBalance >= 150 ? "#ecfdf5" : "#fff7ed", color: ownerWalletBalance >= 150 ? "#166534" : "#9a3412", fontSize: "0.875rem", fontWeight: 700 }}>
                {isRtl ? `رصيد المحفظة الحالي: ${Math.max(0, ownerWalletBalance).toLocaleString()} ر.س` : `Current wallet balance: ${Math.max(0, ownerWalletBalance).toLocaleString()} SAR`}
              </div>
              {ownerProjects.length === 0 ? (
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  {isRtl ? "لا توجد مشاريع مرسّاة أو قيد التنفيذ يمكن طلب إشراف لها حالياً." : "No awarded or in-progress projects are currently eligible for supervision requests."}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {ownerProjects.map((p: any) => {
                    const existing = ownerRequests.find((r: any) => r.projectId === p.id);
                    return (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>
                          {isRtl ? (p.titleAr || p.title) : p.title}
                        </span>
                        {existing ? (
                          <span className={`chip chip-${existing.status === "ASSIGNED" ? "success" : "warning"}`}>
                            {isRtl ? `تم إنشاء الطلب (${existing.status})` : `Request Created (${existing.status})`}
                          </span>
                        ) : (
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            {ownerWalletBalance >= 150 && (
                              <form action={createSupervisionRequestFromWallet} style={{ display: "inline" }}>
                                <input type="hidden" name="projectId" value={p.id} />
                                <input type="hidden" name="locale" value={locale} />
                                <button type="submit" className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>
                                  <Wallet style={{ width: "14px", height: "14px" }} /> {isRtl ? "ادفع من المحفظة" : "Pay from Wallet"}
                                </button>
                              </form>
                            )}
                            <form action={createSupervisionRequest} style={{ display: "inline" }}>
                              <input type="hidden" name="projectId" value={p.id} />
                              <input type="hidden" name="locale" value={locale} />
                              <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>
                                <Banknote style={{ width: "14px", height: "14px" }} /> 150 {isRtl ? "ر.س" : "SAR"}
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
        )}

        {isEngineer && engineerProfile && (
          <div className="card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem", background: "linear-gradient(135deg, rgba(42,123,136,0.08), rgba(37,99,235,0.06))" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
                  {isRtl ? "جاهزية عروض الإشراف" : "Supervision Bid Readiness"}
                </div>
                <div style={{ marginTop: "0.35rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  {isRtl ? `الرصيد: ${engineerProfile.walletBalance.toLocaleString()} ر.س • عروض متبقية: ${engineerProfile.supervisionBidCredits}` : `Wallet: ${engineerProfile.walletBalance.toLocaleString()} SAR • Remaining bid credits: ${engineerProfile.supervisionBidCredits}`}
                </div>
              </div>
              <Link href="/dashboard/wallet" className="btn-secondary" style={{ textDecoration: "none" }}>
                <Wallet style={{ width: "14px", height: "14px" }} />
                {isRtl ? "إدارة المحفظة والعروض" : "Manage Wallet & Credits"}
              </Link>
            </div>

            {!canEngineerBid && (
              <div style={{ marginTop: "1rem", padding: "0.875rem 1rem", borderRadius: "var(--radius-md)", background: walletBlocked ? "#fef2f2" : "#fff7ed", color: walletBlocked ? "#b91c1c" : "#9a3412", fontSize: "0.875rem", fontWeight: 600 }}>
                {walletBlocked
                  ? (isRtl ? "أضف 500 ر.س إلى محفظتك لتقديم عرض." : "Add 500 SAR to your wallet to bid")
                  : creditsBlocked
                    ? (isRtl ? "ليس لديك عروض إشراف متبقية. اشترِ باقة جديدة للمتابعة." : "You have no supervision bid credits left. Buy a new pack to continue.")
                    : (isRtl ? "يلزم التحقق من الحساب وتخصص مشرف/كلاهما لتقديم عروض إشراف." : "Verified supervisor or both specialization is required to place supervision bids.")}
              </div>
            )}
          </div>
        )}

        {isOwner && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {ownerRequests.length === 0 ? (
              <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)" }}>{isRtl ? "لا توجد طلبات إشراف بعد." : "No supervision requests yet."}</p>
              </div>
            ) : ownerRequests.map((request: any) => (
              <div key={request.id} className="card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text)" }}>
                      {isRtl ? (request.project?.titleAr || request.project?.title) : request.project?.title}
                    </div>
                    <div style={{ marginTop: "0.375rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                      {formatDate(request.createdAt, locale)} • {isRtl ? `رسوم الطلب ${request.requestFee} ر.س` : `Request fee ${request.requestFee} SAR`}
                    </div>
                  </div>
                  <span className={`chip chip-${request.status === "ASSIGNED" ? "success" : "warning"}`}>{request.status}</span>
                </div>

                <div style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {isRtl ? (request.project?.descriptionAr || request.project?.description) : request.project?.description}
                </div>

                {request.bids.length === 0 ? (
                  <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", padding: "0.75rem 0" }}>
                    {isRtl ? "لا توجد عروض بعد." : "No bids yet."}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {request.bids.map((bid: any) => (
                      <div key={bid.id} style={{ padding: "1rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)", border: bid.status === "AWARDED" ? "1px solid rgba(42,123,136,0.35)" : "1px solid transparent" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)" }}>
                              {isRtl ? (bid.engineer?.fullNameAr || bid.engineer?.fullName) : bid.engineer?.fullName}
                            </div>
                            <div style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {bid.engineer?.specialization} • {isRtl ? `خبرة ${bid.engineer?.yearsExperience || 0} سنة` : `${bid.engineer?.yearsExperience || 0} years experience`} • {isRtl ? `تقييم ${Number(bid.engineer?.ratingAverage || 0).toFixed(1)}` : `Rating ${Number(bid.engineer?.ratingAverage || 0).toFixed(1)}`}
                            </div>
                          </div>
                          <div style={{ textAlign: "end" }}>
                            <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary)" }}>
                              {bid.proposedFee.toLocaleString()} {isRtl ? "ر.س" : "SAR"}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {bid.estimatedDuration ? `${bid.estimatedDuration} ${isRtl ? "يوم" : "days"}` : (isRtl ? "بدون مدة محددة" : "No timeline")}
                            </div>
                          </div>
                        </div>

                        {bid.proposalText && (
                          <div style={{ marginTop: "0.75rem", fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                            {bid.proposalText}
                          </div>
                        )}

                        <div style={{ marginTop: "0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                          <span className={`chip chip-${bid.status === "AWARDED" ? "success" : bid.status === "REJECTED" ? "default" : "info"}`}>{bid.status}</span>
                          {request.status === "OPEN" && bid.status === "SUBMITTED" && (
                            <form action={awardSupervisionBid}>
                              <input type="hidden" name="requestId" value={request.id} />
                              <input type="hidden" name="bidId" value={bid.id} />
                              <button type="submit" className="btn-primary" style={{ padding: "0.55rem 1rem", fontSize: "0.8125rem" }}>
                                <CheckCircle2 style={{ width: "14px", height: "14px" }} />
                                {isRtl ? "اختيار هذا العرض" : "Award This Bid"}
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isEngineer && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {openRequests.length === 0 ? (
              <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)" }}>{isRtl ? "لا توجد طلبات إشراف مفتوحة حالياً." : "No open supervision requests at this time."}</p>
              </div>
            ) : openRequests.map((req: any) => {
              const alreadyBid = req.bids.some((bid: any) => bid.engineerId === engineerProfile?.id);
              return (
                <div key={req.id} className="card" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                        <HardHat style={{ width: "18px", height: "18px", color: "var(--accent)" }} />
                        <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text)" }}>
                          {isRtl ? (req.project?.titleAr || req.project?.title) : req.project?.title}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        {formatDate(req.createdAt, locale)} • {isRtl ? `رسوم المالك ${req.requestFee} ر.س` : `Owner fee ${req.requestFee} SAR`} • {isRtl ? `${req.bids.length} عروض حتى الآن` : `${req.bids.length} bids so far`}
                      </div>
                    </div>
                    <span className="chip chip-warning">OPEN</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                    <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{isRtl ? "حالة المشروع" : "Project Status"}</div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)", marginTop: "0.25rem" }}>{req.project?.status}</div>
                    </div>
                    <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{isRtl ? "الميزانية" : "Budget"}</div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)", marginTop: "0.25rem" }}>
                        {(req.project?.budgetMax || req.project?.budgetMin || 0).toLocaleString()} {req.project?.currency || "SAR"}
                      </div>
                    </div>
                    <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{isRtl ? "مطلوب للمشاركة" : "Required to Participate"}</div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: walletBlocked ? "var(--error)" : "var(--primary)", marginTop: "0.25rem" }}>
                        500 {isRtl ? "ر.س في المحفظة" : "SAR in wallet"}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                    {isRtl ? (req.project?.descriptionAr || req.project?.description) : req.project?.description}
                  </div>

                  {alreadyBid ? (
                    <div style={{ padding: "0.875rem 1rem", borderRadius: "var(--radius-md)", background: "#ecfdf5", color: "#166534", fontSize: "0.875rem", fontWeight: 700 }}>
                      {isRtl ? "لقد قمت بتقديم عرضك على هذا الطلب بالفعل." : "You have already submitted your bid on this request."}
                    </div>
                  ) : canEngineerBid ? (
                    <form action={submitSupervisionBid} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <input type="hidden" name="requestId" value={req.id} />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <input type="number" name="proposedFee" min="1" required placeholder={isRtl ? "قيمة العرض (ر.س)" : "Bid amount (SAR)"} />
                        <input type="number" name="estimatedDuration" min="1" placeholder={isRtl ? "المدة المتوقعة بالأيام" : "Estimated duration in days"} />
                      </div>
                      <textarea name="proposalText" rows={4} placeholder={isRtl ? "اكتب تفاصيل عرضك وخبرتك وخطة الإشراف..." : "Write your bid details, experience, and supervision plan..."} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {isRtl ? "سيتم استخدام عرض واحد من رصيد عروض الإشراف الخاص بك." : "One supervision bid credit will be consumed when you submit."}
                        </div>
                        <button type="submit" className="btn-primary" style={{ padding: "0.7rem 1.15rem", fontSize: "0.875rem" }}>
                          <Briefcase style={{ width: "15px", height: "15px" }} />
                          {isRtl ? "تقديم العرض" : "Submit Bid"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ padding: "0.875rem 1rem", borderRadius: "var(--radius-md)", background: walletBlocked ? "#fef2f2" : "#fff7ed", color: walletBlocked ? "#b91c1c" : "#9a3412", fontSize: "0.875rem", fontWeight: 600 }}>
                      {walletBlocked
                        ? (isRtl ? "أضف 500 ر.س إلى محفظتك لتقديم عرض." : "Add 500 SAR to your wallet to bid")
                        : creditsBlocked
                          ? (isRtl ? "ليس لديك عروض إشراف متبقية. اشترِ باقة جديدة أولاً." : "You have no supervision bid credits left. Buy a new pack first.")
                          : (isRtl ? "يلزم أن يكون حسابك موثّقاً وبتخصص مشرف/كلاهما لتقديم عرض." : "Your account must be verified with Supervisor/Both specialization to place a bid.")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
