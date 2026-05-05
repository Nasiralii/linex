"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";

export function QASendButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="btn-primary"
      disabled={pending}
      style={{ padding: "0.5rem 1rem", flexShrink: 0, opacity: pending ? 0.8 : 1, cursor: pending ? "not-allowed" : "pointer" }}
      aria-busy={pending}
    >
      {pending ? <Loader2 className="animate-spin" style={{ width: "16px", height: "16px" }} /> : <Send style={{ width: "16px", height: "16px" }} />}
    </button>
  );
}
