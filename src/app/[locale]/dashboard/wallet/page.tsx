import { getCurrentUser } from "@/lib/auth";
import { redirect, Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect as nextRedirect } from "next/navigation";
import { Wallet, Plus, ArrowDown, ArrowUp, Clock, CheckCircle, CreditCard, RefreshCw } from "lucide-react";
import { createSupervisionBidPackPayment, createWalletPayment } from "@/lib/payment";

// Universal wallet for ALL users — top up, view balance, transaction history

async function topUpWalletAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) return;
  const amount = parseInt(formData.get("amount") as string) || 0;
  const locale = (formData.get("locale") as string) || "ar";
  if (amount <= 0) return;

  try {
    const session = await createWalletPayment(user.id, amount, user.email, user.email.split("@")[0], locale);
    if (session.paymentUrl) {
      nextRedirect(session.paymentUrl);
    }
    nextRedirect(`/${locale}/dashboard/wallet?paymentError=wallet_topup_failed`);
  } catch (error) {
    console.error('[topUpWalletAction] DB query failed:', error);
    nextRedirect(`/${locale}/dashboard/wallet?paymentError=wallet_topup_failed`);
  }
  revalidatePath("/dashboard/wallet");
}

// BUG-C07: Test top-up action (bypass payment gateway for testing)
async function testTopUpAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) return;
  const amount = parseInt(formData.get("amount") as string) || 0;
  if (amount <= 0) return;

  try {
    // Add funds directly to wallet (bypass payment gateway)
    await db.walletTransaction.create({
      data: {
        userId: user.id,
        type: "FUND",
        amount,
        purpose: "WALLET_TOPUP",
        status: "completed",
      },
    });

    if (user.role === "ENGINEER") {
      await db.engineerProfile.update({
        where: { userId: user.id },
        data: { walletBalance: { increment: amount } },
      }).catch(() => {});
    }

    await db.notification.create({
      data: {
        userId: user.id,
        type: "GENERAL",
        title: "Test top-up successful", titleAr: "تم شحن المحفظة بنجاح",
        message: `Your wallet has been topped up with ${amount} SAR (test mode).`,
        messageAr: `تم شحن محفظتك بمبلغ ${amount} ر.س (وضع الاختبار).`,
        link: "/dashboard/wallet",
      },
    });
  } catch (error) {
    console.error('[testTopUpAction] DB query failed:', error);
  }
  revalidatePath("/dashboard/wallet");
}

async function buySupervisionBidPackAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user || user.role !== "ENGINEER") return;
  const locale = (formData.get("locale") as string) || "ar";

  try {
    const session = await createSupervisionBidPackPayment(user.id, user.email, user.email.split("@")[0], locale);
    if (session.paymentUrl) {
      nextRedirect(session.paymentUrl);
    }
    nextRedirect(`/${locale}/dashboard/wallet?paymentError=supbidpack_failed`);
  } catch (error) {
    console.error('[buySupervisionBidPackAction] DB query failed:', error);
    nextRedirect(`/${locale}/dashboard/wallet?paymentError=supbidpack_failed`);
  }

  revalidatePath("/dashboard/wallet");
}

async function requestRefundAction() {
  "use server";
  const user = await getCurrentUser();
  if (!user) return;
  try {
    const balance = await getWalletBalance(user.id);
    if (balance <= 0) return;
    await db.walletTransaction.create({
      data: { userId: user.id, type: "REFUND", amount: balance, purpose: "REFUND", status: "pending" },
    });
    await db.notification.create({
      data: {
        userId: user.id, type: "GENERAL",
        title: "Refund request submitted", titleAr: "تم إرسال طلب الاسترداد",
        message: `Your refund request for ${balance} SAR has been submitted.`,
        messageAr: `تم إرسال طلب استرداد ${balance} ر.س`,
      },
    });
  } catch (error) {
    console.error('[requestRefundAction] DB query failed:', error);
  }
  revalidatePath("/dashboard/wallet");
}

async function getWalletBalance(userId: string): Promise<number> {
  const transactions = await db.walletTransaction.findMany({
    where: { userId, status: "completed" },
  });
  let balance = 0;
  for (const tx of transactions) {
    if (tx.type === "FUND") balance += tx.amount;
    else if (tx.type === "DEDUCT") balance -= tx.amount;
  }
  return Math.max(0, balance);
}

export default async function WalletPage({
  searchParams,
}: {
  searchParams?: Promise<{ paymentError?: string; payment?: string }>;
}) {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/auth/login", locale });
  const isRtl = locale === "ar";
  const params = (await searchParams) || {};

  // Calculate balance from transactions
  let walletBalance = 0;
  let engineerBalance = 0;
  let transactions: any[] = [];
  let supervisionBidCredits = 0;

  try {
    walletBalance = await getWalletBalance(user.id);

    // If engineer, also check profile balance
    if (user.role === "ENGINEER") {
      const eng = await (db as any).engineerProfile.findUnique({ where: { userId: user.id } });
      engineerBalance = eng?.walletBalance || 0;
      supervisionBidCredits = eng?.supervisionBidCredits || 0;
    }

    transactions = await db.walletTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  } catch (error) {
    console.error('[WalletPage] DB query failed:', error);
  }

  const displayBalance = user.role === "ENGINEER" ? Math.max(walletBalance, engineerBalance) : walletBalance;

  const topUpAmounts = [100, 250, 500, 1000];

  const purposeLabels: Record<string, { en: string; ar: string }> = {
    WALLET_TOPUP: { en: "Wallet Top-Up", ar: "شحن المحفظة" },
    SUPERVISION_BID_PACK: { en: "Supervision Bid Pack", ar: "باقة عروض الإشراف" },
    SUPERVISION_REQUEST_FEE: { en: "Supervision Request Fee", ar: "رسوم طلب الإشراف" },
    SUPERVISION_WIN_FEE: { en: "Supervision Win Fee", ar: "رسوم الفوز بالإشراف" },
    KRASAT: { en: "Krasat Access", ar: "كراسات" },
    CONTRACT_FEE: { en: "Contract Fee", ar: "رسوم عقد" },
    REFUND: { en: "Refund Request", ar: "طلب استرداد" },
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1C5963, #2A7B88)", padding: "2rem 0" }}>
        <div className="container-app">
          <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem", textDecoration: "none" }}>
            ← {isRtl ? "العودة" : "Back"}
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Wallet style={{ width: "24px", height: "24px" }} />
            {isRtl ? "محفظتي" : "My Wallet"}
          </h1>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1rem", maxWidth: "800px" }}>
        {params.paymentError && (
          <div className="card" style={{ padding: "1rem 1.25rem", marginBottom: "1rem", border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.25rem" }}>
              {isRtl ? "تعذر بدء عملية الدفع" : "Unable to start payment"}
            </div>
            <div style={{ fontSize: "0.8125rem" }}>
              {params.paymentError === "supbidpack_failed"
                ? (isRtl ? "تعذر بدء شراء باقة عروض الإشراف. حاول مرة أخرى أو استخدم الشحن ثم أعد المحاولة." : "Could not start the supervision bid pack purchase. Please try again, or top up and retry.")
                : (isRtl ? "تعذر بدء عملية شحن المحفظة. تحقق من إعدادات الدفع ثم حاول مرة أخرى." : "Could not start wallet top-up. Please verify payment configuration and try again.")}
            </div>
          </div>
        )}

        {params.payment === "success" && (
          <div className="card" style={{ padding: "1rem 1.25rem", marginBottom: "1rem", border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>
              {isRtl ? "تمت معالجة عملية الدفع بنجاح." : "Your payment was processed successfully."}
            </div>
          </div>
        )}

        {/* Balance Card */}
        <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem", textAlign: "center", background: "linear-gradient(135deg, #1C5963, #2A7B88)", color: "white", borderRadius: "var(--radius-xl)" }}>
          <div style={{ fontSize: "0.875rem", opacity: 0.8, marginBottom: "0.25rem" }}>
            {isRtl ? "رصيدك الحالي" : "Current Balance"}
          </div>
          <div style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            {displayBalance.toLocaleString()} <span style={{ fontSize: "1.25rem", fontWeight: 500 }}>{isRtl ? "ر.س" : "SAR"}</span>
          </div>
          <p style={{ fontSize: "0.8125rem", opacity: 0.7 }}>
            {isRtl ? "اشحن محفظتك لدفع رسوم الكراسات والإشراف والعقود" : "Top up your wallet to pay for Krasat, supervision, and contract fees"}
          </p>
          {user.role === "ENGINEER" && (
            <div style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.875rem", borderRadius: "999px", background: "rgba(255,255,255,0.14)", fontSize: "0.875rem", fontWeight: 700 }}>
              <span>{isRtl ? "رصيد عروض الإشراف:" : "Supervision Bid Credits:"}</span>
              <span>{supervisionBidCredits}</span>
            </div>
          )}
        </div>

        {user.role === "ENGINEER" && (
          <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid rgba(184,115,51,0.35)", background: "linear-gradient(135deg, rgba(184,115,51,0.08), rgba(42,123,136,0.05))" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
              {isRtl ? "شراء باقة عروض الإشراف" : "Buy Supervision Bid Pack"}
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.7 }}>
              {isRtl ? "ادفع 500 ر.س لتحصل على 5 عروض إشراف. يتم استخدام عرض واحد عند التقديم، ويتم خصم 500 ر.س إضافية من المحفظة فقط إذا فزت بالمشروع." : "Pay 500 SAR to get 5 supervision bid credits. One credit is used per bid, and an additional 500 SAR is charged from your wallet only if you win."}
            </p>
            <form action={buySupervisionBidPackAction}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="btn-primary" style={{ padding: "0.75rem 1.25rem", fontSize: "0.875rem" }}>
                {isRtl ? "شراء 5 عروض مقابل 500 ر.س" : "Buy 5 bids for 500 SAR"}
              </button>
            </form>
          </div>
        )}

        {/* Top Up Section */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CreditCard style={{ width: "18px", height: "18px", color: "var(--accent)" }} />
            {isRtl ? "شحن المحفظة" : "Top Up Wallet"}
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            {isRtl ? "اختر المبلغ وادفع عبر بوابة الدفع الآمنة (مدى، فيزا، أبل باي)" : "Choose amount and pay via secure gateway (Mada, Visa, Apple Pay)"}
          </p>

          {/* Preset amounts */}
          <div className="grid md:grid-cols-4 grid-cols-2 gap-3 !mb-4">
            {topUpAmounts.map(amount => (
              <form key={amount} action={topUpWalletAction}>
                <input type="hidden" name="amount" value={amount} />
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" style={{
                  width: "100%", padding: "1rem 0.5rem", borderRadius: "var(--radius-lg)",
                  border: "2px solid var(--border)", background: "var(--surface)", cursor: "pointer",
                  fontFamily: "inherit", textAlign: "center", transition: "all 150ms ease",
                }}>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)" }}>{amount}</div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{isRtl ? "ر.س" : "SAR"}</div>
                </button>
              </form>
            ))}
          </div>

          {/* Custom amount */}
          <form action={topUpWalletAction} style={{ display: "flex", gap: "0.5rem" }}>
            <input type="hidden" name="locale" value={locale} />
            <input type="number" name="amount" min="10" placeholder={isRtl ? "مبلغ مخصص..." : "Custom amount..."} dir="ltr" style={{ flex: 1 }} />
            <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem", whiteSpace: "nowrap" }}>
              <Plus style={{ width: "14px", height: "14px" }} /> {isRtl ? "شحن" : "Top Up"}
            </button>
          </form>

          <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.5rem", textAlign: "center" }}>
            {isRtl ? "🔒 الدفع آمن عبر بوابة DineroPay — مدى، فيزا، ماستركارد، أبل باي" : "🔒 Secure payment via DineroPay — Mada, Visa, Mastercard, Apple Pay"}
          </p>
        </div>

        {/* BUG-C07: Test Top Up Section (for testing only) */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem", border: "2px dashed var(--accent)" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Wallet style={{ width: "18px", height: "18px" }} />
            {isRtl ? "شحن تجريبي (للاختبار فقط)" : "Test Top Up (For Testing Only)"}
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            {isRtl ? "هذا الشحن التجريبي يضيف رصيد مباشرة إلى محفظتك للاختبار. لا يتطلب دفع حقيقي." : "This test top-up adds funds directly to your wallet for testing. No real payment required."}
          </p>

          <div className="grid md:grid-cols-4 grid-cols-2 gap-3 !mb-4" >
            {[100, 500, 1000, 5000].map(amount => (
              <form key={amount} action={testTopUpAction}>
                <input type="hidden" name="amount" value={amount} />
                <button type="submit" style={{
                  width: "100%", padding: "1rem 0.5rem", borderRadius: "var(--radius-lg)",
                  border: "2px solid var(--accent)", background: "var(--accent-light)", cursor: "pointer",
                  fontFamily: "inherit", textAlign: "center", transition: "all 150ms ease",
                }}>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent)" }}>{amount}</div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{isRtl ? "ر.س" : "SAR"}</div>
                </button>
              </form>
            ))}
          </div>
        </div>

        {/* Fees Reference */}
        <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.75rem" }}>
            {isRtl ? "رسوم المنصة" : "Platform Fees"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {[
              { label: isRtl ? "كراسات (وصول المشروع)" : "Krasat (Project Access)", amount: "100" },
              { label: isRtl ? "طلب إشراف" : "Supervision Request", amount: "150" },
              { label: isRtl ? "باقة 5 عروض إشراف" : "Supervision Bid Pack (5 bids)", amount: "500" },
              { label: isRtl ? "رسوم الفوز بالإشراف" : "Supervision Win Fee", amount: "500" },
              { label: isRtl ? "عقد احترافي" : "Professional Contract", amount: "150" },
            ].map((fee, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--text-muted)" }}>{fee.label}</span>
                <span style={{ fontWeight: 700, color: "var(--primary)" }}>{fee.amount} {isRtl ? "ر.س" : "SAR"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
              {isRtl ? "سجل المعاملات" : "Transaction History"}
            </h3>
            <form action={requestRefundAction}>
              <button type="submit" disabled={displayBalance <= 0} style={{
                padding: "0.375rem 0.75rem", fontSize: "0.75rem", borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)",
                cursor: displayBalance > 0 ? "pointer" : "not-allowed", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: "0.25rem",
              }}>
                <RefreshCw style={{ width: "12px", height: "12px" }} /> {isRtl ? "طلب استرداد" : "Request Refund"}
              </button>
            </form>
          </div>

          {transactions.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
              {isRtl ? "لا توجد معاملات بعد. اشحن محفظتك!" : "No transactions yet. Top up your wallet!"}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {transactions.map((tx: any) => (
                <div key={tx.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: tx.type === "FUND" ? "var(--primary-light)" : tx.type === "REFUND" ? "var(--accent-light)" : "var(--error-light)",
                    }}>
                      {tx.type === "FUND" ? <ArrowDown style={{ width: "16px", height: "16px", color: "var(--primary)" }} /> :
                       tx.type === "REFUND" ? <RefreshCw style={{ width: "16px", height: "16px", color: "var(--accent)" }} /> :
                       <ArrowUp style={{ width: "16px", height: "16px", color: "var(--error)" }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>
                        {isRtl ? (purposeLabels[tx.purpose]?.ar || tx.purpose) : (purposeLabels[tx.purpose]?.en || tx.purpose)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: tx.type === "FUND" ? "var(--primary)" : tx.type === "REFUND" ? "var(--accent)" : "var(--error)" }}>
                      {tx.type === "FUND" ? "+" : tx.type === "REFUND" ? "↩" : "-"}{tx.amount?.toLocaleString()} {isRtl ? "ر.س" : "SAR"}
                    </div>
                    <span className={`chip chip-${tx.status === "completed" ? "success" : tx.status === "pending" ? "warning" : "default"}`} style={{ fontSize: "0.6875rem" }}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}