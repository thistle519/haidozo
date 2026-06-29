"use client";

interface TagChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  variant?: "accent" | "sage";
  small?: boolean;
}

export default function TagChip({ label, selected = false, onClick, variant = "accent", small = false }: TagChipProps) {
  const accent = variant === "accent";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={onClick ? "btn-interactive" : ""}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: small ? "3px 10px" : "7px 16px",
        borderRadius: "100px",
        fontSize: small ? 11 : 14,
        fontWeight: selected ? 700 : 500,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        border: selected
          ? `1.5px solid ${accent ? "var(--color-accent)" : "var(--color-sage)"}`
          : "1.5px solid var(--color-border)",
        background: selected
          ? (accent ? "var(--color-accent-light)" : "var(--color-sage-light)")
          : "var(--color-surface)",
        color: selected
          ? (accent ? "var(--color-accent-dark)" : "#8B6F00")
          : "var(--color-fg)",
        fontFamily: "inherit",
        letterSpacing: selected ? "0.01em" : "0",
      }}
    >
      {label}
    </button>
  );
}
