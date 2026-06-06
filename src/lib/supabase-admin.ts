import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types'

/**
 * Service Role クライアント（サーバーサイド専用）
 * RLS をバイパスして全データにアクセスできます。
 * API Route 内でのみ使用してください。
 */
export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY が設定されていません。.env.local に追加してください。'
    )
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
