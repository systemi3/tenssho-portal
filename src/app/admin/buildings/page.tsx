import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Building } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminBuildingsPage() {
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .order('name')

  const buildings: Building[] = error ? [] : (data as Building[])

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">ビル状態</h2>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          データ取得エラー: {error.message}
        </p>
      )}

      {buildings.length === 0 && !error ? (
        <p className="text-gray-400 text-sm text-center py-8">ビルが登録されていません</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((building) => (
            <Link
              key={building.id}
              href={`/admin/buildings/${building.id}`}
              className="group block bg-white rounded-xl border border-gray-200 shadow-sm p-5
                         hover:shadow-md hover:border-blue-300 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0
                                group-hover:bg-blue-100 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3m4-3v3m4-3v3" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                    {building.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">詳細を確認する</p>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0 mt-0.5"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {['設備系', '清掃系', 'インシデント系', '入退館系'].map((cat) => (
                  <span key={cat} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
