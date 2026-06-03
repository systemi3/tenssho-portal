import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Building, Status, StatusHistory } from '@/types'
import PredictButton from '@/components/PredictButton'
import StatusList from '@/components/StatusList'
import HistoryList from '@/components/HistoryList'

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

  const { data: statusesData, error: statusError } = await supabase
    .from('statuses')
    .select('*')
    .eq('building_id', id)

  if (statusError || !statusesData) redirect('/')

  const { data: historyData } = await supabase
    .from('status_history')
    .select('*')
    .eq('building_id', id)
    .order('changed_at', { ascending: false })
    .limit(20)

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

        {/* 現在の状態（Realtimeサブスクライブ） */}
        <StatusList
          buildingId={building.id}
          initialStatuses={statusesData as Status[]}
        />

        {/* 変化履歴（フィルター・もっと見る） */}
        <HistoryList
          buildingId={building.id}
          initialHistory={(historyData ?? []) as StatusHistory[]}
        />

      </main>
    </div>
  )
}
