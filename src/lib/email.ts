import { Resend } from "resend";

// ============================================================================
// Email Service — Resend Integration for LineX-Forsa
// ============================================================================

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || "");
  return _resend;
}

const FROM = process.env.EMAIL_FROM || "LineX Forsa <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ============================================================================
// Email Verification
// ============================================================================
export async function sendVerificationEmail(email: string, _token: string, locale: string = "ar") {
  // NOTE: _token parameter is unused - verification uses HMAC of email
  // Generate HMAC token from email for secure verification (matches verify-email route)
  const crypto = await import("crypto");
  const secret = process.env.AUTH_SECRET || "dev-secret-change-in-production";
  const hmacToken = crypto
    .createHmac("sha256", secret)
    .update(email.toLowerCase())
    .digest("hex");
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${hmacToken}&email=${encodeURIComponent(email.toLowerCase())}`;
  const isAr = locale === "ar";

  try {
    await getResend().emails.send({
      from: FROM,
      to: email,
      subject: isAr ? "تأكيد بريدك الإلكتروني — لاينكس فرصة" : "Verify your email — LineX Forsa",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; direction: ${isAr ? "rtl" : "ltr"};">
          <div style="background: linear-gradient(135deg, #0f6b57, #0a4e41); padding: 2rem; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 1.5rem;">${isAr ? "لاينكس فرصة" : "LineX Forsa"}</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 0.5rem 0 0; font-size: 0.875rem;">${isAr ? "منصة المقاولات الموثوقة" : "Trusted Construction Marketplace"}</p>
          </div>
          <div style="background: white; padding: 2rem; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a2332; font-size: 1.25rem;">${isAr ? "تأكيد بريدك الإلكتروني" : "Verify Your Email"}</h2>
            <p style="color: #475569; line-height: 1.7;">${isAr ? "شكراً لتسجيلك في لاينكس فرصة. يرجى الضغط على الزر أدناه لتأكيد بريدك الإلكتروني." : "Thank you for registering on LineX Forsa. Please click the button below to verify your email address."}</p>
            <div style="text-align: center; margin: 2rem 0;">
              <a href="${verifyUrl}" style="display: inline-block; padding: 0.875rem 2rem; background: #0f6b57; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1rem;">
                ${isAr ? "تأكيد البريد الإلكتروني" : "Verify Email"}
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 0.75rem;">${isAr ? "إذا لم تقم بالتسجيل، تجاهل هذا البريد." : "If you didn't register, please ignore this email."}</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error?.message };
  }
}

// ============================================================================
// Transactional Emails
// ============================================================================
export async function sendNotificationEmail(email: string, subject: string, subjectAr: string, body: string, bodyAr: string, locale: string = "ar") {
  const isAr = locale === "ar";
  try {
    await getResend().emails.send({
      from: FROM,
      to: email,
      subject: isAr ? subjectAr : subject,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; direction: ${isAr ? "rtl" : "ltr"};">
          <div style="background: #0f6b57; padding: 1.5rem; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 1.25rem;">${isAr ? "لاينكس فرصة" : "LineX Forsa"}</h1>
          </div>
          <div style="background: white; padding: 2rem; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
            <p style="color: #1a2332; line-height: 1.7; font-size: 0.9375rem;">${isAr ? bodyAr : body}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;" />
            <p style="color: #94a3b8; font-size: 0.75rem; text-align: center;">
              <a href="${APP_URL}" style="color: #0f6b57;">${isAr ? "زيارة المنصة" : "Visit Platform"}</a>
            </p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error: any) {
    console.error("Email error:", error);
    return { success: false, error: error?.message };
  }
}

// ============================================================================
// Pre-built email templates
// ============================================================================
export async function sendProjectApprovedEmail(email: string, projectTitle: string, locale: string = "ar") {
  return sendNotificationEmail(email,
    `Project "${projectTitle}" has been approved`, `تمت الموافقة على مشروعك "${projectTitle}"`,
    `Your project "${projectTitle}" has been approved and is now published on the marketplace. Contractors can now submit bids.`,
    `تمت الموافقة على مشروعك "${projectTitle}" وأصبح منشوراً في سوق المشاريع. يمكن للمقاولين الآن تقديم عروضهم.`,
    locale
  );
}

export async function sendBidReceivedEmail(email: string, projectTitle: string, bidAmount: number, locale: string = "ar") {
  return sendNotificationEmail(email,
    `New bid received on "${projectTitle}"`, `عرض جديد على مشروعك "${projectTitle}"`,
    `A new bid of ${bidAmount.toLocaleString()} SAR has been submitted on your project "${projectTitle}". Login to review the bid.`,
    `تم تقديم عرض جديد بقيمة ${bidAmount.toLocaleString()} ر.س على مشروعك "${projectTitle}". سجل دخولك لمراجعة العرض.`,
    locale
  );
}

export async function sendBidAwardedEmail(email: string, projectTitle: string, amount: number, locale: string = "ar") {
  return sendNotificationEmail(email,
    `Congratulations! Your bid on "${projectTitle}" was awarded`, `تهانينا! تم ترسية عرضك على "${projectTitle}"`,
    `Your bid of ${amount.toLocaleString()} SAR on project "${projectTitle}" has been awarded. Login to access the execution workspace.`,
    `تم ترسية عرضك بقيمة ${amount.toLocaleString()} ر.س على مشروع "${projectTitle}". سجل دخولك للوصول إلى منصة التنفيذ.`,
    locale
  );
}
