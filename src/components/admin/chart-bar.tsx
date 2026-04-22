"use client";

// Reusable CSS-based bar chart component — no external libraries
// Supports horizontal and vertical orientations with animated bars

interface BarItem {
  label: string;
  value: number;
  color: string;
}

interface ChartBarProps {
  data: BarItem[];
  orientation?: "horizontal" | "vertical";
  height?: number;
  showValues?: boolean;
  suffix?: string;
  animate?: boolean;
}

export default function ChartBar({
  data,
  orientation = "vertical",
  height = 160,
  showValues = true,
  suffix = "",
  animate = true,
}: ChartBarProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (orientation === "horizontal") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#6b7280", minWidth: 80, textAlign: "right" }}>
              {item.label}
            </span>
            <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 6, height: 24, overflow: "hidden" }}>
              <div
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  background: item.color,
                  height: "100%",
                  borderRadius: 6,
                  transition: animate ? "width 0.8s cubic-bezier(0.4,0,0.2,1)" : "none",
                  transitionDelay: animate ? `${i * 100}ms` : "0ms",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 8,
                }}
              >
                {showValues && (
                  <span style={{ fontSize: "0.6875rem", color: "#fff", fontWeight: 700 }}>
                    {item.value.toLocaleString()}{suffix}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Vertical bars
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height, justifyContent: "center" }}>
      {data.map((item, i) => {
        const barHeight = (item.value / maxValue) * (height - 30);
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            {showValues && (
              <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "#374151", marginBottom: 4 }}>
                {item.value.toLocaleString()}{suffix}
              </span>
            )}
            <div
              style={{
                width: "100%",
                maxWidth: 40,
                height: barHeight,
                background: item.color,
                borderRadius: "6px 6px 0 0",
                transition: animate ? "height 0.8s cubic-bezier(0.4,0,0.2,1)" : "none",
                transitionDelay: animate ? `${i * 100}ms` : "0ms",
                minHeight: 4,
              }}
            />
            <span
              style={{
                fontSize: "0.5625rem",
                color: "#6b7280",
                marginTop: 4,
                textAlign: "center",
                lineHeight: 1.2,
                maxWidth: 56,
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
