-- profiles_select_admin ポリシーは self-referential（profiles の中から profiles を参照）
-- のため無限再帰が発生し500エラーとなる。削除して安全な構成に修正する。
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

-- profiles_select_self のみで全ロールのログインは機能する。
-- 管理者が他ユーザーのプロフィールを参照する機能が必要になった場合は、
-- security definer 関数を用いて安全に実装すること。
