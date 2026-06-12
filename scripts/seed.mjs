/**
 * haidozo シードスクリプト
 * - ダミーアカウント5名を Admin API で作成（ログイン不可：ランダムパスワード）
 * - mockData.ts 由来の17投稿を投入（冪等：同名 item の既存投稿はスキップ）
 * - テスト投稿（item="テスト"）を削除
 *
 * 実行方法（プロジェクトルート app/ で）:
 *   SUPABASE_SERVICE_ROLE_KEY=<service_roleキー> node scripts/seed.mjs
 *
 * URL は .env.local の NEXT_PUBLIC_SUPABASE_URL を自動で読む。
 * service_role キーは絶対にコミット・クライアント露出しないこと。
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// ── 設定読み込み ──────────────────────────────────────────────
function readEnvLocal(key) {
  try {
    const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    const m = text.match(new RegExp(`^${key}=(.+)$`, "m"));
    return m?.[1]?.trim();
  } catch {
    return undefined;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? readEnvLocal("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL（.env.local可）と SUPABASE_SERVICE_ROLE_KEY（環境変数）が必要です");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

// ── ダミーアカウント ──────────────────────────────────────────
const SEED_USERS = [
  { key: "katsuya", name: "Katsuya", email: "seed-katsuya@haidozo.example" },
  { key: "waei",    name: "WAEI",    email: "seed-waei@haidozo.example" },
  { key: "shizuru", name: "shizuru", email: "seed-shizuru@haidozo.example" },
  { key: "juri",    name: "JURI",    email: "seed-juri@haidozo.example" },
  { key: "mina",    name: "mina",    email: "seed-mina@haidozo.example" },
];

// ── 投稿データ（src/lib/mockData.ts と同内容、created_at を付与） ──
const SEED_POSTS = [
  { user: "katsuya", created_at: "2026-05-18T10:00:00+09:00", item: "お猪口", relation: "友達", scene: "手土産", price: "〜3,000円",
    about: "大学の同期。二十歳になったばかり。",
    reason: "陶器市で素敵なお猪口を発見。お互いに二十歳になってお酒が飲めるようになったので、一緒に飲みたいという気持ちを込めて。",
    reaction: "素直に喜んでくれた。仲良いグループみんなにあげたので、一体感みたいなのがより強くなった気がした。",
    persona: ["お酒好き", "同期", "グループ"],
    vibes: ["一緒に楽しめるものがよかった", "一体感が生まれそう", "この出会いを形にしたかった"] },
  { user: "waei", created_at: "2025-12-24T19:00:00+09:00", item: "メイソンピアソン ヘアブラシ", relation: "恋人", scene: "記念日", price: "それ以上",
    about: "100均のものでも壊れるまで長く使う人",
    reason: "ほかの有名プロダクトはあったけど、「長く使う人」にずっとついて行ってくれるだろうプロダクトはこのブランドだけだった。髪を梳かすときは相手の後頭部で顔は見えないけど、自分があげたブラシが見えるならとても良い時間になるなとも思ったから。",
    reaction: "突然突撃してケーキと一緒にあげて喜んでくれた！",
    url: "https://www.masonpearson.jp/",
    persona: ["ものを大切にする", "長く使う", "丁寧な暮らし"],
    vibes: ["ずっと使い続けてほしい", "毎日の時間に自分がいてほしい", "ちゃんと見てたことが伝わる"] },
  { user: "shizuru", created_at: "2026-04-08T09:00:00+09:00", item: "ブルーボトルコーヒー インスタントコーヒーセット（ブライト・エスプレッソ）", relation: "先生・恩師", scene: "誕生日", price: "〜3,000円",
    about: "出張が多くて、宿泊先の部屋にコーヒーメーカーがあって朝コーヒー飲めるのが嬉しいってSNSに書いてた",
    reason: "旅先にサクッと持っていけるインスタントにしようとすぐ決まった。かさばらないし、ブルーボトルなら間違いないと思って即決",
    reaction: "たまたまお誕生日当日にお会いするタイミングがあって、その場でお渡しできた",
    url: "https://store.bluebottlecoffee.jp/products/s346",
    persona: ["コーヒー好き", "カフェ好き", "出張多い", "ハードワーカー"],
    vibes: ["旅先でふと思い出してほしい", "さりげなく気遣いが伝わる", "その人の日常に自然と馴染む"] },
  { user: "shizuru", created_at: "2026-03-22T15:00:00+09:00", item: "メゾン マルジェラ「レプリカ」フレグランス ディスカバリーコレクション", relation: "友達", scene: "誕生日", price: "〜5,000円",
    about: "いつもハードワークで忙しそうな子。昔一緒に香水屋さんに寄ったとき、仕事で辛くなった時に気持ちを切り替えるために香りを使うって話してくれた",
    reason: "普段からつけるわけじゃないけど、スイッチを切り替えるために香りを使うって言ってたのが頭に残ってた。ディスカバリーセットなら色んな香りを試せるから、気分で使い分けられると思って",
    url: "https://mall.line.me/sb/maisonmargiela/7723390",
    persona: ["おしゃれ好き", "センスいい", "香り好き", "ハードワーカー", "忙しそう"],
    vibes: ["辛い時にそっとそばにいてあげられる", "ちゃんと聞いてたよが伝わる", "気分の切り替えに使ってほしい"] },
  { user: "shizuru", created_at: "2026-04-19T14:00:00+09:00", item: "「立町カヌレ」カヌレギフトセット（15個入り）", relation: "友達", scene: "なんでもない日", price: "〜5,000円",
    about: "カヌレが大好きな子。同棲してて、うちに来てくれた時に私の大好きなピエールエルメをてんこ盛り買ってきてくれた",
    reason: "カヌレが好きって知ってたからてんこ盛りの詰め合わせに。ピエールエルメの時の嬉しさを今度は私から返したかった。同棲してるから基本シェアになるけど、その子自身のためのものにしたかった",
    url: "https://www.castagna.co.jp/pasticceria/cannelegiftset/",
    persona: ["甘いもの好き", "食いしん坊", "グルメ好き"],
    vibes: ["その子自身のためのものにしたかった", "嬉しさをお返ししたかった", "贈った後の顔が浮かんだ"] },
  { user: "shizuru", created_at: "2026-04-02T11:00:00+09:00", item: "TEAPOND ポーチ入り ティータイムセット", relation: "友達", scene: "送別", price: "〜3,000円",
    about: "紅茶屋さんでバイトするくらい紅茶好きな子。家の近くにteapondがあってよく一緒に遊びに来てくれてた",
    reason: "この子に贈るならここしかないと思った。引越し後はまだ落ち着かないだろうからティーバッグで手軽に飲めるのも考えた。ポーチ付きでグッズとしても使えるのも決め手",
    reaction: "新居で紅茶を飲む時にふと思い出してくれたらいいな",
    url: "https://teapond.jp/collections/gift/products/tts0003",
    persona: ["紅茶好き", "カフェ好き", "インドア派", "おうち時間好き"],
    vibes: ["新居でふと思い出してほしい", "この場所の記憶を持って行ってほしい", "落ち着いた時間に使ってほしい"] },
  { user: "shizuru", created_at: "2025-12-15T16:00:00+09:00", item: "TAKIBI BAKERY クリスマスシュトーレン ＋ 旅する紅茶 ＋ 小花束", relation: "先生・恩師", scene: "送別", price: "〜5,000円",
    about: "コーヒー屋さんで、もうすぐご結婚されると聞いていた。長くお世話になった方",
    reason: "コーヒーのプロだから、逆に普段選ばない紅茶を贈りたかった。シュトーレンはクリスマスの時期でもあったし、パートナーと一緒に食べてほしくて。お花は主役じゃなくていい、ありがとうを伝える1本として添えた",
    url: "https://csonline.cifaka.jp/?pid=64257741",
    persona: ["コーヒー好き", "甘いもの好き", "グルメ好き", "ハードワーカー", "花が好き"],
    vibes: ["プロだからこそ逆張りしたかった", "ふたりで楽しんでほしかった", "ありがとうをそっと添えたい"] },
  { user: "juri", created_at: "2026-02-11T13:00:00+09:00", item: "ADDICTION リップスティック", relation: "友達", scene: "誕生日", price: "〜5,000円",
    about: "あんまり化粧品を買うイメージはないけど化粧をしないわけじゃなくて、赤いリップが似合いそうな子",
    reason: "誕生日ならデパコスがいいかなーって思って、名前やこれまでの印象と色だけじゃなくてその商品の名前が素敵なものを選びたかった。SUQQUと悩んだけど、アディクションの鮮やかさやネーミングセンスの方がぴったりだなぁと思ったので選んだ",
    reaction: "あげたのはもう数年前だけどとっても気に入ってくれて自分で2本目も買ってた",
    url: "https://www.addiction-beauty.com/site/g/gMAPJ001/",
    persona: ["おしゃれ", "ナチュラルメイク", "色が似合う", "美意識ある"],
    vibes: ["名前まで含めてその人にぴったりを選びたかった", "何年後も使い続けてほしい", "センスが伝わるものがよかった"] },
  { user: "mina", created_at: "2026-04-25T18:00:00+09:00", item: "AURALEE スムースソフトウールニット", relation: "恋人", scene: "誕生日", price: "それ以上",
    about: "服に興味があって、社会人になったらもう少し高いものを使いたいと言っていた。ドメブラに興味はあるけど値段が高くて踏み出せずにいるのを知っていた。",
    reason: "実店舗でじっくり選べて、店員さんにも相談に乗ってもらえた。シンプルで何にでも合わせやすいのに、編み目に少しだけ特徴があって、わざわざ高いものを選ぶ意味がある一着だと思った。ドメブラへの入口として、まず使いやすいものから始めてほしかった。",
    reaction: "すごく喜んでもらえた。その後それに合わせてパンツを買ったりして、自分の世界を広げてくれて良かった。",
    url: "https://auralee.jp/item/detail/1_1_A26SP01SY_1/2501",
    persona: ["ファッション好き", "ドメブラ", "こだわり派", "社会人1年目"],
    vibes: ["自分の世界を広げてほしかった", "最初の一着になってほしかった", "入口を一緒に開けてあげたかった"] },
  { user: "shizuru", created_at: "2026-03-29T12:00:00+09:00", item: "ムビチケオンラインギフト 4枚綴り", relation: "友達", scene: "送別", price: "〜10,000円",
    about: "大学を卒業して遠方で働くことになった友達。映画をよく見る人で、泣きたくて映画を見るタイプ。映画館はスマホから離れられるのがいいって言ってた。",
    reason: "遠くに行くのでオンラインギフトがよかった。映画を気軽に見に行ける時間をプレゼントしたかった。4枚にしたのは、誰かを誘って一緒に見てほしかったから。友達との距離感としてもちょうどいい金額だった。",
    reaction: "すごく喜んでくれた。いろんな映画見に行ったよって報告してもらえた。",
    url: "https://page.line.me/bwk4306j",
    persona: ["映画好き", "泣くのが好き", "スマホから離れたい", "遠方"],
    vibes: ["気軽に見に行ける時間をプレゼントしたかった", "距離があっても届けられた", "誰かと一緒に使ってほしかった"] },
  { user: "shizuru", created_at: "2026-01-20T10:00:00+09:00", item: "図書カード（ピーターラビット）+ しおり", relation: "友達", scene: "誕生日", price: "〜3,000円",
    about: "図書館学系の大学で出会った友達。本が本当に好きで、本屋をウロウロするのが好き。",
    reason: "本をプレゼントしたいと思ったけど、本は自分で選ぶのが好きな子だと思って。本屋でウロウロしながら選ぶ時間ごとプレゼントしたくて図書カードにした。しおりをセットにしたのは、本を読む時間そのものも一緒に贈りたかったから。",
    url: "https://www.toshocard.com/toshocard/peterrabbit.html",
    persona: ["本好き", "本屋好き", "読書家", "図書館"],
    vibes: ["本を選ぶ時間からプレゼントしたかった", "その人のペースで楽しんでほしかった", "自分で選ぶ喜びを邪魔したくなかった"] },
  { user: "shizuru", created_at: "2026-05-30T20:00:00+09:00", item: "COMME des GARÇONS PARFUM Monocle Yoyogi", relation: "恋人", scene: "誕生日", price: "〜10,000円",
    about: "普段使うものにこだわりがある彼。でも香水はまだ開拓していないのを知っていた。私が香水が好きなので、一緒にいるから手に取りやすいものを選びたかった。",
    reason: "普段使いのものに踏み込むのは違うと思って、まだ開拓していない香りにした。代々木の草木の香りがするコムデギャルソンの香水で、サカナクションの山口一郎さんも使っているとどこかで知っていた。嫌いな人はいないと思える深い香りで、これをつけてちょっと気取った気分になってくれたら嬉しいなと思って選んだ。",
    reaction: "時々使ってくれていて、近づくといい香りがする。",
    url: "https://comme-des-garcons-parfum.com/products/monocle-yoyogi",
    persona: ["こだわり派", "香水未経験", "感性派", "音楽好き"],
    vibes: ["私と一緒にいるから手に取れるものがよかった", "気取った気分になってほしかった", "開拓していない世界に連れて行きたかった"] },
  { user: "shizuru", created_at: "2026-02-27T17:00:00+09:00", item: "あなたのための短歌集（木下龍也）+ パロサント", relation: "友達", scene: "誕生日", price: "〜3,000円",
    about: "いろんなことをやっていてすごく忙しい子。でもお家の時間を楽しんでいて、どんな紅茶を飲むかとか、一人の時間を大切にしている。",
    reason: "本を渡すと読まなきゃという気持ちになりそうで、短歌集なら気軽に広げて、ちょっとした文章で想像を膨らませたり温かい気持ちになれると思った。そういう時間を過ごしてほしいという手紙と一緒に、香りのパロサントも添えた。",
    reaction: "気持ちが嬉しいって言ってもらえた。",
    url: "https://www.amazon.co.jp/%E3%81%82%E3%81%AA%E3%81%9F%E3%81%AE%E3%81%9F%E3%82%81%E3%81%AE%E7%9F%AD%E6%AD%8C%E9%9B%86-%E6%9C%A8%E4%B8%8B-%E9%BE%8D%E4%B9%9F/dp/4867320064",
    persona: ["忙しい", "一人の時間が好き", "インドア派", "おうち時間"],
    vibes: ["重くない贈り物にしたかった", "ちょっとした時間に開いてほしかった", "ひとりの時間がもっと豊かになってほしかった"] },
  { user: "shizuru", created_at: "2026-05-07T13:00:00+09:00", item: "スターバックスeギフト 4枚綴り", relation: "友達", scene: "応援", price: "〜3,000円",
    about: "ちょっと失敗をして落ち込んでいた友達。カフェが好きな子。",
    reason: "すぐそばに行けないので、オンラインで届けたかった。カフェでゆっくりしてほしいという気持ちと、誰かを誘って一緒に飲んだら気が紛れるかなと思って複数枚にした。",
    reaction: "喜んでくれた。使ってくれたのも知っている。",
    url: "https://www.starbucks.co.jp/egift/",
    persona: ["カフェ好き", "仕事頑張ってる", "落ち込んでいる"],
    vibes: ["そばにいられなくても届けたかった", "誰かと飲んで気が紛れてほしかった", "気軽なものがちょうどよかった"] },
  { user: "shizuru", created_at: "2026-01-10T11:00:00+09:00", item: "FOR2ギフト（GREEN）| ソウ・エクスペリエンス体験ギフト", relation: "友達", scene: "結婚祝い", price: "それ以上",
    about: "旅行が好きでアクティブなカップル。今は夫婦に。",
    reason: "一緒にアクティブな体験ができたら、ふたりの思い出になると思った。モノより体験を残してほしくて、ふたりで使える体験ギフトにした。",
    url: "https://www.sowxp.co.jp/catalogs/5",
    persona: ["旅行好き", "アクティブ", "カップル", "体験好き"],
    vibes: ["ふたりの思い出になってほしかった", "モノより体験を残したかった", "一緒に使ってほしかった"] },
  { user: "shizuru", created_at: "2026-03-05T15:00:00+09:00", item: "汲古 紅白のお皿", relation: "友達", scene: "結婚祝い", price: "〜10,000円",
    about: "料理が大好きで、素敵な料理をみんなに振る舞っているカップル。今は夫婦に。",
    reason: "料理が好きな子だから食器を贈りたかった。しかもめでたいお祝いなので、紅白の食器にした。",
    url: "https://media.urban-research.jp/news/610924/",
    persona: ["料理好き", "おもてなし好き", "カップル", "食器"],
    vibes: ["好きなものに踏み込みたかった", "おめでとうの気持ちを形にしたかった", "ふたりで使ってほしかった"] },
  { user: "shizuru", created_at: "2026-06-01T09:30:00+09:00", item: "アフタヌーンティーペアチケット | ソウ・エクスペリエンス体験ギフト", relation: "家族", scene: "誕生日", price: "それ以上",
    about: "最近vlogを始めてYouTubeに投稿している母。お出かけ系のvlogなのでよく外に出ている。",
    reason: "出かける口実をあげたいのと、vlogのネタ提供にもなると思って。お父さんと一緒に行けるようにペアチケットにした。",
    reaction: "素敵なホテルのアフタヌーンティーに行って、ついでに関西旅行もしたみたい。すごい満足そうで良かった。",
    url: "https://www.sowxp.co.jp/catalogs/1467",
    persona: ["vlogger", "お出かけ好き", "親", "旅行好き"],
    vibes: ["出かける口実をあげたかった", "体験を通じてネタも一緒に贈った", "ふたりで楽しんでほしかった"] },
];

// ── 実行 ──────────────────────────────────────────────────────
async function findUserByEmail(email) {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  return data.users.find((u) => u.email === email);
}

async function ensureUser({ name, email }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    console.log(`✓ 既存: ${name} (${existing.id})`);
    return existing.id;
  }
  const password = crypto.randomUUID() + crypto.randomUUID(); // ログイン不可相当
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error) throw error;
  console.log(`+ 作成: ${name} (${data.user.id})`);
  return data.user.id;
}

async function main() {
  console.log("── ダミーアカウント作成 ──");
  const idByKey = {};
  for (const u of SEED_USERS) {
    idByKey[u.key] = await ensureUser(u);
  }

  console.log("── 既存投稿の確認 ──");
  const { data: existingPosts, error: exErr } = await supabase.from("posts").select("item");
  if (exErr) throw exErr;
  const existingItems = new Set(existingPosts.map((p) => p.item));

  console.log("── 投稿投入 ──");
  let inserted = 0;
  for (const p of SEED_POSTS) {
    if (existingItems.has(p.item)) {
      console.log(`✓ スキップ（既存）: ${p.item}`);
      continue;
    }
    const { error } = await supabase.from("posts").insert({
      user_id: idByKey[p.user],
      item: p.item,
      relation: p.relation,
      scene: p.scene,
      price: p.price,
      about: p.about,
      reason: p.reason,
      reaction: p.reaction ?? null,
      persona: p.persona,
      vibes: p.vibes,
      url: p.url ?? null,
      created_at: p.created_at,
    });
    if (error) throw new Error(`${p.item}: ${error.message}`);
    console.log(`+ 投入: ${p.item}`);
    inserted++;
  }

  console.log("── テスト投稿の削除 ──");
  const { data: deleted, error: delErr } = await supabase
    .from("posts")
    .delete()
    .eq("item", "テスト")
    .select("id");
  if (delErr) throw delErr;
  console.log(deleted.length > 0 ? `- 削除: ${deleted.length}件` : "（テスト投稿なし）");

  console.log(`\n完了：${inserted}件投入。https://haidozo.vercel.app で確認してください`);
}

main().catch((e) => {
  console.error("失敗:", e.message ?? e);
  process.exit(1);
});
