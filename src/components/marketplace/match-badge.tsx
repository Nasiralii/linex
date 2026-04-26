// Match Score Badge — shows "XX% Match" on project cards
// Only rendered when user is logged in and has a profile

interface MatchBadgeProps {
  score: number;
  isRtl: boolean;
}

export function MatchBadge({ score, isRtl }: MatchBadgeProps) {
  const color = score >= 80 ? "#2A7B88" :
    score >= 60 ? "#B87333" :
    score >= 40 ? "#6b7280" : "#9ca3af";

  const bg = score >= 80 ? "rgba(42,123,136,0.1)" :
    score >= 60 ? "rgba(184,115,51,0.1)" :
    score >= 40 ? "rgba(107,114,128,0.1)" : "rgba(156,163,175,0.1)";

  const label = isRtl ? "تطابق" : "Match";

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.25rem",
      padding: "0.25rem 0.625rem",
      borderRadius: "var(--radius-full)",
      background: bg,
      color: color,
      fontSize: "0.75rem",
      fontWeight: 700,
      border: `1px solid ${color}20`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: "0.8125rem", fontWeight: 800 }}>{score}%</span>
      {label}
    </span>
  );
}
