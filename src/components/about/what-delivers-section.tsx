import { FolderPlus, Users, BarChartHorizontal, ShieldCheck, MessageSquare, FileCheck, Star } from "lucide-react";

interface WhatDeliversSectionProps {
  t: (key: string) => string;
}

export function WhatDeliversSection({ t }: WhatDeliversSectionProps) {
  const services = [
    { icon: FolderPlus, color: "#0d7377" },
    { icon: Users, color: "#14a085" },
    { icon: BarChartHorizontal, color: "#2980b9" },
    { icon: ShieldCheck, color: "#8e44ad" },
    { icon: MessageSquare, color: "#d35400" },
    { icon: FileCheck, color: "#c0392b" },
    { icon: Star, color: "#f39c12" },
  ];

  return (
    <section style={{ padding: "6rem 0", backgroundColor: "var(--background)" }}>
      <div className="container-app" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
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
              fontWeight: 500,
              color: "var(--brand-navy)",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
            }}
          >
            {t("whatDelivers.title")}
          </h2>
          
          <p style={{ 
            fontSize: "1.125rem", 
            color: "#6b7b8c",
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.7,
          }}>
            {t("whatDelivers.subtitle")}
          </p>
        </div>

        {/* Cards Grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <div
              key={i}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "2rem",
                border: "1px solid #f0f2f5",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Header Row */}
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.875rem",
                }}>
                  {/* Icon */}
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #e6f4f1 0%, #d4e8eb 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <s.icon style={{ width: "22px", height: "22px", color: "#0d7377" }} />
                  </div>
                  
                </div>
              </div>
              
              {/* Title */}
              <h3 style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "#0a1628",
                marginBottom: "0.75rem",
                lineHeight: 1.4,
              }}>
                {t(`whatDelivers.services.${i}.title`)}
              </h3>
              
              {/* Description */}
              <p style={{
                fontSize: "0.9375rem",
                lineHeight: 1.75,
                color: "#5a6b7c",
                margin: "0 0 1rem",
              }}>
                {t(`whatDelivers.services.${i}.description`)}
              </p>
              
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{
          marginTop: "4rem",
          padding: "2.5rem",
          background: "#f8fafb",
          borderRadius: "20px",
          textAlign: "center",
          border: "1px solid #f0f2f5",
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
          }}>
            <ShieldCheck style={{ width: "26px", height: "26px", color: "#0d7377" }} />
          </div>
          
          <h4 style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#0a1628",
            marginBottom: "0.5rem",
          }}>
            Scope of Platform
          </h4>
          
          <p style={{
            fontSize: "1rem",
            color: "#5a6b7c",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: 1.7,
          }}>
            Rasi&apos;s role ends at award. The platform does not manage execution, 
            track milestones, or intervene in the contractual relationship.
          </p>
        </div>
      </div>
    </section>
  );
}
