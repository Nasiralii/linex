"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { Bot, MessageCircle, Sparkles, BarChart3, Send, FileText, PenTool, FileCheck, DollarSign, Star, Megaphone, Shield, Loader2, Copy, CheckCircle } from "lucide-react";

const AGENTS = [
  { id: "support", icon: MessageCircle, name: "Customer Support", nameAr: "الدعم الفني", color: "#0f6b57", placeholder: "Ask any question about the platform...", placeholderAr: "اسأل أي سؤال عن المنصة..." },
  { id: "intake", icon: Sparkles, name: "Project Intake", nameAr: "إنشاء المشاريع", color: "#c58b2a", placeholder: "Describe a project you want to create...", placeholderAr: "اوصف مشروع تريد إنشاءه..." },
  { id: "bid-evaluator", icon: BarChart3, name: "Bid Evaluator", nameAr: "محلل العروض", color: "#2563eb", placeholder: "Paste bid details to analyze...", placeholderAr: "الصق تفاصيل العروض للتحليل..." },
  { id: "admin-intelligence", icon: Shield, name: "Admin Intelligence", nameAr: "ذكاء الإدارة", color: "#7c3aed", placeholder: "Enter platform stats for analysis...", placeholderAr: "أدخل إحصائيات المنصة للتحليل..." },
  { id: "outreach", icon: Send, name: "Outreach Agent", nameAr: "وكيل التواصل", color: "#0891b2", placeholder: "Describe project + contractor for outreach message...", placeholderAr: "اوصف المشروع والمقاول لرسالة التواصل..." },
  { id: "contract-drafter", icon: FileText, name: "Contract Drafter", nameAr: "صياغة العقود", color: "#059669", placeholder: "Describe project details for contract...", placeholderAr: "اوصف تفاصيل المشروع للعقد..." },
  { id: "bid-writer", icon: PenTool, name: "Bid Writer", nameAr: "كتابة العروض", color: "#d97706", placeholder: "Describe project to write bid for...", placeholderAr: "اوصف المشروع لكتابة عرض..." },
  { id: "doc-verifier", icon: FileCheck, name: "Document Verifier", nameAr: "التحقق من الوثائق", color: "#dc2626", placeholder: "Paste document text to verify...", placeholderAr: "الصق نص الوثيقة للتحقق..." },
  { id: "price-estimate", icon: DollarSign, name: "Price Estimator", nameAr: "تقدير الأسعار", color: "#16a34a", placeholder: "Describe project for cost estimate...", placeholderAr: "اوصف المشروع لتقدير التكلفة..." },
  { id: "review-sentiment", icon: Star, name: "Review Sentiment", nameAr: "تحليل التقييمات", color: "#ea580c", placeholder: "Paste reviews to analyze...", placeholderAr: "الصق التقييمات للتحليل..." },
  { id: "marketing", icon: Megaphone, name: "Marketing Agent", nameAr: "وكيل التسويق", color: "#e11d48", placeholder: "What do you want to promote?", placeholderAr: "ماذا تريد أن تروج له؟" },
];

export default function AiHubPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const runAgent = async () => {
    if (!input.trim()) return;
    setLoading(true); setResult(null);
    try {
      const body: any = { agent: selectedAgent.id, message: input, locale, data: {} };
      if (selectedAgent.id === "marketing") body.data = { type: "instagram_post" };
      if (selectedAgent.id === "contract-drafter") body.data = { project: { title: input }, bid: { amount: 100000 }, contractType: "SIMPLE" };
      if (selectedAgent.id === "bid-writer") body.data = { project: { title: input, description: input }, contractor: { companyName: "Test Co" } };
      if (selectedAgent.id === "outreach") body.data = { project: { title: input, location: "Riyadh", budgetMin: 100000 }, contractor: { companyName: "ABC Construction" } };
      if (selectedAgent.id === "bid-evaluator") body.data = { projectTitle: input, bids: [{ id: "1", amount: 150000, timeline: 60, rating: 4.5 }, { id: "2", amount: 120000, timeline: 90, rating: 3.8 }] };
      if (selectedAgent.id === "admin-intelligence") body.data = { stats: { users: 150, projects: 45, bids: 120, awards: 12, revenue: 25000 } };
      if (selectedAgent.id === "review-sentiment") body.data = { reviews: [{ id: "1", rating: 5, comment: input }, { id: "2", rating: 2, comment: "Not good" }] };
      if (selectedAgent.id === "doc-verifier") body.data = { documentType: "business_license" };

      const res = await fetch("/api/agents/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      setResult(data);
    } catch { setResult({ error: "Agent failed" }); }
    setLoading(false);
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)", padding: "2rem 0" }}>
        <div className="container-app">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Bot style={{ width: "28px", height: "28px", color: "white" }} />
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>
                {isRtl ? "مركز وكلاء الذكاء الاصطناعي" : "AI Agents Hub"}
              </h1>
              <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
                {isRtl ? "اختبر وتفاعل مع جميع الوكلاء الـ 11" : "Test and interact with all 11 agents"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {/* Agent Selector Sidebar */}
          <div style={{ width: "280px", flexShrink: 0 }}>
            <div className="card" style={{ padding: "0.5rem", position: "sticky", top: "80px" }}>
              {AGENTS.map((agent, i) => (
                <button key={agent.id} onClick={() => { setSelectedAgent(agent); setResult(null); setInput(""); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "0.625rem",
                    padding: "0.75rem 0.875rem", borderRadius: "var(--radius-md)",
                    border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: isRtl ? "right" : "left",
                    background: selectedAgent.id === agent.id ? `${agent.color}12` : "transparent",
                    color: selectedAgent.id === agent.id ? agent.color : "var(--text-secondary)",
                    fontWeight: selectedAgent.id === agent.id ? 700 : 500,
                    fontSize: "0.8125rem", transition: "all 150ms ease",
                    borderRight: selectedAgent.id === agent.id && !isRtl ? `3px solid ${agent.color}` : "3px solid transparent",
                    borderLeft: selectedAgent.id === agent.id && isRtl ? `3px solid ${agent.color}` : "3px solid transparent",
                  }}>
                  <agent.icon style={{ width: "18px", height: "18px", flexShrink: 0 }} />
                  <span>{isRtl ? agent.nameAr : agent.name}</span>
                  <span style={{ fontSize: "0.625rem", background: `${agent.color}20`, color: agent.color, padding: "0.125rem 0.375rem", borderRadius: "var(--radius-full)", marginInlineStart: "auto" }}>
                    {i + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Agent Workspace */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Agent Header */}
            <div className="card" style={{ padding: "1.25rem", marginBottom: "1rem", borderTop: `3px solid ${selectedAgent.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: `${selectedAgent.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <selectedAgent.icon style={{ width: "24px", height: "24px", color: selectedAgent.color }} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
                    {isRtl ? selectedAgent.nameAr : selectedAgent.name}
                  </h2>
                  <span style={{ fontSize: "0.6875rem", color: "var(--success)", background: "var(--success-light)", padding: "0.125rem 0.5rem", borderRadius: "var(--radius-full)", fontWeight: 600 }}>
                    {isRtl ? "نشط" : "Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="card" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
              <textarea value={input} onChange={(e) => setInput(e.target.value)}
                placeholder={isRtl ? selectedAgent.placeholderAr : selectedAgent.placeholder}
                style={{ width: "100%", minHeight: "100px", resize: "vertical", marginBottom: "0.75rem" }} />
              <button onClick={runAgent} disabled={loading || !input.trim()} className="btn-primary" style={{ padding: "0.75rem 2rem" }}>
                {loading ? <><Loader2 className="animate-spin" style={{ width: "16px", height: "16px" }} /> {isRtl ? "جاري المعالجة..." : "Processing..."}</> :
                  <><selectedAgent.icon style={{ width: "16px", height: "16px" }} /> {isRtl ? "تشغيل الوكيل" : "Run Agent"}</>}
              </button>
            </div>

            {/* Results */}
            {result && (
              <div className="card" style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)" }}>
                    {isRtl ? "النتائج" : "Results"}
                  </h3>
                  <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.375rem 0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit", color: copied ? "var(--success)" : "var(--text-muted)" }}>
                    {copied ? <CheckCircle style={{ width: "12px", height: "12px" }} /> : <Copy style={{ width: "12px", height: "12px" }} />}
                    {copied ? "✓" : (isRtl ? "نسخ" : "Copy")}
                  </button>
                </div>

                {result.error ? (
                  <div style={{ padding: "1rem", background: "var(--error-light)", borderRadius: "var(--radius-md)", color: "var(--error)", fontSize: "0.875rem" }}>{result.error}</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {Object.entries(result).map(([key, value]: [string, any]) => {
                      if (!value || key === "error") return null;
                      return (
                        <div key={key} style={{ padding: "0.875rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
                          <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: selectedAgent.color, textTransform: "uppercase", marginBottom: "0.375rem", letterSpacing: "0.05em" }}>
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                          </div>
                          <div style={{ fontSize: "0.8125rem", color: "var(--text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                            {Array.isArray(value) ? value.map((item: any, i: number) => (
                              <div key={i} style={{ marginBottom: "0.25rem" }}>• {typeof item === "object" ? JSON.stringify(item) : String(item)}</div>
                            )) : typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
