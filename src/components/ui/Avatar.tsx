interface AvatarProps {
  initial?: string;
  size?: number;
  /** 画像URLがあれば円形画像を表示。無ければイニシャル丸（後方互換） */
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
