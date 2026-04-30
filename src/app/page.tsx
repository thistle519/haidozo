import ClientShell from "./ClientShell";

export default function Home() {
  return (
    <main style={{ minHeight: "100dvh", background: "var(--color-bg)" }}>
      <ClientShell />
    </main>
  );
}
