interface AvatarProps {
  initial?: string;
  size?: number;
  src?: string | null;
}

export default function Avatar({ initial = "?", size = 32, src }: AvatarProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: "100px",
          objectFit: "cover",
          border: "1.5px solid var(--color-border)",
          flexShrink: 0,
          display: "block",
          boxShadow: "0 2px 8px rgba(42, 37, 33, 0.08)",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "100px",
        background: "linear-gradient(145deg, var(--hz-orange-wash), var(--hz-orange-tint))",
        border: "1.5px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 600,
        color: "var(--color-accent)",
        flexShrink: 0,
        boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.5)",
      }}
    >
      {initial}
    </div>
  );
}
