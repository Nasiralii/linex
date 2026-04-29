"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqClientProps {
  badge: string;
  title: string;
  showMore: string;
  showLess: string;
  faqs: FaqItem[];
  initialVisible: number;
}

function FaqRow({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <article
      style={{
        borderRadius: "14px",
        border: `1px solid ${open ? "rgba(42,123,136,0.38)" : "var(--brand-ivory-dark)"}`,
        background: open
          ? "linear-gradient(135deg, rgba(42,123,136,0.055) 0%, var(--brand-white) 65%)"
          : "var(--brand-white)",
        overflow: "hidden",
        transition: "border-color 220ms ease, background 220ms ease, box-shadow 220ms ease",
        boxShadow: open
          ? "0 14px 36px -22px rgba(42,123,136,0.28)"
          : "0 3px 14px -10px rgba(27,42,74,0.12)",
      }}
    >
      {/* Question row / button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.85rem",
          padding: "0.9rem 1rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        {/* Number badge */}
        <span
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "999px",
            background: open ? "var(--brand-teal)" : "rgba(42,123,136,0.11)",
            color: open ? "#fff" : "var(--brand-teal)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "0.7rem",
            flexShrink: 0,
            transition: "background 220ms ease, color 220ms ease, transform 220ms ease",
            transform: open ? "scale(1.08)" : "scale(1)",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Question text */}
        <span
          style={{
            flex: 1,
            color: open ? "var(--brand-teal)" : "var(--brand-navy)",
            fontWeight: 700,
            fontSize: "0.91rem",
            lineHeight: 1.4,
            transition: "color 220ms ease",
          }}
        >
          {item.q}
        </span>

        {/* Chevron toggle */}
        <span
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "999px",
            background: open ? "var(--brand-teal)" : "var(--brand-ivory)",
            border: `1px solid ${open ? "transparent" : "var(--brand-ivory-dark)"}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 220ms ease, border-color 220ms ease",
          }}
        >
          <ChevronDown
            style={{
              width: "13px",
              height: "13px",
              color: open ? "#fff" : "var(--brand-teal)",
              transition: "transform 280ms cubic-bezier(0.4,0,0.2,1), color 220ms ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </span>
      </button>

      {/* Answer — always mounted, animated via max-height + opacity + translateY */}
      <div
        style={{
          maxHeight: open ? "500px" : "0px",
          opacity: open ? 1 : 0,
          overflow: "hidden",
          transition: open
            ? "max-height 380ms cubic-bezier(0.4,0,0.2,1), opacity 260ms ease 60ms"
            : "max-height 280ms cubic-bezier(0.4,0,0.2,1), opacity 180ms ease",
        }}
      >
        <div
          style={{
            padding: "0 1rem 1.05rem 3.15rem",
            transform: open ? "translateY(0)" : "translateY(-6px)",
            transition: "transform 320ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "2px",
              borderRadius: "999px",
              background: "var(--brand-teal)",
              marginBottom: "0.55rem",
              opacity: 0.45,
            }}
          />
          <p
            style={{
              margin: 0,
              color: "var(--brand-charcoal)",
              lineHeight: 1.76,
              fontSize: "0.88rem",
            }}
          >
            {item.a}
          </p>
        </div>
      </div>
    </article>
  );
}

export function FaqClient({
  badge,
  title,
  showMore,
  showLess,
  faqs,
  initialVisible,
}: FaqClientProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? faqs : faqs.slice(0, initialVisible);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.72rem",
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--brand-teal)",
            marginBottom: "0.6rem",
          }}
        >
          <span
            style={{
              width: "22px",
              height: "1.5px",
              background: "var(--brand-teal)",
              display: "inline-block",
            }}
          />
          {badge}
        </div>
        <h2
          style={{
            margin: 0,
            color: "var(--brand-navy)",
            fontWeight: 900,
            letterSpacing: "-0.025em",
            fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
            lineHeight: 1.1,
          }}
        >
          {title}
        </h2>
      </div>

      {/* FAQ list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
        {visible.map((item, idx) => (
          <FaqRow key={item.q} item={item} index={idx} />
        ))}
      </div>

      {/* View more / Show less toggle */}
      <div style={{ marginTop: "1.2rem" }}>
        <button
          type="button"
          onClick={() => {
            setExpanded((p) => !p);
            if (expanded) {
              document.getElementById("faq-contact-section")?.scrollIntoView({ behavior: "smooth" });
            }
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            border: "1px solid var(--brand-ivory-dark)",
            background: "var(--brand-white)",
            color: "var(--brand-navy)",
            fontWeight: 700,
            fontSize: "0.85rem",
            borderRadius: "999px",
            padding: "0.6rem 1.1rem",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 4px 16px -10px rgba(27,42,74,0.18)",
            transition: "box-shadow 180ms ease",
          }}
        >
          {expanded ? showLess : showMore}
          <ChevronDown
            style={{
              width: "15px",
              height: "15px",
              transition: "transform 260ms cubic-bezier(0.4,0,0.2,1)",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>
      </div>
    </div>
  );
}
