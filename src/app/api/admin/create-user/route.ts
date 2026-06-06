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

  const { email, password, name, role, room_no } = (await request.json()) as {
    email: string
    password: string
    name: string
    role: Role
    room_no: string | null
  }

  if (!email || !password || !name || !role) {
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
  }

  try {
    const admin = createSupabaseAdminClient()

    // 1. Auth ユーザー作成
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message ?? '認証ユーザーの作成に失敗しました' },
        { status: 400 }
      )
    }

    // 2. profiles に INSERT
    const { error: profileError } = await admin.from('profiles').insert({
      id: authData.user.id,
      name,
      role,
      room_no: role === 'resident' ? (room_no || null) : null,
    })
    if (profileError) {
      // ロールバック: Auth ユーザーを削除
      await admin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
