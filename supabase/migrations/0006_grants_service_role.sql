-- haidozo 0006: service_role への GRANT（0004 の漏れ補完その2）
-- このプロジェクトでは public スキーマのデフォルト権限が効いておらず、
-- anon/authenticated（0004, 0005）に続き service_role も GRANT が必要だった。
-- （シードスクリプト実行時に 42501 permission denied for table posts が発生）

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- 今後作成するテーブルにも自動付与
alter default privileges in schema public grant all on tables to service_role;
