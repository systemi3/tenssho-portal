'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { Category, StatusHistory } from '@/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORIES = ['設備系', '清掃系', 'インシデント系', '入退館系'] as const
const PAGE_SIZE = 20

type Filter = 'all' | Category

type Props = {
  buildingId: string
  initialHistory: StatusHistory[]
}

const badgeClass = (status: string) => {
  if (status === '正常') return 'bg-green-100 text-green-800'
  if (status === '異常') return 'bg-red-100 text-red-800'
  if (status === '対応中') return 'bg-yellow-100 text-yellow-800'
  return ''
}

export default function HistoryList({ buildingId, initialHistory }: Props) {
  const [history, setHistory] = useState<StatusHistory[]>(initialHistory)
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialHistory.length === PAGE_SIZE)

  const displayed = filter === 'all' ? history : history.filter((h) => h.category === filter)

  const loadMore = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('status_history')
      .select('*')
      .eq('building_id', buildingId)
      .order('changed_at', { ascending: false })
      .range(history.length, history.length + PAGE_SIZE - 1)
    setLoading(false)

    if (!data || data.length === 0) {
      setHasMore(false)
      return
    }
    setHistory((prev) => [...prev, ...(data as StatusHistory[])])
    setHasMore(data.length === PAGE_SIZE)
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-gray-700 mb-3">変化履歴</h2>

      {/* カテゴリフィルター */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {(['all', ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filter === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {cat === 'all' ? 'すべて' : cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {displayed.length === 0 ? (
          <p className="text-sm text-gray-400 p-5">履歴がありません</p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">日時</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">カテゴリ</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">項目</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">状態</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">メモ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(h.changed_at).toLocaleString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{h.category}</td>
                    <td className="px-4 py-3 text-xs text-gray-800">{h.item}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass(h.status)}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{h.memo ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hasMore && (
              <div className="p-4 border-t border-gray-100 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="text-xs px-4 py-2 rounded-lg border border-gray-200 text-gray-600
                             hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 transition-colors"
                >
                  {loading ? '読み込み中...' : 'もっと見る'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
