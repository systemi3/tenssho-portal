'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Category, StatusValue } from '@/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Props = {
  statusId: string
  buildingId: string
  category: Category
  item: string
  currentStatus: StatusValue
}

export default function StatusUpdateButton({ statusId, buildingId, category, item, currentStatus }: Props) {
  const [selected, setSelected] = useState<StatusValue>(currentStatus)
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleUpdate = async () => {
    setLoading(true)
    setMessage(null)

    const { error: statusError } = await supabase
      .from('statuses')
      .update({ status: selected, updated_at: new Date().toISOString() })
      .eq('id', statusId)

    if (statusError) {
      setLoading(false)
      setMessage('エラー: ' + statusError.message)
      return
    }

    const { error: historyError } = await supabase
      .from('status_history')
      .insert({
        building_id: buildingId,
        category,
        item,
        status: selected,
        memo: memo.trim() || null,
      })

    setLoading(false)

    if (historyError) {
      setMessage('エラー: ' + historyError.message)
      return
    }

    setMemo('')
    setMessage('✓ 更新完了')
    router.refresh()
    setTimeout(() => setMessage(null), 2000)
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as StatusValue)}
          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
        >
          <option value="正常">正常</option>
          <option value="異常">異常</option>
          <option value="対応中">対応中</option>
        </select>
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="text-xs px-3 py-1 rounded bg-blue-600 text-white
                     hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {loading ? '更新中...' : '更新'}
        </button>
      </div>
      <input
        type="text"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="メモ（任意）"
        className="text-xs border border-gray-200 rounded px-2 py-1 w-48 bg-white placeholder-gray-300"
      />
      {message && (
        <p className={`text-xs ${message.startsWith('エラー') ? 'text-red-500' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
