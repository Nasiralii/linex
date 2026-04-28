import { CheckCircle2, Cpu, Share2 } from "lucide-react";

interface OurStorySectionProps {
  t: (key: string) => string;
}

export function OurStorySection({ t }: OurStorySectionProps) {
  return (
    <section style={{ 
      padding: "5rem 0", 
      background: "#FFFFFF", 
      position: "relative"
    }}>
      <div className="container-app">
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
          gap: "1rem", 
          alignItems: "center" 
        }}>
          
          {/* Left Side: The "Operating Layer" Logic Stack */}
          <div style={{ position: "relative" }}>
            
            {/* The Vertical "Processing" Line */}
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '40px',
              width: '2px',
              height: '80%',
              background: 'linear-gradient(to bottom, #E5E7EB, #0d7377, #E5E7EB)',
              zIndex: 0
            }} />

            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              
              {/* Step 1: Fragmented Market Data */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ 
                  width: "80px", height: "80px", borderRadius: "20px", background: "#F9FAFB", 
                  border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
                }}>
                  <Share2 size={28} color="#9CA3AF" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1rem", color: "#6B7280", fontWeight: 500 }}>{t("ourStory.step1Title")}</h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#9CA3AF" }}>{t("ourStory.step1Desc")}</p>
                </div>
              </div>

              {/* Step 2: Rasi Operating Layer (THE CORE) */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ 
                  width: "80px", height: "80px", borderRadius: "20px", 
                  background: "linear-gradient(135deg, #1B2A4A 0%, #0d7377 100%)", 
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 15px 30px rgba(13, 115, 119, 0.3)",
                  position: "relative"
                }}>
                  <Cpu size={32} color="#5eead4" strokeWidth={1.5} />
                  {/* Small pulsing notification dot to show "Processing" */}
                  <span style={{
                    position: "absolute", top: "20px", right: "20px", width: "8px", height: "8px",
                    background: "#5eead4", borderRadius: "50%", boxShadow: "0 0 10px #5eead4"
                  }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1.1rem", color: "#1B2A4A", fontWeight: 700 }}>{t("ourStory.step2Title")}</h4>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#0d7377", fontWeight: 500 }}>{t("ourStory.step2Desc")}</p>
                </div>
              </div>

              {/* Step 3: Structured Decision */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ 
                  width: "80px", height: "80px", borderRadius: "20px", background: "#FFFFFF", 
                  border: "2px solid #0d7377", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 10px 20px rgba(13, 115, 119, 0.1)"
                }}>
                  <CheckCircle2 size={32} color="#0d7377" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1rem", color: "#1B2A4A", fontWeight: 700 }}>{t("ourStory.step3Title")}</h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#4B5563" }}>{t("ourStory.step3Desc")}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Side: Copy remains clean and editorial */}
          <div>
              <div style={{ height: "3px", width: "40px", background: "#0d7377", marginBottom: "1.5rem" }} />
              <h2 style={{ 
                fontSize: "clamp(2.25rem, 5vw, 3rem)", 
                color: "#1B2A4A", 
                fontWeight: 700, 
                lineHeight: 1.1, 
                marginBottom: "2rem" 
              }}>
                {t("ourStory.title")}
              </h2>
              <p style={{ color: "#4B5563", fontSize: "1.125rem", lineHeight: 1.8, marginBottom: "2rem" }}>
                {t("ourStory.description")}
              </p>
              <p style={{ color: "#4B5563", fontSize: "1.125rem", lineHeight: 1.8, marginBottom: "2rem" }}>
                {t("ourStory.description2")}
              </p>
              <div style={{ background: "#F9FAFB", padding: "2rem", borderLeft: "4px solid #0d7377", textAlign: "right" }}>
                <p className='text-start' style={{ color: "#1B2A4A", fontSize: "1.1rem", fontStyle: "italic", margin: 0 }}>
                  {t("ourStory.quote")}
                </p>
              </div>
          </div>

        </div>
      </div>
    </section>
  );
}