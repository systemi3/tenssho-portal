import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Building, Status, StatusHistory, Role } from '@/types'
import StatusList from '@/components/StatusList'
import HistoryList from '@/components/HistoryList'
import PredictButton from '@/components/PredictButton'

export const dynamic = 'force-dynamic'

const UPDATE_ROLES: Role[] = ['admin_a', 'admin_b', 'cleaner', 'chairman']

export default async function AdminBuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // ロール取得（認証済み前提 — admin layout が保証）
  const serverSupabase = await createSupabaseServerClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  const { data: profile } = user
    ? await serverSupabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  const canUpdate = profile ? UPDATE_ROLES.includes(profile.role as Role) : false

  // ビルデータ取得
  const { data: buildingData, error: buildingError } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', id)
    .single()

  if (buildingError || !buildingData) redirect('/admin/buildings')

  const building = buildingData as Building

  const { data: statusesData, error: statusError } = await supabase
    .from('statuses')
    .select('*')
    .eq('building_id', id)

  if (statusError || !statusesData) redirect('/admin/buildings')

  const { data: historyData } = await supabase
    .from('status_history')
    .select('*')
    .eq('building_id', id)
    .order('changed_at', { ascending: false })
    .limit(20)

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Link href="/admin/buildings" className="text-sm text-blue-600 hover:underline">
          ← ビル一覧に戻る
        </Link>
        <h2 className="text-xl font-semibold text-gray-800 mt-1">{building.name}</h2>
        {!canUpdate && (
          <p className="text-xs text-gray-400 mt-0.5">閲覧のみ（更新権限なし）</p>
        )}
      </div>

      <PredictButton buildingId={building.id} buildingName={building.name} />

      <StatusList
        buildingId={building.id}
        initialStatuses={statusesData as Status[]}
        canUpdate={canUpdate}
      />

      <HistoryList
        buildingId={building.id}
        initialHistory={(historyData ?? []) as StatusHistory[]}
      />
    </div>
  )
}
