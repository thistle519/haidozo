-- 0009: relation / scene / price の CHECK 制約を拡張
-- relation: + 'その他'
-- scene:    + '労い'
-- price:    + '〜5万円', '〜10万円'

ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_relation_check;
ALTER TABLE posts ADD CONSTRAINT posts_relation_check
  CHECK (relation IN ('恋人','友達','家族','上司','同僚','先生・恩師','その他'));

ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_scene_check;
ALTER TABLE posts ADD CONSTRAINT posts_scene_check
  CHECK (scene IN ('誕生日','記念日','お礼','送別','手土産','なんでもない日','応援','結婚祝い','労い'));

ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_price_check;
ALTER TABLE posts ADD CONSTRAINT posts_price_check
  CHECK (price IN ('〜3,000円','〜5,000円','〜10,000円','〜5万円','〜10万円','それ以上'));
