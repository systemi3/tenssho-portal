'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Profile, Role } from '@/types'

type MenuItem = {
  label: string
  href: string
  roles: Role[] | 'all'
}

const menuItems: MenuItem[] = [
  { label: 'ダッシュボード',      href: '/admin',                  roles: 'all' },
  { label: 'ビル状態',            href: '/admin/buildings',         roles: 'all' },
  { label: '掲示板',              href: '/admin/board',             roles: 'all' },
  { label: 'ユーザー一覧',        href: '/admin/users',             roles: 'all' },
  { label: 'AI予測',              href: '/admin/ai',                roles: ['admin_a', 'admin_b', 'admin_c', 'chairman'] },
  { label: 'レポート',            href: '/admin/reports',           roles: ['admin_a', 'admin_b', 'chairman'] },
  { label: 'ユーザー管理',        href: '/admin/user-management',   roles: ['admin_a'] },
  { label: 'お知らせ配信',        href: '/admin/notifications',     roles: ['admin_a', 'chairman'] },
]

export default function AdminSidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const role = profile?.role

  const visibleItems = menuItems.filter((item) =>
    item.roles === 'all' || (role && (item.roles as Role[]).includes(role))
  )

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex-shrink-0 min-h-full">
      <nav className="py-3">
        {visibleItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
