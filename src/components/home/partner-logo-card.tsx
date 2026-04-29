"use client";

import { Building2 } from "lucide-react";
import { useState } from "react";

type PartnerLogoCardProps = {
  src: string;
  label: string;
};

export function PartnerLogoCard({ src, label }: PartnerLogoCardProps) {
  const [hidden, setHidden] = useState(false);

  return (
    <article
      className="partner-logo-card group"
      style={{
        borderRadius: "1px",
        border: "1px solid var(--brand-ivory-dark)",
        background: "var(--brand-white)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: "0",
      }}
    >
      <div
        className="partner-logo-card-body"
        style={{
          flex: 1,
          minHeight: "156px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.85rem 0.8rem 0.7rem",
          position: "relative",
        }}
      >
        {!hidden ? (
          <img
            src={src}
            alt=""
            className="max-h-[52px] w-auto max-w-[85%] object-contain transition-transform duration-200 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
            onError={() => setHidden(true)}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
              color: "var(--brand-warm-grey)",
              textAlign: "center",
            }}
          >
            <Building2 style={{ width: "28px", height: "28px", opacity: 0.5 }} aria-hidden />
            <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.04em", lineHeight: 1.35 }}>
              Logo
            </span>
          </div>
        )}
      </div>
      <div className="partner-logo-card-footer" style={{ flexShrink: 0 }}>
        <span>{label}</span>
      </div>
    </article>
  );
}
