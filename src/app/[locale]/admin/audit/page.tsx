import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { FileText, User, Clock } from "lucide-react";
import { isFullAccessAdmin } from "@/lib/admin-config";

export default async function AuditLogPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user || user.role !== "ADMIN") return redirect({ href: "/auth/login", locale });
  if (!isFullAccessAdmin(user.email)) return redirect({ href: "/admin/users", locale });
  const isRtl = locale === "ar";

  let logs: any[] = [];
  try {
    logs = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { actor: { select: { email: true, role: true } } },
    });
  } catch (error) {
    console.error('[AuditLogPage] DB query failed:', error);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "2rem 0" }}>
        <div className="container-app">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>
            {isRtl ? "سجل العمليات" : "Audit Log"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>
            {isRtl ? "جميع الإجراءات الحساسة مسجلة هنا" : "All sensitive actions are logged here"}
          </p>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        {logs.length === 0 ? (
          <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
            <FileText style={{ width: "48px", height: "48px", color: "var(--text-muted)", margin: "0 auto 1rem" }} />
            <p style={{ color: "var(--text-muted)" }}>{isRtl ? "لا توجد سجلات بعد" : "No audit logs yet"}</p>
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                <thead>
                  <tr style={{ background: "var(--surface-2)" }}>
                    <th style={{ padding: "0.75rem 1rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)", fontWeight: 600 }}>
                      {isRtl ? "التاريخ" : "Date"}
                    </th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)", fontWeight: 600 }}>
                      {isRtl ? "المستخدم" : "User"}
                    </th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)", fontWeight: 600 }}>
                      {isRtl ? "الإجراء" : "Action"}
                    </th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)", fontWeight: 600 }}>
                      {isRtl ? "الكيان" : "Entity"}
                    </th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)", fontWeight: 600 }}>
                      {isRtl ? "التفاصيل" : "Details"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(log.createdAt).toLocaleString(isRtl ? "ar-SA" : "en-US")}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "var(--text)" }}>
                        {log.actor?.email || "System"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span style={{
                          padding: "0.2rem 0.5rem", borderRadius: "var(--radius-full)",
                          fontSize: "0.6875rem", fontWeight: 600,
                          background: "var(--primary-light)", color: "var(--primary)",
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "var(--text-secondary)" }}>
                        {log.entityType}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {log.metadata ? JSON.stringify(log.metadata).substring(0, 50) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
