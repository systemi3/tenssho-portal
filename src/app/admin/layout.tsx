import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import LogoutButton from '@/components/LogoutButton'
import type { Profile } from '@/types'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">天</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                天翔ビルディング
              </h1>
              <p className="text-xs text-gray-500">管理者ポータル</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <span className="text-sm text-gray-600">
                {profile.name}
                <span className="ml-1.5 text-xs text-gray-400">
                  ({profile.role})
                </span>
              </span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* サイドバー + メインコンテンツ */}
      <div className="flex flex-1">
        <AdminSidebar profile={profile as Profile | null} />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
