'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import ReplyForm from '@/components/board/ReplyForm'
import type { Role } from '@/types'

type ThreadWithAuthor = {
  id: string
  title: string
  body: string
  created_at: string
  user_id: string | null
  profiles: { name: string } | null
}

type ReplyWithAuthor = {
  id: string
  body: string
  created_at: string
  user_id: string | null
  profiles: { name: string } | null
}

const ADMIN_ROLES: Role[] = ['admin_a', 'admin_b']

export default function AdminThreadDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string; threadId: string }>
}) {
  const { categoryId, threadId } = use(params)
  const [thread, setThread] = useState<ThreadWithAuthor | null>(null)
  const [replies, setReplies] = useState<ReplyWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const router = useRouter()

  const fetchReplies = async () => {
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('board_replies')
      .select('id, body, created_at, user_id, profiles(name)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
    if (error) setError('返信の取得に失敗しました')
    else setReplies((data ?? []) as ReplyWithAuthor[])
  }

  useEffect(() => {
    const init = async () => {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile) setUserRole(profile.role as Role)

      const { data: threadData, error: threadError } = await supabase
        .from('board_threads')
        .select('id, title, body, created_at, user_id, profiles(name)')
        .eq('id', threadId)
        .single()
      if (threadError || !threadData) {
        setError('スレッドが見つかりません')
        setLoading(false)
        return
      }
      setThread(threadData as ThreadWithAuthor)

      await fetchReplies()
      setLoading(false)
    }
    init()
  }, [threadId, router])

  const handleReply = async (body: string) => {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.from('board_replies').insert({
      thread_id: threadId,
      body,
      user_id: userId,
    })
    if (error) setError('返信の投稿に失敗しました')
    else await fetchReplies()
  }

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('この返信を削除しますか？')) return
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.from('board_replies').delete().eq('id', replyId)
    if (error) setError('削除に失敗しました')
    else await fetchReplies()
  }

  const handleDeleteThread = async () => {
    if (!confirm('このスレッドを削除しますか？返信もすべて削除されます。')) return
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.from('board_threads').delete().eq('id', threadId)
    if (error) setError('削除に失敗しました')
    else router.push(`/admin/board/${categoryId}`)
  }

  const canDelete = (postUserId: string | null) =>
    postUserId === userId || (userRole !== null && ADMIN_ROLES.includes(userRole))

  const fmt = (s: string) =>
    new Date(s).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })

  if (loading) return <p className="text-gray-500">読み込み中...</p>

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/admin/board/${categoryId}`} className="text-sm text-blue-600 hover:underline">
          ← スレッド一覧
        </Link>
        {userRole === 'admin_a' && (
          <Link
            href={`/admin/board/categories`}
            className="text-sm text-gray-500 border border-gray-300 rounded-lg px-3 py-1.5
                       hover:bg-gray-50 transition-colors"
          >
            カテゴリ編集
          </Link>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {thread && (
        <>
          {/* スレッド本文 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">{thread.title}</h2>
              {canDelete(thread.user_id) && (
                <button
                  onClick={handleDeleteThread}
                  className="text-xs text-red-500 hover:text-red-700 shrink-0"
                >
                  削除
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {thread.profiles?.name ?? '不明'} · {fmt(thread.created_at)}
            </p>
            <p className="mt-4 text-gray-700 whitespace-pre-wrap">{thread.body}</p>
          </div>

          {/* 返信一覧 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600">返信 {replies.length}件</h3>
            {replies.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-6">返信はまだありません</p>
            )}
            {replies.map((reply) => (
              <div
                key={reply.id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-gray-700 whitespace-pre-wrap flex-1">{reply.body}</p>
                  {canDelete(reply.user_id) && (
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
                      className="text-xs text-red-500 hover:text-red-700 shrink-0"
                    >
                      削除
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {reply.profiles?.name ?? '不明'} · {fmt(reply.created_at)}
                </p>
              </div>
            ))}
          </div>

          {/* 返信フォーム */}
          <ReplyForm onSubmit={handleReply} />
        </>
      )}
    </div>
  )
}
