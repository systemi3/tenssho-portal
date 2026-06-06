import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import type { Role } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未認証' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin_a') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const { userId, role } = (await request.json()) as { userId: string; role: Role }
  if (!userId || !role) {
    return NextResponse.json({ error: 'userId と role が必要です' }, { status: 400 })
  }

  try {
    const admin = createSupabaseAdminClient()
    const { error } = await admin
      .from('profiles')
      .update({ role })
      .eq('id', userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
