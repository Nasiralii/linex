import { FolderPlus, Users, BarChartHorizontal, ShieldCheck, MessageSquare, FileCheck, Star } from "lucide-react";

interface WhatDeliversSectionProps {
  t: (key: string) => string;
}

export function WhatDeliversSection({ t }: WhatDeliversSectionProps) {
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
    <section
      style={{
        padding: "5rem 0",
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <div
              key={i}
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
      </div>
    </section>
  );
}
