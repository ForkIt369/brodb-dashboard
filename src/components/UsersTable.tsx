'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/types/database'
import Avatar from '@/components/Avatar'

interface UsersTableProps {
  limit?: number
}

type UserWithTiers = Tables<'users'> & {
  user_tiers: Tables<'user_tiers'> | null
}

export default function UsersTable({ limit }: UsersTableProps) {
  const [users, setUsers] = useState<UserWithTiers[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = limit || 50

  useEffect(() => {
    loadUsers()
  }, [page])

  async function loadUsers() {
    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_tiers (*)
        `)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      setUsers(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading users:', error)
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toLocaleString()
  }

  const getLevelClass = (level: number) => {
    if (level >= 5) return 'bg-gradient-to-r from-bro-500 to-bro-600 text-white'
    if (level >= 4) return 'border border-bro-500 text-bro-500'
    if (level >= 2) return 'border border-w3dv-blue text-w3dv-blue'
    return 'border border-gray-500 text-gray-500'
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-white/10 rounded mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {limit ? 'Top Performers' : 'All Users'}
        </h2>
        {!limit && (
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 glass rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={users.length < pageSize}
              className="px-4 py-2 glass rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400 border-b border-white/10">
              <th className="pb-3 pr-4">User</th>
              <th className="pb-3 pr-4">Level</th>
              <th className="pb-3 pr-4">Total Bits</th>
              <th className="pb-3 pr-4">Boost</th>
              <th className="pb-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr 
                key={user.id} 
                className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
              >
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      username={user.username}
                      telegramId={user.telegram_id}
                      profilePicture={user.profile_picture}
                      size="md"
                    />
                    <div>
                      <div className="font-medium">{user.username || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{user.telegram_id}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getLevelClass(user.user_tiers?.smart_bro_level || 0)}`}>
                    {user.user_tiers?.smart_bro_level || 0}/{user.user_tiers?.synergy_bro_level || 0}
                  </span>
                </td>
                <td className="py-4 pr-4 font-medium">
                  {formatNumber(user.user_tiers?.bits_earned || 0)}
                </td>
                <td className="py-4 pr-4">
                  <span className="text-bro-500 font-medium">
                    {(user.user_tiers?.boost_multiplier || 1).toFixed(1)}x
                  </span>
                </td>
                <td className="py-4 text-sm text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}