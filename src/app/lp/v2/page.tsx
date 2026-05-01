import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "haidozo — 相手が喜ぶシーンを想像する、プレゼント選び",
  description: "誰かのエピソードから、あなたのプレゼントのストーリーを考える。",
};

const EPISODES = [
  {
    wish: "辛い時に、そっとそばにいてあげられるものを渡したかった",
    about: "いつもハードワークで忙しそうな子。昔一緒に香水屋さんに寄ったとき、仕事で辛くなった時に気持ちを切り替えるために香りを使うって話してくれた",
    reason: "ディスカバリーセットなら色んな香りを試せるから、気分で使い分けられると思って",
    item: "メゾン マルジェラ フレグランス",
    tag: "友達の誕生日",
  },
  {
    wish: "新居で紅茶を飲む時に、ふと思い出してくれたらいいな",
    about: "紅茶屋さんでバイトするくらい紅茶好きな子。家の近くにteapondがあってよく一緒に遊びに来てくれてた",
    reason: "この子に贈るならここしかないと思った。引越し後はまだ落ち着かないだろうからティーバッグで手軽に飲めるのも考えた",
    item: "TEAPOND ティータイムセット",
    tag: "友達の送別",
  },
  {
    wish: "コーヒーのプロだから、あえて選ばない方向で驚かせたかった",
    about: "コーヒー屋さんで、もうすぐご結婚されると聞いていた。長くお世話になった方",
    reason: "コーヒーのプロだから、逆に普段選ばない紅茶を贈りたかった。お花は主役じゃなくていい、ありがとうを伝える1本として添えた",
    item: "TAKIBI BAKERY シュトーレン + 旅する紅茶 + 花",
    tag: "先生への餞別",
  },
];

export default function LpPage() {
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
        .flow-cards { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 40px; }
        @media (min-width: 640px) {
          .grid-3 { grid-template-columns: repeat(3, 1fr); }
          .steps { grid-template-columns: repeat(3, 1fr); }
          .flow-cards { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
        @media (min-width: 768px) {
          .flow-cards { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      <div className="lp">
        {/* Version bar */}
        <div style={{ background: "#2B3467", padding: "8px 0", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            LP{" "}
            <Link href="/lp/v1" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "underline" }}>v1</Link>
            {"　"}
            <strong style={{ color: "#E8502A" }}>v2（最新）</strong>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav style={{
          borderBottom: "1px solid rgba(43,52,103,0.08)",
          background: "rgba(250,247,242,0.92)", backdropFilter: "blur(10px)",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div className="wrap" style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Image src="/haidozo.png" alt="haidozo" width={120} height={32} style={{ objectFit: "contain" }} />
            <Link href="/" style={{
              background: "#E8502A", color: "#fff", borderRadius: 100,
              padding: "9px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>
              使ってみる
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ padding: "100px 0 96px", textAlign: "center" }}>
          <div className="wrap">
            <p className="eyebrow">GIFT DISCOVERY</p>
            <h1 style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 800, lineHeight: 1.18, letterSpacing: "-1.5px",
              color: "#2B3467", maxWidth: 800, margin: "0 auto 28px",
            }}>
              相手が喜ぶシーンを想像する、<br />プレゼント選び
            </h1>
            <p style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              color: "#8B93B8", lineHeight: 1.85,
              maxWidth: 520, margin: "0 auto 44px",
            }}>
              誰かのエピソードから、あなたのプレゼントのストーリーを考える。
            </p>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#E8502A", color: "#fff",
              borderRadius: 100, padding: "17px 40px",
              fontSize: 16, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 8px 28px rgba(232,80,42,0.38)",
              letterSpacing: "0.01em",
            }}>
              一緒に考えてみる →
            </Link>
          </div>
        </section>

        {/* ── Problem ── */}
        <section className="section-alt">
          <div className="wrap">
            <p className="eyebrow">THE PROBLEM</p>
            <h2 className="h2">「何を買うか」より先に、考えたいこと</h2>
            <p style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 800, color: "#E8502A", lineHeight: 1.5, marginBottom: 24, maxWidth: 600 }}>
              「渡した後の、あの人の顔」
            </p>
            <p className="lead" style={{ maxWidth: 560 }}>
              誰かが「こんな気持ちで選んだ」エピソードを読みながら、自分が何を贈りたいかが見えてくる。
              haidozo は、答えを渡すんじゃなく、視点を渡す場所。
            </p>
          </div>
        </section>

        {/* ── Episodes ── */}
        <section className="section">
          <div className="wrap">
            <p className="eyebrow">REAL EPISODES</p>
            <h2 className="h2">「こんな贈り方がしたかった」が、ヒントになる</h2>
            <p className="lead" style={{ maxWidth: 560 }}>
              haidozo に記録されているのは、アイテム名だけじゃない。その人のこと、選んだ理由、贈った後に思い描いていた場面。
            </p>
            <div className="grid-3">
              {EPISODES.map((ep, i) => (
                <div key={i} style={{
                  background: "#fff", border: "1px solid rgba(43,52,103,0.08)",
                  borderRadius: 22, padding: "28px 24px 22px",
                  boxShadow: "0 4px 20px rgba(43,52,103,0.06)",
                  display: "flex", flexDirection: "column", gap: 0,
                }}>
                  {/* wish = アウトカム */}
                  <div style={{
                    background: "rgba(232,80,42,0.06)", borderRadius: 12,
                    padding: "12px 14px", marginBottom: 18,
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#E8502A", letterSpacing: "0.06em", marginBottom: 6 }}>
                      こんな気持ちで選んだ
                    </p>
                    <p style={{ fontSize: 13, color: "#2B3467", lineHeight: 1.8, fontWeight: 500 }}>
                      {ep.wish}
                    </p>
                  </div>
                  {/* reason */}
                  <div style={{ borderLeft: "2px solid rgba(43,52,103,0.12)", paddingLeft: 14, marginBottom: 20, flex: 1 }}>
                    <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.85 }}>
                      {ep.reason}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#2B3467", marginBottom: 8 }}>{ep.item}</p>
                    <span style={{
                      fontSize: 11, background: "rgba(232,80,42,0.08)", color: "#E8502A",
                      borderRadius: 100, padding: "4px 12px", fontWeight: 600,
                    }}>{ep.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="section-alt">
          <div className="wrap">
            <p className="eyebrow">HOW IT WORKS</p>
            <h2 className="h2">エピソードから、自分の答えが見えてくる</h2>
            <p className="lead" style={{ maxWidth: 560, marginBottom: 0 }}>
              1問1答じゃない。誰かの「こんな贈り方をしたかった」に共鳴しながら、贈りたい気持ちの方向性が見えてくる。
            </p>

            <div className="flow-cards">
              {[
                {
                  n: "01",
                  title: "誰に・どんな時を選ぶ",
                  body: "贈る相手の関係性と場面を選ぶと、近いエピソードが出てくる。",
                  accent: false,
                },
                {
                  n: "02",
                  title: "エピソードを眺める",
                  body: "「こんな贈り方がしたかった」というリアルな記録を読んでいく。ピンとくるものを探す感覚で。",
                  accent: false,
                },
                {
                  n: "03",
                  title: "「これに近い！」を選ぶ",
                  body: "共鳴したエピソードを選ぶと、何がよかったか・自分の相手のことを少し掘り下げるステップへ。",
                  accent: true,
                },
                {
                  n: "04",
                  title: "「じゃあこういう軸ね」が出てくる",
                  body: "「こんなプレゼントがしたい」という自分の贈りたい気持ちの言葉が見つかる。そこから探せばいい。",
                  accent: false,
                },
              ].map((step) => (
                <div key={step.n} style={{
                  background: step.accent ? "rgba(232,80,42,0.05)" : "#fff",
                  border: `1.5px solid ${step.accent ? "rgba(232,80,42,0.25)" : "rgba(43,52,103,0.08)"}`,
                  borderRadius: 20, padding: "24px 22px",
                  display: "flex", flexDirection: "column", gap: 12,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: step.accent ? "rgba(232,80,42,0.12)" : "rgba(43,52,103,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: step.accent ? "#E8502A" : "#2B3467" }}>{step.n}</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#2B3467" }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: "#8B93B8", lineHeight: 1.8 }}>{step.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pseudo experience ── */}
        <section className="section">
          <div className="wrap">
            <p className="eyebrow">TRY IT</p>
            <h2 className="h2">こんな体験ができます</h2>
            <p className="lead" style={{ maxWidth: 560, marginBottom: 48 }}>
              エピソードを見ながら「これに近い！」を選ぶと、「じゃあこういうプレゼントがしたいんだね」という軸が言葉になって出てくる。
            </p>

            {/* Mockup */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 16, alignItems: "center",
            }}>
              {/* Episode card */}
              <div style={{
                width: "100%", maxWidth: 420,
                background: "#fff", border: "1.5px solid rgba(43,52,103,0.1)",
                borderRadius: 24, padding: 24, boxShadow: "0 8px 32px rgba(43,52,103,0.08)",
              }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {["友達", "誕生日", "〜5,000円"].map((t) => (
                    <span key={t} style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
                      background: "rgba(43,52,103,0.06)", color: "#8B93B8",
                    }}>{t}</span>
                  ))}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#A0A8CC", letterSpacing: "0.06em", marginBottom: 6 }}>贈った相手のこと</p>
                  <p style={{ fontSize: 14, color: "#2B3467", lineHeight: 1.8 }}>
                    いつもハードワークで忙しそうな子。昔一緒に香水屋さんに寄ったとき、仕事で辛くなった時に気持ちを切り替えるために香りを使うって話してくれた
                  </p>
                </div>
                <div style={{ height: 1, background: "rgba(43,52,103,0.08)", margin: "14px 0" }} />
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#A0A8CC", letterSpacing: "0.06em", marginBottom: 6 }}>なぜこれを選んだか</p>
                  <p style={{ fontSize: 14, color: "#2B3467", lineHeight: 1.8 }}>
                    ディスカバリーセットなら色んな香りを試せるから、気分で使い分けられると思って
                  </p>
                </div>
                <div style={{
                  display: "flex", flexDirection: "column", gap: 10, marginTop: 8,
                }}>
                  <div style={{
                    background: "#E8502A", borderRadius: 100, padding: "14px",
                    textAlign: "center", fontSize: 15, fontWeight: 700, color: "#fff",
                    boxShadow: "0 4px 16px rgba(232,80,42,0.3)",
                  }}>
                    これに近い！
                  </div>
                  <div style={{
                    border: "1.5px solid rgba(43,52,103,0.12)", borderRadius: 100, padding: "12px",
                    textAlign: "center", fontSize: 14, color: "#8B93B8", fontWeight: 500,
                  }}>
                    ちょっと違うかも →
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: 24, color: "#E8502A", lineHeight: 1 }}>↓</div>

              {/* Axis card */}
              <div style={{
                width: "100%", maxWidth: 420,
                background: "linear-gradient(135deg, rgba(232,80,42,0.07) 0%, #fff8f5 100%)",
                border: "2px solid rgba(232,80,42,0.2)",
                borderRadius: 24, padding: 24, boxShadow: "0 8px 32px rgba(232,80,42,0.08)",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#E8502A", letterSpacing: "0.08em", marginBottom: 10 }}>
                  じゃあこういう軸ね
                </p>
                <p style={{ fontSize: 19, fontWeight: 800, color: "#2B3467", lineHeight: 1.5, marginBottom: 16 }}>
                  辛い時に、そっとそばにいてあげられるもの
                </p>
                <div style={{ height: 1, background: "rgba(232,80,42,0.12)", marginBottom: 14 }} />
                <p style={{ fontSize: 11, fontWeight: 700, color: "#A0A8CC", letterSpacing: "0.06em", marginBottom: 6 }}>
                  このひとのこと
                </p>
                <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.8, marginBottom: 20 }}>
                  仕事が忙しくて、気持ちの切り替えが得意な子
                </p>
                <div style={{
                  background: "#E8502A", borderRadius: 100, padding: "14px",
                  textAlign: "center", fontSize: 15, fontWeight: 700, color: "#fff",
                  boxShadow: "0 4px 16px rgba(232,80,42,0.3)",
                }}>
                  この方向で探す
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 48 }}>
              <Link href="/" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "2px solid #E8502A", color: "#E8502A",
                borderRadius: 100, padding: "14px 36px",
                fontSize: 15, fontWeight: 700, textDecoration: "none",
                transition: "all 200ms",
              }}>
                実際に体験してみる →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section style={{ background: "#2B3467", padding: "100px 0 112px", textAlign: "center" }}>
          <div className="wrap">
            <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 18 }}>
              haidozo
            </div>
            <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 40 }}>
              あの人が喜ぶ場面を想像しながら、<br />プレゼントを選ぼう。
            </p>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#E8502A", color: "#fff",
              borderRadius: 100, padding: "18px 48px",
              fontSize: 17, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 8px 32px rgba(232,80,42,0.5)",
            }}>
              一緒に考えてみる →
            </Link>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", marginTop: 22 }}>無料で使えます</p>
          </div>
        </section>

      </div>
    </>
  );
}
