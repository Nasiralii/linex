"use client";

import { Link } from "@/i18n/routing";

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  isRtl: boolean;
}

export default function AdminHeader({ title, subtitle, isRtl }: AdminHeaderProps) {
  return (
    <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "2rem 0" }}>
      <div className="container-app" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "0.25rem" }}>
            {title}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>
            {subtitle}
          </p>
        </div>
        <Link
          href="/admin/admins"
          style={{
            display: "inline-block",
            padding: "0.625rem 1.25rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "white",
            background: "var(--primary)",
            textDecoration: "none",
          }}
        >
          {isRtl ? "+ إضافة مسؤول" : "+ Add Admin"}
        </Link>
      </div>
    </div>
  );
}
