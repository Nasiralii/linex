interface ContentPageViewProps {
  title: string;
  excerpt?: string | null;
  content: string;
}

export function ContentPageView({ title, excerpt, content }: ContentPageViewProps) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <section
        style={{
          background: "linear-gradient(135deg, #0a4e41 0%, #0f6b57 60%, #127a63 100%)",
          color: "white",
          padding: "4rem 0 3rem",
        }}
      >
        <div className="container-narrow">
          <h1 style={{ color: "white", marginBottom: "0.75rem" }}>{title}</h1>
          {excerpt ? (
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1rem", maxWidth: "760px" }}>{excerpt}</p>
          ) : null}
        </div>
      </section>

      <section style={{ padding: "2.5rem 0 4rem" }}>
        <div className="container-narrow">
          <div className="card" style={{ padding: "2rem" }}>
            <div style={{ display: "grid", gap: "1rem" }}>
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p key={index} style={{ fontSize: "1rem", lineHeight: 1.9, color: "var(--text-secondary)" }}>
                    {paragraph}
                  </p>
                ))
              ) : (
                <p style={{ fontSize: "1rem", lineHeight: 1.9, color: "var(--text-secondary)" }}>{content}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
