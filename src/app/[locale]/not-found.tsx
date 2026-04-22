import { Link } from "@/i18n/routing";
import { Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <div style={{ fontSize: "6rem", fontWeight: 900, color: "var(--primary)", lineHeight: 1, marginBottom: "1rem", opacity: 0.2 }}>404</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.5rem" }}>
          الصفحة غير موجودة
        </h1>
        <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", marginBottom: "1rem" }}>
          Page Not Found
        </p>
        <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          <br />
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="btn-primary" style={{ textDecoration: "none", padding: "0.75rem 2rem" }}>
          <Home style={{ width: "18px", height: "18px" }} />
          العودة للرئيسية / Back to Home
        </Link>
      </div>
    </div>
  );
}
