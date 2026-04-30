import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "haidozo v1 — 相手のことを想って、プレゼントを選ぼう",
};

const STORIES = [
  {
    reason: "仕事で辛い時に香りで気持ちを切り替えるって言ってたのが頭に残ってた。ディスカバリーセットなら色んな香りを試せるから、気分で使い分けられると思って",
    item: "メゾン マルジェラ フレグランス",
    tag: "友達の誕生日",
  },
  {
    reason: "この子に贈るならここしかないと思った。引越し後はまだ落ち着かないだろうからティーバッグで手軽に飲めるのも考えた。ポーチ付きでグッズとしても使えるのも決め手",
    item: "TEAPOND ティータイムセット",
    tag: "友達の送別",
  },
  {
    reason: "コーヒーのプロだから、逆に普段選ばない紅茶を贈りたかった。お花は主役じゃなくていい、ありがとうを伝える1本として添えた",
    item: "TAKIBI BAKERY シュトーレン + 花",
    tag: "先生への餞別",
  },
];

export default function LpV1Page() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .lp { font-family: var(--font-sans, system-ui, sans-serif); background: #FAF7F2; color: #2B3467; }
        .wrap { max-width: 1040px; margin: 0 auto; padding: 0 32px; }
        @media (min-width: 768px) { .wrap { padding: 0 64px; } }
        .section { padding: 96px 0; }
        .section-alt { padding: 96px 0; background: #fff; border-top: 1px solid rgba(43,52,103,0.07); border-bottom: 1px solid rgba(43,52,103,0.07); }
        .eyebrow { font-size: 11px; font-weight: 700; color: #E8502A; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 20px; }
        .h2 { font-size: clamp(26px, 3.5vw, 38px); font-weight: 800; line-height: 1.25; letter-spacing: -0.5px; color: #2B3467; margin-bottom: 20px; }
        .lead { font-size: clamp(14px, 1.5vw, 16px); color: #8B93B8; line-height: 1.9; }
        .grid-3 { display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 48px; }
        .steps { display: grid; grid-template-columns: 1fr; gap: 32px; margin-top: 48px; }
        @media (min-width: 640px) {
          .grid-3 { grid-template-columns: repeat(3, 1fr); }
          .steps { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <div className="lp">
        {/* Version bar */}
        <div style={{ background: "#2B3467", padding: "8px 0", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            LP v1（初期版）
            <Link href="/lp/v2" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "underline" }}>v2</Link>
            　｜
            <Link href="/lp" style={{ color: "#E8502A", fontWeight: 700, textDecoration: "underline" }}>最新版を見る</Link>
          </div>
        </div>

        <nav style={{
          borderBottom: "1px solid rgba(43,52,103,0.08)",
          background: "rgba(250,247,242,0.92)", backdropFilter: "blur(10px)",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div className="wrap" style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Image src="/haidozo.png" alt="haidozo" width={120} height={32} style={{ objectFit: "contain" }} />
            <Link href="/" style={{ background: "#E8502A", color: "#fff", borderRadius: 100, padding: "9px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>使ってみる</Link>
          </div>
        </nav>

        <section style={{ padding: "100px 0 96px", textAlign: "center" }}>
          <div className="wrap">
            <p className="eyebrow">GIFT DISCOVERY</p>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, lineHeight: 1.18, letterSpacing: "-1.5px", color: "#2B3467", maxWidth: 800, margin: "0 auto 28px" }}>
              相手のことを想って、<br />プレゼントを贈ろう
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.8vw, 18px)", color: "#8B93B8", lineHeight: 1.85, maxWidth: 520, margin: "0 auto 44px" }}>
              誰かが悩んで選んだ贈り物の「なぜ」から、あなたにぴったりのプレゼントが見つかる。
            </p>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#E8502A", color: "#fff", borderRadius: 100, padding: "17px 40px", fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 28px rgba(232,80,42,0.38)" }}>
              プレゼントを探してみる →
            </Link>
          </div>
        </section>

        <section className="section-alt">
          <div className="wrap">
            <p className="eyebrow">THE PROBLEM</p>
            <h2 className="h2">悩みは「何を買うか」じゃない</h2>
            <p style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 800, color: "#E8502A", lineHeight: 1.5, marginBottom: 24, maxWidth: 600 }}>
              「この人に合ったものを、ちゃんと選べるか」
            </p>
            <p className="lead" style={{ maxWidth: 560 }}>
              候補は多すぎるのに、決め手が見つからない。その人のことを一番よく知ってるのは、結局、その人と関わった誰かだ。
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <p className="eyebrow">REAL STORIES</p>
            <h2 className="h2">「なぜ選んだか」が、ヒントになる</h2>
            <p className="lead" style={{ maxWidth: 560 }}>haidozo に記録されているのは、アイテム名だけじゃない。選んだ理由と、贈った相手のこと。</p>
            <div className="grid-3">
              {STORIES.map((s, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid rgba(43,52,103,0.08)", borderRadius: 22, padding: "28px 24px 22px", boxShadow: "0 4px 20px rgba(43,52,103,0.06)", display: "flex", flexDirection: "column" }}>
                  <div style={{ borderLeft: "3px solid #E8502A", paddingLeft: 16, marginBottom: 22, flex: 1 }}>
                    <p style={{ fontSize: 14, color: "#2B3467", lineHeight: 1.9 }}>「{s.reason}」</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#2B3467", marginBottom: 8 }}>{s.item}</p>
                    <span style={{ fontSize: 11, background: "rgba(232,80,42,0.08)", color: "#E8502A", borderRadius: 100, padding: "4px 12px", fontWeight: 600 }}>{s.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-alt">
          <div className="wrap">
            <p className="eyebrow">HOW IT WORKS</p>
            <h2 className="h2">使い方はシンプル</h2>
            <div className="steps">
              {[
                { n: "01", title: "相手のことを伝える", body: "「香水が好き」「コーヒーのプロだから違うものを贈りたい」など、その人のことを自由に入力。誰に・どんな時・予算も絞れる。" },
                { n: "02", title: "提案を受け取る", body: "みんなの「なぜ選んだか」から、条件に近いプレゼントを提案。選び方の視点も一緒に教えてくれる。" },
                { n: "03", title: "記録を残す", body: "贈った相手のこと、なぜ選んだかをログに残せる。あなたの記録が、次の誰かのヒントになる。" },
              ].map((step) => (
                <div key={step.n} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(232,80,42,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#E8502A" }}>{step.n}</span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#2B3467" }}>{step.title}</div>
                  <div style={{ fontSize: 14, color: "#8B93B8", lineHeight: 1.8 }}>{step.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: "#2B3467", padding: "100px 0 112px", textAlign: "center" }}>
          <div className="wrap">
            <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 18 }}>haidozo</div>
            <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 40 }}>あの人のために、ちゃんと選んだ贈り物を。</p>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#E8502A", color: "#fff", borderRadius: 100, padding: "18px 48px", fontSize: 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 32px rgba(232,80,42,0.5)" }}>
              プレゼントを探してみる →
            </Link>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", marginTop: 22 }}>無料で使えます</p>
          </div>
        </section>
      </div>
    </>
  );
}
