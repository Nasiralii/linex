"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function ExtendDeadlineSubmit({ isRtl }: { isRtl: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: "0.375rem 0.75rem",
        fontSize: "0.75rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--primary)",
        background: "var(--primary-light)",
        color: "var(--primary)",
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.8 : 1,
        fontFamily: "inherit",
        fontWeight: 600,
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
      }}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" style={{ width: "12px", height: "12px" }} />
          {isRtl ? "جارٍ التمديد..." : "Extending..."}
        </>
      ) : (
        isRtl ? "تمديد الموعد" : "Extend"
      )}
    </button>
  );
}
