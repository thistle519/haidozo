# haidozo リリース前チェックリスト

更新日: 2026-06-12（アーキテクチャレビューセッション）

## 1. Supabase セットアップ（手作業）

- [x] Supabase プロジェクト作成（haidozo-prod, Asia-Pacific）
- [x] SQL Editor で `supabase/migrations/0001_init.sql` → `0002_rls.sql` → `0003_storage.sql` を順に実行
- [x] Authentication > Providers > Email: 有効化（Confirm email ON）
- [ ] **Authentication > SMTP Settings: Resend 設定 ←リリース前必須。Supabase標準メールは送信レート制限が厳しく、原則プロジェクトのチームメンバー宛しか配信されないため、実ユーザーにサインアップ確認メールが届かない**
  - Host `smtp.resend.com` / Port `465` / User `resend` / Pass: Resend API キー
  - Sender: 認証済みドメインのアドレス
- [ ] Authentication > Email Templates: 日本語化（確認・リセット）
- [x] Authentication > URL Configuration: Site URL（https://haidozo.vercel.app）+ `/auth/callback` 登録済み
- [ ] Redirect URLs に `http://localhost:3000/auth/callback` を追加（ローカル開発でメールリンクが機能するために必要）
- [ ] Preview デプロイを使う場合は `https://*-<vercelチーム/プロジェクト>.vercel.app/auth/callback` 形式のワイルドカード追加を検討

## 2. 環境変数

- [ ] `.env.local` の ANON_KEY を埋める（URL は記入済みのファイルを作成済み。キーは Dashboard > Settings > API Keys の Publishable key）
- [x] Vercel 環境変数に同 2 つを設定（Production / Preview / Development）
- [ ] `SUPABASE_SERVICE_ROLE_KEY` はコード未使用。設定する場合も `NEXT_PUBLIC_` を付けない
- [ ] `.env*` が git 管理外（確認済み: .gitignore に `.env*` あり）

## 3. 機能 E2E（手動確認）

- [ ] サインアップ → 確認メール受信（Resend 経由） → リンク → ログイン状態で "/" 表示
- [ ] ログアウト状態で "/" → /auth/login へリダイレクト（proxy.ts）
- [ ] ログイン → フィード表示（DB から取得）
- [ ] 投稿作成 → フィード先頭に反映 → リロード後も残る
- [ ] いいね → カウント反映 → リロード後も保持（楽観更新の整合）
- [ ] 検索（キーワード・関係性・シーン・価格帯チップ）動作
- [ ] パスワードリセット: メール → /auth/update-password → 新パスワードでログイン
- [ ] ログイン済みで /auth/login に行くと "/" へリダイレクト

## 4. セキュリティ（コードレビュー済み項目含む）

- [x] RLS 全テーブル有効（0002_rls.sql）。posts 書込・削除は本人のみ
- [x] API は user_id を body から受けず `getUser()` から取得
- [x] DELETE /api/posts/:id 未認証 401・他人 404（API + RLS 二重防衛）
- [x] /auth/callback と login の `next` パラメータのオープンリダイレクト対策（`//` 拒否）— 監査で発見・修正済み
- [x] PostgREST `.or()` 構文注入対策（サニタイズ + 10 語制限）
- [x] service_role キー不使用・anon キー + RLS のみ
- [x] パスワードハッシュは Supabase Auth 管理（bcrypt 自前実装なし）
- [ ] 本番 URL で未認証 curl により API 401/404 を実地確認
- [ ] Supabase Dashboard > Advisors（Security/Performance）の警告ゼロ確認

## 5. 品質ゲート

- [x] `tsc --noEmit` エラーゼロ（strict）
- [x] `eslint src` エラーゼロ（warning 12 件: 未使用変数等、既存コード由来。リリースブロッカーではない）
- [ ] `npm run build` 成功（※サンドボックスではネイティブクラッシュのためローカル Mac で要実行）
- [ ] モバイル 375px 表示確認（feed / search / compose / auth 各画面）
- [ ] Lighthouse モバイル ≥ 80
- [ ] エラーメッセージ日本語表示確認（400/401/404/500）

## 6. デプロイ

- [ ] Vercel プロジェクト接続（root: `app/`）
- [ ] Preview デプロイで E2E（§3）を一巡
- [ ] 本番ドメインを Supabase の Redirect URLs に追加
- [ ] 本番デプロイ → スモークテスト

## 7. 既知の残課題（リリース後でよい）

- 画像アップロード UI（`uploadPostImage()` は実装済み、ComposerScreen に画像選択 UI が未実装）
- ProfileScreen の集計値（いいね数等）ハードコード → API 化
- 検索ログ insert が fire-and-forget（serverless 環境で稀に欠損し得る。統計用途なので許容）
- いいねトグルの同時実行で稀に 500（PK 重複）→ 23505 を liked 扱いにする改善余地
- テスト未整備（Jest + RTL の最小セット: API ルート・認証フローは次スプリント）
- Embedding 検索はフェーズ2（`lib/embeddings.ts` スケルトン・`searches` ログ蓄積中）
