"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function ExtendDeadlineSubmit({ isRtl, disabled = false }: { isRtl: boolean; disabled?: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      style={{
        padding: "0.375rem 0.75rem",
        fontSize: "0.75rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--primary)",
        background: isDisabled ? "var(--surface-2)" : "var(--primary-light)",
        color: isDisabled ? "var(--text-muted)" : "var(--primary)",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.75 : 1,
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
