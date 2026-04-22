// ============================================================================
// Gap 5: Badge Display Component — Shows user badges inline
// ============================================================================

import { BADGE_CONFIG, type BadgeType } from "@/lib/badges";

interface BadgeDisplayProps {
  badges: BadgeType[];
  locale?: string;
  size?: "sm" | "md";
}

export function BadgeDisplay({ badges, locale = "en", size = "sm" }: BadgeDisplayProps) {
  const isRtl = locale === "ar";
  if (!badges || badges.length === 0) return null;

  const fontSize = size === "sm" ? "0.625rem" : "0.75rem";
  const padding = size === "sm" ? "0.125rem 0.5rem" : "0.25rem 0.625rem";

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
      {badges.map((badge) => {
        const config = BADGE_CONFIG[badge];
        if (!config) return null;
        return (
          <span
            key={badge}
            style={{
              padding,
              borderRadius: "var(--radius-full)",
              fontSize,
              fontWeight: 700,
              background: config.colorBg,
              color: config.colorText,
              whiteSpace: "nowrap",
            }}
          >
            {config.emoji} {isRtl ? config.labelAr : config.labelEn}
          </span>
        );
      })}
    </div>
  );
}
