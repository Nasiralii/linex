"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { BadgeCheck, Layers, GitCompare, FileText, ChevronLeft, ChevronRight } from "lucide-react";

export function TrustPillarsSection() {
  const t = useTranslations("home");
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const scrollByCard = (direction: "prev" | "next") => {
    const container = carouselRef.current;
    if (!container) return;
    const card = container.querySelector<HTMLElement>(".trust-card");
    const step = card ? card.offsetWidth + 14 : container.clientWidth * 0.86;
    container.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  };
  const pillars = [
    {
      icon: BadgeCheck,
      title: t("trust.verifiedProfiles"),
      desc: t("trust.verifiedProfilesDesc"),
      accent: "#0d7377",
    },
    {
      icon: Layers,
      title: t("trust.transparentTiers"),
      desc: t("trust.transparentTiersDesc"),
      accent: "#1b2a4a",
    },
    {
      icon: GitCompare,
      title: t("trust.sideBySide"),
      desc: t("trust.sideBySideDesc"),
      accent: "#0d7377",
    },
    {
      icon: FileText,
      title: t("trust.documentedJourney"),
      desc: t("trust.documentedJourneyDesc"),
      accent: "#1b2a4a",
    },
  ];

  return (
    <section style={{ 
      background: "var(--brand-ivory)", 
      padding: "4rem 0",
      overflow: "hidden",
      position: "relative" 
    }}>
      {/* Decorative background element */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-5%",
        width: "40%",
        height: "120%",
        background: "radial-gradient(circle, rgba(13,115,119,0.03) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div className="container-app" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#0d7377",
              marginBottom: "0.875rem",
            }}
          >
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
            {t("trust.title")}
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--brand-navy)",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
            }}
          >
            {t("trust.title")}
          </h2>
        </div>

        <div
          ref={carouselRef}
          className="trust-grid"
          style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          alignItems: "start"
        }}
        >
          {pillars.map((item, i) => (
            <div
              key={i}
              className="trust-card"
              style={{
                background: "var(--brand-white)",
                padding: "2.5rem",
                borderRadius: "24px",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                marginTop: i % 2 === 0 ? "0" : "2rem", // Staggered effect
                boxShadow: "0 20px 40px -15px rgba(27,42,74,0.08)",
                border: "1px solid rgba(27,42,74,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem"
              }}
            >
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #e6f4f1 0%, #d4e8eb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "rotate(-5deg)"
              }}>
                <item.icon size={32} color="#0d7377" strokeWidth={1.5} />
              </div>

              <div>
                <h3 style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--brand-navy)",
                  marginBottom: "0.75rem"
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: "0.95rem",
                  color: "#4a5568",
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {item.desc}
                </p>
              </div>

              {/* Minimalist interactive indicator */}
              <div style={{
                marginTop: "auto",
                width: "30px",
                height: "2px",
                background: item.accent,
                opacity: 0.3
              }} />
            </div>
          ))}
        </div>

        <div className="trust-carousel-controls" aria-hidden>
          <button
            type="button"
            className="trust-carousel-btn"
            onClick={() => scrollByCard("prev")}
          >
            <ChevronLeft size={18} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            className="trust-carousel-btn"
            onClick={() => scrollByCard("next")}
          >
            <ChevronRight size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <style>{`
        .trust-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 30px 60px -12px rgba(27,42,74,0.12);
          border-color: #0d737740;
        }
        .trust-carousel-controls { display: none; }
        @media (min-width: 768px) and (max-width: 1024px) {
          .trust-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 1rem !important;
          }
          .trust-card {
            margin-top: 0 !important;
            min-width: 0 !important;
            padding: 1.6rem !important;
            border-radius: 18px !important;
          }
        }
        @media (max-width: 767px) {
          .trust-grid {
            display: flex !important;
            overflow-x: auto;
            gap: 0.9rem !important;
            scroll-snap-type: x mandatory;
            padding-bottom: 0.35rem;
            -webkit-overflow-scrolling: touch;
          }
          .trust-grid::-webkit-scrollbar { display: none; }
          .trust-card { margin-top: 0 !important; }
          .trust-card {
            min-width: 84%;
            scroll-snap-align: start;
            padding: 1.25rem !important;
            border-radius: 16px !important;
          }
          .trust-card h3 { font-size: 1rem !important; margin-bottom: 0.55rem !important; }
          .trust-card p { font-size: 0.84rem !important; line-height: 1.45 !important; }
          .trust-card > div:first-child { width: 50px !important; height: 50px !important; border-radius: 14px !important; }
          .trust-card > div:first-child svg { width: 24px !important; height: 24px !important; }
          .trust-carousel-controls {
            margin-top: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.65rem;
          }
          .trust-carousel-btn {
            width: 38px;
            height: 38px;
            border-radius: 999px;
            border: 1px solid rgba(13,115,119,0.26);
            background: var(--brand-white);
            color: var(--brand-teal);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 20px -14px rgba(27,42,74,0.35);
          }
        }
      `}</style>
    </section>
  );
}