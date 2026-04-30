interface AvatarProps {
  initial?: string;
  size?: number;
}

export default function Avatar({ initial = "?", size = 32 }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "100px",
        background: "var(--color-surface-alt)",
        border: "1.5px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 500,
        color: "var(--color-fg-muted)",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}
