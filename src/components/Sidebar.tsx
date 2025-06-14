'use client'

import { useState } from 'react'
import clsx from 'clsx'

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

const navigation = [
  { name: 'Dashboard', icon: '📊', view: 'dashboard' },
  { name: 'Users', icon: '👥', view: 'users' },
  { name: 'Analytics', icon: '📈', view: 'analytics' },
  { name: 'Referrals', icon: '🔗', view: 'referrals' },
  { name: 'Settings', icon: '⚙️', view: 'settings' },
]

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-dark-secondary border-r border-white/5">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-bro-500 to-bro-600 rounded-xl flex items-center justify-center text-xl font-bold">
            B
          </div>
          <span className="text-xl font-semibold tracking-wider text-bro-500">brodb</span>
        </div>
      </div>
      
      <nav className="p-4">
        {navigation.map((item) => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className={clsx(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
              currentView === item.view
                ? 'bg-bro-500/20 text-bro-500 border-l-2 border-bro-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}