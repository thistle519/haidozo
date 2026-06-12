"use client";

interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
      }}
    >
      <div
        className="animate-slide-up"
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--color-surface)",
          borderRadius: 24,
          padding: "36px 32px",
          boxShadow: "var(--shadow-3)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "var(--color-accent)",
            letterSpacing: "-0.5px",
            marginBottom: 28,
            textAlign: "center",
          }}
        >
          haidozo
        </div>
        {children}
      </div>
    </div>
  );
}
