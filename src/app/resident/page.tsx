import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

export default async function ResidentPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">天</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                天翔ビルディング
              </h1>
              <p className="text-xs text-gray-500">入居者ポータル</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <span className="text-sm text-gray-600">
                {profile.name}
                {profile.room_no && (
                  <span className="ml-1.5 text-xs text-gray-400">
                    {profile.room_no}号室
                  </span>
                )}
              </span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">メニュー</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/resident/board"
            className="group bg-white rounded-xl border border-gray-200 shadow-sm p-5
                       hover:shadow-md hover:border-emerald-300 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  掲示板
                </p>
                <p className="text-xs text-gray-400 mt-0.5">スレッドを確認・投稿する</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 transition-colors"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/resident/buildings"
            className="group bg-white rounded-xl border border-gray-200 shadow-sm p-5
                       hover:shadow-md hover:border-emerald-300 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  ビル状態
                </p>
                <p className="text-xs text-gray-400 mt-0.5">設備・清掃などの現在の状態を確認する</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 transition-colors"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/resident/notifications"
            className="group bg-white rounded-xl border border-gray-200 shadow-sm p-5
                       hover:shadow-md hover:border-emerald-300 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  お知らせ
                </p>
                <p className="text-xs text-gray-400 mt-0.5">管理者からのお知らせを確認する</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 transition-colors"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
