'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { Profile, Role } from '@/types'

const ROLES: Role[] = ['admin_a', 'admin_b', 'admin_c', 'cleaner', 'chairman', 'resident']
const fmt = (s: string) => new Date(s).toLocaleDateString('ja-JP')

export default function AdminUserManagementPage() {
  const [myProfile, setMyProfile] = useState<Profile | null>(null)
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<Role>('resident')
  const [roomNo, setRoomNo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const router = useRouter()

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users')
    const json = await res.json()
    if (!res.ok) setError(json.error)
    else setUsers(json.users ?? [])
  }

  useEffect(() => {
    const init = async () => {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setMyProfile(prof as Profile | null)

      if (prof?.role === 'admin_a') await fetchUsers()
      setLoading(false)
    }
    init()
  }, [router])

  const handleCreateUser = async () => {
    if (!email.trim() || !password.trim() || !newName.trim()) return
    setSubmitting(true)
    setFormError(null)
    setFormSuccess(null)

    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
        name: newName.trim(),
        role: newRole,
        room_no: newRole === 'resident' ? roomNo.trim() || null : null,
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      setFormError(json.error)
    } else {
      setEmail(''); setPassword(''); setNewName('')
      setNewRole('resident'); setRoomNo('')
      setFormSuccess('ユーザーを追加しました')
      await fetchUsers()
    }
    setSubmitting(false)
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`「${userName}」を削除しますか？この操作は取り消せません。`)) return
    const res = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const json = await res.json()
    if (!res.ok) setError(json.error)
    else await fetchUsers()
  }

  const handleRoleChange = async (userId: string, role: Role) => {
    const res = await fetch('/api/admin/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    })
    const json = await res.json()
    if (!res.ok) setError(json.error)
    else await fetchUsers()
  }

  if (loading) return <p className="text-gray-500">読み込み中...</p>

  if (myProfile?.role !== 'admin_a') {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-gray-500">このページへのアクセス権限がありません</p>
        <p className="text-sm text-gray-400 mt-1">admin_a のみアクセスできます</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8">
      <h2 className="text-xl font-semibold text-gray-800">ユーザー管理</h2>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* 新規ユーザー追加フォーム */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-700">新規ユーザー追加</h3>

        {formError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {formError}
          </p>
        )}
        {formSuccess && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            {formSuccess}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">表示名</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="山田 太郎"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ロール</label>
            <select
              value={newRole}
              onChange={(e) => { setNewRole(e.target.value as Role); setRoomNo('') }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {newRole === 'resident' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">部屋番号</label>
              <input
                type="text"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="101"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleCreateUser}
            disabled={submitting || !email.trim() || !password.trim() || !newName.trim()}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? '追加中...' : '追加する'}
          </button>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div>
        <h3 className="text-base font-medium text-gray-700 mb-3">
          ユーザー一覧 <span className="text-sm font-normal text-gray-400">({users.length}名)</span>
        </h3>

        {users.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">ユーザーが登録されていません</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">名前</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ロール</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">部屋番号</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">作成日</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {u.name}
                      {u.id === myProfile?.id && (
                        <span className="ml-2 text-xs text-blue-500">(自分)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        disabled={u.id === myProfile?.id}
                        className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700
                                   focus:outline-none focus:ring-1 focus:ring-blue-500
                                   disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {u.room_no ? `${u.room_no}号室` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{fmt(u.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== myProfile?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          削除
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
