'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { Notification, Profile, Role } from '@/types'

type ResidentOption = { id: string; name: string; room_no: string | null }

const CAN_TARGET_SPECIFIC: Role[] = ['admin_a', 'chairman']
const CAN_POST: Role[] = ['admin_a', 'admin_b', 'admin_c', 'cleaner', 'chairman']

const fmt = (s: string) =>
  new Date(s).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })

export default function AdminNotificationsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [residents, setResidents] = useState<ResidentOption[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all')
  const [targetUser, setTargetUser] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const router = useRouter()

  const fetchNotifications = async () => {
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError('お知らせ一覧の取得に失敗しました')
    else setNotifications((data ?? []) as Notification[])
  }

  useEffect(() => {
    const init = async () => {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      if (prof) setProfile(prof as Profile)

      const { data: res } = await supabase
        .from('profiles')
        .select('id, name, room_no')
        .eq('role', 'resident')
        .order('name')
      setResidents((res ?? []) as ResidentOption[])

      await fetchNotifications()
      setLoading(false)
    }
    init()
  }, [router])

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return
    if (targetType === 'specific' && !targetUser) return
    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('notifications').insert({
      title: title.trim(),
      body: body.trim(),
      target_type: targetType,
      target_user: targetType === 'specific' ? targetUser : null,
      created_by: user?.id ?? null,
    })
    if (error) {
      setError('送信に失敗しました')
    } else {
      setTitle('')
      setBody('')
      setTargetType('all')
      setTargetUser('')
      setSuccessMsg('お知らせを送信しました')
      await fetchNotifications()
    }
    setSubmitting(false)
  }

  const role = profile?.role
  const canPost = role && CAN_POST.includes(role)
  const canTargetSpecific = role && CAN_TARGET_SPECIFIC.includes(role)

  if (loading) return <p className="text-gray-500">読み込み中...</p>

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-xl font-semibold text-gray-800">お知らせ配信</h2>

      {/* 配信フォーム */}
      {canPost && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-base font-medium text-gray-700">新規配信</h3>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {successMsg && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              {successMsg}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="お知らせのタイトル"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">本文</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="お知らせ内容を入力してください"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">配信対象</label>
            <select
              value={targetType}
              onChange={(e) => {
                setTargetType(e.target.value as 'all' | 'specific')
                setTargetUser('')
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全体</option>
              {canTargetSpecific && <option value="specific">特定入居者</option>}
            </select>
          </div>

          {targetType === 'specific' && canTargetSpecific && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">対象入居者</label>
              <select
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}{r.room_no ? `（${r.room_no}号室）` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !title.trim() ||
                !body.trim() ||
                (targetType === 'specific' && !targetUser)
              }
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                         hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '送信中...' : '送信する'}
            </button>
          </div>
        </div>
      )}

      {/* 過去のお知らせ一覧 */}
      <div>
        <h3 className="text-base font-medium text-gray-700 mb-3">配信履歴</h3>
        {notifications.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">お知らせはまだありません</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium text-gray-900">{n.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    n.target_type === 'all'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {n.target_type === 'all' ? '全体' : '特定入居者'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{fmt(n.created_at!)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
