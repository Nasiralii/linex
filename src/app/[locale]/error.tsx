"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("App error:", error); }, [error]);

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <AlertTriangle style={{ width: "64px", height: "64px", color: "var(--error)", margin: "0 auto 1.5rem", opacity: 0.5 }} />
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.5rem" }}>حدث خطأ غير متوقع</h1>
        <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>Something went wrong</p>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
          نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.
          <br />
          We apologize for this error. Please try again.
        </p>
        <button onClick={() => reset()} className="btn-primary" style={{ padding: "0.75rem 2rem" }}>
          <RefreshCw style={{ width: "18px", height: "18px" }} />
          إعادة المحاولة / Try Again
        </button>
      </div>
    </div>
  );
}
