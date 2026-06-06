'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import LogoutButton from '@/components/LogoutButton'

type ThreadWithAuthor = {
  id: string
  title: string
  body: string
  created_at: string
  user_id: string | null
  profiles: { name: string } | null
}

export default function ThreadListPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = use(params)
  const [categoryName, setCategoryName] = useState('')
  const [threads, setThreads] = useState<ThreadWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  const fetchThreads = async () => {
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('board_threads')
      .select('id, title, body, created_at, user_id, profiles(name)')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })

    if (error) setError('スレッドの取得に失敗しました')
    else setThreads((data ?? []) as ThreadWithAuthor[])
  }

  useEffect(() => {
    const init = async () => {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: cat } = await supabase
        .from('board_categories')
        .select('name')
        .eq('id', categoryId)
        .single()
      setCategoryName(cat?.name ?? '')

      await fetchThreads()
      setLoading(false)
    }
    init()
  }, [categoryId, router])

  const handleCreateThread = async () => {
    if (!newTitle.trim() || !newBody.trim()) return
    setSubmitting(true)
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.from('board_threads').insert({
      category_id: categoryId,
      title: newTitle.trim(),
      body: newBody.trim(),
      user_id: userId,
    })
    if (error) {
      setError('スレッドの作成に失敗しました')
    } else {
      setShowModal(false)
      setNewTitle('')
      setNewBody('')
      await fetchThreads()
    }
    setSubmitting(false)
  }

  const fmt = (s: string) => new Date(s).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })

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
              <p className="text-xs text-gray-500">入居者掲示板</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/resident/board" className="text-sm text-emerald-600 hover:underline">
              ← カテゴリ一覧
            </Link>
            <h2 className="text-xl font-semibold text-gray-800 mt-1">{categoryName}</h2>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg
                       hover:bg-emerald-700 transition-colors"
          >
            + 新しいスレッドを立てる
          </button>
        </div>

        {loading && <p className="text-gray-500">読み込み中...</p>}
        {error && <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3 mb-4">{error}</p>}

        <div className="space-y-2">
          {!loading && threads.length === 0 && (
            <p className="text-gray-400 text-center py-12">スレッドがまだありません</p>
          )}
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/resident/board/${categoryId}/${thread.id}`}
              className="block bg-white rounded-xl border border-gray-200 px-5 py-4
                         hover:shadow-sm hover:border-emerald-300 transition-all duration-150"
            >
              <p className="font-medium text-gray-900">{thread.title}</p>
              <p className="text-xs text-gray-400 mt-1">
                {thread.profiles?.name ?? '不明'} · {fmt(thread.created_at)}
              </p>
            </Link>
          ))}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">新しいスレッドを立てる</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="スレッドのタイトル"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">本文</label>
              <textarea
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                placeholder="内容を入力してください"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowModal(false); setNewTitle(''); setNewBody('') }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateThread}
                disabled={submitting || !newTitle.trim() || !newBody.trim()}
                className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg
                           hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? '投稿中...' : '投稿する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
