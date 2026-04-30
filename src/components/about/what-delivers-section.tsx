"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { FolderPlus, Users, BarChartHorizontal, ShieldCheck, MessageSquare, FileCheck, Star, ChevronLeft, ChevronRight } from "lucide-react";

export function WhatDeliversSection() {
  const t = useTranslations("about");
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);

  const scrollByCard = (direction: "prev" | "next") => {
    const el = mobileCarouselRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".what-delivers-card");
    const gap = parseFloat(window.getComputedStyle(el).columnGap || window.getComputedStyle(el).gap || "14");
    const cardWidth = (card?.offsetWidth ?? el.clientWidth * 0.84) + gap;
    const delta = direction === "next" ? cardWidth : -cardWidth;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  const services = [
    { icon: FolderPlus },
    { icon: Users },
    { icon: BarChartHorizontal },
    { icon: ShieldCheck },
    { icon: MessageSquare },
    { icon: FileCheck },
    { icon: Star },
  ];

  return (
    <section className="md:!py-8 !py-4"
      style={{
        background: "linear-gradient(180deg, var(--brand-ivory) 0%, #ffffff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="container-app" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
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
              marginBottom: "1rem",
            }}
          >
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
            {t("whatDelivers.badge")}
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--brand-navy)",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              maxWidth: "780px",
              margin: "0 auto",
            }}
          >
            {t("whatDelivers.title")}
          </h2>
        </div>

        <div ref={mobileCarouselRef} className="what-delivers-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <div
              key={i}
              className="what-delivers-card"
              style={{
                background: "#ffffff",
                borderRadius: "22px",
                padding: "2rem",
                border: "1px solid rgba(27,42,74,0.08)",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 18px 44px -32px rgba(27,42,74,0.28)",
                minHeight: "310px",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  width: "56px",
                  height: "56px",
                  borderRadius: "18px",
                  background: "rgba(13,115,119,0.08)",
                  color: "#0d7377",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                {i + 1}
              </span>

              <div style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: "1.25rem",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.875rem",
                }}>
                  <div style={{
                    width: "54px",
                    height: "54px",
                    borderRadius: "18px",
                    background: "linear-gradient(135deg, #e6f4f1 0%, #d4e8eb 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <s.icon style={{ width: "22px", height: "22px", color: "#0d7377" }} />
                  </div>
                </div>
              </div>

              <h3 style={{
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "#0a1628",
                marginBottom: "0.75rem",
                lineHeight: 1.4,
              }}>
                {t(`whatDelivers.services.${i}.title`)}
              </h3>

              <p style={{
                fontSize: "0.9375rem",
                lineHeight: 1.75,
                color: "#5a6b7c",
                margin: 0,
              }}>
                {t(`whatDelivers.services.${i}.description`)}
              </p>
            </div>
          ))}
        </div>
        <div className="what-delivers-mobile-nav">
          <button
            type="button"
            onClick={() => scrollByCard("prev")}
            className="what-delivers-nav-btn"
            aria-label="Previous service"
          >
            <ChevronLeft style={{ width: "18px", height: "18px" }} />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard("next")}
            className="what-delivers-nav-btn"
            aria-label="Next service"
          >
            <ChevronRight style={{ width: "18px", height: "18px" }} />
          </button>
        </div>
      </div>
      <style>{`
        .what-delivers-mobile-nav {
          display: none;
        }
        .what-delivers-nav-btn {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 1px solid var(--brand-ivory-dark);
          background: var(--brand-white);
          color: var(--brand-teal);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 767px) {
          .what-delivers-mobile-nav {
            display: flex;
            justify-content: center;
            gap: 0.65rem;
            margin-top: 0.9rem;
          }
          .what-delivers-grid {
            display: flex !important;
            overflow-x: auto;
            gap: 0.9rem !important;
            scroll-snap-type: x mandatory;
            padding-bottom: 0.4rem;
            -webkit-overflow-scrolling: touch;
          }
          .what-delivers-grid::-webkit-scrollbar {
            display: none;
          }
          .what-delivers-card {
            min-width: 84%;
            scroll-snap-align: start;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .what-delivers-mobile-nav {
            display: flex;
            justify-content: center;
            gap: 0.65rem;
            margin-top: 0.9rem;
          }
          .what-delivers-grid {
            display: flex !important;
            overflow-x: auto;
            gap: 0.9rem !important;
            scroll-snap-type: x mandatory;
            padding-bottom: 0.4rem;
            -webkit-overflow-scrolling: touch;
          }
          .what-delivers-grid::-webkit-scrollbar {
            display: none;
          }
          .what-delivers-card {
            min-width: calc((100% - 0.9rem) / 2);
            scroll-snap-align: start;
          }
        }
      `}</style>
    </section>
  );
}
