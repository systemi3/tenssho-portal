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
      }
      statuses: {
        Row: Status
        Insert: Omit<Status, 'id' | 'updated_at'>
        Update: Partial<Omit<Status, 'id'>>
      }
      status_history: {
        Row: StatusHistory
        Insert: Omit<StatusHistory, 'id' | 'changed_at'>
        Update: never
      }
    }
  }
}
