import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "haidozo — なにあげよ？から、はじめる。",
  description: "プレゼントは、探すより考える時間が楽しい。haidozoは「これどうかな？」からギフトのヒントに出会えるサービス。",
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
    title: "なにあげよ？",
    body: "まず、誰のことを考えるかを選ぶ。条件入力ではなく、あの人の顔が浮かぶところから始める。",
    accent: false,
  },
  {
    n: "02",
    title: "これどうかな？",
    body: "好きなものや最近の会話をメモしながら、みんなの『なぜ選んだか』を候補メモとして集める。",
    accent: true,
  },
  {
    n: "03",
    title: "これ、いいかも",
    body: "候補の中から、あの人が喜んでくれそうな方向が見えてくる。モノ選びはそのあと。",
    accent: false,
  },
  {
    n: "04",
    title: "贈って、記録する",
    body: "考えた時間ごと記録に残す。あなたの「なぜ選んだか」が、次に誰かが迷ったときのヒントになる。",
    accent: false,
  },
];

export default function LpPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .lp { font-family: var(--font-sans, system-ui, sans-serif); background: var(--hz-cream); color: var(--hz-ink); }
        .wrap { max-width: 1040px; margin: 0 auto; padding: 0 32px; }
        @media (min-width: 768px) { .wrap { padding: 0 64px; } }
        .section { padding: 96px 0; }
        .section-alt { padding: 96px 0; background: var(--hz-surface); border-top: 1px solid var(--hz-hairline); border-bottom: 1px solid var(--hz-hairline); }
        .eyebrow { font-size: 11px; font-weight: 800; color: var(--hz-orange); letter-spacing: 0; margin-bottom: 20px; }
        .h2 { font-size: clamp(26px, 3.5vw, 38px); font-weight: 800; line-height: 1.25; letter-spacing: 0; color: var(--hz-ink); margin-bottom: 20px; }
        .lead { font-size: clamp(14px, 1.5vw, 16px); color: var(--hz-ink-soft); line-height: 1.9; }
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
        {/* ── Nav ── */}
        <nav style={{
          borderBottom: "1px solid var(--hz-hairline)",
          background: "color-mix(in srgb, var(--hz-cream) 92%, transparent)", backdropFilter: "blur(10px)",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div className="wrap" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              fontWeight: 800,
              lineHeight: 1,
              color: "var(--hz-ink)",
            }}>
              haidozo
            </div>
            <Link href="/" style={{
              background: "var(--hz-orange)", color: "var(--hz-cream)", borderRadius: 100,
              padding: "9px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none",
              boxShadow: "var(--hz-shadow-cta)",
            }}>
              使ってみる
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ padding: "80px 0 72px", textAlign: "center" }}>
          <div className="wrap">
            <p className="eyebrow">贈る前の、いちばん楽しい時間</p>
            <h1 style={{
              fontSize: "clamp(34px, 5.6vw, 60px)",
              fontWeight: 800, lineHeight: 1.18, letterSpacing: 0,
              color: "var(--hz-ink)", maxWidth: 820, margin: "0 auto 28px",
            }}>
              なにあげよ？<br />から、はじめる。
            </h1>
            <p style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              color: "var(--hz-ink-soft)", lineHeight: 1.85,
              maxWidth: 540, margin: "0 auto 44px",
            }}>
              プレゼントは、探すより考える時間が楽しい。<br />
              「これどうかな？」を集めて、「これ、いいかも」に出会うアプリ。
            </p>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--hz-orange)", color: "var(--hz-cream)",
              borderRadius: 100, padding: "17px 40px",
              fontSize: 16, fontWeight: 700, textDecoration: "none",
              boxShadow: "var(--hz-shadow-cta)",
              letterSpacing: "0.01em",
            }}>
              なにあげよ？を始める →
            </Link>
          </div>
        </section>

        {/* ── Problem ── */}
        <section className="section-alt">
          <div className="wrap">
            <p className="eyebrow">WHY HAIDOZO</p>
            <h2 className="h2">「探すツール」はあるのに、<br />「考える場所」がなかった</h2>
            <p style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 800, color: "var(--hz-orange)", lineHeight: 1.5, marginBottom: 24, maxWidth: 640 }}>
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
            <h2 className="h2">入口はひとつ。「なにあげよ？」から</h2>
            <p className="lead" style={{ maxWidth: 560, marginBottom: 0 }}>
              フィルターで絞り込む検索ではなく、あの人の顔を思い浮かべることから始まる1本の道。
              誰かのエピソードが、「これどうかな？」のヒントになる。
            </p>

            <div className="flow-cards">
              {STEPS.map((step) => (
                <div key={step.n} style={{
                  background: step.accent ? "color-mix(in srgb, var(--hz-orange) 4%, transparent)" : "var(--hz-surface)",
                  border: `1.5px solid ${step.accent ? "color-mix(in srgb, var(--hz-orange) 20%, transparent)" : "var(--hz-hairline)"}`,
                  borderRadius: 20, padding: "24px 22px",
                  display: "flex", flexDirection: "column", gap: 12,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: step.accent ? "var(--hz-orange-wash)" : "var(--hz-surface-alt)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: step.accent ? "var(--hz-orange)" : "var(--hz-ink)" }}>{step.n}</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--hz-ink)" }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: "var(--hz-ink-soft)", lineHeight: 1.8 }}>{step.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pseudo experience ── */}
        <section className="section-alt">
          <div className="wrap">
            <p className="eyebrow">TRY IT</p>
            <h2 className="h2">あとで考える、もちゃんと残せる</h2>
            <p className="lead" style={{ maxWidth: 560, marginBottom: 48 }}>
              決めきれない途中経過は「あとで考える」として残る。
              アプリを開くたび、検索バーじゃなく、あの人の顔から続きが始まる。
            </p>

            <div className="mock-row">
              {/* あとで考えるカード mockup */}
              <div style={{
                width: "100%", maxWidth: 400,
                background: "var(--hz-cream)", border: "1.5px solid var(--hz-hairline)",
                borderRadius: 24, padding: 24, boxShadow: "var(--hz-shadow-soft)",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--hz-ink-faint)", letterSpacing: "0.06em", marginBottom: 14 }}>
                  あとで考える
                </p>
                <div style={{
                  background: "var(--hz-surface)", border: "1px solid var(--hz-hairline)",
                  borderRadius: 18, padding: 16, marginBottom: 12,
                }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 100,
                      background: "var(--hz-orange-tint)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 800, color: "var(--hz-orange-press)",
                    }}>母</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "var(--hz-ink)", marginBottom: 4 }}>お母さん</p>
                      <div style={{ display: "flex", gap: 5 }}>
                        {["家族", "誕生日"].map((t, index) => (
                          <span key={t} style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 100,
                            background: index === 0 ? "var(--hz-orange-tint)" : "var(--hz-sky-tint)",
                            color: index === 0 ? "var(--hz-orange-press)" : "var(--hz-sky)",
                          }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--hz-ink-soft)", lineHeight: 1.7, marginBottom: 12 }}>
                    「最近vlogを始めて楽しそう。ネタになるものもいいかも」
                  </p>
                  <div style={{
                    background: "var(--hz-orange)", borderRadius: 100, padding: "10px",
                    textAlign: "center", fontSize: 13, fontWeight: 700, color: "var(--hz-cream)",
                  }}>
                    つづきを考える
                  </div>
                </div>
                <div style={{
                  border: "1.5px dashed var(--hz-orange)", borderRadius: 16,
                  padding: "13px", textAlign: "center",
                  fontSize: 13, fontWeight: 700, color: "var(--hz-orange)",
                  background: "var(--hz-orange-wash)",
                }}>
                  ＋ あたらしく「なにあげよ？」
                </div>
              </div>

              {/* これ、いいかも mockup */}
              <div style={{
                width: "100%", maxWidth: 400,
                background: "var(--hz-surface)", border: "2px solid color-mix(in srgb, var(--hz-orange) 20%, transparent)",
                borderRadius: 24, padding: 24, boxShadow: "var(--hz-shadow-soft)",
                display: "flex", flexDirection: "column",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--hz-ink-faint)", letterSpacing: "0.06em", marginBottom: 14 }}>
                  これ、いいかも
                </p>
                <div style={{
                  background: "linear-gradient(135deg, var(--hz-orange-wash) 0%, var(--hz-surface) 100%)",
                  border: "1.5px solid color-mix(in srgb, var(--hz-orange) 24%, transparent)",
                  borderRadius: 16, padding: "16px 18px", marginBottom: 16,
                }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "var(--hz-orange)", letterSpacing: "0.08em", marginBottom: 8 }}>
                    あの人に、これだ
                  </p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "var(--hz-ink)", lineHeight: 1.7 }}>
                    出かける口実ごと、<br />プレゼントしたい
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                  {["出かける口実をあげたかった", "ふたりで楽しんでほしい"].map((v) => (
                    <span key={v} style={{ fontSize: 11, padding: "4px 11px", borderRadius: 100, background: "var(--hz-orange-wash)", color: "var(--hz-orange)", fontWeight: 600 }}>{v}</span>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "var(--hz-ink-soft)", lineHeight: 1.8, marginTop: "auto" }}>
                  喜んでくれそうな方向が見えてから、モノに出会う。<br />近い記録とお店が、その下に並びます。
                </p>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 48 }}>
              <Link href="/" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "2px solid var(--hz-orange)", color: "var(--hz-orange)",
                borderRadius: 100, padding: "14px 36px",
                fontSize: 15, fontWeight: 700, textDecoration: "none",
                transition: "all 200ms",
              }}>
                なにあげよ？を体験する →
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
              考えて、贈って、記録する。そのループが、次に誰かが「なにあげよ？」と迷った時間を支える。
            </p>
            <div className="grid-3">
              {EPISODES.map((ep, i) => (
                <div key={i} className="card-interactive" style={{
                  background: "var(--hz-surface)", border: "1px solid var(--hz-hairline)",
                  borderRadius: 22, padding: "28px 24px 22px",
                  boxShadow: "var(--hz-shadow-soft)",
                  display: "flex", flexDirection: "column", gap: 0,
                }}>
                  <div style={{
                    background: "var(--hz-orange-wash)", borderRadius: 12,
                    padding: "12px 14px", marginBottom: 18,
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--hz-orange)", letterSpacing: "0.06em", marginBottom: 6 }}>
                      こんなふうに喜んでほしかった
                    </p>
                    <p style={{ fontSize: 13, color: "var(--hz-ink)", lineHeight: 1.8, fontWeight: 500 }}>
                      {ep.wish}
                    </p>
                  </div>
                  <div style={{ borderLeft: "2px solid var(--hz-hairline)", paddingLeft: 14, marginBottom: 20, flex: 1 }}>
                    <p style={{ fontSize: 13, color: "var(--hz-ink-soft)", lineHeight: 1.85 }}>
                      {ep.reason}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--hz-ink)", marginBottom: 8 }}>{ep.item}</p>
                    <span style={{
                      fontSize: 11, background: "var(--hz-orange-wash)", color: "var(--hz-orange)",
                      borderRadius: 100, padding: "4px 12px", fontWeight: 600,
                    }}>{ep.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section style={{ background: "var(--hz-ink)", padding: "100px 0 112px", textAlign: "center" }}>
          <div className="wrap">
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--hz-cream)", letterSpacing: 0, marginBottom: 18 }}>
              haidozo
            </div>
            <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "color-mix(in srgb, var(--hz-cream) 50%, transparent)", lineHeight: 1.8, marginBottom: 40 }}>
              いま、誰のことを考えていますか？
            </p>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--hz-orange)", color: "var(--hz-cream)",
              borderRadius: 100, padding: "18px 48px",
              fontSize: 17, fontWeight: 700, textDecoration: "none",
              boxShadow: "var(--hz-shadow-cta)",
            }}>
              なにあげよ？を始める →
            </Link>
            <p style={{ fontSize: 12, color: "color-mix(in srgb, var(--hz-cream) 22%, transparent)", marginTop: 22 }}>無料で使えます</p>
          </div>
        </section>

      </div>
    </>
  );
}
