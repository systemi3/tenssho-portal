-- 既存掲示板テーブルをprofiles参照ベースに再構築
-- （既存RLSポリシーを先に削除してからDROP）

DROP POLICY IF EXISTS "board_threads_select"  ON board_threads;
DROP POLICY IF EXISTS "board_threads_insert"  ON board_threads;
DROP POLICY IF EXISTS "board_threads_admin"   ON board_threads;
DROP POLICY IF EXISTS "board_posts_select"    ON board_posts;
DROP POLICY IF EXISTS "board_posts_insert"    ON board_posts;
DROP POLICY IF EXISTS "board_categories_select" ON board_categories;

DROP TABLE IF EXISTS board_posts       CASCADE;
DROP TABLE IF EXISTS board_threads     CASCADE;
DROP TABLE IF EXISTS board_categories  CASCADE;

-- =====================
-- board_categories
-- =====================
CREATE TABLE public.board_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  order_no   INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.board_categories ENABLE ROW LEVEL SECURITY;

-- SELECT: 全ロール可
CREATE POLICY "board_categories_select" ON public.board_categories
  FOR SELECT TO authenticated
  USING (true);

-- INSERT: admin_a のみ
CREATE POLICY "board_categories_insert" ON public.board_categories
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin_a'
  );

-- UPDATE: admin_a のみ
CREATE POLICY "board_categories_update" ON public.board_categories
  FOR UPDATE TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin_a'
  );

-- DELETE: admin_a のみ
CREATE POLICY "board_categories_delete" ON public.board_categories
  FOR DELETE TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin_a'
  );

-- =====================
-- board_threads
-- =====================
CREATE TABLE public.board_threads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.board_categories(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_board_threads_category ON public.board_threads(category_id);
CREATE INDEX idx_board_threads_user     ON public.board_threads(user_id);
CREATE INDEX idx_board_threads_created  ON public.board_threads(created_at DESC);

ALTER TABLE public.board_threads ENABLE ROW LEVEL SECURITY;

-- SELECT: 全ロール可
CREATE POLICY "board_threads_select" ON public.board_threads
  FOR SELECT TO authenticated
  USING (true);

-- INSERT: 全ロール可（profilesに登録済みであること）
CREATE POLICY "board_threads_insert" ON public.board_threads
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
  );

-- DELETE: admin_a / admin_b は全件、それ以外は自分の投稿のみ
CREATE POLICY "board_threads_delete" ON public.board_threads
  FOR DELETE TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin_a', 'admin_b')
    OR user_id = auth.uid()
  );

-- =====================
-- board_replies
-- =====================
CREATE TABLE public.board_replies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  UUID REFERENCES public.board_threads(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_board_replies_thread ON public.board_replies(thread_id);
CREATE INDEX idx_board_replies_user   ON public.board_replies(user_id);

ALTER TABLE public.board_replies ENABLE ROW LEVEL SECURITY;

-- SELECT: 全ロール可
CREATE POLICY "board_replies_select" ON public.board_replies
  FOR SELECT TO authenticated
  USING (true);

-- INSERT: 全ロール可（profilesに登録済みであること）
CREATE POLICY "board_replies_insert" ON public.board_replies
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
  );

-- DELETE: admin_a / admin_b は全件、それ以外は自分の投稿のみ
CREATE POLICY "board_replies_delete" ON public.board_replies
  FOR DELETE TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin_a', 'admin_b')
    OR user_id = auth.uid()
  );

-- Realtime 購読対象に追加
ALTER PUBLICATION supabase_realtime ADD TABLE public.board_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.board_replies;

-- 初期カテゴリデータ
INSERT INTO public.board_categories (name, order_no) VALUES
  ('情報共有', 1),
  ('イベント', 2),
  ('設備要望', 3),
  ('相談', 4),
  ('その他', 5);
