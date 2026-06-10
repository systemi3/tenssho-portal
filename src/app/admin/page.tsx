'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { Profile, Role } from '@/types'

const CAN_SEE_NOTIFICATIONS: Role[] = ['admin_a', 'chairman']

const fmt = (s: string) =>
  new Date(s).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })

type ThreadWithCategory = {
  id: string
  title: string
  created_at: string
  category_id: string | null
  board_categories: { name: string } | null
}

type NotificationSummary = {
  id: string
  title: string
  target_type: 'all' | 'specific'
  created_at: string
}

type DashboardData = {
  buildingCount: number
  unhandledCount: number
  recentThreadCount: number
  recentNotificationCount: number
  latestThreads: ThreadWithCategory[]
  latestNotifications: NotificationSummary[]
}

export default function AdminDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof as Profile | null)

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const [
        buildingsRes,
        unhandledRes,
        recentThreadsRes,
        recentNotificationsRes,
        latestThreadsRes,
        latestNotificationsRes,
      ] = await Promise.all([
        supabase.from('buildings').select('id', { count: 'exact', head: true }),
        supabase.from('statuses').select('id', { count: 'exact', head: true })
          .in('status', ['異常', '対応中']),
        supabase.from('board_threads').select('id', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo),
        supabase.from('notifications').select('id', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo),
        supabase.from('board_threads')
          .select('id, title, created_at, category_id, board_categories(name)')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('notifications')
          .select('id, title, target_type, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      setData({
        buildingCount: buildingsRes.count ?? 0,
        unhandledCount: unhandledRes.count ?? 0,
        recentThreadCount: recentThreadsRes.count ?? 0,
        recentNotificationCount: recentNotificationsRes.count ?? 0,
        latestThreads: (latestThreadsRes.data ?? []) as ThreadWithCategory[],
        latestNotifications: (latestNotificationsRes.data ?? []) as NotificationSummary[],
      })
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) return <p className="text-gray-500">読み込み中...</p>
  if (!data) return null

  const role = profile?.role
  const canSeeNotifications = role && CAN_SEE_NOTIFICATIONS.includes(role)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">ダッシュボード</h2>

      {/* サマリーカード（上段） */}
      <div className={`grid gap-4 ${canSeeNotifications ? 'grid-cols-4' : 'grid-cols-3'}`}>
        <SummaryCard
          label="管理ビル数"
          value={data.buildingCount}
          unit="棟"
          href="/admin/buildings"
          color="blue"
        />
        <SummaryCard
          label="未対応インシデント"
          value={data.unhandledCount}
          unit="件"
          href="/admin/buildings"
          color={data.unhandledCount > 0 ? 'red' : 'green'}
        />
        <SummaryCard
          label="掲示板の新着（7日）"
          value={data.recentThreadCount}
          unit="件"
          href="/admin/board"
          color="indigo"
        />
        {canSeeNotifications && (
          <SummaryCard
            label="お知らせ配信（30日）"
            value={data.recentNotificationCount}
            unit="件"
            href="/admin/notifications"
            color="amber"
          />
        )}
      </div>

      {/* 下段 */}
      <div className={`grid gap-6 ${canSeeNotifications ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* 左: 最新スレッド */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">最新スレッド</h3>
            <Link href="/admin/board" className="text-xs text-blue-600 hover:underline">
              すべて見る
            </Link>
          </div>
          {data.latestThreads.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">スレッドはありません</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.latestThreads.map((t) => (
                <li key={t.id} className="py-2.5 first:pt-0 last:pb-0">
                  <Link
                    href={`/admin/board/${t.category_id}/${t.id}`}
                    className="group block"
                  >
                    <p className="text-sm text-gray-800 group-hover:text-blue-600 truncate">
                      {t.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.board_categories?.name ?? '—'} · {fmt(t.created_at)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 右: 最新お知らせ（admin_a / chairman のみ） */}
        {canSeeNotifications && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">最新のお知らせ</h3>
              <Link href="/admin/notifications" className="text-xs text-blue-600 hover:underline">
                すべて見る
              </Link>
            </div>
            {data.latestNotifications.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">お知らせはありません</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.latestNotifications.map((n) => (
                  <li key={n.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800 truncate">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmt(n.created_at)}</p>
                    </div>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                      n.target_type === 'all'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {n.target_type === 'all' ? '全体' : '特定'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

type CardColor = 'blue' | 'green' | 'red' | 'indigo' | 'amber'

const colorMap: Record<CardColor, { text: string; value: string }> = {
  blue:   { text: 'text-blue-500',    value: 'text-blue-700' },
  green:  { text: 'text-emerald-500', value: 'text-emerald-700' },
  red:    { text: 'text-red-500',     value: 'text-red-700' },
  indigo: { text: 'text-indigo-500',  value: 'text-indigo-700' },
  amber:  { text: 'text-amber-500',   value: 'text-amber-700' },
}

function SummaryCard({
  label, value, unit, href, color,
}: {
  label: string
  value: number
  unit: string
  href: string
  color: CardColor
}) {
  const c = colorMap[color]
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-5
                 hover:shadow-md hover:border-blue-300 transition-all duration-200 block"
    >
      <p className={`text-xs font-medium ${c.text} mb-2`}>{label}</p>
      <p className={`text-3xl font-bold ${c.value}`}>
        {value}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </Link>
  )
}
