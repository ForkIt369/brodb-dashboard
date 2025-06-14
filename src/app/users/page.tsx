'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/types/database'
import { DataTable } from '@/components/DataTable'
import Avatar from '@/components/Avatar'
import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { Calendar, TrendingUp, Zap, Users, Filter } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

type UserWithTiers = Pick<Tables<'users'>, 'telegram_id' | 'username' | 'profile_picture' | 'created_at'> & {
  user_tiers: Tables<'user_tiers'> | null
  last_active?: string | null
  total_referrals?: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithTiers[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  
  // Advanced filters
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [levelFilter, setLevelFilter] = useState<{ min: number; max: number }>({ min: 0, max: 10 })
  const [bitsFilter, setBitsFilter] = useState<{ min: number; max: number }>({ min: 0, max: 1000000 })
  const [segmentFilter, setSegmentFilter] = useState<string[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    newThisWeek: 0,
    avgLevel: 0,
  })

  useEffect(() => {
    loadUsers()
    loadStats()
  }, [])

  async function loadUsers() {
    try {
      // First get users with their tiers
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          telegram_id,
          username,
          profile_picture,
          created_at,
          user_tiers (*)
        `)
        .order('created_at', { ascending: false })

      if (userError) throw userError

      // Get last active data from raw_earnings
      const { data: activityData } = await supabase
        .from('raw_earnings')
        .select('telegram_id, earned_at')
        .order('earned_at', { ascending: false })

      // Group by telegram_id to get last active
      const lastActiveMap = new Map<string, string>()
      activityData?.forEach(record => {
        if (!lastActiveMap.has(record.telegram_id)) {
          lastActiveMap.set(record.telegram_id, record.earned_at)
        }
      })

      // Merge data
      const enrichedUsers = userData?.map(user => ({
        ...user,
        last_active: lastActiveMap.get(user.telegram_id) || null,
        total_referrals: 0, // TODO: Add referral count when available
      })) || []

      setUsers(enrichedUsers)
      setLoading(false)
    } catch (error) {
      console.error('Error loading users:', error)
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      const now = new Date()
      const todayStart = new Date(now.setHours(0, 0, 0, 0))
      const weekAgo = new Date(now.setDate(now.getDate() - 7))

      // Total users
      const { count: totalCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Active today
      const { data: activeData } = await supabase
        .from('raw_earnings')
        .select('telegram_id')
        .gte('earned_at', todayStart.toISOString())

      const activeToday = new Set(activeData?.map(r => r.telegram_id) || []).size

      // New this week
      const { count: newCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())

      // Average level
      const { data: tierData } = await supabase
        .from('user_tiers')
        .select('smart_bro_level')

      const avgLevel = tierData?.length 
        ? tierData.reduce((sum, t) => sum + (t.smart_bro_level || 0), 0) / tierData.length
        : 0

      setStats({
        totalUsers: totalCount || 0,
        activeToday,
        newThisWeek: newCount || 0,
        avgLevel: Math.round(avgLevel * 10) / 10,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // Filter users based on advanced filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Date range filter
      if (dateRange[0] && dateRange[1]) {
        const userDate = user.created_at ? new Date(user.created_at) : null
        if (!userDate || userDate < dateRange[0] || userDate > dateRange[1]) {
          return false
        }
      }

      // Level filter
      const level = user.user_tiers?.smart_bro_level || 0
      if (level < levelFilter.min || level > levelFilter.max) {
        return false
      }

      // Bits filter
      const bits = user.user_tiers?.bits_earned || 0
      if (bits < bitsFilter.min || bits > bitsFilter.max) {
        return false
      }

      // Segment filter
      if (segmentFilter.length > 0) {
        const userSegment = getUserSegment(user)
        if (!segmentFilter.includes(userSegment)) {
          return false
        }
      }

      return true
    })
  }, [users, dateRange, levelFilter, bitsFilter, segmentFilter])

  function getUserSegment(user: UserWithTiers): string {
    const bits = user.user_tiers?.bits_earned || 0
    if (bits > 10000) return 'whale'
    if (bits > 5000) return 'shark'
    if (bits > 1000) return 'fish'
    return 'plankton'
  }

  const columns: ColumnDef<UserWithTiers>[] = [
    {
      accessorKey: 'username',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar
            username={row.original.username}
            telegramId={row.original.telegram_id}
            profilePicture={row.original.profile_picture}
            size="md"
          />
          <div>
            <div className="font-medium">{row.original.username || 'Unknown'}</div>
            <div className="text-sm text-gray-500">{row.original.telegram_id}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'user_tiers.smart_bro_level',
      header: 'Level',
      cell: ({ row }) => {
        const smartLevel = row.original.user_tiers?.smart_bro_level || 0
        const synergyLevel = row.original.user_tiers?.synergy_bro_level || 0
        const levelClass = smartLevel >= 5 
          ? 'bg-gradient-to-r from-bro-500 to-bro-600 text-white'
          : smartLevel >= 3 
          ? 'border border-bro-500 text-bro-500'
          : 'border border-gray-500 text-gray-500'
        
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${levelClass}`}>
            {smartLevel}/{synergyLevel}
          </span>
        )
      },
    },
    {
      accessorKey: 'user_tiers.bits_earned',
      header: 'Total Bits',
      cell: ({ row }) => {
        const bits = row.original.user_tiers?.bits_earned || 0
        return (
          <div className="font-medium">
            {bits >= 1000000 ? `${(bits / 1000000).toFixed(1)}M` 
            : bits >= 1000 ? `${(bits / 1000).toFixed(1)}K` 
            : bits.toLocaleString()}
          </div>
        )
      },
    },
    {
      accessorKey: 'user_tiers.boost_multiplier',
      header: 'Boost',
      cell: ({ row }) => (
        <span className="text-bro-500 font-medium flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {(row.original.user_tiers?.boost_multiplier || 1).toFixed(1)}x
        </span>
      ),
    },
    {
      accessorKey: 'last_active',
      header: 'Last Active',
      cell: ({ row }) => {
        const lastActive = row.original.last_active
        if (!lastActive) return <span className="text-gray-500">Never</span>
        
        const date = new Date(lastActive)
        const now = new Date()
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
        
        if (diffHours < 24) {
          return <span className="text-green-500">{diffHours}h ago</span>
        } else if (diffHours < 168) {
          return <span className="text-yellow-500">{Math.floor(diffHours / 24)}d ago</span>
        } else {
          return <span className="text-gray-500">{format(date, 'MMM d')}</span>
        }
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Joined',
      cell: ({ row }) => (
        <span className="text-sm text-gray-400">
          {row.original.created_at ? format(new Date(row.original.created_at), 'MMM d, yyyy') : 'N/A'}
        </span>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-white/10 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white/10 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="px-4 py-2 glass rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Advanced Filters
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-bro-500" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Today</p>
              <p className="text-2xl font-bold mt-1">{stats.activeToday.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">New This Week</p>
              <p className="text-2xl font-bold mt-1">{stats.newThisWeek.toLocaleString()}</p>
            </div>
            <Calendar className="w-8 h-8 text-w3dv-blue" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Level</p>
              <p className="text-2xl font-bold mt-1">{stats.avgLevel}</p>
            </div>
            <Zap className="w-8 h-8 text-w3dv-orange" />
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="glass rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Join Date Range</label>
              <DatePicker
                selectsRange
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={(update) => setDateRange(update as [Date | null, Date | null])}
                placeholderText="Select date range"
                className="w-full px-3 py-2 glass rounded-lg text-sm"
              />
            </div>

            {/* Level Range */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Level Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={levelFilter.min}
                  onChange={(e) => setLevelFilter({ ...levelFilter, min: Number(e.target.value) })}
                  className="w-20 px-2 py-1 glass rounded text-sm"
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={levelFilter.max}
                  onChange={(e) => setLevelFilter({ ...levelFilter, max: Number(e.target.value) })}
                  className="w-20 px-2 py-1 glass rounded text-sm"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Bits Range */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Bits Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={bitsFilter.min}
                  onChange={(e) => setBitsFilter({ ...bitsFilter, min: Number(e.target.value) })}
                  className="w-24 px-2 py-1 glass rounded text-sm"
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  min="0"
                  value={bitsFilter.max}
                  onChange={(e) => setBitsFilter({ ...bitsFilter, max: Number(e.target.value) })}
                  className="w-24 px-2 py-1 glass rounded text-sm"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Segment Filter */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">User Segments</label>
              <div className="space-y-1">
                {['whale', 'shark', 'fish', 'plankton'].map(segment => (
                  <label key={segment} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={segmentFilter.includes(segment)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSegmentFilter([...segmentFilter, segment])
                        } else {
                          setSegmentFilter(segmentFilter.filter(s => s !== segment))
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{segment}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => {
                setDateRange([null, null])
                setLevelFilter({ min: 0, max: 10 })
                setBitsFilter({ min: 0, max: 1000000 })
                setSegmentFilter([])
              }}
              className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        exportFilename="bro-users"
      />
    </div>
  )
}