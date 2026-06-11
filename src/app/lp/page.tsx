import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "haidozo — 考えた時間が、いちばんの贈り物になる",
  description: "モノを探す前に、相手のことを思いめぐらせる。haidozoは「誰かを想って選ぶ時間」のためのサービス。",
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

const STEPS = [
  {
    n: "01",
    title: "思い浮かべる",
    body: "誰に、どんな場面で、どんな人か。条件ではなく「人柄」から始める、haidozoの入口はこれひとつ。",
    accent: false,
  },
  {
    n: "02",
    title: "めぐらせる",
    body: "「最近、その人が嬉しそうだったのは？」——問いに答えながら、誰かの『なぜ選んだか』をヒントに、想いのかけらを集めていく。",
    accent: true,
  },
  {
    n: "03",
    title: "想いの一文になる",
    body: "かけらが「こんなふうに喜んでほしい」という一文に結晶する。モノ選びはそのあと。方向が決まれば、もう迷わない。",
    accent: false,
  },
  {
    n: "04",
    title: "贈って、記録する",
    body: "考えた時間ごと記録に残す。あなたの「なぜ選んだか」が、次に誰かが思いめぐらせる時のヒントになる。",
    accent: false,
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
        .flow-cards { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 40px; }
        .mock-row { display: flex; flex-direction: column; gap: 24px; align-items: center; }
        @media (min-width: 640px) {
          .grid-3 { grid-template-columns: repeat(3, 1fr); }
          .flow-cards { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
        @media (min-width: 768px) {
          .flow-cards { grid-template-columns: repeat(4, 1fr); }
          .mock-row { flex-direction: row; align-items: stretch; justify-content: center; }
        }
      `}</style>

      <div className="lp">
        {/* Version bar */}
        <div style={{ background: "#2B3467", padding: "8px 0", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            LP{" "}
            <Link href="/lp/v1" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "underline" }}>v1</Link>
            {"　"}
            <Link href="/lp/v2" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "underline" }}>v2</Link>
            {"　"}
            <Link href="/lp/v3" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "underline" }}>v3</Link>
            {"　"}
            <strong style={{ color: "#E8502A" }}>v4（最新）</strong>
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
            <p className="eyebrow">OMOI-MEGURI</p>
            <h1 style={{
              fontSize: "clamp(34px, 5.6vw, 60px)",
              fontWeight: 800, lineHeight: 1.25, letterSpacing: "-1.5px",
              color: "#2B3467", maxWidth: 820, margin: "0 auto 28px",
            }}>
              考えた時間が、<br />いちばんの贈り物になる。
            </h1>
            <p style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              color: "#8B93B8", lineHeight: 1.85,
              maxWidth: 540, margin: "0 auto 44px",
            }}>
              モノを探す前に、相手のことを思いめぐらせる。<br />
              haidozoは「誰かを想って選ぶ時間」のためのサービス。
            </p>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#E8502A", color: "#fff",
              borderRadius: 100, padding: "17px 40px",
              fontSize: 16, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 8px 28px rgba(232,80,42,0.38)",
              letterSpacing: "0.01em",
            }}>
              思いめぐらせてみる →
            </Link>
          </div>
        </section>

        {/* ── Problem ── */}
        <section className="section-alt">
          <div className="wrap">
            <p className="eyebrow">THE PROBLEM</p>
            <h2 className="h2">「探すツール」はあるのに、<br />「考える場所」がなかった</h2>
            <p style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 800, color: "#E8502A", lineHeight: 1.5, marginBottom: 24, maxWidth: 640 }}>
              そのプレゼント、どうして選んだの？
            </p>
            <p className="lead" style={{ maxWidth: 560 }}>
              ECもSNSも「何を買うか」から始まる。でも、本当にいい贈り物は「あの人はどんな人か」から始まる。
              haidozoは検索結果じゃなく、贈る相手のことを考えるプロセスそのものを真ん中に置きました。
            </p>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="section">
          <div className="wrap">
            <p className="eyebrow">HOW IT WORKS</p>
            <h2 className="h2">入口はひとつ。「誰のことを考える？」から</h2>
            <p className="lead" style={{ maxWidth: 560, marginBottom: 0 }}>
              フィルターで絞り込む検索ではなく、相手を思い浮かべることから始まる1本の道。
              途中で出会う誰かのエピソードが、あなたの考えを進めてくれる。
            </p>

            <div className="flow-cards">
              {STEPS.map((step) => (
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
        <section className="section-alt">
          <div className="wrap">
            <p className="eyebrow">TRY IT</p>
            <h2 className="h2">考えの途中を、置いておける</h2>
            <p className="lead" style={{ maxWidth: 560, marginBottom: 48 }}>
              思いめぐらせた途中経過は「考え中の相手」として残る。
              アプリを開くたび、検索バーじゃなく、あの人の顔が待っている。
            </p>

            <div className="mock-row">
              {/* 考え中カード mockup */}
              <div style={{
                width: "100%", maxWidth: 400,
                background: "#FAF7F2", border: "1.5px solid rgba(43,52,103,0.1)",
                borderRadius: 24, padding: 24, boxShadow: "0 8px 32px rgba(43,52,103,0.08)",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#A0A8CC", letterSpacing: "0.06em", marginBottom: 14 }}>
                  考え中の相手
                </p>
                <div style={{
                  background: "#fff", border: "1px solid rgba(43,52,103,0.08)",
                  borderRadius: 18, padding: 16, marginBottom: 12,
                }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 100,
                      background: "rgba(232,80,42,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 800, color: "#E8502A",
                    }}>母</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#2B3467", marginBottom: 4 }}>お母さん</p>
                      <div style={{ display: "flex", gap: 5 }}>
                        {["家族", "誕生日"].map((t) => (
                          <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: "rgba(43,52,103,0.06)", color: "#8B93B8" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "#8B93B8", lineHeight: 1.7, marginBottom: 12 }}>
                    「最近vlogを始めて楽しそう。ネタになるものもいいかも」
                  </p>
                  <div style={{
                    background: "#E8502A", borderRadius: 100, padding: "10px",
                    textAlign: "center", fontSize: 13, fontWeight: 700, color: "#fff",
                  }}>
                    つづきを考える
                  </div>
                </div>
                <div style={{
                  border: "1.5px dashed rgba(232,80,42,0.5)", borderRadius: 16,
                  padding: "13px", textAlign: "center",
                  fontSize: 13, fontWeight: 700, color: "#E8502A",
                  background: "rgba(232,80,42,0.04)",
                }}>
                  ＋ 新しく思いめぐらせる
                </div>
              </div>

              {/* 想いの一文 mockup */}
              <div style={{
                width: "100%", maxWidth: 400,
                background: "#fff", border: "2px solid rgba(232,80,42,0.2)",
                borderRadius: 24, padding: 24, boxShadow: "0 8px 32px rgba(232,80,42,0.08)",
                display: "flex", flexDirection: "column",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#A0A8CC", letterSpacing: "0.06em", marginBottom: 14 }}>
                  めぐらせた先に
                </p>
                <div style={{
                  background: "linear-gradient(135deg, rgba(232,80,42,0.08) 0%, #fff8f5 100%)",
                  border: "1.5px solid rgba(232,80,42,0.25)",
                  borderRadius: 16, padding: "16px 18px", marginBottom: 16,
                }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#E8502A", letterSpacing: "0.08em", marginBottom: 8 }}>
                    こんなふうに喜んでほしい
                  </p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#2B3467", lineHeight: 1.7 }}>
                    出かける口実ごと、<br />プレゼントしたい
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                  {["出かける口実をあげたかった", "ふたりで楽しんでほしい"].map((v) => (
                    <span key={v} style={{ fontSize: 11, padding: "4px 11px", borderRadius: 100, background: "rgba(232,80,42,0.08)", color: "#E8502A", fontWeight: 600 }}>{v}</span>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "#8B93B8", lineHeight: 1.8, marginTop: "auto" }}>
                  想いが一文になってから、モノに出会う。<br />近い記録とお店が、その下に並びます。
                </p>
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

        {/* ── Episodes ── */}
        <section className="section">
          <div className="wrap">
            <p className="eyebrow">REAL EPISODES</p>
            <h2 className="h2">あなたの「なぜ選んだか」が、<br />誰かのヒントになる</h2>
            <p className="lead" style={{ maxWidth: 560 }}>
              haidozoに残るのはアイテム名だけじゃない。その人のこと、選んだ理由、贈ったあとに思い描いていた場面。
              考えて、贈って、記録する——そのループが、次に誰かが思いめぐらせる時間を支える。
            </p>
            <div className="grid-3">
              {EPISODES.map((ep, i) => (
                <div key={i} style={{
                  background: "#fff", border: "1px solid rgba(43,52,103,0.08)",
                  borderRadius: 22, padding: "28px 24px 22px",
                  boxShadow: "0 4px 20px rgba(43,52,103,0.06)",
                  display: "flex", flexDirection: "column", gap: 0,
                }}>
                  <div style={{
                    background: "rgba(232,80,42,0.06)", borderRadius: 12,
                    padding: "12px 14px", marginBottom: 18,
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#E8502A", letterSpacing: "0.06em", marginBottom: 6 }}>
                      こんなふうに喜んでほしかった
                    </p>
                    <p style={{ fontSize: 13, color: "#2B3467", lineHeight: 1.8, fontWeight: 500 }}>
                      {ep.wish}
                    </p>
                  </div>
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

        {/* ── Final CTA ── */}
        <section style={{ background: "#2B3467", padding: "100px 0 112px", textAlign: "center" }}>
          <div className="wrap">
            <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 18 }}>
              haidozo
            </div>
            <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 40 }}>
              いま、誰のことを考えていますか？
            </p>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#E8502A", color: "#fff",
              borderRadius: 100, padding: "18px 48px",
              fontSize: 17, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 8px 32px rgba(232,80,42,0.5)",
            }}>
              思いめぐらせてみる →
            </Link>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", marginTop: 22 }}>無料で使えます</p>
          </div>
        </section>

      </div>
    </>
  );
}
