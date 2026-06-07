'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { Status } from '@/types'
import StatusUpdateButton from './StatusUpdateButton'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORIES = ['設備系', '清掃系', 'インシデント系', '入退館系'] as const

type Props = {
  buildingId: string
  initialStatuses: Status[]
  canUpdate?: boolean
}

const badgeClass = (status: string) => {
  if (status === '正常') return 'bg-green-100 text-green-800'
  if (status === '異常') return 'bg-red-100 text-red-800'
  if (status === '対応中') return 'bg-yellow-100 text-yellow-800'
  return ''
}

export default function StatusList({ buildingId, initialStatuses, canUpdate = true }: Props) {
  const [statuses, setStatuses] = useState<Status[]>(initialStatuses)

  useEffect(() => {
    const channel = supabase
      .channel(`statuses:${buildingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'statuses',
          filter: `building_id=eq.${buildingId}`,
        },
        (payload) => {
          setStatuses((prev) =>
            prev.map((s) => (s.id === payload.new.id ? (payload.new as Status) : s))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [buildingId])

  return (
    <section>
      <h2 className="text-base font-semibold text-gray-700 mb-3">現在の状態</h2>
      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const catStatuses = statuses.filter((s) => s.category === cat)
          return (
            <div key={cat} className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">{cat}</h3>
              {catStatuses.length === 0 ? (
                <p className="text-sm text-gray-400">データなし</p>
              ) : (
                <div className="space-y-3">
                  {catStatuses.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${badgeClass(s.status)}`}>
                          {s.status}
                        </span>
                        <span className="text-sm text-gray-800 truncate">{s.item}</span>
                      </div>
                      {canUpdate && (
                        <StatusUpdateButton
                          statusId={s.id}
                          buildingId={buildingId}
                          category={s.category}
                          item={s.item}
                          currentStatus={s.status}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
