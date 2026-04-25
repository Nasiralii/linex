"use client";

import { useToast } from "@/components/toast";
import { useState } from "react";

interface ActionButtonsProps {
  userId: string;
  isRtl: boolean;
  onAction: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
}

export default function ActionButtons({ userId, isRtl, onAction }: ActionButtonsProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubmit(action: string) {
    setLoading(action);
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("action", action);
    
    const result = await onAction(formData);
    
    if (result.success) {
      showToast(
        action === "approve"
          ? (isRtl ? "تمت الموافقة بنجاح" : "Approved successfully")
          : (isRtl ? "تم الرفض بنجاح" : "Rejected successfully"),
        "success"
      );
      window.location.reload();
    } else {
      showToast(result.error || (isRtl ? "فشلت العملية" : "Action failed"), "error");
    }
    setLoading(null);
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button
        type="button"
        onClick={() => handleSubmit("approve")}
        disabled={loading !== null}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          background: "var(--surface-2)",
          cursor: loading !== null ? "not-allowed" : "pointer",
          color: "var(--success)",
          fontSize: "0.875rem",
          fontWeight: 600,
          opacity: loading !== null ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {loading === "approve" ? (
          <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
        ) : null}
        {loading === "approve" ? (isRtl ? "جاري..." : "Loading...") : (isRtl ? "موافقة" : "Approve")}
      </button>
      <button
        type="button"
        onClick={() => handleSubmit("reject")}
        disabled={loading !== null}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          background: "var(--surface-2)",
          cursor: loading !== null ? "not-allowed" : "pointer",
          color: "var(--error)",
          fontSize: "0.875rem",
          fontWeight: 600,
          opacity: loading !== null ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {loading === "reject" ? (
          <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
        ) : null}
        {loading === "reject" ? (isRtl ? "جاري..." : "Loading...") : (isRtl ? "رفض" : "Reject")}
      </button>
    </div>
  );
}
