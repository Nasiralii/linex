interface ContentPageViewProps {
  title: string;
  excerpt?: string | null;
  content: string;
}

function parseFaqItems(content: string) {
  const lines = content.split("\n").map((line) => line.trim());
  const items: Array<{ question: string; answer: string }> = [];
  let question = "";
  let answer = "";

  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith("Q:")) {
      if (question || answer) {
        items.push({ question: question.trim(), answer: answer.trim() });
      }
      question = line.slice(2).trim();
      answer = "";
      continue;
    }
    if (line.startsWith("A:")) {
      answer = line.slice(2).trim();
      continue;
    }
    if (line.startsWith("C:") || line.startsWith("I:")) {
      continue;
    }
    if (!question && !answer) continue;
    answer = `${answer}\n${line}`.trim();
  }

  if (question || answer) {
    items.push({ question: question.trim(), answer: answer.trim() });
  }

  return items.filter((item) => item.question || item.answer);
}

export function ContentPageView({ title, excerpt, content }: ContentPageViewProps) {
  const faqItems = parseFaqItems(content);
  const isFaqView = faqItems.length > 0;
  const paragraphs = content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <section
        style={{
          background: "linear-gradient(135deg, #1C5963 0%, #2A7B88 60%, #3A8B98 100%)",
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
              {isFaqView ? (
                faqItems.map((item, index) => (
                  <div
                    key={`${item.question}-${index}`}
                    style={{ border: "1px solid var(--border-light)", borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem" }}
                  >
                    <h3 style={{ fontSize: "1rem", marginBottom: "0.4rem", color: "var(--text)", fontWeight: 700 }}>
                      {item.question}
                    </h3>
                    <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--text-secondary)" }}>{item.answer}</p>
                  </div>
                ))
              ) : paragraphs.length > 0 ? (
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
