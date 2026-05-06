"use client";

import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";

type BidSubmitButtonProps = {
  label: string;
  pendingLabel: string;
};

export function BidSubmitButton({ label, pendingLabel }: BidSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="btn-primary"
      style={{ width: "100%", padding: "0.75rem", opacity: pending ? 0.9 : 1, cursor: pending ? "not-allowed" : "pointer" }}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" style={{ width: "16px", height: "16px" }} /> {pendingLabel}
        </>
      ) : (
        <>
          <Send style={{ width: "16px", height: "16px" }} /> {label}
        </>
      )}
    </button>
  );
}

type BidSubmitSuccessAlertProps = {
  enabled: boolean;
  message: string;
};

export function BidSubmitSuccessAlert({ enabled, message }: BidSubmitSuccessAlertProps) {
  useEffect(() => {
    if (!enabled) return;
    window.alert(message);

    const url = new URL(window.location.href);
    url.searchParams.delete("bidSubmitted");
    window.history.replaceState({}, "", url.toString());
  }, [enabled, message]);

  return null;
}
