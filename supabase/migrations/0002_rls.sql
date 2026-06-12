-- haidozo 0002: Row Level Security
-- 方針: anon キー + RLS が認可の最終防衛線。service_role は原則不使用。

alter table public.profiles   enable row level security;
alter table public.posts      enable row level security;
alter table public.post_likes enable row level security;
alter table public.searches   enable row level security;

-- ── profiles: 全員読取 / 本人のみ更新（INSERT はトリガー経由） ──
create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_insert_own" on public.profiles
  for insert with check (id = (select auth.uid()));

create policy "profiles_update_own" on public.profiles
  for update using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- DELETE ポリシーなし = 削除不可（アカウント削除は auth.users cascade で対応）

-- ── posts: 公開フィード / 書込は本人のみ ──
create policy "posts_select_all" on public.posts
  for select using (true);

create policy "posts_insert_own" on public.posts
  for insert with check (user_id = (select auth.uid()));

create policy "posts_update_own" on public.posts
  for update using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "posts_delete_own" on public.posts
  for delete using (user_id = (select auth.uid()));

-- ── post_likes: 読取全員 / 付与・解除は本人のみ ──
create policy "likes_select_all" on public.post_likes
  for select using (true);

create policy "likes_insert_own" on public.post_likes
  for insert with check (user_id = (select auth.uid()));

create policy "likes_delete_own" on public.post_likes
  for delete using (user_id = (select auth.uid()));

-- ── searches: 本人のみ（プライバシー：検索履歴は非公開） ──
create policy "searches_select_own" on public.searches
  for select using (user_id = (select auth.uid()));

create policy "searches_insert_own" on public.searches
  for insert with check (user_id = (select auth.uid()));

create policy "searches_delete_own" on public.searches
  for delete using (user_id = (select auth.uid()));
