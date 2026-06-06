'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import LogoutButton from '@/components/LogoutButton'
import type { Notification } from '@/types'

const fmt = (s: string) =>
  new Date(s).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })

export default function ResidentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) setError('お知らせの取得に失敗しました')
      else setNotifications((data ?? []) as Notification[])
      setLoading(false)
    }
    init()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">天</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">天翔ビルディング</h1>
              <p className="text-xs text-gray-500">入居者ポータル</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Link href="/resident" className="text-sm text-emerald-600 hover:underline">
            ← ダッシュボード
          </Link>
          <h2 className="text-xl font-semibold text-gray-800 mt-1">お知らせ</h2>
        </div>

        {loading && <p className="text-gray-500">読み込み中...</p>}
        {error && (
          <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
        )}

        {!loading && notifications.length === 0 && (
          <p className="text-gray-400 text-center py-16">お知らせはありません</p>
        )}

        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-xl border border-gray-200 px-5 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-semibold text-gray-900">{n.title}</p>
                <span className="text-xs text-gray-400 shrink-0">{fmt(n.created_at!)}</span>
              </div>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{n.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
