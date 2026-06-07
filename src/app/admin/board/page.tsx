'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { BoardCategory } from '@/types'

export default function AdminBoardPage() {
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

  if (loading) return <p className="text-gray-500">読み込み中...</p>

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">掲示板</h2>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/admin/board/${cat.id}`}
            className="group bg-white rounded-xl border border-gray-200 shadow-sm p-5
                       hover:shadow-md hover:border-blue-300 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                {cat.name}
              </span>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
