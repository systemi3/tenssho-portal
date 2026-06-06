// お知らせ
export type Notification = {
  id: string
  title: string
  body: string
  target_type: 'all' | 'specific'
  target_user: string | null
  created_by: string | null
  created_at: string
}

// 掲示板カテゴリ
export type BoardCategory = {
  id: string
  name: string
  order_no: number | null
  created_at: string
}

// 掲示板スレッド
export type BoardThread = {
  id: string
  category_id: string | null
  title: string
  body: string
  user_id: string | null
  created_at: string
}

// 掲示板返信
export type BoardReply = {
  id: string
  thread_id: string | null
  body: string
  user_id: string | null
  created_at: string
}

// ロール一覧
export type Role = 'admin_a' | 'admin_b' | 'admin_c' | 'cleaner' | 'chairman' | 'resident'

// ユーザープロフィール
export type Profile = {
  id: string
  name: string
  role: Role
  room_no: string | null
  created_at: string
}

// ステータスの選択肢
export type StatusValue = '正常' | '異常' | '対応中'

// カテゴリの選択肢
export type Category = '設備系' | '清掃系' | 'インシデント系' | '入退館系'

// ビルマスタ
export type Building = {
  id: string
  name: string
}

// 現在の状態
export type Status = {
  id: string
  building_id: string
  category: Category
  item: string
  status: StatusValue
  updated_at: string
}

// 状態変化履歴
export type StatusHistory = {
  id: string
  building_id: string
  category: Category
  item: string
  status: StatusValue
  changed_at: string
  memo: string | null
}

// Supabase Database 型（supabase.ts で使用）
export type Database = {
  public: {
    Tables: {
      buildings: {
        Row: Building
        Insert: Omit<Building, 'id'>
        Update: Partial<Omit<Building, 'id'>>
        Relationships: []
      }
      statuses: {
        Row: Status
        Insert: Omit<Status, 'id' | 'updated_at'>
        Update: Partial<Omit<Status, 'id'>>
        Relationships: []
      }
      status_history: {
        Row: StatusHistory
        Insert: Omit<StatusHistory, 'id' | 'changed_at'>
        Update: never
        Relationships: []
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
        Relationships: []
      }
      board_categories: {
        Row: BoardCategory
        Insert: Omit<BoardCategory, 'id' | 'created_at'>
        Update: Partial<Omit<BoardCategory, 'id' | 'created_at'>>
        Relationships: []
      }
      board_threads: {
        Row: BoardThread
        Insert: Omit<BoardThread, 'id' | 'created_at'>
        Update: Partial<Omit<BoardThread, 'id' | 'created_at'>>
        Relationships: []
      }
      board_replies: {
        Row: BoardReply
        Insert: Omit<BoardReply, 'id' | 'created_at'>
        Update: Partial<Omit<BoardReply, 'id' | 'created_at'>>
        Relationships: []
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
