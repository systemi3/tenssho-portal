'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600
                 hover:bg-gray-50 hover:text-gray-900 transition-colors"
    >
      ログアウト
    </button>
  )
}
