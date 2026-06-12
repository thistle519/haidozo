"use client";

interface AuthButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "primary" | "ghost";
}

export default function AuthButton({
  children,
  type = "button",
  loading = false,
  disabled = false,
  onClick,
  variant = "primary",
}: AuthButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: "100%",
        padding: "13px 20px",
        fontSize: 15,
        fontWeight: 700,
        fontFamily: "var(--font-sans)",
        background: isPrimary
          ? disabled || loading
            ? "var(--color-fg-subtle)"
            : "var(--color-accent)"
          : "transparent",
        color: isPrimary ? "#fff" : "var(--color-accent)",
        border: isPrimary ? "none" : `1.5px solid var(--color-accent)`,
        borderRadius: 100,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        transition: "transform 200ms ease-out, opacity 200ms ease-out",
        transform: "scale(1)",
        letterSpacing: "0.02em",
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
        }
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
    >
      {loading ? "送信中…" : children}
    </button>
  );
}
