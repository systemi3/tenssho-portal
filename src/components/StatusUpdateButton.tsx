'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type StatusValue = '正常' | '異常' | '対応中'

type Props = {
  statusId: string
  currentStatus: StatusValue
}

export default function StatusUpdateButton({ statusId, currentStatus }: Props) {
  const [selected, setSelected] = useState<StatusValue>(currentStatus)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleUpdate = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase
      .from('statuses')
      .update({ status: selected, updated_at: new Date().toISOString() })
      .eq('id', statusId)
    setLoading(false)
    if (error) {
      setMessage('エラー: ' + error.message)
      return
    }
    setMessage('✓ 更新完了')
    router.refresh()
    setTimeout(() => setMessage(null), 2000)
  }

  return (
    <div className="flex flex-col items-end gap-1">
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
      {message && (
        <p className={`text-xs ${message.startsWith('エラー') ? 'text-red-500' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
