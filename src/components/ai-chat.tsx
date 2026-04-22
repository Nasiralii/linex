"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AiChatWidget() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: "support",
          message: userMsg,
          locale,
          history: messages.slice(-10),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.message || data.error || "..." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: isRtl ? "عذراً، حدث خطأ. حاول مرة أخرى." : "Sorry, an error occurred. Try again." }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button onClick={() => setOpen(true)} style={{
          position: "fixed", bottom: "24px", [isRtl ? "left" : "right"]: "24px", zIndex: 999,
          width: "60px", height: "60px", borderRadius: "50%",
          background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
          color: "white", border: "none", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(15, 107, 87, 0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 200ms ease",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
        >
          <MessageCircle style={{ width: "28px", height: "28px" }} />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="animate-slide-in-up" style={{
          position: "fixed", bottom: "24px", [isRtl ? "left" : "right"]: "24px", zIndex: 999,
          width: "380px", maxWidth: "calc(100vw - 48px)", height: "520px", maxHeight: "calc(100vh - 100px)",
          borderRadius: "var(--radius-xl)", overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", background: "var(--surface)",
          border: "1px solid var(--border-light)",
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Bot style={{ width: "24px", height: "24px", color: "white" }} />
              <div>
                <div style={{ color: "white", fontSize: "0.9375rem", fontWeight: 700 }}>
                  {isRtl ? "مساعد لاينكس فرصة" : "LineX Forsa Assistant"}
                </div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.6875rem" }}>
                  {isRtl ? "متاح الآن • AI" : "Online now • AI"}
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
              width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "white",
            }}>
              <X style={{ width: "18px", height: "18px" }} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "1rem",
            display: "flex", flexDirection: "column", gap: "0.75rem",
            background: "var(--bg)",
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <Bot style={{ width: "40px", height: "40px", color: "var(--primary)", margin: "0 auto 0.75rem", opacity: 0.5 }} />
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {isRtl ? "مرحباً! كيف يمكنني مساعدتك؟\nاسأل عن المنصة، التسجيل، المشاريع، أو أي شيء آخر." : "Hello! How can I help you?\nAsk about the platform, registration, projects, or anything else."}
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex", gap: "0.5rem",
                flexDirection: msg.role === "user" ? (isRtl ? "row" : "row-reverse") : "row",
                alignItems: "flex-start",
              }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: msg.role === "user" ? "var(--primary-light)" : "var(--accent-light)",
                }}>
                  {msg.role === "user" ? <User style={{ width: "14px", height: "14px", color: "var(--primary)" }} /> : <Bot style={{ width: "14px", height: "14px", color: "var(--accent)" }} />}
                </div>
                <div style={{
                  maxWidth: "75%", padding: "0.625rem 0.875rem", borderRadius: "var(--radius-lg)",
                  fontSize: "0.8125rem", lineHeight: 1.5,
                  background: msg.role === "user" ? "var(--primary)" : "var(--surface)",
                  color: msg.role === "user" ? "white" : "var(--text)",
                  border: msg.role === "assistant" ? "1px solid var(--border-light)" : "none",
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Loader2 className="animate-spin" style={{ width: "14px", height: "14px", color: "var(--accent)" }} />
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {isRtl ? "جاري الكتابة..." : "Typing..."}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "0.75rem", borderTop: "1px solid var(--border-light)",
            display: "flex", gap: "0.5rem", background: "var(--surface)",
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={isRtl ? "اكتب سؤالك هنا..." : "Type your question..."}
              style={{
                flex: 1, padding: "0.625rem 0.875rem", borderRadius: "var(--radius-lg)",
                border: "1.5px solid var(--border)", background: "var(--bg)",
                fontSize: "0.8125rem", fontFamily: "inherit", outline: "none",
              }}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
              width: "40px", height: "40px", borderRadius: "var(--radius-lg)",
              background: "var(--primary)", color: "white", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              opacity: loading || !input.trim() ? 0.5 : 1,
            }}>
              <Send style={{ width: "18px", height: "18px" }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
