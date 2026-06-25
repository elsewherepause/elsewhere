'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/actions/auth.actions'

const links = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/projects', label: 'Projects', exact: false },
  { href: '/admin/gallery', label: 'Gallery', exact: false },
  { href: '/admin/notes', label: 'Notes', exact: false },
  { href: '/admin/media', label: 'Media', exact: false },
  { href: '/admin/settings', label: 'Settings', exact: false },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="w-52 flex-shrink-0 bg-[var(--color-admin-sidebar)] text-[var(--color-admin-sidebar-text)] flex flex-col">
      <div className="px-5 py-6 border-b border-white/10">
        <Link
          href="/"
          target="_blank"
          className="text-white text-sm font-medium tracking-tight hover:opacity-70 transition-opacity"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          .elsewhere
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href) && !(exact && pathname !== href)
          return (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 text-sm rounded transition-colors ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-[var(--color-admin-sidebar-text)] hover:bg-white/5 hover:text-white'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <form action={logout}>
          <button
            type="submit"
            className="w-full text-left px-3 py-2 text-sm text-[var(--color-admin-sidebar-text)] hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
