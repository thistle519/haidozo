import type { Post, Notification } from "@/types";

export const FEED_DATA: Post[] = [
  { id: 9, user: "shizuru", initial: "S", item: "ブルーボトルコーヒー インスタントコーヒーセット（ブライト・エスプレッソ）", relation: "先生・恩師", scene: "誕生日", price: "〜3,000円", note: "出張先の部屋にコーヒーメーカーがあって、朝コーヒー飲めるのが嬉しいってSNSに書いてたのを覚えてた。それが頭にあったので即決できた", likes: 0, date: "4月", url: "https://store.bluebottlecoffee.jp/products/s346", episode: "たまたまお誕生日当日にお会いするタイミングがあって、急いで選んだ。出張先の部屋にコーヒーメーカーがあって朝コーヒー飲めるのが嬉しいってSNSに書いてたのを覚えてて、それで旅先に持っていけるインスタントにしようとすぐ決まった。かさばらないし、ブルーボトルなら間違いないと思って。" },
  { id: 10, user: "shizuru", initial: "S", item: "メゾン マルジェラ「レプリカ」フレグランス ディスカバリーコレクション", relation: "友達", scene: "誕生日", price: "〜5,000円", note: "仕事で辛くなった時に気持ちを切り替えるために香水を使うって、昔一緒に香水屋さんに寄った時に話してくれたのを覚えてた。いつもハードワークな子だから、そんな時に使ってねって気持ちで", likes: 0, date: "3月", url: "https://mall.line.me/sb/maisonmargiela/7723390", episode: "普段からずっとつけるわけじゃないけど、スイッチを切り替えるために香りを使うって言ってたのがずっと頭に残ってた。ディスカバリーセットなら色んな香りを試せるから、気分によって使い分けられると思って選んだ。" },
  { id: 11, user: "shizuru", initial: "S", item: "「立町カヌレ」カヌレギフトセット（15個入り）", relation: "友達", scene: "なんでもない日", price: "〜5,000円", note: "カヌレが大好きって聞いてたから、お腹いっぱい食べてほしくててんこ盛りの詰め合わせにした。前にうちに来てくれた時、私の大好きなピエールエルメをたくさん買ってきてくれたのが嬉しかったので、同じことを私からも返したかった", likes: 0, date: "4月", url: "https://www.castagna.co.jp/pasticceria/cannelegiftset/", episode: "同棲してる子のおうちへの手土産。同棲相手もいるから基本シェアになるけど、その子自身のためのものにしたかった。カヌレ好きって知ってたし、てんこ盛りで渡したら絶対喜ぶと思って。ピエールエルメの時の嬉しさを返せた気がした。" },
  { id: 13, user: "shizuru", initial: "S", item: "TAKIBI BAKERY クリスマスシュトーレン ＋ 旅する紅茶 ＋ 小花束", relation: "先生・恩師", scene: "送別", price: "〜5,000円", note: "コーヒー屋さんだからこそ、あえて紅茶を。クリスマスの時期にもうすぐ結婚されると聞いていたので、大切な人と食べるシュトーレンを選んだ。お花はありがとうの気持ちで小さめのものを添えた", likes: 0, date: "12月", url: "https://csonline.cifaka.jp/?pid=64257741", episode: "お世話になった方の餞別。コーヒーのプロだから、逆に普段選ばない紅茶を贈りたかった。シュトーレンはクリスマスの時期だったのと、ご結婚が近いと聞いていたので、パートナーと一緒に食べてほしくて。お花は主役じゃなくていい、ただありがとうを伝える1本として。" },
  { id: 12, user: "shizuru", initial: "S", item: "TEAPOND ポーチ入り ティータイムセット", relation: "友達", scene: "送別", price: "〜3,000円", note: "紅茶屋さんでバイトするくらい紅茶好きな子。家の近くにteapondがあってよく一緒に来てたから、この子に贈るならここしかないと思った。引越し後はまだ落ち着かないだろうから、ティーバッグで手軽に飲めるのも考えた", likes: 0, date: "4月", url: "https://teapond.jp/collections/gift/products/tts0003", episode: "ポーチ付きなのでグッズとしても使えるのも決め手。遊びに来るたびに一緒に行ってたお店のものを贈れるのが、思い出としても残る気がして。新居で紅茶を飲む時にふと思い出してくれたらいいな。" },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 1, type: "like", user: "haru_present", initial: "H", text: "あなたの投稿にいいねしました", sub: "ジョーマローン ピオニー & ブラッシュ コロン", time: "3分前", unread: true },
  { id: 2, type: "like", user: "nana_memo", initial: "N", text: "あなたの投稿にいいねしました", sub: "ほぼ日手帳 weeks + カバー", time: "1時間前", unread: true },
  { id: 3, type: "follow", user: "aoi_gift", initial: "A", text: "フォローしました", time: "昨日", unread: false },
  { id: 4, type: "like", user: "kei_note", initial: "K", text: "あなたの投稿にいいねしました", sub: "ジョーマローン ピオニー & ブラッシュ コロン", time: "昨日", unread: false },
  { id: 5, type: "like", user: "tomo_rec", initial: "T", text: "あなたの投稿にいいねしました", sub: "無印良品 アロマストーン セット", time: "3日前", unread: false },
];
