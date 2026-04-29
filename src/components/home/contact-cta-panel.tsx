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
  channelsTitle: string;
  channels: { icon: "form" | "email" | "hours" | "operator"; label: string; value: string }[];
  ctaOwner: string;
  ctaPro: string;
  ctaSupport: string;
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
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
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
  channelsTitle,
  channels,
  ctaOwner,
  ctaPro,
  ctaSupport,
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

  // Only show email/hours/operator in the mini channel list (skip "form" since form is inline)
  const infoChannels = channels.filter(
    (c) => c.icon !== "form"
  ) as Channel[];

  return (
    <div
      style={{
        background: "linear-gradient(145deg, var(--brand-navy) 0%, #0d2240 100%)",
        borderRadius: "20px",
        padding: "2rem 2.2rem",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        height: "100%",
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
          background: "radial-gradient(circle, rgba(42,123,136,0.22) 0%, transparent 70%)",
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
          background: "radial-gradient(circle, rgba(42,123,136,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.7rem",
          fontWeight: 800,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--brand-teal)",
          marginBottom: "0.75rem",
        }}
      >
        <span style={{ width: "20px", height: "1.5px", background: "var(--brand-teal)", display: "inline-block" }} />
        {badge}
      </div>

      {/* Headline */}
      <h2
        style={{
          margin: "0 0 0.5rem",
          color: "#ffffff",
          fontWeight: 900,
          letterSpacing: "-0.025em",
          fontSize: "clamp(1.25rem, 2.2vw, 1.7rem)",
          lineHeight: 1.15,
        }}
      >
        {headline}
      </h2>

      {/* Teal underline */}
      <div style={{ width: "36px", height: "3px", borderRadius: "999px", background: "var(--brand-teal)", marginBottom: "0.85rem" }} />

      {/* Short copy */}
      <p style={{ margin: "0 0 1.5rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.68, fontSize: "0.85rem" }}>
        {copy}
      </p>

      {/* ── Inline contact form ── */}
      <p
        style={{
          margin: "0 0 0.75rem",
          color: "rgba(255,255,255,0.45)",
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
            background: "rgba(42,123,136,0.18)",
            border: "1px solid rgba(42,123,136,0.35)",
            marginBottom: "1.5rem",
          }}
        >
          <CheckCircle2 style={{ width: "18px", height: "18px", color: "var(--brand-teal)", flexShrink: 0 }} />
          <p style={{ margin: 0, color: "rgba(255,255,255,0.85)", fontSize: "0.85rem", lineHeight: 1.5 }}>
            {submitSuccess}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "1.5rem" }}>
          {/* Name + Email row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <label style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em" }}>
                {fieldName}
              </label>
              <input
                type="text"
                required
                placeholder="Nasir Al-..."
                style={INPUT_STYLE}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(42,123,136,0.6)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <label style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em" }}>
                {fieldEmail}
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                style={INPUT_STYLE}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(42,123,136,0.6)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
              />
            </div>
          </div>

          {/* Message */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <label style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em" }}>
              {fieldMessage}
            </label>
            <textarea
              required
              rows={3}
              placeholder={fieldMessagePlaceholder}
              style={{ ...INPUT_STYLE, resize: "none", lineHeight: 1.6 }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(42,123,136,0.6)";
                e.currentTarget.style.background = "rgba(255,255,255,0.09)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
            />
          </div>

          {/* Submit */}
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
              background: sending ? "rgba(42,123,136,0.5)" : "var(--brand-teal)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.88rem",
              border: "none",
              cursor: sending ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "background 180ms ease, opacity 180ms ease",
              alignSelf: "flex-start",
            }}
          >
            <Send style={{ width: "14px", height: "14px" }} />
            {sending ? submitSending : submit}
          </button>
        </form>
      )}

      {/* ── Channel info strip ── */}
      <p
        style={{
          margin: "0 0 0.6rem",
          color: "rgba(255,255,255,0.38)",
          fontSize: "0.65rem",
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {channelsTitle}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.42rem", marginBottom: "1.6rem" }}>
        {infoChannels.map((ch) => {
          const Icon = CHANNEL_ICONS[ch.icon];
          return (
            <div key={ch.label} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "7px",
                  background: "rgba(42,123,136,0.16)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: "11px", height: "11px", color: "var(--brand-teal)" }} />
              </span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.76rem" }}>
                <strong style={{ color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>{ch.label}:</strong>{" "}
                {ch.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── CTAs ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "auto" }}>
        <a
          href="/dashboard/projects/new"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1rem",
            borderRadius: "11px",
            background: "var(--brand-teal)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.85rem",
            textDecoration: "none",
            transition: "opacity 160ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {ctaOwner}
          <ArrowRight style={{ width: "14px", height: "14px" }} />
        </a>
        <a
          href="/auth/register?role=professional"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1rem",
            borderRadius: "11px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.88)",
            fontWeight: 700,
            fontSize: "0.85rem",
            textDecoration: "none",
            transition: "background 160ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.11)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        >
          {ctaPro}
          <ArrowRight style={{ width: "14px", height: "14px" }} />
        </a>
        <a
          href="/contact"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1rem",
            borderRadius: "11px",
            background: "transparent",
            border: "1px solid rgba(42,123,136,0.35)",
            color: "var(--brand-teal)",
            fontWeight: 700,
            fontSize: "0.85rem",
            textDecoration: "none",
            transition: "background 160ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(42,123,136,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {ctaSupport}
          <ArrowRight style={{ width: "14px", height: "14px" }} />
        </a>
      </div>
    </div>
  );
}
