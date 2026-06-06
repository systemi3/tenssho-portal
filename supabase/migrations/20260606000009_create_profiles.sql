-- ユーザープロフィール（auth.usersと1:1紐付け、ロール管理）
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  role       TEXT        NOT NULL CHECK (role IN ('admin_a', 'admin_b', 'admin_c', 'cleaner', 'chairman', 'resident')),
  room_no    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 自分自身のプロフィールは参照・更新可
CREATE POLICY "profiles_select_self" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- admin_a / admin_b は全件参照可
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin_a', 'admin_b')
  );

-- 新規登録はサービスロール（サーバーサイド）のみ許可
-- （フロントからの直接INSERT禁止）
