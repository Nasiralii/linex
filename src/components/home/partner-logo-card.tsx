"use client";

import { Building2 } from "lucide-react";
import { useState } from "react";

const EXTS = [".webp", ".png", ".jpg", ".jpeg"] as const;

type PartnerLogoCardProps = {
  index: number;
  label: string;
};

export function PartnerLogoCard({ index, label }: PartnerLogoCardProps) {
  const [extIdx, setExtIdx] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [useDefaultLogo, setUseDefaultLogo] = useState(false);
  const src = useDefaultLogo ? "/logo.jpg" : `/partners/${index}${EXTS[extIdx]}`;

  function onImgError() {
    if (useDefaultLogo) {
      setHidden(true);
      return;
    }
    if (extIdx < EXTS.length - 1) {
      setExtIdx((x) => x + 1);
    } else {
      setUseDefaultLogo(true);
    }
  }

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
          minHeight: "106px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.85rem 0.8rem 0.7rem",
          position: "relative",
        }}
      >
        {!hidden ? (
          <img
            key={extIdx}
            src={src}
            alt=""
            className="max-h-[52px] w-auto max-w-[85%] object-contain transition-transform duration-200 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
            onError={onImgError}
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
