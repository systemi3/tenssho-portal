import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Status } from '@/types'

export default async function ResidentBuildingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: building, error: buildingError } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', id)
    .single()

  if (buildingError || !building) redirect('/resident')

  const { data: statuses, error: statusError } = await supabase
    .from('statuses')
    .select('*')
    .eq('building_id', id)

  if (statusError || !statuses) redirect('/resident')

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
          <Link href="/resident" className="text-sm text-emerald-600 hover:underline">← ビル一覧に戻る</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{building.name}</h1>
          <p className="text-xs text-gray-500 mt-0.5">現在の状態（閲覧専用）</p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {grouped.map(({ category, statuses }) => (
            <div key={category} className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-gray-700 mb-3">{category}</h2>
              {statuses.length === 0 ? (
                <p className="text-sm text-gray-400">現在データがありません</p>
              ) : (
                <div className="space-y-2">
                  {statuses.map((s: Status) => (
                    <div key={s.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-800">{s.item}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeClass(s.status)}`}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
