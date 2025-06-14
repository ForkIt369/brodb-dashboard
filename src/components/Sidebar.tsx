'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', icon: '📊', href: '/' },
  { name: 'Users', icon: '👥', href: '/users' },
  { name: 'Analytics', icon: '📈', href: '/analytics' },
  { name: 'Referrals', icon: '🔗', href: '/referrals' },
  { name: 'Settings', icon: '⚙️', href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="w-64 bg-dark-secondary border-r border-white/5">
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-bro-500 to-bro-600 rounded-xl flex items-center justify-center text-xl font-bold">
            B
          </div>
          <span className="text-xl font-semibold tracking-wider text-bro-500">brodb</span>
        </Link>
      </div>
      
      <nav className="p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname === '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive
                  ? 'bg-bro-500/20 text-bro-500 border-l-2 border-bro-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}