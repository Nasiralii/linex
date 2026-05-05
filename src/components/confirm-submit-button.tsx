"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

type ConfirmSubmitButtonProps = {
  label: string;
  confirmMessage: string;
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  pendingLabel?: string;
};

export function ConfirmSubmitButton({ label, confirmMessage, className, style, icon, pendingLabel }: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      style={{ ...style, opacity: pending ? 0.85 : 1, cursor: pending ? "not-allowed" : style?.cursor }}
      disabled={pending}
      aria-busy={pending}
      onClick={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" style={{ width: "14px", height: "14px", marginInlineEnd: "0.35rem" }} />
          {pendingLabel || "Processing..."}
        </>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
}