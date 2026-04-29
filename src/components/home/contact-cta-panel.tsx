"use client";

import { useState } from "react";
import { Mail, Clock, Building2, ArrowRight, Send, CheckCircle2 } from "lucide-react";

interface Channel {
  icon: "email" | "hours" | "operator";
  label: string;
  value: string;
}

interface ContactCtaPanelProps {
  badge: string;
  headline: string;
  copy: string;
  formTitle: string;
  fieldName: string;
  fieldEmail: string;
  fieldMessage: string;
  fieldMessagePlaceholder: string;
  submit: string;
  submitSending: string;
  submitSuccess: string;
}

const CHANNEL_ICONS = {
  email: Mail,
  hours: Clock,
  operator: Building2,
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  fontSize: "0.88rem",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 180ms ease, background 180ms ease",
  boxSizing: "border-box",
};

export function ContactCtaPanel({
  badge,
  headline,
  copy,
  formTitle,
  fieldName,
  fieldEmail,
  fieldMessage,
  fieldMessagePlaceholder,
  submit,
  submitSending,
  submitSuccess,
}: ContactCtaPanelProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  }

  return (
    <div
      className="relative lg:sticky lg:top-24"
      style={{
        background: "linear-gradient(155deg, var(--brand-teal) 0%, #0a5a5d 100%)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 22px 48px -28px rgba(13,115,119,0.55)",
        borderRadius: "20px",
        padding: "2rem 2.2rem",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Decorative glow top-right */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-70px",
          right: "-70px",
          width: "220px",
          height: "220px",
          borderRadius: "999px",
          background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Decorative glow bottom-left */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-50px",
          left: "-50px",
          width: "160px",
          height: "160px",
          borderRadius: "999px",
          background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Badge + live status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          marginBottom: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.7rem",
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.78)",
          }}
        >
          <span style={{ width: "20px", height: "1.5px", background: "rgba(255,255,255,0.65)", display: "inline-block" }} />
          {badge}
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.2rem 0.55rem 0.2rem 0.45rem",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.18)",
            fontSize: "0.66rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.92)",
          }}
        >
          <span className="cct-live-dot" aria-hidden />
          Online
        </div>
      </div>

      {/* Headline */}
      <h2
        style={{
          margin: "0 0 0.5rem",
          color: "#ffffff",
          fontWeight: 800,
          letterSpacing: "-0.025em",
          fontSize: "clamp(1.25rem, 2.2vw, 1.7rem)",
          lineHeight: 1.2,
        }}
      >
        {headline}
      </h2>

      {/* White underline */}
      <div style={{ width: "36px", height: "3px", borderRadius: "999px", background: "rgba(255,255,255,0.65)", marginBottom: "0.85rem" }} />

      {/* Short copy */}
      <p style={{ margin: "0 0 1.4rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.68, fontSize: "0.88rem" }}>
        {copy}
      </p>

      {/* ── Inline contact form ── */}
      <p
        style={{
          margin: "0 0 0.75rem",
          color: "rgba(255,255,255,0.65)",
          fontSize: "0.68rem",
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {formTitle}
      </p>

      {sent ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.7rem",
            padding: "1rem 1.1rem",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.32)",
            marginBottom: "1.5rem",
          }}
        >
          <CheckCircle2 style={{ width: "18px", height: "18px", color: "#fff", flexShrink: 0 }} />
          <p style={{ margin: 0, color: "rgba(255,255,255,0.92)", fontSize: "0.85rem", lineHeight: 1.5 }}>
            {submitSuccess}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "1.5rem" }}>
          {/* Name + Email row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em" }}>
                {fieldName}
              </label>
              <input
                type="text"
                required
                placeholder="John"
                style={INPUT_STYLE}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em" }}>
                {fieldEmail}
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                style={INPUT_STYLE}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
              />
            </div>
          </div>

          {/* Message */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em" }}>
              {fieldMessage}
            </label>
            <textarea
              required
              rows={3}
              placeholder={fieldMessagePlaceholder}
              style={{ ...INPUT_STYLE, resize: "none", lineHeight: 1.6 }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
                e.currentTarget.style.background = "rgba(255,255,255,0.14)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
            />
          </div>

          {/* Submit + reply microcopy */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              disabled={sending}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.72rem 1.3rem",
                borderRadius: "10px",
                background: sending ? "rgba(184,115,51,0.55)" : "var(--brand-copper)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.88rem",
                border: "none",
                cursor: sending ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                boxShadow: sending ? "none" : "0 6px 20px -6px rgba(184,115,51,0.55)",
                transition: "background 180ms ease, opacity 180ms ease, transform 180ms ease",
              }}
              onMouseEnter={(e) => {
                if (!sending) e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Send style={{ width: "14px", height: "14px" }} />
              {sending ? submitSending : submit}
            </button>
            <span
              aria-hidden
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.74rem",
                lineHeight: 1.2,
              }}
            >
              <Clock style={{ width: "13px", height: "13px", opacity: 0.85 }} />
              Replies within 1 business day
            </span>
          </div>
        </form>
      )}

      <style>{`
        .cct-live-dot {
          position: relative;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #4ade80;
          box-shadow: 0 0 0 2px rgba(74,222,128,0.18);
        }
        .cct-live-dot::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: #4ade80;
          opacity: 0.6;
          animation: cct-live-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes cct-live-ping {
          0%   { transform: scale(1);   opacity: 0.55; }
          70%  { transform: scale(2.4); opacity: 0;    }
          100% { transform: scale(2.4); opacity: 0;    }
        }
        @media (prefers-reduced-motion: reduce) {
          .cct-live-dot::after { animation: none; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full-width "How to reach us" strip — channels on the left, CTAs on the right
// ─────────────────────────────────────────────────────────────────────────────
interface ContactActionsStripProps {
  channelsTitle: string;
  channels: { icon: "form" | "email" | "hours" | "operator"; label: string; value: string }[];
  ctaOwner: string;
  ctaPro: string;
  ctaSupport: string;
}

export function ContactActionsStrip({
  channelsTitle,
  channels,
  ctaOwner,
  ctaPro,
  ctaSupport,
}: ContactActionsStripProps) {
  const infoChannels = channels.filter((c) => c.icon !== "form") as Channel[];

  return (
    <div
      style={{
        position: "relative",
        background: "var(--brand-white)",
        border: "1px solid var(--brand-ivory-dark)",
        borderRadius: "20px",
        padding: "1.6rem 1.8rem",
        boxShadow: "0 18px 48px -32px rgba(27,42,74,0.18)",
        overflow: "hidden",
      }}
    >
      {/* Teal accent stripe — visual continuation of the teal panel above */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          insetInlineStart: "1.8rem",
          width: "48px",
          height: "3px",
          borderRadius: "0 0 999px 999px",
          background: "var(--brand-teal)",
        }}
      />

      <div
        className="grid grid-cols-1 lg:grid-cols-12"
        style={{ gap: "1.5rem", alignItems: "start" }}
      >
        {/* Channels — left */}
        <div className="lg:col-span-8">
          <p
            style={{
              margin: "0 0 1rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--brand-teal)",
              fontSize: "0.68rem",
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            <span aria-hidden style={{ width: "18px", height: "1.5px", background: "var(--brand-teal)", display: "inline-block" }} />
            {channelsTitle}
          </p>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            style={{ gap: "0.85rem" }}
          >
            {infoChannels.map((ch) => {
              const Icon = CHANNEL_ICONS[ch.icon];
              return (
                <div
                  key={ch.label}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.7rem",
                    padding: "0.75rem 0.85rem",
                    borderRadius: "12px",
                    background: "var(--brand-ivory)",
                    border: "1px solid var(--brand-ivory-dark)",
                  }}
                >
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "9px",
                      background: "rgba(13,115,119,0.1)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: "14px", height: "14px", color: "var(--brand-teal)" }} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, color: "var(--brand-navy)", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      {ch.label}
                    </p>
                    <p style={{ margin: "0.2rem 0 0", color: "var(--brand-charcoal)", fontSize: "0.82rem", lineHeight: 1.45 }}>
                      {ch.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTAs — right */}
        <div
          className="lg:col-span-4"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.55rem",
            width: "100%",
            maxWidth: "280px",
            marginInlineStart: "auto",
          }}
        >
          <a
            href="/dashboard/projects/new"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.85rem 1.1rem",
              borderRadius: "12px",
              background: "var(--brand-copper)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
              boxShadow: "0 8px 24px -10px rgba(184,115,51,0.55)",
              transition: "opacity 160ms ease, transform 160ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {ctaOwner}
            <ArrowRight style={{ width: "15px", height: "15px" }} />
          </a>
          <a
            href="/auth/register?role=professional"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.85rem 1.1rem",
              borderRadius: "12px",
              background: "var(--brand-white)",
              border: "1.5px solid rgba(13,115,119,0.45)",
              color: "var(--brand-teal)",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
              transition: "background 160ms ease, transform 160ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(13,115,119,0.06)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--brand-white)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {ctaPro}
            <ArrowRight style={{ width: "15px", height: "15px" }} />
          </a>
          <a
            href="/contact"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.85rem 1.1rem",
              borderRadius: "12px",
              background: "transparent",
              border: "1px solid var(--brand-ivory-dark)",
              color: "var(--brand-navy)",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
              transition: "background 160ms ease, border-color 160ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--brand-ivory)";
              e.currentTarget.style.borderColor = "rgba(13,115,119,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "var(--brand-ivory-dark)";
            }}
          >
            {ctaSupport}
            <ArrowRight style={{ width: "15px", height: "15px" }} />
          </a>
        </div>
      </div>
    </div>
  );
}
