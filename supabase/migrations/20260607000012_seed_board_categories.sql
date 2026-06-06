-- 既存カテゴリを削除して仕様通りの3カテゴリに再投入
DELETE FROM public.board_categories;

INSERT INTO public.board_categories (name, order_no) VALUES
  ('設備等', 1),
  ('入居者同士の交流', 2),
  ('その他', 3);
