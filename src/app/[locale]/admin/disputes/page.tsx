import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { AlertTriangle, CheckCircle, Clock, MessageSquare, XCircle } from "lucide-react";
import { isFullAccessAdmin } from "@/lib/admin-config";

// G15: Admin dispute resolution UI

async function resolveDisputeAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return;
  const disputeId = formData.get("disputeId") as string;
  const resolution = formData.get("resolution") as string;
  const action = formData.get("action") as string;

  try {
    await db.dispute.update({
      where: { id: disputeId },
      data: {
        status: action === "resolve" ? "RESOLVED" : "CLOSED",
        resolution: resolution || "Resolved by admin",
        resolvedAt: new Date(),
      },
    });

    await db.auditLog.create({
      data: { actorId: user.id, action: `DISPUTE_${action.toUpperCase()}`, entityType: "dispute", entityId: disputeId },
    });
  } catch (error) {
    console.error('[resolveDisputeAction] DB query failed:', error);
  }
  revalidatePath("/admin/disputes");
}

export default async function AdminDisputesPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user || user.role !== "ADMIN") return redirect({ href: "/dashboard", locale });
  if (!isFullAccessAdmin(user.email)) return redirect({ href: "/admin/users", locale });
  const isRtl = locale === "ar";

  let disputes: any[] = [];
  try {
    disputes = await db.dispute.findMany({
      orderBy: { createdAt: "desc" },
      include: { project: { select: { title: true, titleAr: true } } },
      take: 50,
    });
  } catch (error) {
    console.error('[AdminDisputesPage] DB query failed:', error);
  }

  const open = disputes.filter(d => d.status === "OPEN" || d.status === "UNDER_REVIEW");
  const resolved = disputes.filter(d => d.status === "RESOLVED" || d.status === "CLOSED");

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "2rem 0" }}>
        <div className="container-app">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle style={{ width: "24px", height: "24px" }} />
            {isRtl ? "إدارة النزاعات" : "Dispute Resolution"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>
            {isRtl ? `${open.length} نزاع مفتوح` : `${open.length} open disputes`}
          </p>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
          <Clock style={{ width: "16px", height: "16px", display: "inline", color: "var(--accent)" }} /> {isRtl ? "نزاعات مفتوحة" : "Open Disputes"}
        </h3>
        {open.length === 0 ? (
          <div className="card" style={{ padding: "2rem", textAlign: "center", marginBottom: "2rem" }}>
            <p style={{ color: "var(--text-muted)" }}>{isRtl ? "لا توجد نزاعات مفتوحة" : "No open disputes"}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
            {open.map((d: any) => (
              <div key={d.id} className="card" style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <div>
                    <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)" }}>
                      {isRtl ? (d.project?.titleAr || d.project?.title) : d.project?.title} — #{d.id.slice(-6)}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                      {isRtl ? "السبب:" : "Reason:"} {d.reason}
                    </div>
                    {d.description && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{d.description}</p>}
                  </div>
                  <span className="chip chip-error" style={{ fontSize: "0.6875rem" }}>{d.status}</span>
                </div>
                <form action={resolveDisputeAction} style={{ display: "flex", gap: "0.5rem", alignItems: "end" }}>
                  <input type="hidden" name="disputeId" value={d.id} />
                  <div style={{ flex: 1 }}>
                    <input type="text" name="resolution" placeholder={isRtl ? "القرار / الحل..." : "Resolution notes..."} style={{ fontSize: "0.8125rem" }} />
                  </div>
                  <input type="hidden" name="action" value="resolve" />
                  <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>
                    <CheckCircle style={{ width: "14px", height: "14px" }} /> {isRtl ? "حل" : "Resolve"}
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {resolved.length > 0 && (
          <>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
              <CheckCircle style={{ width: "16px", height: "16px", display: "inline", color: "var(--primary)" }} /> {isRtl ? "نزاعات محلولة" : "Resolved"} ({resolved.length})
            </h3>
            {resolved.slice(0, 10).map((d: any) => (
              <div key={d.id} className="card" style={{ padding: "0.75rem 1rem", marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--text)" }}>{d.reason}</span>
                <span style={{ color: "var(--primary)" }}>{d.resolution}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
