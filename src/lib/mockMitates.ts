import type { Mitate, Post, Relation, Scene } from "@/types";
import { expandQuery, postFullText } from "@/lib/searchUtils";

type MitateTemplate = Omit<Mitate, "fragment"> & {
  fallbackFragment: string;
  keywords: string[];
  suggestions: string[];
};

const MITATE_TEMPLATES: MitateTemplate[] = [
  {
    id: "switch-scent",
    fallbackFragment: "頭の切り替えが効かない",
    axis: "自分に戻るスイッチ",
    category: "香りのもの",
    reason:
      "忙しい日ほど、気持ちを切り替える小さな合図があるとうれしい。香りなら、場所を変えなくても「ここから自分の時間」と思えるから。",
    relatedPostIds: ["10", "20", "21"],
    branches: [
      { axis: "朝の数分を整える", category: "コーヒーまわり", oneLine: "朝のはじまりを、少しだけ自分のペースにする" },
      { axis: "夜にスイッチを切る", category: "入浴剤", oneLine: "帰ってから頭をゆるめる方向で考える" },
      { axis: "一日をほどく合図", category: "眠る前のもの", oneLine: "寝る前の数分に、ほっとする余白をつくる" },
    ],
    keywords: ["香り", "香水", "フレグランス", "切り替え", "仕事", "忙しい", "ハードワーク", "おしゃれ"],
    suggestions: ["Aesop ヒュイル オードパルファム", "Jo Malone ウッドセージ＆シーソルト", "SHIRO サボン ルームフレグランス"],
  },
  {
    id: "first-good-clothes",
    fallbackFragment: "服は好きだけど、高いものはまだ踏み出せない",
    axis: "毎日を少しだけ誇らしくする",
    category: "長く着られる服",
    reason:
      "よく着るものほど、贈る側が勝手に選ぶのは少しむずかしい。でも、その人が気になっていた入口を一緒に開く感じなら、着るたびに少しうれしくなれる。",
    relatedPostIds: ["17", "15"],
    branches: [
      { axis: "小さく試せる入口", category: "ファッション小物", oneLine: "服より軽く、でもその人らしさは出せる" },
      { axis: "一緒に選ぶ時間", category: "買い物に行く日", oneLine: "モノより選ぶ時間ごとプレゼントする" },
      { axis: "手入れまで贈る", category: "ケア用品", oneLine: "大事に使う前提で、長く付き合えるものにする" },
    ],
    keywords: ["恋人", "誕生日", "服", "ファッション", "ドメブラ", "ブランド", "ニット", "社会人", "こだわり", "おしゃれ"],
    suggestions: ["YAECA コンフォートシャツ", "Hender Scheme エスキメーションレザーベルト", "THE NORTH FACE PURPLE LABEL ニットキャップ"],
  },
  {
    id: "share-a-date",
    fallbackFragment: "一緒にいる時間がいちばんうれしそう",
    axis: "会う理由をひとつ増やす",
    category: "一緒に出かけるプレゼント",
    reason:
      "恋人へのプレゼントは、渡したあとにも楽しみが続くと強い。チケットや体験なら「これ一緒に行こう」と言えて、少し先の約束まで贈れる。",
    relatedPostIds: ["18", "23", "25"],
    branches: [
      { axis: "映画館で少し離れる", category: "映画のギフト", oneLine: "スマホから離れて、同じ時間を過ごせる" },
      { axis: "日常の中の寄り道", category: "カフェチケット", oneLine: "大げさじゃない外出のきっかけにする" },
      { axis: "特別な日を作る", category: "体験ギフト", oneLine: "記念日に残る時間として考える" },
    ],
    keywords: ["恋人", "記念日", "誕生日", "一緒", "ふたり", "二人", "映画", "音楽", "ライブ", "旅行", "お出かけ", "デート", "体験"],
    suggestions: ["SOW EXPERIENCE 体験ギフト for 2", "TOHOシネマズ ギフトカード", "Afternoon Tea ペアティーセット"],
  },
  {
    id: "hair-care",
    fallbackFragment: "ものを大切に、長く使う人",
    axis: "毎日の中でちゃんと思い出す",
    category: "髪や身だしなみのもの",
    reason:
      "毎日使うものは、派手じゃなくてもじわっと残る。相手が長く使う人なら、少しいい道具を選ぶだけで「ちゃんと見てた」が自然に伝わる。",
    relatedPostIds: ["15", "16"],
    branches: [
      { axis: "朝の支度を整える", category: "ヘアブラシ", oneLine: "毎日手に取るものを少し良くする" },
      { axis: "似合う色を贈る", category: "リップや色もの", oneLine: "その人の印象まで見て選ぶ" },
      { axis: "香りまで整える", category: "フレグランス", oneLine: "近づいたときに少しうれしいものにする" },
    ],
    keywords: ["恋人", "記念日", "誕生日", "髪", "ヘア", "美容", "メイク", "ブラシ", "リップ", "長く使う", "丁寧", "身だしなみ"],
    suggestions: ["MASON PEARSON ポケットブリッスル", "NARS リップスティック", "MARKS&WEB ハーバルバスソルト"],
  },
  {
    id: "private-culture",
    fallbackFragment: "好きな作品の話をしている時間が楽しそう",
    axis: "その人の世界をもう少し広げる",
    category: "映画・本・音楽まわり",
    reason:
      "好きなものを真正面から当てにいくより、楽しむ時間を増やすほうが外しにくい。作品そのものではなく、観に行く・聴く・読む時間を贈れる。",
    relatedPostIds: ["18", "19", "20", "21"],
    branches: [
      { axis: "一緒に観る口実", category: "映画ギフト", oneLine: "あとで感想を話せる時間まで含める" },
      { axis: "選ぶ楽しみを残す", category: "図書カード", oneLine: "本人が選ぶ喜びを邪魔しない" },
      { axis: "気分を作る", category: "香りのもの", oneLine: "作品の余韻みたいに使える" },
    ],
    keywords: ["恋人", "映画", "本", "読書", "音楽", "ライブ", "サカナクション", "カルチャー", "作品", "推し", "感性"],
    suggestions: ["紀伊國屋書店 ギフトカード", "Spotify Premium ギフト 3ヶ月", "BALMUDA The Speaker"],
  },
  {
    id: "morning-coffee",
    fallbackFragment: "朝を少し整えたい",
    axis: "朝の数分を整える",
    category: "コーヒーまわり",
    reason:
      "朝の一杯があると、忙しい日でも少しだけ自分のペースを取り戻せる。道具や豆そのものより、「今日も始められそう」と思える時間を渡せる。",
    relatedPostIds: ["9", "13", "22"],
    branches: [
      { axis: "自分に戻るスイッチ", category: "香りのもの", oneLine: "気分を切り替える合図として考える" },
      { axis: "家の中に好きな場所を作る", category: "部屋で使うもの", oneLine: "家で過ごす時間を少し楽しくする" },
      { axis: "会う理由をひとつ増やす", category: "一緒に過ごす口実になるもの", oneLine: "一緒に飲む時間まで贈る" },
    ],
    keywords: ["コーヒー", "カフェ", "朝", "出張", "旅", "仕事", "応援", "落ち込んでいる"],
    suggestions: ["KINTO トラベルタンブラー", "丸山珈琲 シングルオリジンセット", "Kalita ウェーブドリッパー"],
  },
  {
    id: "night-bath",
    fallbackFragment: "帰ってからも頭が休まらない",
    axis: "夜にスイッチを切る",
    category: "入浴剤",
    reason:
      "がんばった日を、いきなり終わりにするのは難しいから。お風呂に入れるだけの小さな儀式なら、疲れている日でも受け取りやすい。",
    relatedPostIds: ["10", "12", "21"],
    branches: [
      { axis: "一日をほどく合図", category: "眠る前のもの", oneLine: "寝る前の習慣として軽く渡す" },
      { axis: "自分に戻るスイッチ", category: "香りのもの", oneLine: "好きな香りで気分を切り替える" },
      { axis: "家の中に好きな場所を作る", category: "部屋で使うもの", oneLine: "部屋で落ち着けるきっかけにする" },
    ],
    keywords: ["入浴", "お風呂", "夜", "休む", "疲れ", "忙しい", "リラックス", "ゆっくり"],
    suggestions: ["CLAYD ウィークブック", "BARTH 中性重炭酸入浴剤", "OSAJI バスオイル"],
  },
  {
    id: "home-reset",
    fallbackFragment: "家で過ごす時間を大事にしている",
    axis: "家の中に好きな場所を作る",
    category: "部屋で使うもの",
    reason:
      "外でがんばる時間が長い人ほど、帰ってきた場所が少し整っているだけでほっとする。毎日目に入るものなら、無理なく気持ちを支えてくれる。",
    relatedPostIds: ["15", "21", "24"],
    branches: [
      { axis: "一日をほどく合図", category: "眠る前のもの", oneLine: "一日の終わりに使えるものへ寄せる" },
      { axis: "朝の数分を整える", category: "コーヒーまわり", oneLine: "家で始まる小さな楽しみにする" },
      { axis: "夜にスイッチを切る", category: "入浴剤", oneLine: "疲れた日にすぐ使えるものにする" },
    ],
    keywords: ["部屋", "家", "おうち", "インドア", "丁寧", "料理", "食器", "暮らし", "一人"],
    suggestions: ["HAY キャンドルホルダー", "P.F.Candle Co. アンバー＆モス", "1616 / arita japan ラウンドプレート"],
  },
  {
    id: "before-sleep",
    fallbackFragment: "ひとりの時間を大事にしている",
    axis: "一日をほどく合図",
    category: "眠る前のもの",
    reason:
      "寝る前の数分は、誰にも見せなくていい自分に戻れる時間。重いケアではなく、枕元で使える小さなものなら続きやすい。",
    relatedPostIds: ["12", "19", "21"],
    branches: [
      { axis: "夜にスイッチを切る", category: "入浴剤", oneLine: "眠る前に体からゆるめる" },
      { axis: "家の中に好きな場所を作る", category: "部屋で使うもの", oneLine: "部屋で過ごす時間全体を整える" },
      { axis: "自分に戻るスイッチ", category: "香りのもの", oneLine: "香りで気持ちをほどく" },
    ],
    keywords: ["眠る", "寝る", "夜", "本", "読書", "ひとり", "一人", "短歌", "紅茶", "落ち着く"],
    suggestions: ["KLIPPAN コットンブランケット", "TWG ティーバッグセット", "無印良品 おやすみブレンド エッセンシャルオイル"],
  },
  {
    id: "shared-excuse",
    fallbackFragment: "一緒に過ごす時間がうれしそう",
    axis: "会う理由をひとつ増やす",
    category: "一緒に過ごす口実になるもの",
    reason:
      "モノだけを渡すより、「これ一緒に使おう」と言える余地があると、贈ったあとにも楽しみが続く。少し先の約束まで一緒に贈れる。",
    relatedPostIds: ["14", "18", "23", "25"],
    branches: [
      { axis: "朝の数分を整える", category: "コーヒーまわり", oneLine: "一緒に飲む時間として考える" },
      { axis: "家の中に好きな場所を作る", category: "部屋で使うもの", oneLine: "家で一緒に使えるものにする" },
      { axis: "一日をほどく合図", category: "眠る前のもの", oneLine: "一人の時間も大事にできる方向へずらす" },
    ],
    keywords: ["一緒", "ふたり", "二人", "体験", "映画", "旅行", "お出かけ", "会う", "友達", "家族"],
    suggestions: ["アソビュー 体験ギフト", "Starbucks ペアマグセット", "SOW EXPERIENCE レストランギフト"],
  },
];

export function pickMitateFragment(memo: string, loves: string[], vibes: string[]): string {
  const note = memo.trim().replace(/\s+/g, " ");
  const quoted = note.match(/[「『“"](.{2,44}?)[」』”"]/);
  if (quoted?.[1]) return quoted[1];
  if (note) return note.length > 44 ? `${note.slice(0, 44)}...` : note;
  if (vibes[0]) return vibes[0];
  if (loves[0]) return `${loves[0]}が好き`;
  return "その人のことを考えている時間";
}

export function buildMockMitates(fragment: string, query: string): Mitate[] {
  const expanded = expandQuery(query).map((term) => term.toLowerCase());
  const scored = MITATE_TEMPLATES.map((template, index) => {
    const haystack = [
      template.axis,
      template.category,
      template.reason,
      template.fallbackFragment,
      ...template.keywords,
      ...(template.branches ?? []).flatMap((branch) => [branch.axis, branch.category, branch.oneLine]),
    ].join(" ").toLowerCase();

    const score = expanded.reduce((total, term) => total + (haystack.includes(term) || term.includes(template.category) ? 1 : 0), 0);
    return { template, score, index };
  });

  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ template }) => ({
      id: template.id,
      fragment: fragment || template.fallbackFragment,
      axis: template.axis,
      category: template.category,
      reason: template.reason,
      relatedPostIds: template.relatedPostIds,
      branches: template.branches,
      suggestions: template.suggestions,
    }));
}

export function findMitateIndexByBranch(mitates: Mitate[], branch: { axis: string; category: string }): number {
  return mitates.findIndex((mitate) => mitate.axis === branch.axis || mitate.category === branch.category);
}

export function getRelatedPostsForMitate(
  mitate: Mitate,
  posts: Post[],
  relation: Relation | null,
  scene: Scene | null,
  limit = 4
): Post[] {
  const byId = mitate.relatedPostIds
    .map((id) => posts.find((post) => post.id === id))
    .filter((post): post is Post => Boolean(post));

  if (byId.length >= Math.min(limit, 2)) return byId.slice(0, limit);

  const terms = expandQuery([mitate.category, mitate.axis, mitate.reason, mitate.fragment].join("、"));
  const fallback = posts
    .filter((post) => !byId.some((item) => item.id === post.id))
    .map((post) => {
      let score = 0;
      if (relation && post.relation === relation) score += 2;
      if (scene && post.scene === scene) score += 1;
      const text = postFullText(post);
      for (const term of terms) {
        if (text.includes(term)) score += 2;
      }
      return { post, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post);

  return [...byId, ...fallback].slice(0, limit);
}
