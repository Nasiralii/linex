import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAuthAuditPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user || user.role !== "ADMIN") return redirect({ href: "/auth/login", locale });
  const isRtl = locale === "ar";

  let logs: any[] = [];
  try {
    logs = await db.auditLog.findMany({
      where: {
        entityType: "auth",
        OR: [
          { action: { startsWith: "AUTH_" } },
          { action: { contains: "auth" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { actor: { select: { email: true, role: true } } },
    });
  } catch (error) {
    console.error("[AdminAuthAuditPage] DB query failed:", error);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "2rem 0" }}>
        <div className="container-app">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck style={{ width: 22, height: 22 }} />
            {isRtl ? "سجل حوادث المصادقة" : "Auth Incident Log"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>
            {isRtl ? "جميع أحداث تسجيل الدخول والجلسات وعدم التزامن" : "All login, session and auth sync events"}
          </p>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  <th style={{ padding: "0.75rem 1rem", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "التاريخ" : "Date"}</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "المستخدم" : "User"}</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "الحدث" : "Event"}</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "التفاصيل" : "Details"}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap", color: "var(--text-muted)" }}>
                      {new Date(log.createdAt).toLocaleString(isRtl ? "ar-SA" : "en-US")}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>{log.actor?.email || "System"}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{ padding: "0.2rem 0.5rem", borderRadius: "var(--radius-full)", background: "var(--primary-light)", color: "var(--primary)", fontSize: "0.6875rem", fontWeight: 700 }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", maxWidth: 480 }}>
                      {log.metadata ? JSON.stringify(log.metadata) : "—"}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                      {isRtl ? "لا توجد أحداث مصادقة مسجلة بعد" : "No auth incidents logged yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}