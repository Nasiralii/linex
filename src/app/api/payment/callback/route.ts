import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPayment } from "@/lib/payment";

type ParsedOrder = {
  type: string;
  userId: string;
  referenceId?: string;
};

function parseOrderId(orderId: string): ParsedOrder | null {
  const parts = orderId.split("-");
  if (parts.length < 2) return null;

  return {
    type: parts[0],
    userId: parts[1],
    referenceId: parts[2],
  };
}

function getSuccessRedirectPath(orderId: string, locale: string) {
  const parsed = parseOrderId(orderId);
  if (!parsed) return `/${locale}/dashboard?payment=success`;

  if (parsed.type === "krasat" && parsed.referenceId) {
    return `/${locale}/marketplace/${parsed.referenceId}?payment=success`;
  }

  if (parsed.type === "supervision") {
    return `/${locale}/dashboard/supervision?payment=success`;
  }

  if (parsed.type === "contract" && parsed.referenceId) {
    return `/${locale}/dashboard/contracts/${parsed.referenceId}?payment=success`;
  }

  if (parsed.type === "wallet") {
    return `/${locale}/dashboard/wallet?payment=success`;
  }

  if (parsed.type === "supbidpack") {
    return `/${locale}/dashboard/wallet?payment=success`;
  }

  return `/${locale}/dashboard?payment=success`;
}

async function processVerifiedPayment(orderId: string, sessionId: string, transactionId?: string, amount?: number) {
  const parsed = parseOrderId(orderId);
  if (!parsed) {
    return { success: false, error: "Invalid order ID" };
  }

  const externalPaymentId = transactionId || sessionId;

  if (parsed.type === "wallet") {
    const existing = await db.walletTransaction.findFirst({
      where: { stripePaymentId: externalPaymentId, purpose: "WALLET_TOPUP" },
    });

    if (!existing) {
      await db.walletTransaction.create({
        data: {
          userId: parsed.userId,
          type: "FUND",
          amount: amount || 0,
          purpose: "WALLET_TOPUP",
          status: "completed",
          stripePaymentId: externalPaymentId,
        },
      });

      const user = await db.user.findUnique({ where: { id: parsed.userId }, select: { role: true } });
      if (user?.role === "ENGINEER") {
        await db.engineerProfile.update({
          where: { userId: parsed.userId },
          data: { walletBalance: { increment: amount || 0 } },
        }).catch(() => {});
      }
    }
  }

  if (parsed.type === "supbidpack") {
    const existing = await db.walletTransaction.findFirst({
      where: { stripePaymentId: externalPaymentId, purpose: "SUPERVISION_BID_PACK" },
    });

    if (!existing) {
      await db.walletTransaction.create({
        data: {
          userId: parsed.userId,
          type: "FUND",
          amount: amount || 500,
          purpose: "SUPERVISION_BID_PACK",
          status: "completed",
          stripePaymentId: externalPaymentId,
        },
      });

      await db.engineerProfile.update({
        where: { userId: parsed.userId },
        data: {
          walletBalance: { increment: amount || 500 },
          supervisionBidCredits: { increment: 5 },
        },
      }).catch(() => {});
    }
  }

  if (parsed.type === "krasat" && parsed.referenceId) {
    const existingPurchase = await db.krasatPurchase.findUnique({
      where: { userId_projectId: { userId: parsed.userId, projectId: parsed.referenceId } },
    });

    if (!existingPurchase) {
      await db.krasatPurchase.create({
        data: {
          userId: parsed.userId,
          projectId: parsed.referenceId,
          amount: amount || 100,
          status: "completed",
          stripePaymentId: externalPaymentId,
        },
      });
    }

    const existingTx = await db.walletTransaction.findFirst({
      where: { stripePaymentId: externalPaymentId, purpose: "KRASAT" },
    });

    if (!existingTx) {
      await db.walletTransaction.create({
        data: {
          userId: parsed.userId,
          type: "DEDUCT",
          amount: amount || 100,
          purpose: "KRASAT",
          referenceId: parsed.referenceId,
          status: "completed",
          stripePaymentId: externalPaymentId,
        },
      });
    }
  }

  if (parsed.type === "supervision" && parsed.referenceId) {
    const existingRequest = await db.supervisionRequest.findFirst({
      where: { projectId: parsed.referenceId, requestedBy: parsed.userId },
    });

    if (!existingRequest) {
      await db.supervisionRequest.create({
        data: { projectId: parsed.referenceId, requestedBy: parsed.userId, requestFee: 150, status: "OPEN" },
      });

      const supervisors = await db.engineerProfile.findMany({
        where: { specialization: { in: ["SUPERVISOR", "BOTH"] }, verificationStatus: "VERIFIED" },
        select: { userId: true },
      });

      if (supervisors.length > 0) {
        await db.notification.createMany({
          data: supervisors.map((sup) => ({
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
    }

    const existingTx = await db.walletTransaction.findFirst({
      where: { stripePaymentId: externalPaymentId, purpose: "SUPERVISION_REQUEST_FEE" },
    });

    if (!existingTx) {
      await db.walletTransaction.create({
        data: {
          userId: parsed.userId,
          type: "DEDUCT",
          amount: amount || 150,
          purpose: "SUPERVISION_REQUEST_FEE",
          referenceId: parsed.referenceId,
          status: "completed",
          stripePaymentId: externalPaymentId,
        },
      });
    }
  }

  if (parsed.type === "contract" && parsed.referenceId) {
    const contract = await db.contract.findUnique({ where: { id: parsed.referenceId } });

    if (contract && contract.contractType !== "PROFESSIONAL") {
      await db.contract.update({
        where: { id: parsed.referenceId },
        data: { contractType: "PROFESSIONAL", amount: 150 },
      });
    }

    const existingTx = await db.walletTransaction.findFirst({
      where: { stripePaymentId: externalPaymentId, purpose: "CONTRACT_FEE" },
    });

    if (!existingTx) {
      await db.walletTransaction.create({
        data: {
          userId: parsed.userId,
          type: "DEDUCT",
          amount: amount || 150,
          purpose: "CONTRACT_FEE",
          referenceId: contract?.projectId,
          status: "completed",
          stripePaymentId: externalPaymentId,
        },
      });
    }
  }

  const existingAudit = await db.auditLog.findFirst({
    where: { entityType: "payment", entityId: externalPaymentId, action: "PAYMENT_COMPLETED" },
  });

  if (!existingAudit) {
    await db.auditLog.create({
      data: {
        actorId: parsed.userId,
        action: "PAYMENT_COMPLETED",
        entityType: "payment",
        entityId: externalPaymentId,
        metadata: { amount, type: parsed.type, orderId },
      },
    });
  }

  return { success: true, parsed };
}

// Payment callback handler — DineroPay redirects here after payment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = body.session_id || body.sessionId;
    const orderId = body.order_id || body.orderId;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Missing session_id" }, { status: 400 });
    }

    const result = await verifyPayment(sessionId);
    const verifiedOrderId = result.orderId || orderId;

    if (result.success && verifiedOrderId) {
      await processVerifiedPayment(verifiedOrderId, sessionId, result.transactionId, result.amount);
      return NextResponse.json({ success: true, orderId: verifiedOrderId });
    }

    return NextResponse.json({ success: false, error: result.error || "Payment verification failed" }, { status: 400 });
  } catch (error: any) {
    console.error("Payment callback error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

// GET handler — DineroPay redirects user here with query params
export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const sessionId = url.searchParams.get("session_id") || url.searchParams.get("sessionId");
  const orderId = url.searchParams.get("order_id") || url.searchParams.get("orderId") || "";
  const locale = url.searchParams.get("locale") || "ar";

  if (sessionId) {
    try {
      const result = await verifyPayment(sessionId);
      const verifiedOrderId = result.orderId || orderId;

      if (result.success && verifiedOrderId) {
        await processVerifiedPayment(verifiedOrderId, sessionId, result.transactionId, result.amount);
        return NextResponse.redirect(new URL(getSuccessRedirectPath(verifiedOrderId, locale), url.origin));
      }
    } catch (error) {
      console.error("Payment GET callback error:", error);
    }
  }

  if (status === "paid" || status === "captured") {
    return NextResponse.redirect(new URL(getSuccessRedirectPath(orderId, locale), url.origin));
  }

  return NextResponse.redirect(new URL(`/${locale}/dashboard?payment=failed`, url.origin));
}
