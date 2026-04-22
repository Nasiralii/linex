"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Sparkles, Loader2, X, Copy, CheckCircle } from "lucide-react";

interface AiAgentButtonProps {
  agent: string;
  label: string;
  labelAr: string;
  message?: string;
  data?: any;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function AiAgentButton({ agent, label, labelAr, message, data, icon, style, className }: AiAgentButtonProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const runAgent = async () => {
    setLoading(true); setResult(null); setShowResult(true);
    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, message: message || "", locale, data }),
      });
      setResult(await res.json());
    } catch {
      setResult({ error: isRtl ? "حدث خطأ" : "An error occurred" });
    }
    setLoading(false);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button onClick={runAgent} disabled={loading} className={className || "btn-primary"}
        style={{ fontSize: "0.8125rem", padding: "0.5rem 1rem", gap: "0.375rem", ...style }}>
        {loading ? <Loader2 className="animate-spin" style={{ width: "14px", height: "14px" }} /> : (icon || <Sparkles style={{ width: "14px", height: "14px" }} />)}
        {isRtl ? labelAr : label}
      </button>

      {/* Result Modal */}
      {showResult && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem",
        }} onClick={() => setShowResult(false)}>
          <div style={{
            background: "var(--surface)", borderRadius: "var(--radius-xl)",
            width: "100%", maxWidth: "600px", maxHeight: "80vh", overflow: "hidden",
            display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid var(--border-light)", background: "var(--primary-light)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles style={{ width: "18px", height: "18px", color: "var(--primary)" }} />
                <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.9375rem" }}>
                  {isRtl ? "نتائج الذكاء الاصطناعي" : "AI Results"}
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {result && !result.error && (
                  <button onClick={copyAll} style={{
                    display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem",
                    borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                    background: "white", cursor: "pointer", fontSize: "0.6875rem", fontFamily: "inherit",
                    color: copied ? "var(--success)" : "var(--text-muted)",
                  }}>
                    {copied ? <CheckCircle style={{ width: "12px", height: "12px" }} /> : <Copy style={{ width: "12px", height: "12px" }} />}
                    {copied ? "✓" : (isRtl ? "نسخ" : "Copy")}
                  </button>
                )}
                <button onClick={() => setShowResult(false)} style={{
                  width: "28px", height: "28px", borderRadius: "50%", border: "none",
                  background: "var(--border-light)", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <X style={{ width: "14px", height: "14px", color: "var(--text-muted)" }} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: "1.25rem", overflowY: "auto", flex: 1 }}>
              {loading && (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <Loader2 className="animate-spin" style={{ width: "32px", height: "32px", color: "var(--primary)", margin: "0 auto 1rem" }} />
                  <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                    {isRtl ? "جاري التحليل بالذكاء الاصطناعي..." : "AI is analyzing..."}
                  </p>
                </div>
              )}

              {result && result.error && (
                <div style={{ padding: "1rem", background: "var(--error-light)", borderRadius: "var(--radius-md)", color: "var(--error)", fontSize: "0.875rem" }}>
                  {result.error}
                </div>
              )}

              {result && !result.error && !loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {Object.entries(result).map(([key, value]: [string, any]) => {
                    if (!value || key === "error") return null;
                    return (
                      <div key={key} style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
                        <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.375rem", letterSpacing: "0.05em" }}>
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
          </div>
        </div>
      )}
    </>
  );
}
