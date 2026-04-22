"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";

interface Project {
  id: string; title: string; titleAr?: string; owner: string; type: string;
  status: string; bidsCount: number; awardAmount: number | null;
  awardContractor: string | null; createdAt: string;
  bids: { company: string; amount: number; status: string; score: number; confidence?: string | null; fallbackCount?: number; missingCount?: number; note?: string | null; rankedAt?: string | null }[];
}
interface Performer { rank: number; name: string; rating: number; projects: number; reviews: number }
interface Props { projects: Project[]; performers: Performer[]; isRtl: boolean }

const SC: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: "#f3f4f6", text: "#6b7280" }, PUBLISHED: { bg: "#ecfdf5", text: "#0f6b57" },
  BIDDING: { bg: "#fef3c7", text: "#c58b2a" }, AWARDED: { bg: "#eff6ff", text: "#2563eb" },
  IN_PROGRESS: { bg: "#e0f2fe", text: "#0369a1" }, COMPLETED: { bg: "#dcfce7", text: "#15803d" },
  CANCELLED: { bg: "#fee2e2", text: "#dc2626" }, PENDING_REVIEW: { bg: "#fff7ed", text: "#b45309" },
  SUBMITTED: { bg: "#eff6ff", text: "#2563eb" }, SHORTLISTED: { bg: "#fef3c7", text: "#c58b2a" },
  REJECTED: { bg: "#fee2e2", text: "#dc2626" }, WITHDRAWN: { bg: "#f3f4f6", text: "#6b7280" },
};
const MC = ["🥇", "🥈", "🥉"];
const TL: Record<string, { en: string; ar: string }> = {
  DESIGN_ONLY: { en: "Design", ar: "تصميم" }, CONSTRUCTION_ONLY: { en: "Construction", ar: "مقاولات" },
  DESIGN_AND_CONSTRUCTION: { en: "Design+Build", ar: "تصميم+مقاولات" },
};

function Chip({ status }: { status: string }) {
  const c = SC[status] || SC.DRAFT;
  return <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: "0.6875rem", fontWeight: 600, background: c.bg, color: c.text, display: "inline-block" }}>{status.replace(/_/g, " ")}</span>;
}

export default function DrillDownTable({ projects, performers, isRtl }: Props) {
  const [expId, setExpId] = useState<string | null>(null);
  const [sKey, setSKey] = useState("createdAt");
  const [sDir, setSDir] = useState<"asc" | "desc">("desc");
  const [hovRow, setHovRow] = useState<string | null>(null);

  const sort = (k: string) => { if (sKey === k) setSDir(d => d === "asc" ? "desc" : "asc"); else { setSKey(k); setSDir("desc"); } };
  const sorted = [...projects].sort((a: any, b: any) => { const va = a[sKey] ?? 0, vb = b[sKey] ?? 0; return sDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1); });
  const si = (k: string) => sKey === k ? (sDir === "asc" ? " ▲" : " ▼") : "";

  const glass = { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "1.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.6)" };
  const secHead = { fontSize: "1.125rem", fontWeight: 700 as const, color: "#1a2332", marginBottom: "1.25rem", display: "flex" as const, alignItems: "center" as const, gap: "0.5rem" };
  const th = { padding: "12px 10px", textAlign: (isRtl ? "right" : "left") as any, fontSize: "0.75rem", color: "#fff", fontWeight: 600, cursor: "pointer", userSelect: "none" as any };
  const td = { padding: "12px 10px", fontSize: "0.8125rem", color: "#374151" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={glass}>
        <h3 style={secHead}>
          <span style={{ width: 4, height: 20, borderRadius: 2, background: "linear-gradient(to bottom, #c58b2a, #a06d1e)", display: "inline-block" }} />
          {isRtl ? "جدول المشاريع التفصيلي" : "Projects Drill-Down"}
        </h3>
        <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead><tr style={{ background: "linear-gradient(135deg, #0f6b57, #0a4e41)" }}>
              <th style={th} onClick={() => sort("title")}>{(isRtl ? "المشروع" : "Project") + si("title")}</th>
              <th style={th} onClick={() => sort("owner")}>{(isRtl ? "المالك" : "Owner") + si("owner")}</th>
              <th style={th}>{isRtl ? "النوع" : "Type"}</th>
              <th style={th} onClick={() => sort("status")}>{(isRtl ? "الحالة" : "Status") + si("status")}</th>
              <th style={th} onClick={() => sort("bidsCount")}>{(isRtl ? "العروض" : "Bids") + si("bidsCount")}</th>
              <th style={th} onClick={() => sort("awardAmount")}>{(isRtl ? "الترسية" : "Award") + si("awardAmount")}</th>
              <th style={{ ...th, width: 36 }} />
            </tr></thead>
            <tbody>
              {sorted.length === 0 && <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "#9ca3af", padding: "2rem" }}>{isRtl ? "لا توجد مشاريع" : "No projects"}</td></tr>}
              {sorted.map((p, idx) => {
                const isE = expId === p.id, tl = TL[p.type] || { en: p.type, ar: p.type };
                const rowBg = hovRow === p.id ? "#f0fdf4" : idx % 2 === 0 ? "#fff" : "#faf9f6";
                return (<>
                  <tr key={p.id} onClick={() => setExpId(isE ? null : p.id)}
                    onMouseEnter={() => setHovRow(p.id)} onMouseLeave={() => setHovRow(null)}
                    style={{ cursor: "pointer", background: rowBg, transition: "background 0.2s", borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ ...td, fontWeight: 600, color: "#0f6b57" }}>{isRtl ? (p.titleAr || p.title) : p.title}</td>
                    <td style={td}>{p.owner}</td>
                    <td style={td}><span style={{ padding: "3px 10px", borderRadius: 12, background: "#f3f4f6", fontSize: "0.6875rem", fontWeight: 500 }}>{isRtl ? tl.ar : tl.en}</span></td>
                    <td style={td}><Chip status={p.status} /></td>
                    <td style={{ ...td, fontWeight: 700, color: "#1a2332" }}>{p.bidsCount}</td>
                    <td style={{ ...td, fontWeight: 700, color: p.awardAmount ? "#0f6b57" : "#9ca3af" }}>{p.awardAmount ? `${p.awardAmount.toLocaleString()} SAR` : "—"}</td>
                    <td style={td}>{isE ? <ChevronUp style={{ width: 16, height: 16, color: "#0f6b57" }} /> : <ChevronDown style={{ width: 16, height: 16, color: "#9ca3af" }} />}</td>
                  </tr>
                  {isE && <tr key={p.id + "-exp"}><td colSpan={7} style={{ padding: 0, borderBottom: "1px solid #e5e7eb" }}>
                    <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, #f0fdf4, #f5f2ea)", maxHeight: 300, overflow: "hidden", transition: "max-height 0.4s ease" }}>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f6b57", marginBottom: 10 }}>
                        {isRtl ? "تفاصيل العروض" : "Bid Details"}{p.awardContractor && ` — ${isRtl ? "الفائز" : "Winner"}: ${p.awardContractor}`}
                      </div>
                      <div style={{ fontSize: "0.6875rem", color: "#6b7280", marginBottom: 10 }}>
                        {isRtl ? "يعرض هذا القسم نتيجة الترتيب والثقة وعدد البدائل التحفظية المستخدمة داخلياً." : "This section shows internal ranking score, confidence, and conservative fallback usage."}
                      </div>
                      {p.bids.length === 0 ? <span style={{ fontSize: "0.8125rem", color: "#9ca3af" }}>{isRtl ? "لا عروض" : "No bids"}</span> : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {p.bids.map((b, j) => (
                            <div key={j} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.9)", borderRadius: 12, border: "1px solid #e5e7eb", backdropFilter: "blur(8px)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                                <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1a2332" }}>{b.company}</span>
                                <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                  {b.score > 0 && <span style={{ fontSize: "0.6875rem", color: "#7c3aed", fontWeight: 700, background: "#f3e8ff", padding: "2px 8px", borderRadius: 10 }}>AI: {b.score}</span>}
                                  {b.confidence && <span style={{ fontSize: "0.6875rem", color: "#0f6b57", fontWeight: 700, background: "#ecfdf5", padding: "2px 8px", borderRadius: 10 }}>{isRtl ? `ثقة: ${b.confidence}` : `Conf: ${b.confidence}`}</span>}
                                  {!!b.fallbackCount && <span style={{ fontSize: "0.6875rem", color: "#b45309", fontWeight: 700, background: "#fff7ed", padding: "2px 8px", borderRadius: 10 }}>{isRtl ? `بدائل: ${b.fallbackCount}` : `Fallbacks: ${b.fallbackCount}`}</span>}
                                  {!!b.missingCount && <span style={{ fontSize: "0.6875rem", color: "#dc2626", fontWeight: 700, background: "#fee2e2", padding: "2px 8px", borderRadius: 10 }}>{isRtl ? `نواقص: ${b.missingCount}` : `Missing: ${b.missingCount}`}</span>}
                                  <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f6b57" }}>{b.amount.toLocaleString()} SAR</span>
                                  <Chip status={b.status} />
                                </div>
                              </div>
                              {(b.note || b.rankedAt) && (
                                <div style={{ marginTop: 8, fontSize: "0.72rem", color: "#6b7280", lineHeight: 1.4 }}>
                                  {b.note && <div>{b.note}</div>}
                                  {b.rankedAt && <div>{isRtl ? "آخر تقييم:" : "Last ranked:"} {new Date(b.rankedAt).toLocaleString()}</div>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td></tr>}
                </>);
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performers */}
      <div style={glass}>
        <h3 style={secHead}>
          <span style={{ width: 4, height: 20, borderRadius: 2, background: "linear-gradient(to bottom, #c58b2a, #a06d1e)", display: "inline-block" }} />
          {isRtl ? "أفضل المقاولين أداءً" : "Top Performers"}
        </h3>
        {performers.length === 0 ? <div style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>{isRtl ? "لا توجد بيانات" : "No data"}</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {performers.map((pf, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 18px",
                background: i < 3 ? `linear-gradient(135deg, ${i === 0 ? "#fefce8" : i === 1 ? "#f8f9fa" : "#fdf4e8"}, #fff)` : "#fafafa",
                borderRadius: 14, border: i < 3 ? `1px solid ${i === 0 ? "#fde68a" : i === 1 ? "#d1d5db" : "#f5d0a9"}` : "1px solid #e5e7eb",
                transition: "transform 0.2s, box-shadow 0.2s", cursor: "default",
              }}>
                {i < 3 ? <span style={{ fontSize: "1.75rem" }}>{MC[i]}</span> : <span style={{ width: 30, textAlign: "center", fontSize: "1rem", fontWeight: 800, color: "#9ca3af" }}>{pf.rank}</span>}
                <span style={{ flex: 1, fontWeight: 700, fontSize: "0.9375rem", color: "#1a2332" }}>{pf.name}</span>
                <span style={{ fontSize: "0.875rem", color: "#c58b2a", fontWeight: 800 }}>★ {pf.rating.toFixed(1)}</span>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", background: "#f3f4f6", padding: "3px 10px", borderRadius: 10 }}>
                  {pf.projects} {isRtl ? "مشروع" : "proj"} · {pf.reviews} {isRtl ? "تقييم" : "reviews"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
