@AGENTS.md

# 天翔ポータル — プロジェクトガイド

## プロジェクト概要
天翔ビルディングのビル状態管理ポータル。
社員・入居者がビル設備・清掃・インシデント・入退館をリアルタイム共有し、
AIが次の事象を予測・アドバイスするシステム。

## 技術スタック
- フロントエンド: Next.js + TypeScript → Vercel（このリポジトリ）
- データベース: Supabase（PostgreSQL）
- バックエンド: Python + FastAPI → Render（別途作成予定）
- AI: Anthropic API（claude-sonnet-4-20250514）
- 認証: Supabase Auth

## 開発フェーズ（現在地を随時更新）
- Phase 1: 状態共有ポータル（DB + 画面）← 現在ここから開始
- Phase 2: 履歴管理
- Phase 3: LLM予測エージェント（FastAPI + Anthropic API）

---

## 実装前に必ずすること
1. **どのファイルをどう変更するか、コードを書く前に日本語で説明する**
2. Supabaseのスキーマ変更は必ずマイグレーションファイルを作成してから反映する
3. 新しいAPIルートは型・レスポンス形式を先に確認する

---

## コーディング規則

### TypeScript全般
- 型を必ず付ける。`any` 禁止
- インデント: スペース2つ
- コンポーネントは1ファイル1責務。100行を超えたら分割を検討する

### Next.js固有
- サーバーコンポーネントとクライアントコンポーネントを明確に分ける
- Supabaseクライアントはサーバーコンポーネントで `createServerClient` を使う
- 環境変数は `.env.local` に置く。コード直書き禁止
- `NEXT_PUBLIC_` プレフィックスのない変数はサーバー側のみで使う

### Python（FastAPIを開始する時）
- インデント: スペース4つ
- 型ヒント（Type Hints）を必ず付ける
- 環境変数は `.env` から `python-dotenv` で読み込む

---

## Supabaseルール
- 新しいテーブルを作るときはRow Level Security（RLS）を必ず有効にし、ポリシーも同時に作成する
- カラム追加・変更はマイグレーションファイルで管理する（直接変更しない）
- `supabase/migrations/` に変更履歴を残す

---

## テスト方針
- 重要なロジック（認証・データ更新）にはテストを書く
- FastAPI開始後: エンドポイントには必ずpytestを書く
- LLM呼び出し部分はモック化してテストする（APIコスト節約）

---

## Git運用
- Claudeに作業を依頼する**前に必ずコミット**しておく
- 1機能・1修正 = 1コミット
- コミットメッセージ例:
  - `feat: オフィス一覧ページ追加`
  - `fix: Supabase認証エラー修正`
  - `test: 状態更新APIのテスト追加`
  - `docs: CLAUDE.md 現在フェーズ更新`

---

## よく使うコマンド
```bash
npm run dev          # 開発サーバー起動（localhost:3000）
npm run build        # 本番ビルド確認
npm test             # テスト実行

supabase start       # ローカルSupabase起動
supabase db push     # マイグレーション適用
supabase status      # 接続情報確認
```

---

## 絶対にやってはいけないこと
- `.env.local` をコミットしない（.gitignoreに入っていること）
- Anthropic APIキー・Supabase Service Role Keyをコードに直書きしない
- `any` 型を使わない
- RLSを無効のままSupabaseテーブルを本番に公開しない
- テストが失敗している状態でコミットしない
