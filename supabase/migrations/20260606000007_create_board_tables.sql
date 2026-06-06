-- コミュニティ掲示板（スレッド型）
CREATE TABLE IF NOT EXISTS board_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS board_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES board_categories(id),
  created_by UUID NOT NULL REFERENCES tenants(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS board_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES board_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES tenants(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_board_threads_building ON board_threads(building_id);
CREATE INDEX idx_board_threads_category ON board_threads(category_id);
CREATE INDEX idx_board_threads_updated ON board_threads(updated_at DESC);
CREATE INDEX idx_board_posts_thread ON board_posts(thread_id);
ALTER TABLE board_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;
INSERT INTO board_categories (building_id, name, sort_order) VALUES
  (NULL, '情報共有', 1), (NULL, 'イベント', 2), (NULL, '設備要望', 3),
  (NULL, '相談', 4), (NULL, 'その他', 5);
