"use client";

import { useToast } from "@/components/toast";
import { useState } from "react";

interface RequestInfoFormProps {
  userId: string;
  isRtl: boolean;
  onAction: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
}

export default function RequestInfoForm({ userId, isRtl, onAction }: RequestInfoFormProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("userId", userId);
    formData.append("action", "request_info");
    
    const result = await onAction(formData);
    
    if (result.success) {
      showToast(isRtl ? "تم إرسال طلب المعلومات بنجاح" : "Information request sent successfully", "success");
      window.location.reload();
    } else {
      showToast(result.error || (isRtl ? "فشلت العملية" : "Action failed"), "error");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap md:w-auto w-full">
      <input type="text" name="adminNotes" className="md:py-0" disabled={loading} placeholder={isRtl ? "ما المعلومات المطلوبة؟..." : "What information is needed?..."} style={{ flex: 1, fontSize: "0.8125rem", opacity: loading ? 0.7 : 1 }} />
      <button className="text-center md:w-auto w-full justify-center" type="submit" disabled={loading} style={{
        padding: "0.5rem 0.75rem", fontSize: "0.8125rem", borderRadius: "var(--radius-md)",
        border: "1px solid var(--accent)", background: "var(--accent-light)", color: "var(--accent)",
        cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem", whiteSpace: "nowrap", opacity: loading ? 0.7 : 1,
      }}>
        {loading ? <span style={{ animation: "spin 1s linear infinite" }}>⏳</span> : <span>💬</span>}
        {loading ? (isRtl ? "جاري..." : "Loading...") : (isRtl ? "طلب معلومات" : "Request Info")}
      </button>
    </form>
  );
}
