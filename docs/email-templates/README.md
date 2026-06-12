# 認証メールテンプレート

ブランドデザイン（ベージュ背景・テラコッタCTA・Noto Sans JP系）準拠の認証メール。
メールクライアント互換性のため table レイアウト + inline style で記述。

## 設定手順（Supabase Dashboard）

Authentication → Email Templates で各テンプレートを開き、Subject と Body(HTML) を差し替える。

| テンプレート | 件名（Subject） | Body |
|---|---|---|
| Confirm signup | `【haidozo】メールアドレスの確認` | `confirm-signup.html` の中身を貼り付け |
| Reset password | `【haidozo】パスワード再設定のご案内` | `reset-password.html` の中身を貼り付け |

## 注意

- `{{ .ConfirmationURL }}` は Supabase の変数。消さないこと。
- 変更後は保存 → 自分宛に再度サインアップ/リセットを行い、実機（スマホのメールアプリ含む）で表示確認する。
- Gmail はサポート外CSSが多いため、レイアウト崩れを見つけたらこのテンプレートを修正（外部CSS・flexbox・position は使わない）。
- 送信元名は Resend/SMTP 設定の Sender Name で「haidozo」にする。
