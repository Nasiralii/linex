"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

type ShortlistSubmitButtonProps = {
  label: string;
  pendingLabel: string;
  className?: string;
  style?: React.CSSProperties;
};

export function ShortlistSubmitButton({ label, pendingLabel, className, style }: ShortlistSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      style={{ ...style, opacity: pending ? 0.85 : 1, cursor: pending ? "not-allowed" : style?.cursor }}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" style={{ width: "14px", height: "14px", marginInlineEnd: "0.35rem" }} />
          {pendingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}
