// ============================================================================
// DineroPay Payment Gateway — Saudi Local Payment Provider
// Supports: Mada, Visa, Mastercard, Apple Pay, STC Pay
// ============================================================================

const DINERO_BASE = process.env.DINERO_ENV === "production"
  ? "https://api.dineropay.com"
  : "https://sandbox.dineropay.com";

const MERCHANT_KEY = process.env.DINERO_MERCHANT_KEY || "";
const API_PASSWORD = process.env.DINERO_API_PASSWORD || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface PaymentSession {
  sessionId: string;
  paymentUrl: string;
  orderId: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  amount?: number;
  error?: string;
}

// ============================================================================
// Create Payment Session — Redirects user to DineroPay hosted page
// ============================================================================
export async function createPaymentSession(params: {
  orderId: string;
  amount: number; // in SAR
  currency?: string;
  description: string;
  descriptionAr?: string;
  customerEmail: string;
  customerName: string;
  callbackUrl?: string;
  returnUrl?: string;
  locale?: string;
}): Promise<PaymentSession & { error?: string }> {
  try {
    const response = await fetch(`${DINERO_BASE}/api/v1/checkout/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MERCHANT_KEY}`,
        "X-Api-Password": API_PASSWORD,
      },
      body: JSON.stringify({
        merchant_key: MERCHANT_KEY,
        order_id: params.orderId,
        amount: params.amount.toFixed(2),
        currency: params.currency || "SAR",
        description: params.description,
        callback_url: params.callbackUrl || `${APP_URL}/api/payment/callback`,
        return_url: params.returnUrl || `${APP_URL}/api/payment/return`,
        customer_email: params.customerEmail,
        customer_name: params.customerName,
        language: params.locale === "ar" ? "ar" : "en",
      }),
    });

    const data = await response.json();

    if (data.session_id && data.payment_url) {
      return {
        sessionId: data.session_id,
        paymentUrl: data.payment_url,
        orderId: params.orderId,
      };
    }

    return { sessionId: "", paymentUrl: "", orderId: "", error: data.message || "Payment session failed" };
  } catch (error: any) {
    console.error("DineroPay error:", error);
    return { sessionId: "", paymentUrl: "", orderId: "", error: error?.message || "Payment error" };
  }
}

// ============================================================================
// Verify Payment — Check payment status after callback
// ============================================================================
export async function verifyPayment(sessionId: string): Promise<PaymentResult> {
  try {
    const response = await fetch(`${DINERO_BASE}/api/v1/checkout/session/${sessionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${MERCHANT_KEY}`,
        "X-Api-Password": API_PASSWORD,
      },
    });

    const data = await response.json();

    if (data.status === "paid" || data.status === "captured") {
      return {
        success: true,
        transactionId: data.transaction_id,
        orderId: data.order_id,
        amount: parseFloat(data.amount),
      };
    }

    return { success: false, error: `Payment status: ${data.status}` };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

// ============================================================================
// Convenience: Create Krasat Payment (100 SAR)
// ============================================================================
export async function createKrasatPayment(userId: string, projectId: string, email: string, name: string, locale: string = "ar") {
  return createPaymentSession({
    orderId: `krasat-${userId}-${projectId}-${Date.now()}`,
    amount: 100,
    description: "Krasat - Project Access (100 SAR)",
    descriptionAr: "كراسات - الوصول للمشروع (100 ريال)",
    customerEmail: email,
    customerName: name,
    returnUrl: `${APP_URL}/${locale}/marketplace/${projectId}?payment=krasat`,
    locale,
  });
}

// ============================================================================
// Convenience: Create Supervision Payment (150 SAR)
// ============================================================================
export async function createSupervisionPayment(userId: string, projectId: string, email: string, name: string, locale: string = "ar") {
  return createPaymentSession({
    orderId: `supervision-${userId}-${projectId}-${Date.now()}`,
    amount: 150,
    description: "Supervision Request (150 SAR)",
    descriptionAr: "طلب إشراف (150 ريال)",
    customerEmail: email,
    customerName: name,
    returnUrl: `${APP_URL}/${locale}/dashboard/supervision?payment=supervision`,
    locale,
  });
}

// ============================================================================
// Convenience: Create Supervision Bid Pack Payment (500 SAR => 5 bids)
// ============================================================================
export async function createSupervisionBidPackPayment(userId: string, email: string, name: string, locale: string = "ar") {
  return createPaymentSession({
    orderId: `supbidpack-${userId}-${Date.now()}`,
    amount: 500,
    description: "Supervision Bid Pack (5 bids)",
    descriptionAr: "باقة عروض الإشراف (5 عروض)",
    customerEmail: email,
    customerName: name,
    returnUrl: `${APP_URL}/${locale}/dashboard/wallet?payment=supbidpack`,
    locale,
  });
}

// ============================================================================
// Convenience: Create Wallet Funding (500 SAR)
// ============================================================================
export async function createWalletPayment(userId: string, amount: number, email: string, name: string, locale: string = "ar") {
  return createPaymentSession({
    orderId: `wallet-${userId}-${Date.now()}`,
    amount,
    description: `Wallet Funding (${amount} SAR)`,
    descriptionAr: `تمويل المحفظة (${amount} ريال)`,
    customerEmail: email,
    customerName: name,
    returnUrl: `${APP_URL}/${locale}/dashboard/wallet?payment=wallet`,
    locale,
  });
}

// ============================================================================
// Convenience: Create Professional Contract Payment (150 SAR)
// ============================================================================
export async function createContractPayment(userId: string, contractId: string, email: string, name: string, locale: string = "ar") {
  return createPaymentSession({
    orderId: `contract-${userId}-${contractId}-${Date.now()}`,
    amount: 150,
    description: "Professional Contract (150 SAR)",
    descriptionAr: "عقد احترافي (150 ريال)",
    customerEmail: email,
    customerName: name,
    returnUrl: `${APP_URL}/${locale}/dashboard/contracts/${contractId}?payment=contract`,
    locale,
  });
}
