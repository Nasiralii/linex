import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { DollarSign, ArrowLeft, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { isFullAccessAdmin } from "@/lib/admin-config";

// Gap 14: Refund management (admin)

async function processRefundAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return;

  const transactionId = formData.get("transactionId") as string;
  const action = formData.get("action") as string;

  try {
    const tx = await db.walletTransaction.findUnique({ where: { id: transactionId } });
    if (!tx) return;

    if (action === "approve") {
      // Create refund transaction
      await db.walletTransaction.create({
        data: {
          userId: tx.userId, type: "REFUND", amount: tx.amount,
          purpose: "REFUND", referenceId: tx.referenceId, status: "completed",
        },
      });

      // Update original transaction
      await db.walletTransaction.update({
        where: { id: transactionId },
        data: { status: "refunded" },
      });

      // If it was a krasat, remove the purchase
      if (tx.purpose === "KRASAT" && tx.referenceId) {
        await db.krasatPurchase.deleteMany({
          where: { userId: tx.userId, projectId: tx.referenceId },
        });
      }
    } else if (action === "reject") {
      await db.walletTransaction.update({
        where: { id: transactionId },
        data: { status: "refund_rejected" },
      });
    }

    await db.auditLog.create({
      data: { actorId: user.id, action: `REFUND_${action.toUpperCase()}`, entityType: "transaction", entityId: transactionId },
    });
  } catch (error) {
    console.error('[processRefundAction] DB query failed:', error);
  }

  revalidatePath("/admin/refunds");
}

export default async function RefundManagementPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user || user.role !== "ADMIN") return redirect({ href: "/dashboard", locale });
  if (!isFullAccessAdmin(user.email)) return redirect({ href: "/admin/users", locale });
  const isRtl = locale === "ar";

  // Get all deduction transactions (potential refund candidates)
  let transactions: any[] = [];
  let refunded: any[] = [];
  try {
    transactions = await db.walletTransaction.findMany({
      where: { type: "DEDUCT", status: { in: ["completed", "refund_requested"] } },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, role: true } } },
      take: 50,
    });

    refunded = await db.walletTransaction.findMany({
      where: { type: "REFUND" },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  } catch (error) {
    console.error('[RefundManagementPage] DB query failed:', error);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "2rem 0" }}>
        <div className="container-app">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RefreshCw style={{ width: "24px", height: "24px" }} />
            {isRtl ? "إدارة المبالغ المستردة" : "Refund Management"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>
            {isRtl ? `${transactions.length} معاملة • ${refunded.length} مسترد` : `${transactions.length} transactions • ${refunded.length} refunded`}
          </p>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        {/* Transactions list */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
            {isRtl ? "المعاملات القابلة للاسترداد" : "Refundable Transactions"}
          </h3>

          {transactions.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
              {isRtl ? "لا توجد معاملات" : "No transactions found"}
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <th style={{ padding: "0.75rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)", fontWeight: 600 }}>{isRtl ? "المستخدم" : "User"}</th>
                    <th style={{ padding: "0.75rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)", fontWeight: 600 }}>{isRtl ? "الغرض" : "Purpose"}</th>
                    <th style={{ padding: "0.75rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)", fontWeight: 600 }}>{isRtl ? "المبلغ" : "Amount"}</th>
                    <th style={{ padding: "0.75rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)", fontWeight: 600 }}>{isRtl ? "التاريخ" : "Date"}</th>
                    <th style={{ padding: "0.75rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)", fontWeight: 600 }}>{isRtl ? "الحالة" : "Status"}</th>
                    <th style={{ padding: "0.75rem", textAlign: "center", color: "var(--text-muted)", fontWeight: 600 }}>{isRtl ? "إجراء" : "Action"}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "0.75rem", color: "var(--text)" }}>{tx.user?.email}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <span className="chip" style={{ fontSize: "0.6875rem" }}>{tx.purpose}</span>
                      </td>
                      <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--error)" }}>
                        {tx.amount?.toLocaleString()} {isRtl ? "ر.س" : "SAR"}
                      </td>
                      <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <span className={`chip chip-${tx.status === "completed" ? "default" : tx.status === "refunded" ? "success" : "error"}`} style={{ fontSize: "0.6875rem" }}>
                          {tx.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        {tx.status === "completed" && (
                          <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                            <form action={processRefundAction} style={{ display: "inline" }}>
                              <input type="hidden" name="transactionId" value={tx.id} />
                              <input type="hidden" name="action" value="approve" />
                              <button type="submit" style={{
                                padding: "0.25rem 0.5rem", fontSize: "0.75rem", borderRadius: "var(--radius-md)",
                                border: "none", background: "var(--primary)", color: "white", cursor: "pointer", fontFamily: "inherit",
                              }}>
                                {isRtl ? "استرداد" : "Refund"}
                              </button>
                            </form>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent refunds */}
        {refunded.length > 0 && (
          <div className="card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
              <CheckCircle style={{ width: "16px", height: "16px", display: "inline", color: "var(--primary)" }} /> {isRtl ? "المبالغ المستردة" : "Processed Refunds"} ({refunded.length})
            </h3>
            {refunded.map((r: any) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border-light)", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--text-muted)" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                <span style={{ fontWeight: 700, color: "var(--primary)" }}>+{r.amount} {isRtl ? "ر.س" : "SAR"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
