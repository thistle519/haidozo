-- haidozo 0007: notifications（通知）
-- いいねイベントの通知を保存。方針は 0002（anon キー + RLS、(select auth.uid()) 形式）に準拠。
-- GRANT は 0004 の流儀に合わせて同ファイル内に記述する。

-- ── notifications ──────────────────────────────────────────
create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id     uuid not null references public.profiles (id) on delete cascade,
  type         text not null check (type in ('like')),
  post_id      uuid references public.posts (id) on delete cascade,
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);

-- 受信者の新着順一覧用
create index notifications_recipient_idx
  on public.notifications (recipient_id, created_at desc);

-- ── RLS ────────────────────────────────────────────────────
alter table public.notifications enable row level security;

-- 閲覧は受信者本人のみ
create policy "notifications_select_own" on public.notifications
  for select using (recipient_id = (select auth.uid()));

-- 生成は actor 本人かつ自分宛でないもののみ
create policy "notifications_insert_own" on public.notifications
  for insert with check (
    actor_id = (select auth.uid())
    and recipient_id <> (select auth.uid())
  );

-- 更新（read の既読化を想定）は受信者本人のみ
create policy "notifications_update_own" on public.notifications
  for update using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

-- 削除は受信者本人のみ（いいね解除に伴う actor 側の削除は actor=recipient ではないため
-- API は service ではなく recipient 視点でないと消せない点に注意）
create policy "notifications_delete_own" on public.notifications
  for delete using (recipient_id = (select auth.uid()));

-- いいね解除時に actor 本人が自分の出した通知を消せるようにする
create policy "notifications_delete_actor" on public.notifications
  for delete using (actor_id = (select auth.uid()));

-- ── GRANT（0004 の流儀に準拠：RLS は基本 GRANT があって初めて評価される） ──
grant select, insert, update, delete on public.notifications to authenticated;
