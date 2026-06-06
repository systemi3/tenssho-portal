CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('all', 'specific')),
  target_user UUID REFERENCES public.profiles(id),
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 閲覧：全体配信は全員、特定配信は対象ユーザーと管理者のみ
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT USING (
    target_type = 'all'
    OR target_user = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid())
       IN ('admin_a', 'admin_b', 'chairman')
  );

-- INSERT：admin_a / admin_b / admin_c / cleaner / chairman のみ
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid())
    IN ('admin_a', 'admin_b', 'admin_c', 'cleaner', 'chairman')
  );
