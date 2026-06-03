import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Building } from '@/types'

export const dynamic = 'force-dynamic'

async function getBuildings(): Promise<Building[]> {
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .order('name')

  if (error) {
    console.error('buildings 取得エラー:', error)
    return []
  }
  return data
}

export default async function HomePage() {
  const buildings = await getBuildings()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">天</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                天翔ビルディング
              </h1>
              <p className="text-xs text-gray-500">ビル状態管理ポータル</p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">ビル一覧</h2>
          <p className="mt-1 text-sm text-gray-500">
            確認するビルを選択してください
          </p>
        </div>

        {/* ビルカード一覧 */}
        {buildings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">ビルが登録されていません</p>
            <p className="text-sm mt-1">Supabase にサンプルデータを投入してください</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {buildings.map((building) => (
              <BuildingCard key={building.id} building={building} />
            ))}
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="mt-auto border-t border-gray-200 py-4">
        <p className="text-center text-xs text-gray-400">
          社員向け管理画面 ·{' '}
          <Link href="/resident" className="underline hover:text-gray-600">
            入居者向けはこちら
          </Link>
        </p>
      </footer>
    </div>
  )
}

function BuildingCard({ building }: { building: Building }) {
  return (
    <Link
      href={`/buildings/${building.id}`}
      className="group block bg-white rounded-xl border border-gray-200 shadow-sm p-5
                 hover:shadow-md hover:border-blue-300 transition-all duration-200"
    >
      {/* アイコン＋ビル名 */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0
                        group-hover:bg-blue-100 transition-colors">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3m4-3v3m4-3v3"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
            {building.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">詳細を確認する</p>
        </div>
        {/* 矢印 */}
        <svg
          className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>

      {/* カテゴリバッジ */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {['設備系', '清掃系', 'インシデント系', '入退館系'].map((cat) => (
          <span
            key={cat}
            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full"
          >
            {cat}
          </span>
        ))}
      </div>
    </Link>
  )
}
