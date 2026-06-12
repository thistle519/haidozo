-- haidozo 0004: anon / authenticated への基本権限付与
-- RLSポリシー（0002）はテーブルへの基本GRANTがあって初めて評価される。
-- 0002はRLSのみでGRANTが無く、anon/authenticatedからの全アクセスが
-- "permission denied for table posts" (42501) になっていたため追加。

grant usage on schema public to anon, authenticated;

-- 全員に公開（*_select_all ポリシーに対応）
grant select on public.profiles, public.posts, public.post_likes to anon, authenticated;

-- ログインユーザーの書き込み（*_insert_own / *_update_own / *_delete_own ポリシーに対応）
grant update on public.profiles to authenticated;
grant insert, update, delete on public.posts to authenticated;
grant insert, delete on public.post_likes to authenticated;

-- searches: 本人のみ（anonはアクセス不要）
grant select, insert, delete on public.searches to authenticated;
