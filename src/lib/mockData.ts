import type { Post, Notification } from "@/types";

export const FEED_DATA: Post[] = [
  { id: 1, user: "miku_gifts", initial: "M", item: "ジョーマローン ピオニー & ブラッシュ コロン", relation: "友達", scene: "誕生日", price: "〜5,000円", note: "去年からずっと欲しいって言ってたやつ。ラッピングも可愛くてよかった", likes: 23, date: "4月", url: "https://example.com", episode: "大学の友達で、毎年誕生日にプレゼント交換してる。今年は絶対これだと思ってた。" },
  { id: 2, user: "haru_present", initial: "H", item: "ル・クルーゼ ミニ ピコ・オーブン", relation: "恋人", scene: "記念日", price: "〜10,000円", note: "一緒に料理したいねって話してたから。色はシグネチャー・ブルー", likes: 41, date: "3月", episode: "付き合って2年の記念日。二人で料理できるものがよかった。" },
  { id: 3, user: "sato_gift", initial: "S", item: "ほぼ日手帳 weeks + カバー", relation: "同僚", scene: "送別", price: "〜3,000円", note: "異動する同僚へ。毎日持ち歩いてくれたら嬉しいな", likes: 18, date: "3月" },
  { id: 4, user: "yuki_san", initial: "Y", item: "無印良品 アロマストーン セット", relation: "家族", scene: "なんでもない日", price: "〜3,000円", note: "母の日とかじゃないけど、ちょっとした気持ちで。気に入ってくれた", likes: 9, date: "4月" },
  { id: 5, user: "nana_memo", initial: "N", item: "クレ・ド・ポー ボーテ ルージュ", relation: "友達", scene: "お礼", price: "〜5,000円", note: "引っ越しのときにめちゃくちゃ助けてくれたので。憧れのブランドだって言ってた", likes: 34, date: "2月", url: "https://example.com", episode: "荷物搬入から整理まで半日つき合ってもらった。絶対喜ぶと思った。" },
  { id: 6, user: "tomo_rec", initial: "T", item: "スターバックス カード（チャージ済み）", relation: "上司", scene: "お礼", price: "〜3,000円", note: "いつもお世話になっています。難しい案件を一緒に乗り越えた感謝を込めて", likes: 7, date: "4月" },
  { id: 7, user: "aoi_gift", initial: "A", item: "ミナ ペルホネン ハンカチーフ", relation: "家族", scene: "誕生日", price: "〜5,000円", note: "姉の誕生日。シンプルで上品なものが好きな人なので迷わず選べた", likes: 15, date: "1月", url: "https://example.com", episode: "毎年何を贈るか悩むけど、今年は即決できた。大事に使ってほしい。" },
  { id: 8, user: "kei_note", initial: "K", item: "ネスプレッソ ヴァーチュオ スターターセット", relation: "恋人", scene: "なんでもない日", price: "それ以上", note: "家でゆっくりカフェ気分になれるように。休日の朝が変わった", likes: 52, date: "12月", episode: "コーヒー好きな彼女へのサプライズ。顔が輝いてたのが最高だった。" },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 1, type: "like", user: "haru_present", initial: "H", text: "あなたの投稿にいいねしました", sub: "ジョーマローン ピオニー & ブラッシュ コロン", time: "3分前", unread: true },
  { id: 2, type: "like", user: "nana_memo", initial: "N", text: "あなたの投稿にいいねしました", sub: "ほぼ日手帳 weeks + カバー", time: "1時間前", unread: true },
  { id: 3, type: "follow", user: "aoi_gift", initial: "A", text: "フォローしました", time: "昨日", unread: false },
  { id: 4, type: "like", user: "kei_note", initial: "K", text: "あなたの投稿にいいねしました", sub: "ジョーマローン ピオニー & ブラッシュ コロン", time: "昨日", unread: false },
  { id: 5, type: "like", user: "tomo_rec", initial: "T", text: "あなたの投稿にいいねしました", sub: "無印良品 アロマストーン セット", time: "3日前", unread: false },
];
