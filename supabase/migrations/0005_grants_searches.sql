-- haidozo 0005: searches テーブルへの GRANT（0004 の漏れ補完）
-- 0004 で searches が漏れており、検索ログ INSERT が 42501 (permission denied) で
-- 静かに失敗し続ける状態だったため付与。
-- （API は fire-and-forget で console.error のみのため表面化しにくい）

grant select, insert, delete on public.searches to authenticated;
