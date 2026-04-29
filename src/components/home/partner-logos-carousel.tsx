"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { PartnerLogoCard } from "@/components/home/partner-logo-card";

type PartnerLogosCarouselProps = {
  labels: string[];
};

export function PartnerLogosCarousel({ labels }: PartnerLogosCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".partner-logos-slide");
    if (!card) return;
    const cardWidth = card.getBoundingClientRect().width;
    const gap = 14;
    if (direction > 0) {
      const nearEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (nearEnd) {
        track.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
    }
    track.scrollBy({ left: direction * (cardWidth + gap), behavior: "smooth" });
  }

  useEffect(() => {
    const id = window.setInterval(() => {
      const track = trackRef.current;
      if (!track || pausedRef.current) return;
      const isCarousel = track.scrollWidth > track.clientWidth + 2;
      if (!isCarousel) return;
      scrollByCard(1);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      style={{ marginBottom: "2.5rem" }}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onTouchStart={() => {
        pausedRef.current = true;
      }}
      onTouchEnd={() => {
        pausedRef.current = false;
      }}
    >
      <div ref={trackRef} className="partner-logos-track">
        {labels.map((label, i) => (
          <div key={`${label}-${i}`} className="partner-logos-slide">
            <PartnerLogoCard index={i + 1} label={label} />
          </div>
        ))}
      </div>
      <div className="partner-logos-nav">
        <button
          type="button"
          aria-label="Previous partner logos"
          onClick={() => scrollByCard(-1)}
          className="partner-logos-nav-btn"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          aria-label="Next partner logos"
          onClick={() => scrollByCard(1)}
          className="partner-logos-nav-btn"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
