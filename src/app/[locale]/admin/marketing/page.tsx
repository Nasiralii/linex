"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { Megaphone, Instagram, Loader2, Copy, CheckCircle, Twitter, Linkedin, Facebook, Calendar } from "lucide-react";

export default function AdminMarketingPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [contentType, setContentType] = useState("instagram_post");
  const [topic, setTopic] = useState("");

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: "marketing", message: topic, locale, data: { type: contentType } }),
      });
      setResult(await res.json());
    } catch { setResult({ error: "Failed" }); }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const types = [
    { id: "instagram_post", label: isRtl ? "منشور انستغرام" : "Instagram Post", icon: Instagram },
    { id: "instagram_story", label: isRtl ? "ستوري انستغرام" : "Instagram Story", icon: Instagram },
    { id: "twitter", label: "Twitter/X", icon: Twitter },
    { id: "linkedin", label: "LinkedIn", icon: Linkedin },
    { id: "facebook", label: "Facebook", icon: Facebook },
    { id: "campaign", label: isRtl ? "حملة كاملة" : "Full Campaign", icon: Calendar },
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #e11d48, #be123c)", padding: "2rem 0" }}>
        <div className="container-app">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Megaphone style={{ width: "28px", height: "28px", color: "white" }} />
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>
                {isRtl ? "وكيل التسويق بالذكاء الاصطناعي" : "AI Marketing Agent"}
              </h1>
              <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
                {isRtl ? "إنشاء محتوى لوسائل التواصل الاجتماعي" : "Generate social media content"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem", maxWidth: "900px" }}>
        {/* Content Type Selector */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <label style={{ marginBottom: "0.75rem", display: "block" }}>
            {isRtl ? "نوع المحتوى" : "Content Type"}
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
            {types.map(t => (
              <button key={t.id} onClick={() => setContentType(t.id)} style={{
                padding: "0.75rem", borderRadius: "var(--radius-md)",
                border: contentType === t.id ? "2px solid var(--primary)" : "2px solid var(--border-light)",
                background: contentType === t.id ? "var(--primary-light)" : "var(--surface)",
                cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center",
                gap: "0.5rem", fontSize: "0.8125rem", fontWeight: 600,
                color: contentType === t.id ? "var(--primary)" : "var(--text-secondary)",
              }}>
                <t.icon style={{ width: "16px", height: "16px" }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Input */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <label>{isRtl ? "موضوع المحتوى" : "Content Topic"}</label>
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder={isRtl ? "مثال: ترويج لخدمة الكراسات الجديدة، أو الإعلان عن 100 مشروع جديد..." : "Example: Promote the new Krasat service, announce 100 new projects..."}
            style={{ width: "100%", minHeight: "80px", resize: "vertical", marginBottom: "1rem" }} />
          <button onClick={generate} disabled={loading || !topic.trim()} className="btn-primary" style={{ padding: "0.75rem 2rem" }}>
            {loading ? <><Loader2 className="animate-spin" style={{ width: "16px", height: "16px" }} /> {isRtl ? "جاري الإنشاء..." : "Generating..."}</> :
              <><Megaphone style={{ width: "16px", height: "16px" }} /> {isRtl ? "إنشاء المحتوى" : "Generate Content"}</>}
          </button>
        </div>

        {/* Results */}
        {result && !result.error && (
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
                {isRtl ? "المحتوى المُنشأ" : "Generated Content"}
              </h3>
              <button onClick={() => copyToClipboard(JSON.stringify(result, null, 2))} style={{
                display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem",
                borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                background: "transparent", cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit",
                color: copied ? "var(--success)" : "var(--text-muted)",
              }}>
                {copied ? <CheckCircle style={{ width: "14px", height: "14px" }} /> : <Copy style={{ width: "14px", height: "14px" }} />}
                {copied ? (isRtl ? "تم النسخ!" : "Copied!") : (isRtl ? "نسخ الكل" : "Copy All")}
              </button>
            </div>

            {/* Render based on content type */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {Object.entries(result).map(([key, value]: [string, any]) => {
                if (!value || key === "error") return null;
                const isArray = Array.isArray(value);
                return (
                  <div key={key} style={{ padding: "1rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
                    <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--text)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                      {isArray ? (value as any[]).map((item: any, i: number) => (
                        <div key={i} style={{ marginBottom: "0.5rem" }}>
                          {typeof item === "object" ? JSON.stringify(item, null, 2) : String(item)}
                        </div>
                      )) : typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                    </div>
                    <button onClick={() => copyToClipboard(isArray ? (value as any[]).join("\n") : String(value))} style={{
                      marginTop: "0.5rem", fontSize: "0.6875rem", color: "var(--primary)",
                      background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
                    }}>
                      {isRtl ? "📋 نسخ" : "📋 Copy"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
