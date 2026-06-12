-- haidozo 0001: 基本スキーマ
-- profiles / posts / post_likes / searches + サインアップ時 profiles 自動作成トリガー

create extension if not exists pg_trgm;

-- ── profiles（auth.users と 1:1） ──────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default '' check (char_length(name) <= 50),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── posts（src/types/index.ts の Post 型と一致させること） ──
create table public.posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  item       text not null check (char_length(item) between 1 and 100),
  relation   text not null check (relation in ('恋人','友達','家族','上司','同僚','先生・恩師')),
  scene      text not null check (scene in ('誕生日','記念日','お礼','送別','手土産','なんでもない日','応援','結婚祝い')),
  price      text not null check (price in ('〜3,000円','〜5,000円','〜10,000円','それ以上')),
  about      text not null default '' check (char_length(about) <= 500),
  reason     text not null check (char_length(reason) between 1 and 1000),
  reaction   text check (char_length(reaction) <= 1000),
  persona    text[] not null default '{}',
  vibes      text[] not null default '{}',
  image_url  text,
  url        text,
  created_at timestamptz not null default now()
);

-- タグ・絞り込み用
create index posts_relation_idx   on public.posts (relation);
create index posts_scene_idx      on public.posts (scene);
create index posts_price_idx      on public.posts (price);
create index posts_created_at_idx on public.posts (created_at desc);
-- 日本語部分一致（tsvector は日本語の分かち書き不可のため pg_trgm を採用）
create index posts_text_trgm_idx  on public.posts
  using gin ((item || ' ' || about || ' ' || reason || ' ' || coalesce(reaction, '')) gin_trgm_ops);
-- タグ配列検索
create index posts_persona_idx on public.posts using gin (persona);
create index posts_vibes_idx   on public.posts using gin (vibes);

-- ── post_likes ─────────────────────────────────────────────
create table public.post_likes (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ── searches（検索ログ：フェーズ2 Embedding の素材） ────────
create table public.searches (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete set null,
  query      text not null check (char_length(query) <= 200),
  created_at timestamptz not null default now()
);

create index searches_user_idx on public.searches (user_id, created_at desc);
