'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import NewThreadModal from '@/components/board/NewThreadModal'

type ThreadWithAuthor = {
  id: string
  title: string
  body: string
  created_at: string
  user_id: string | null
  profiles: { name: string } | null
}

export default function AdminThreadListPage({
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

  const handleCreateThread = async (title: string, body: string) => {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.from('board_threads').insert({
      category_id: categoryId,
      title,
      body,
      user_id: userId,
    })
    if (error) {
      setError('スレッドの作成に失敗しました')
    } else {
      setShowModal(false)
      await fetchThreads()
    }
  }

  const fmt = (s: string) =>
    new Date(s).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })

  if (loading) return <p className="text-gray-500">読み込み中...</p>

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/board" className="text-sm text-blue-600 hover:underline">
            ← カテゴリ一覧
          </Link>
          <h2 className="text-xl font-semibold text-gray-800 mt-1">{categoryName}</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                     hover:bg-blue-700 transition-colors"
        >
          + 新しいスレッドを立てる
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="space-y-2">
        {threads.length === 0 && (
          <p className="text-gray-400 text-center py-12">スレッドがまだありません</p>
        )}
        {threads.map((thread) => (
          <Link
            key={thread.id}
            href={`/admin/board/${categoryId}/${thread.id}`}
            className="block bg-white rounded-xl border border-gray-200 px-5 py-4
                       hover:shadow-sm hover:border-blue-300 transition-all duration-150"
          >
            <p className="font-medium text-gray-900">{thread.title}</p>
            <p className="text-xs text-gray-400 mt-1">
              {thread.profiles?.name ?? '不明'} · {fmt(thread.created_at)}
            </p>
          </Link>
        ))}
      </div>

      {showModal && (
        <NewThreadModal
          onSubmit={handleCreateThread}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
