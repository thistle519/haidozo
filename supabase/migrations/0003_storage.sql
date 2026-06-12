-- haidozo 0003: Storage（投稿画像）
-- バケット: gift-images（公開読取 / アップロードは認証済ユーザーの自フォルダのみ）

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gift-images',
  'gift-images',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- 公開読取（フィード表示用）
create policy "gift_images_public_read" on storage.objects
  for select using (bucket_id = 'gift-images');

-- アップロード: 認証済 かつ パスの先頭フォルダ = 自分の uid（{uid}/xxx.webp）
create policy "gift_images_insert_own_folder" on storage.objects
  for insert with check (
    bucket_id = 'gift-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- 削除: 自フォルダのみ
create policy "gift_images_delete_own_folder" on storage.objects
  for delete using (
    bucket_id = 'gift-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- UPDATE ポリシーなし = 上書き不可（再アップロードは新規ファイル名で）
