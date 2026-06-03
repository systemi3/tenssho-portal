import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Building, Status, StatusHistory } from '@/types'
import StatusUpdateButton from '@/components/StatusUpdateButton'
import PredictButton from '@/components/PredictButton'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: buildingData, error: buildingError } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', id)
    .single()

  if (buildingError || !buildingData) redirect('/')

  const building = buildingData as Building

  const { data: statuses, error: statusError } = await supabase
    .from('statuses')
    .select('*')
    .eq('building_id', id)

  if (statusError || !statuses) redirect('/')

  const { data: history } = await supabase
    .from('status_history')
    .select('*')
    .eq('building_id', id)
    .order('changed_at', { ascending: false })
    .limit(20)

  const categories = ['設備系', '清掃系', 'インシデント系', '入退館系'] as const

  const grouped = categories.map((cat) => ({
    category: cat,
    statuses: statuses.filter((s: Status) => s.category === cat),
  }))

  const badgeClass = (status: string) => {
    if (status === '正常') return 'bg-green-100 text-green-800'
    if (status === '異常') return 'bg-red-100 text-red-800'
    if (status === '対応中') return 'bg-yellow-100 text-yellow-800'
    return ''
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-sm text-blue-600 hover:underline">← ビル一覧に戻る</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{building.name}</h1>
          <p className="text-xs text-gray-500 mt-0.5">社員向け管理画面</p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* LLM予測 */}
        <PredictButton buildingId={building.id} buildingName={building.name} />

        {/* 現在の状態 */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">現在の状態</h2>
          <div className="space-y-4">
            {grouped.map(({ category, statuses }) => (
              <div key={category} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">{category}</h3>
                {statuses.length === 0 ? (
                  <p className="text-sm text-gray-400">データなし</p>
                ) : (
                  <div className="space-y-3">
                    {statuses.map((s: Status) => (
                      <div key={s.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${badgeClass(s.status)}`}>
                            {s.status}
                          </span>
                          <span className="text-sm text-gray-800 truncate">{s.item}</span>
                        </div>
                        <StatusUpdateButton
                          statusId={s.id}
                          buildingId={building.id}
                          category={s.category}
                          item={s.item}
                          currentStatus={s.status}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 履歴一覧 */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">変化履歴（直近20件）</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {!history || history.length === 0 ? (
              <p className="text-sm text-gray-400 p-5">履歴がありません</p>
            ) : (
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
                  {history.map((h: StatusHistory) => (
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
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
