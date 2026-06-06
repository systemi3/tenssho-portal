# 天翔ビルディング ビル状態管理ポータル 要件定義書

**作成日：** 2026年4月6日
**更新日：** 2026年6月6日（v2：GitHub実装反映・プライバシー設計追加）
**バージョン：** 2.0
**ステータス：** 確定

---

## 1. プロジェクト概要

### 目的
各ビルの状態を社員・入居者がリアルタイムで共有し、過去の状態変化履歴をもとにLLMが次に起こりうる事象を予測・アドバイスするポータルシステムを構築する。

### 展示用スコープ（Phase 1〜3 完了済み）
- 対象ビル：2〜3棟
- デモ用サンプルデータ：seed.sql に整備済み
- 認証：なし（展示用・画面切り替えのみ）

### 本番スコープ（Phase 4〜）
- 対象ビル：約30棟
- ユーザー規模：社員10〜20名 ／ 清掃員30〜60名 ／ 入居者約1,500名
- 認証：2系統（社員向け Supabase Auth ／ 入居者向けカスタムアクセスコード）

---

## 2. ユーザー定義

| ユーザー種別 | 権限 | 認証方式 | 端末 |
|---|---|---|---|
| 社員 | 入力・編集・閲覧・管理（全機能） | Supabase Auth | PC + スマホ |
| 清掃員 | 担当ビルの状態入力・画像添付・メモ | Supabase Auth | スマホ専用 |
| 入居者 | 担当ビル閲覧・掲示板投稿 | カスタムアクセスコード（仮名ID） | PC + スマホ |
| 管理者 | 全ビル横断・ユーザー管理・ピン留め | Supabase Auth（管理者ロール） | PC |

### プライバシー設計方針（重要）
**入居者の個人情報はポータル内に一切保持しない。**
- 入居者はランダム生成の「アクセスコード」でログイン
- 表示名は事前に設定した「仮名ID」（例：ひまわり、天翔501等）のみ
- 氏名・メール・電話番号はポータル外の社内台帳で管理
- ビル名称は実名使用（公開情報のため問題なし）

---

## 3. 機能要件

### 完了済みコア機能（Phase 1〜3）

| # | 機能名 | 実装ファイル | 状態 |
|---|---|---|---|
| F-01 | 状態表示 | src/components/StatusList.tsx | 完了 |
| F-02 | 状態入力 | src/components/StatusUpdateButton.tsx | 完了 |
| F-03 | 履歴管理 | src/components/HistoryList.tsx | 完了 |
| F-04 | LLM予測 | src/app/api/predict/route.ts | 完了 |
| F-05 | 社員向け画面 | src/app/buildings/[id]/page.tsx | 完了 |
| F-06 | 入居者向け画面 | src/app/resident/buildings/[id]/page.tsx | 完了 |
| F-07 | リアルタイム同期 | supabase migration 004 | 完了 |
| F-08 | 行レベルセキュリティ | supabase migration 005 | 完了 |

### 残作業機能（Phase 4〜）

| # | 機能名 | 概要 |
|---|---|---|
| F-09 | 認証システム（2系統） | 社員：Supabase Auth ／ 入居者：カスタムアクセスコード |
| F-10 | 清掃員スマホ入力UI | スマホ最適化された現場入力画面 |
| F-11 | 本社管理ダッシュボード | 30棟横断の状態一覧・集計 |
| F-12 | 30棟マルチビル対応 | ビルマスタ拡張・データ移行 |
| F-13 | 入居者アカウント管理 | 仮名ID＋アクセスコードの発行 |
| F-14 | 設備マスタ管理 | 各ビル設備の構造化登録 |
| F-15 | 画像アップロード | Supabase Storage |
| F-16 | プッシュ通知 | 異常発生時の即時通知 |
| F-17 | コミュニティ掲示板（スレッド型） | 入居者同士のカテゴリ別スレッド・返信 |
| F-18 | 会長巡回データ＋RAG | pgvector による経験知の組織資産化 |
| F-19 | レポート出力 | 月次・ビル別レポート（PDF/Excel） |
| F-20 | 監査ログ | 変更の全件記録 |
| F-21 | クラウド本番化 | Vercel Pro + Supabase Pro |
| F-22 | 独自ドメイン・監視 | DNS・UptimeRobot |
| F-23 | 操作マニュアル | 各ユーザー向け利用ガイド |

### LLM予測エージェント仕様（F-04）— 実装済み
- 入力：同ビル・同カテゴリの過去履歴 + 現在ステータス + メモ
- 処理：@anthropic-ai/sdk を Next.js API Routes に直接統合
- エンドポイント：/api/predict
- トリガー：「予測を見る」ボタン押下

### コミュニティ掲示板仕様（F-17）— 未実装
- 性質：入居者同士がカテゴリ別にスレッドを立て返信できる掲示板
- 投稿者表示：仮名IDのみ（個人情報は表示しない）
- ビル分離：RLSにより自ビルのスレッドのみ読み書き可
- リアルタイム：Supabase Realtime で返信を即時反映
- 管理権限：管理者・社員はピン留め・削除可

---

## 4. 非機能要件

| 項目 | 内容 |
|---|---|
| 認証 | 展示用：なし ／ 本番：2系統 |
| プライバシー | 入居者個人情報をシステム内に一切保持しない |
| データ量 | 本番：30棟・約1,600アカウント |
| コスト | 本番：Vercel Pro + Supabase Pro |
| レスポンシブ | PC・スマホ両対応 |
| セキュリティ | RLS適用済み・TLS通信・DB暗号化 |

---

## 5. 画面構成

### 社員向け
```
/ → /buildings/[id]
  状態一覧 / 更新ボタン / 履歴 / 予測ボタン
```

### 入居者向け
```
/resident → /resident/buildings/[id]
  状態閲覧（読み取り専用） / コミュニティ掲示板
```

### 掲示板
```
/resident/buildings/[id]/board
  カテゴリタブ → スレッド一覧 → スレッド詳細（返信）
```

---

## 6. データ設計

### 既存テーブル（実装済み）
- buildings（id, name）
- statuses（id, building_id, category, item, status, updated_at）
- status_history（id, building_id, category, item, status, changed_at, memo）

### 新規テーブル（実装予定）

#### tenants（入居者・個人情報ゼロ設計）
| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | 主キー |
| building_id | UUID | ビルID |
| alias | TEXT | 仮名ID |
| access_code_hash | TEXT | コードのハッシュ |
| is_active | BOOLEAN | 有効フラグ |
| created_at | TIMESTAMP | 発行日時 |

> 氏名・メール・電話・部屋番号は一切保存しない。対応表はポータル外の社内台帳で管理。

#### board_categories（id, building_id, name, sort_order）
#### board_threads（id, building_id, category_id, created_by, title, body, is_pinned, created_at, updated_at）
#### board_posts（id, thread_id, user_id, body, created_at）

---

## 7. 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 16.2.3（App Router） |
| 言語 | TypeScript 5 / React 19.2.4 |
| スタイル | Tailwind CSS v4 |
| データベース | Supabase（PostgreSQL） |
| LLM | @anthropic-ai/sdk 0.96（Next.js API Routes統合） |
| ホスティング | Vercel（単一構成） |

> v1からの変更：FastAPI（Python）とRenderを廃止。LLM処理をNext.js API Routesに統合し、Vercel一本化・TypeScript統一・運用負荷低減。

---

## 8. 開発フェーズ

### 完了済み
- Phase 1：状態共有ポータル（DB・画面・リアルタイム同期）
- Phase 2：履歴管理（HistoryList・StatusUpdateButton・RLS・seed）
- Phase 3：LLM予測（Next.js API Routes統合）

### 予定
- Phase 4A：認証（2系統・入居者は個人情報ゼロ）
- Phase 4B：清掃員スマホUI・画像アップロード
- Phase 4C：30棟対応・tenantsテーブル
- Phase 4D：本社ダッシュボード
- Phase 4E：コミュニティ掲示板（スレッド型）
- Phase 4F：会長巡回＋RAG（pgvector）
- Phase 4G：レポート・監査ログ
- Phase 4H：本番デプロイ

---

## 9. 未決定事項
- アクセスコード配布方法（紙カード vs 暗号化メール）
- 仮名IDの命名ルール
- 会長巡回データの入力UI
- 掲示板のモデレーション方針

---

*本ドキュメントはプロジェクトルートに requirements.md として配置し、Claude Codeが常時参照できる状態にすること。*
