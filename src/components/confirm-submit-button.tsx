"use client";

type ConfirmSubmitButtonProps = {
  label: string;
  confirmMessage: string;
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
};

export function ConfirmSubmitButton({ label, confirmMessage, className, style, icon }: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      style={style}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {icon}
      {label}
    </button>
  );
}