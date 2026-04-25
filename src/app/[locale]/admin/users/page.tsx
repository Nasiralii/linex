import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Users, CheckCircle, XCircle, Clock, ShieldCheck, MessageSquare, Phone, Mail, Briefcase, Award, Globe, FileText, Image as ImageIcon } from "lucide-react";
import { calculateProfileScore } from "@/lib/ai";
import { getTranslations } from "next-intl/server";
import ActionButtons from "./action-buttons";
import RequestInfoForm from "./request-info-form";

export const dynamic = "force-dynamic";

// Admin user management — approve/reject/request info for ALL user types

// Show both DRAFT and PENDING so admin sees new signups before profile submission
// and users who have submitted for review after completing their profile
const REVIEWABLE_VERIFICATION_STATUSES = ["PENDING", "DRAFT"] as const;
const PENDING_VERIFICATION_STATUSES = ["PENDING", "DRAFT"] as const;

function formatProfileDocumentLabel(documentType: string, isRtl: boolean) {
  const labels: Record<string, { ar: string; en: string }> = {
    commercial_reg: { ar: "السجل التجاري", en: "Commercial Registration" },
    company_profile: { ar: "ملف تعريف الشركة", en: "Company Profile" },
    trade_license: { ar: "الرخصة التجارية", en: "Business License" },
    insurance: { ar: "شهادة التأمين", en: "Insurance Certificate" },
    tax_file: { ar: "الملف الضريبي", en: "Tax File" },
    bank_doc: { ar: "الوثيقة البنكية", en: "Bank Document" },
    eng_license: { ar: "الرخصة الهندسية", en: "Engineering License" },
    education: { ar: "المؤهلات التعليمية", en: "Educational Credentials" },
    prof_insurance: { ar: "التأمين المهني", en: "Professional Insurance" },
    certifications: { ar: "الشهادات", en: "Certifications" },
    gov_id: { ar: "الهوية الحكومية", en: "Government ID" },
  };
  const label = labels[documentType];
  return label ? (isRtl ? label.ar : label.en) : documentType.replace(/_/g, " ");
}

function getReviewStatusLabel(verificationStatus: string | null | undefined, rejectionReason: string | null | undefined, isRtl: boolean) {
  if (verificationStatus === "VERIFIED") return isRtl ? "موثّق" : "Verified";
  if (verificationStatus === "REJECTED") return isRtl ? "مرفوض" : "Rejected";
  if (verificationStatus === "PENDING" && rejectionReason) return isRtl ? "تعديلات مطلوبة" : "Changes Requested";
  if (verificationStatus === "DRAFT") return isRtl ? "مسودة" : "Draft";
  return isRtl ? "قيد المراجعة" : "Under Review";
}

function getPendingVerificationWhere(roleFilter: string) {
  // Show ALL users with PENDING verification regardless of profileComplete
  // so admin can see newly registered contractors/engineers/owners who need review
  return roleFilter === "CONTRACTOR"
    ? {
        role: "CONTRACTOR" as const,
        contractorProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } },
      }
    : roleFilter === "ENGINEER"
      ? {
          role: "ENGINEER" as const,
          engineerProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } },
        }
      : roleFilter === "OWNER"
        ? {
            role: "OWNER" as const,
            ownerProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } },
          }
        : {
            OR: [
              {
                role: "OWNER" as const,
                ownerProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } },
              },
              {
                role: "CONTRACTOR" as const,
                contractorProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } },
              },
              {
                role: "ENGINEER" as const,
                engineerProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } },
              },
            ],
          };
}

async function adminUserAction(formData: FormData) {
  "use server";
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return { error: "Unauthorized" };

  const userId = formData.get("userId") as string;
  const action = formData.get("action") as string;
  const adminNotes = formData.get("adminNotes") as string || "";

  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "User not found" };

    if (action === "approve") {
      await db.user.update({ where: { id: userId }, data: { status: "ACTIVE" } });
      if (user.role === "OWNER") {
        await db.ownerProfile.update({ where: { userId }, data: { verificationStatus: "VERIFIED", verifiedAt: new Date(), rejectionReason: null } });
      } else if (user.role === "CONTRACTOR") {
        await db.contractorProfile.update({ where: { userId }, data: { verificationStatus: "VERIFIED", verifiedAt: new Date() } });
      } else if (user.role === "ENGINEER") {
        await db.engineerProfile.update({ where: { userId }, data: { verificationStatus: "VERIFIED", verifiedAt: new Date() } });
      }
      await db.notification.create({
        data: {
          userId, type: "VERIFICATION_APPROVED",
          title: "Account Approved!", titleAr: "تم تفعيل حسابك!",
          message: "Your account has been verified and approved. You can now use all platform features.",
          messageAr: "تم التحقق من حسابك والموافقة عليه. يمكنك الآن استخدام جميع ميزات المنصة.",
          link: "/dashboard",
        },
      });
    } else if (action === "reject") {
      await db.user.update({ where: { id: userId }, data: { status: "DEACTIVATED" } });
      if (user.role === "OWNER") {
        await db.ownerProfile.update({ where: { userId }, data: { verificationStatus: "REJECTED", rejectionReason: adminNotes || "Does not meet requirements" } });
      } else if (user.role === "CONTRACTOR") {
        await db.contractorProfile.update({ where: { userId }, data: { verificationStatus: "REJECTED", rejectionReason: adminNotes || "Does not meet requirements" } });
      } else if (user.role === "ENGINEER") {
        await db.engineerProfile.update({ where: { userId }, data: { verificationStatus: "REJECTED", rejectionReason: adminNotes || "Does not meet requirements" } });
      }
      await db.notification.create({
        data: {
          userId, type: "GENERAL",
          title: "Account Rejected", titleAr: "تم رفض حسابك",
          message: adminNotes || "Your account registration was rejected.",
          messageAr: adminNotes || "تم رفض تسجيل حسابك.",
        },
      });
    } else if (action === "request_info") {
      if (user.role === "OWNER") {
        await db.ownerProfile.update({ where: { userId }, data: { verificationStatus: "PENDING", rejectionReason: adminNotes } });
      } else if (user.role === "CONTRACTOR") {
        await db.contractorProfile.update({ where: { userId }, data: { verificationStatus: "PENDING", rejectionReason: adminNotes } });
      } else if (user.role === "ENGINEER") {
        await db.engineerProfile.update({ where: { userId }, data: { verificationStatus: "PENDING", rejectionReason: adminNotes } });
      }
      await db.notification.create({
        data: {
          userId, type: "GENERAL",
          title: "More Information Required", titleAr: "مطلوب معلومات إضافية",
          message: `Admin requested more information: ${adminNotes}`,
          messageAr: `طلب المسؤول معلومات إضافية: ${adminNotes}`,
          link: "/dashboard/profile",
        },
      });
    }

    await db.auditLog.create({
      data: { actorId: admin.id, action: `USER_${action.toUpperCase()}`, entityType: "user", entityId: userId, metadata: { notes: adminNotes } },
    });
    return { success: true };
  } catch (error) {
    console.error('[adminUserAction] DB query failed:', error);
    return { error: "Failed to process action" };
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const user = await getCurrentUser();
  const locale = await getLocale();
  const params = await searchParams;
  if (!user || user.role !== "ADMIN") return redirect({ href: "/dashboard", locale });
  const isRtl = locale === "ar";
  const roleFilter = params.role || "ALL";

  // Get pending users (ALL roles with PENDING verification)
  let pendingUsers: any[] = [];
  let activeUsers: any[] = [];
  const pendingRoleWhere = getPendingVerificationWhere(roleFilter);

  const activeRoleWhere =
    roleFilter === "CONTRACTOR"
      ? { status: "ACTIVE" as const, role: "CONTRACTOR" as const, contractorProfile: { is: { verificationStatus: "VERIFIED" } } }
      : roleFilter === "ENGINEER"
        ? { status: "ACTIVE" as const, role: "ENGINEER" as const, engineerProfile: { is: { verificationStatus: "VERIFIED" } } }
        : roleFilter === "OWNER"
          ? { status: "ACTIVE" as const, role: "OWNER" as const, ownerProfile: { is: { verificationStatus: "VERIFIED" } } }
          : {
              status: "ACTIVE" as const,
              role: { not: "ADMIN" as const },
              OR: [
                { role: "OWNER" as const, ownerProfile: { is: { verificationStatus: "VERIFIED" } } },
                { role: "CONTRACTOR" as const, contractorProfile: { is: { verificationStatus: "VERIFIED" } } },
                { role: "ENGINEER" as const, engineerProfile: { is: { verificationStatus: "VERIFIED" } } },
              ],
            };

  try {
    pendingUsers = await db.user.findMany({
      where: pendingRoleWhere as any,
      orderBy: [{ createdAt: "desc" }],
      include: {
        ownerProfile: true,
        contractorProfile: { include: { documents: true, portfolioItems: true } },
        engineerProfile: { include: { documents: true, portfolioItems: true } },
      },
    });

    activeUsers = await db.user.findMany({
      where: activeRoleWhere as any,
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        ownerProfile: { select: { fullName: true, fullNameAr: true, phone: true, city: true, companyType: true, verificationStatus: true, bio: true, projectPreferences: true } },
        contractorProfile: { select: { companyName: true, companyNameAr: true, phone: true, city: true, verificationStatus: true, yearsInBusiness: true, description: true, ratingAverage: true, reviewCount: true, website: true, teamSize: true } },
        engineerProfile: { select: { fullName: true, fullNameAr: true, phone: true, city: true, specialization: true, verificationStatus: true, yearsExperience: true, description: true, ratingAverage: true, reviewCount: true, website: true } },
      },
    });
  } catch (error) {
    console.error('[AdminUsersPage] DB query failed:', error);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "2rem 0" }}>
        <div className="container-app">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users style={{ width: "24px", height: "24px" }} />
            {isRtl ? "إدارة المستخدمين" : "User Management"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>
            {isRtl ? `${pendingUsers.length} بانتظار المراجعة` : `${pendingUsers.length} pending review`}
          </p>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {[
            { key: "ALL", ar: "الكل", en: "All" },
            { key: "CONTRACTOR", ar: "مقاول", en: "Contractors" },
            { key: "ENGINEER", ar: "مهندس", en: "Engineers" },
            { key: "OWNER", ar: "مالك مشروع", en: "Owners" },
          ].map((filter) => {
            const active = roleFilter === filter.key;
            const href = filter.key === "ALL" ? "/admin/users" : `/admin/users?role=${filter.key}`;
            return (
              <a key={filter.key} href={`/${locale}${href}`} style={{
                padding: "0.5rem 0.9rem", borderRadius: "var(--radius-full)", textDecoration: "none",
                fontSize: "0.8125rem", fontWeight: 700,
                color: active ? "white" : "var(--text-secondary)",
                background: active ? "var(--primary)" : "var(--surface-2)",
                border: "1px solid var(--border-light)",
              }}>
                {isRtl ? filter.ar : filter.en}
              </a>
            );
          })}
        </div>

        {/* Pending Users */}
        <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Clock style={{ width: "18px", height: "18px", color: "var(--accent)" }} />
          {isRtl ? "بانتظار المراجعة" : "Pending Review"}
          {pendingUsers.length > 0 && (
            <span style={{ background: "var(--error)", color: "white", padding: "0.125rem 0.5rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700 }}>
              {pendingUsers.length}
            </span>
          )}
        </h3>

        {pendingUsers.length === 0 ? (
          <div className="card" style={{ padding: "2rem", textAlign: "center", marginBottom: "2rem" }}>
            <CheckCircle style={{ width: "32px", height: "32px", color: "var(--primary)", margin: "0 auto 0.5rem" }} />
            <p style={{ color: "var(--text-muted)" }}>{isRtl ? "لا يوجد مستخدمين بانتظار الموافقة" : "No users pending review"}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            {pendingUsers.map((u: any) => {
              const isContractor = u.role === "CONTRACTOR";
              const isEngineer = u.role === "ENGINEER";
              const profile = isContractor ? u.contractorProfile : isEngineer ? u.engineerProfile : u.ownerProfile;
              const name = profile?.companyName || profile?.fullName || u.email;
              const phone = profile?.phone || "—";
              const spec = profile?.specialization || "";
              const years = profile?.yearsInBusiness || profile?.yearsExperience || "—";
              const adminNotes = profile?.rejectionReason || "";
              const documents = profile?.documents || [];
              const portfolioItems = profile?.portfolioItems || [];
              const isProfileComplete = profile?.profileComplete !== false;

              return (
                <details key={u.id} className="card" style={{ padding: "1.5rem" }}>
                  <summary className="flex flex-wrap" style={{justifyContent: "space-between", marginBottom: "0.75rem", cursor: "pointer", listStyle: "none" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                        {u.avatarUrl ? <img src={u.avatarUrl} alt={name} style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border-light)" }} /> : null}
                        <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>{name}</span>
                        <span className={`chip chip-${isContractor ? "info" : isEngineer ? "success" : "warning"}`} style={{ fontSize: "0.6875rem" }}>
                          {isContractor ? (isRtl ? "مقاول" : "Contractor") : isEngineer ? (isRtl ? "مهندس" : "Engineer") : (isRtl ? "مالك مشروع" : "Owner")}
                        </span>
                        {spec && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>({spec})</span>}
                      </div>
                    </div>
                    <span className={`chip ${profile?.verificationStatus === "PENDING" && adminNotes ? "chip-error" : "chip-warning"}`} style={{ fontSize: "0.6875rem" }}>
                      {getReviewStatusLabel(profile?.verificationStatus, adminNotes, isRtl)}
                    </span>
                  </summary>

                  {!isProfileComplete && (
                    <div style={{ padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", background: "#fff7ed", color: "#9a3412", marginBottom: "0.75rem", fontSize: "0.75rem", border: "1px solid #fdba74" }}>
                      {isRtl
                        ? "هذا الطلب ظهر لأنه ما زال بحالة انتظار، لكن الملف لم يعد مكتملًا بالكامل. راجع البيانات/الوثائق قبل اتخاذ القرار."
                        : "This request is still pending, but the profile is no longer fully complete. Review the profile/documents before taking action."}
                    </div>
                  )}

                  {/* Full profile info */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.8125rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-muted)" }}>
                      <Mail style={{ width: "12px", height: "12px" }} /> {u.email}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-muted)" }}>
                      <Phone style={{ width: "12px", height: "12px" }} /> {phone}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                    {isRtl ? "تاريخ التسجيل:" : "Registered:"} {new Date(u.createdAt).toLocaleDateString()}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    {profile?.legalName && <div style={{ fontSize: "0.8125rem" }}><strong>{isRtl ? "الاسم القانوني:" : "Legal Name:"}</strong> {profile.legalName}</div>}
                    {profile?.companyCr && <div style={{ fontSize: "0.8125rem" }}><strong>{isRtl ? "السجل التجاري:" : "CR:"}</strong> {profile.companyCr}</div>}
                    {profile?.city && <div style={{ fontSize: "0.8125rem" }}><strong>{isRtl ? "المدينة:" : "City:"}</strong> {profile.city}</div>}
                    {profile?.website && <div style={{ fontSize: "0.8125rem" }}><strong>{isRtl ? "الموقع:" : "Website:"}</strong> {profile.website}</div>}
                    {profile?.companyType && <div style={{ fontSize: "0.8125rem" }}><strong>{isRtl ? "نوع الحساب:" : "Account Type:"}</strong> {profile.companyType}</div>}
                    {profile?.discipline && <div style={{ fontSize: "0.8125rem" }}><strong>{isRtl ? "التخصص الهندسي:" : "Discipline:"}</strong> {profile.discipline}</div>}
                  </div>

                  {(profile?.description || profile?.bio || profile?.projectPreferences || profile?.education || profile?.certifications) && (
                    <div style={{ marginBottom: "0.75rem", padding: "0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
                      {profile?.description && <div style={{ fontSize: "0.8125rem", marginBottom: "0.375rem" }}><strong>{isRtl ? "الوصف:" : "Description:"}</strong> {profile.description}</div>}
                      {profile?.bio && <div style={{ fontSize: "0.8125rem", marginBottom: "0.375rem" }}><strong>{isRtl ? "النبذة:" : "Bio:"}</strong> {profile.bio}</div>}
                      {profile?.projectPreferences && <div style={{ fontSize: "0.8125rem", marginBottom: "0.375rem" }}><strong>{isRtl ? "تفضيلات المشاريع:" : "Project preferences:"}</strong> {profile.projectPreferences}</div>}
                      {profile?.education && <div style={{ fontSize: "0.8125rem", marginBottom: "0.375rem" }}><strong>{isRtl ? "التعليم:" : "Education:"}</strong> {profile.education}</div>}
                      {profile?.certifications && <div style={{ fontSize: "0.8125rem" }}><strong>{isRtl ? "الشهادات:" : "Certifications:"}</strong> {profile.certifications}</div>}
                    </div>
                  )}

                  {(documents.length > 0 || portfolioItems.length > 0) && (
                    <div style={{ display: "grid", gridTemplateColumns: documents.length > 0 && portfolioItems.length > 0 ? "1fr 1fr" : "1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                      {documents.length > 0 && (
                        <div style={{ padding: "0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                            <FileText style={{ width: "14px", height: "14px", color: "var(--primary)" }} />
                            {isRtl ? "المستندات المرفوعة" : "Uploaded Documents"}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                            {documents.map((doc: any) => (
                              <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none" }}>
                                {formatProfileDocumentLabel(doc.documentType, isRtl)}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {portfolioItems.length > 0 && (
                        <div style={{ padding: "0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                            <ImageIcon style={{ width: "14px", height: "14px", color: "var(--accent)" }} />
                            {isRtl ? "معرض الأعمال" : "Portfolio"}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                            {portfolioItems.map((item: any) => (
                              <a key={item.id} href={item.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none" }}>
                                {item.fileName}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Previous admin notes */}
                  {adminNotes && (
                    <div style={{ padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", background: "var(--accent-light)", marginBottom: "0.75rem", fontSize: "0.75rem" }}>
                      <strong>{isRtl ? "ملاحظات سابقة:" : "Previous admin notes:"}</strong> {adminNotes}
                    </div>
                  )}

                  {/* Gov verification placeholder */}
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.6875rem", padding: "0.125rem 0.5rem", borderRadius: "var(--radius-full)", background: "var(--accent-light)", color: "var(--accent)", fontWeight: 600 }}>
                      {isRtl ? "⚠️ بانتظار التحقق الحكومي" : "⚠️ Gov. verification pending"}
                    </span>
                  </div>

                  {/* 3 Actions: Approve / Request Info / Reject */}
                  {/* <div style={{ display: "flex", gap: "0.5rem", alignItems: "end", borderTop: "1px solid var(--border-light)", paddingTop: "0.75rem" }}>
                    <form action={adminUserAction} style={{ display: "inline" }}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>
                        <CheckCircle style={{ width: "14px", height: "14px" }} /> {isRtl ? "موافقة" : "Approve"}
                      </button>
                    </form>

                    <form action={adminUserAction} style={{ flex: 1, display: "flex", gap: "0.375rem" }}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="action" value="request_info" />
                      <input type="text" name="adminNotes" placeholder={isRtl ? "ما المعلومات المطلوبة؟..." : "What information is needed?..."} style={{ flex: 1, fontSize: "0.8125rem" }} />
                      <button type="submit" style={{
                        padding: "0.5rem 0.75rem", fontSize: "0.8125rem", borderRadius: "var(--radius-md)",
                        border: "1px solid var(--accent)", background: "var(--accent-light)", color: "var(--accent)",
                        cursor: "pointer", fontFamily: "inherit", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem", whiteSpace: "nowrap",
                      }}>
                        <MessageSquare style={{ width: "14px", height: "14px" }} /> {isRtl ? "طلب معلومات" : "Request Info"}
                      </button>
                    </form>

                    <form action={adminUserAction} style={{ display: "inline" }}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button type="submit" style={{
                        padding: "0.5rem 1rem", fontSize: "0.8125rem", borderRadius: "var(--radius-md)",
                        border: "1px solid var(--error)", background: "var(--error-light)", color: "var(--error)",
                        cursor: "pointer", fontFamily: "inherit", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem",
                      }}>
                        <XCircle style={{ width: "14px", height: "14px" }} /> {isRtl ? "رفض" : "Reject"}
                      </button>
                    </form>
                  </div> */}
                  {/* 3 Actions: Approve / Request Info / Reject - hide if status is DRAFT */}
{profile?.verificationStatus !== "DRAFT" ? (
  <div className="flex gap-2 md:flex-row md:w-auto w-full flex-col items-end border-t md:items-center items-start border-border-light !pt-3 flex-wrap">
    <ActionButtons userId={u.id} isRtl={isRtl} onAction={adminUserAction} />
    <RequestInfoForm userId={u.id} isRtl={isRtl} onAction={adminUserAction} />
  </div>
) : (
  <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
    {isRtl ? "هذا المستخدم لم يرسل ملفه للمراجعة بعد (حالة مسودة)." : "This user has not submitted their profile for review yet (Draft status)."}
  </div>
)}
                </details>
              );
            })}
          </div>
        )}

        {/* Active Users */}
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
          <ShieldCheck style={{ width: "16px", height: "16px", display: "inline", color: "var(--primary)" }} /> {isRtl ? "المستخدمون المعتمدون" : "Approved Active Users"} ({activeUsers.length})
        </h3>
        <div className="card" style={{ padding: "1rem", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)" }}>{isRtl ? "الاسم" : "Name"}</th>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)" }}>{isRtl ? "الجوال" : "Phone"}</th>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)" }}>{isRtl ? "البريد" : "Email"}</th>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)" }}>{isRtl ? "الدور" : "Role"}</th>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)" }}>{isRtl ? "الحالة" : "Status"}</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((u: any) => {
                const name = u.ownerProfile?.fullName || u.contractorProfile?.companyName || u.engineerProfile?.fullName || u.email;
                const vs = u.contractorProfile?.verificationStatus || u.engineerProfile?.verificationStatus || "N/A";
                const phone = u.ownerProfile?.phone || u.contractorProfile?.phone || u.engineerProfile?.phone || "—";
                const profile = u.ownerProfile || u.contractorProfile || u.engineerProfile;
                const scoreResult = profile ? calculateProfileScore(profile) : { score: 0 };
                const score = scoreResult.score;
                const scoreColor = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#dc2626";
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.5rem", color: "var(--text)" }}>{name}</td>
                    <td style={{ padding: "0.5rem", color: "var(--text-muted)" }}>{phone}</td>
                    <td style={{ padding: "0.5rem", color: "var(--text-muted)" }}>{u.email}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <span className={`chip chip-${u.role === "OWNER" ? "info" : "success"}`} style={{ fontSize: "0.6875rem" }}>{u.role}</span>
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <span className={`chip chip-${vs === "VERIFIED" ? "success" : "warning"}`} style={{ fontSize: "0.6875rem" }}>{vs}</span>
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: scoreColor }}>{score}/100</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}