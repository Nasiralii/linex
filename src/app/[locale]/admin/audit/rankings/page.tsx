import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { extractStoredBidRankingSnapshot } from "@/lib/bid-ranking-policy";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBidRankingAuditPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user || user.role !== "ADMIN") return redirect({ href: "/dashboard", locale });
  const isRtl = locale === "ar";

  const logs = await db.auditLog.findMany({
    where: { action: "BID_RANKED", entityType: "bid" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "2rem 0" }}>
        <div className="container-app">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText style={{ width: 22, height: 22 }} />
            {isRtl ? "سجل تقييم وترتيب العروض" : "Bid Ranking Audit Trail"}
          </h1>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        <div className="card" style={{ padding: "1rem", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "العرض" : "Bid"}</th>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "النتيجة" : "Score"}</th>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "الثقة" : "Confidence"}</th>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "البدائل" : "Fallbacks"}</th>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "ملاحظة" : "Note"}</th>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "التاريخ" : "Date"}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const snapshot = extractStoredBidRankingSnapshot(log.metadata);
                return (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.5rem" }}>{log.entityId}</td>
                    <td style={{ padding: "0.5rem" }}>{snapshot?.totalScore ?? "—"}</td>
                    <td style={{ padding: "0.5rem" }}>{snapshot?.confidence ?? "—"}</td>
                    <td style={{ padding: "0.5rem" }}>{snapshot?.usedFallbacks?.length ?? 0}</td>
                    <td style={{ padding: "0.5rem", maxWidth: 420 }}>{(isRtl ? snapshot?.explanationsAr?.[0] : snapshot?.explanationsEn?.[0]) || "—"}</td>
                    <td style={{ padding: "0.5rem" }}>{new Date(log.createdAt).toLocaleString()}</td>
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