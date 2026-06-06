-- 掲示板RLS：入居者は自ビルのスレッドのみ読み書き可
CREATE POLICY "board_threads_select" ON board_threads FOR SELECT TO authenticated
  USING (building_id IN (SELECT building_id FROM tenants WHERE id = auth.uid()));
CREATE POLICY "board_threads_insert" ON board_threads FOR INSERT TO authenticated
  WITH CHECK (building_id IN (SELECT building_id FROM tenants WHERE id = auth.uid()) AND created_by = auth.uid());
CREATE POLICY "board_threads_admin" ON board_threads FOR UPDATE TO authenticated
  USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "board_posts_select" ON board_posts FOR SELECT TO authenticated
  USING (thread_id IN (SELECT id FROM board_threads WHERE building_id IN (SELECT building_id FROM tenants WHERE id = auth.uid())));
CREATE POLICY "board_posts_insert" ON board_posts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND thread_id IN (SELECT id FROM board_threads WHERE building_id IN (SELECT building_id FROM tenants WHERE id = auth.uid())));
CREATE POLICY "board_categories_select" ON board_categories FOR SELECT TO authenticated USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE board_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE board_posts;
