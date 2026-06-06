'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import LogoutButton from '@/components/LogoutButton'
import type { BoardCategory } from '@/types'

export default function BoardCategoryPage() {
  const [categories, setCategories] = useState<BoardCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data, error } = await supabase
        .from('board_categories')
        .select('*')
        .order('order_no', { ascending: true })

      if (error) setError('カテゴリの取得に失敗しました')
      else setCategories(data ?? [])
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
              <p className="text-xs text-gray-500">入居者掲示板</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/resident" className="text-sm text-gray-500 hover:text-gray-700">
              ダッシュボード
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">カテゴリ一覧</h2>

        {loading && <p className="text-gray-500">読み込み中...</p>}
        {error && <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/resident/board/${cat.id}`}
              className="group bg-white rounded-xl border border-gray-200 shadow-sm p-5
                         hover:shadow-md hover:border-emerald-300 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  {cat.name}
                </span>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 transition-colors"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
