import { Link } from "@/i18n/routing";
import { Building2, Search, ShieldCheck } from "lucide-react";

interface HeroSectionProps {
  t: (key: string) => string;
  tCommon: (key: string) => string;
  showOwnerCta: boolean;
  ownerCtaHref: string;
}

export function HeroSection({ t, tCommon, showOwnerCta, ownerCtaHref }: HeroSectionProps) {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, #1C5963 0%, #2A7B88 40%, #3A8B98 70%, #4A9BA8 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative shapes */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-120px",
          left: "-60px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "10%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(184, 115, 51, 0.1)",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          opacity: 0.035,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Decorative rings */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          zIndex: 0,
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          zIndex: 0,
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          left: "-80px",
          zIndex: 0,
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          border: "1px solid rgba(184,115,51,0.08)",
        }}
      />

      <div
        className="container-app mx-auto text-center"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "6rem 2rem 7rem",
        }}
      >
        {/* Eyebrow badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.4rem 1rem 0.4rem 0.5rem",
            borderRadius: "100px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(8px)",
            color: "rgba(255,255,255,0.88)",
            fontSize: "0.8125rem",
            fontWeight: 500,
            marginBottom: "2rem",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "var(--brand-copper)",
              flexShrink: 0,
            }}
          >
            <ShieldCheck style={{ width: "12px", height: "12px", color: "white" }} />
          </span>
          {tCommon("tagline")}
        </div>

        {/* Headline */}
        <h1
          className="uppercase"
          style={{
            fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
            fontWeight: 700,
            color: "var(--brand-white)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "1.5rem",
          }}
        >
          {t("hero.title")}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(1.2rem, 1.7vw, 1.1875rem)",
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.7,
            padding: "0rem 8rem",
            fontWeight: 400,
          }}
        >
          {t("hero.subtitle")}
        </p>

        {/* Intro paragraph */}
        {t("hero.intro") && (
          <div
            style={{
              padding: "1.25rem 12.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.9375rem",
                color: "rgba(255,255,255,0.80)",
                lineHeight: 1.8,
                margin: 0,
                fontStyle: "italic",
              }}
            >
              {t("hero.intro")}
            </p>
          </div>
        )}

        {/* CTA row */}
        <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
          {showOwnerCta && (
            <Link
              className="hover:scale-105"
              href={ownerCtaHref as "/auth/register" | "/dashboard/projects/new"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.9375rem 1.25rem",
                borderRadius: "10px",
                fontSize: "0.9375rem",
                fontWeight: 700,
                textDecoration: "none",
                background: "var(--brand-copper)",
                color: "var(--brand-white)",
                boxShadow: `0 4px 20px rgba(184,115,51,0.45), inset 0 1px 0 rgba(255,255,255,0.12)`,
                transition: "all 200ms ease",
                letterSpacing: "0.01em",
              }}
            >
              <Building2 style={{ width: "18px", height: "18px" }} />
              {t("hero.ownerCta")}
            </Link>
          )}
          <Link
            className="hover:scale-105"
            href="/marketplace"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.9375rem 1.25rem",
              borderRadius: "10px",
              fontSize: "0.9375rem",
              fontWeight: 600,
              textDecoration: "none",
              color: "var(--brand-white)",
              border: "1.5px solid rgba(255,255,255,0.28)",
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(4px)",
              transition: "all 200ms ease",
            }}
          >
            <Search style={{ width: "18px", height: "18px" }} />
            {t("hero.contractorCta")}
          </Link>
        </div>
      </div>

      {/* Curved bottom edge */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "56px",
          background: "var(--brand-ivory)",
          borderRadius: "48px 48px 0 0",
        }}
      />
    </section>
  );
}
