import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未認証' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin_a') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { userId } = (await request.json()) as { userId: string }
  if (!userId) return NextResponse.json({ error: 'userId が必要です' }, { status: 400 })
  if (userId === user.id) {
    return NextResponse.json({ error: '自分自身は削除できません' }, { status: 400 })
  }

  try {
    const admin = createSupabaseAdminClient()
    // profiles は auth.users の ON DELETE CASCADE で自動削除される
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
