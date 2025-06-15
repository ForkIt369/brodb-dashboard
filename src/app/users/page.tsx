'use client'

export const dynamic = "force-dynamic"

import { useEffect, useState, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { AdvancedDataTable } from '@/components/AdvancedDataTable'
import Avatar from '@/components/Avatar'
import { format, formatDistanceToNow, subDays, subWeeks, subMonths } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { 
  Calendar, TrendingUp, Zap, Users, Shield, AlertTriangle, 
  Globe, Smartphone, Clock, Award, DollarSign, UserCheck,
  BarChart3, Activity, Target, Link2, Hash, Mail, Send,
  Tag, Ban, CheckCircle, XCircle, ChevronRight, Download
} from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { 
  ExtendedUser, UserFilters, defaultColumnVisibility, 
  BulkAction, UserDetails 
} from '@/types/users'
import { Tables } from '@/types/database'
import { UserDetailsPanel } from '@/components/UserDetailsPanel'

// Dummy data generator for missing fields (will be replaced with real data)
function generateDummyData(user: any): ExtendedUser {
  const bits = user.user_tiers?.bits_earned || 0
  const level = user.user_tiers?.smart_bro_level || 0
  
  return {
    ...user,
    // Activity data
    total_sessions: Math.floor(Math.random() * 1000) + 1,
    play_time_minutes: Math.floor(Math.random() * 10000) + 60,
    streak_days: Math.floor(Math.random() * 30),
    
    // Referral data
    referrer_username: user.referrer_id ? `user_${user.referrer_id.slice(-6)}` : null,
    referral_earnings: Math.floor(bits * 0.1),
    l2_referrals: Math.floor(user.total_referrals * 0.3),
    l2_earnings: Math.floor(bits * 0.05),
    
    // Financial data
    total_earnings: bits,
    daily_avg_earnings: Math.floor(bits / 30),
    weekly_avg_earnings: Math.floor(bits / 4),
    monthly_total_earnings: bits,
    boost_earnings: user.user_tiers?.brofit_bits_earned || 0,
    brofit_earnings: user.user_tiers?.l2_brofit_bits_earned || 0,
    
    // Status data
    account_status: Math.random() > 0.95 ? 'inactive' : 'active',
    verification_status: Math.random() > 0.7 ? 'verified' : 'unverified',
    risk_score: Math.floor(Math.random() * 100),
    
    // Metadata
    last_ip_country: ['US', 'UK', 'IN', 'BR', 'NG', 'ID', 'PH', 'VN'][Math.floor(Math.random() * 8)],
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    device_type: ['iOS', 'Android', 'Web'][Math.floor(Math.random() * 3)],
    
    // Computed fields
    xp_progress: Math.floor((bits % 1000) / 10),
    user_segment: bits > 10000 ? 'whale' : bits > 5000 ? 'shark' : bits > 1000 ? 'fish' : 'plankton',
    lifetime_value: bits * 0.001, // Dummy LTV calculation
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<ExtendedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<UserFilters>({
    createdDateRange: [null, null],
    lastActiveDateRange: [null, null],
    levelRange: { min: 0, max: 10 },
    bitsRange: { min: 0, max: 10000000 },
    earningsRange: { min: 0, max: 1000000 },
    referralsRange: { min: 0, max: 1000 },
    riskScoreRange: { min: 0, max: 100 },
    segments: [],
    accountStatuses: [],
    verificationStatuses: [],
    countries: [],
    globalSearch: '',
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState(defaultColumnVisibility)

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    newThisWeek: 0,
    avgLevel: 0,
    totalRevenue: 0,
    avgLTV: 0,
    verificationRate: 0,
    avgRiskScore: 0,
  })

  useEffect(() => {
    loadUsers()
    loadStats()
  }, [])

  async function loadUsers() {
    try {
      console.log('Loading users with extended data...')
      
      // First get users with their tiers
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          user_tiers (*),
          referrals!referrals_referrer_id_fkey (
            referred_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1000)

      if (userError) {
        console.error('Error fetching users:', userError)
        throw userError
      }
      
      console.log('Users data fetched:', userData?.length || 0, 'users')

      // Get last active data from raw_earnings
      const { data: activityData, error: activityError } = await supabase
        .from('raw_earnings')
        .select('telegram_id, earned_at')
        .order('earned_at', { ascending: false })
        
      if (activityError) {
        console.error('Error fetching activity data:', activityError)
      }

      // Get referral counts
      const { data: referralCounts, error: referralError } = await supabase
        .rpc('get_all_referral_counts', { user_id: '' })
        
      if (referralError) {
        console.error('Error fetching referral counts:', referralError)
      }

      // Group by telegram_id to get last active
      const lastActiveMap = new Map<string, string>()
      activityData?.forEach(record => {
        if (!lastActiveMap.has(record.telegram_id)) {
          lastActiveMap.set(record.telegram_id, record.earned_at)
        }
      })

      // Process and enrich users
      const enrichedUsers = userData?.map(user => {
        const extendedUser = generateDummyData({
          ...user,
          last_active: lastActiveMap.get(user.telegram_id) || null,
          total_referrals: user.referrals?.length || 0,
        })
        return extendedUser
      }) || []

      console.log('Users enriched successfully:', enrichedUsers.length)
      setUsers(enrichedUsers)
      setLoading(false)
    } catch (error) {
      console.error('Error loading users:', error)
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      console.log('Loading user stats...')
      
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

      // Average level and other metrics
      const { data: tierData } = await supabase
        .from('user_tiers')
        .select('smart_bro_level, bits_earned')

      const avgLevel = tierData?.length 
        ? tierData.reduce((sum, t) => sum + (t.smart_bro_level || 0), 0) / tierData.length
        : 0

      const totalRevenue = tierData?.reduce((sum, t) => sum + (t.bits_earned || 0), 0) || 0

      const stats = {
        totalUsers: totalCount || 0,
        activeToday,
        newThisWeek: newCount || 0,
        avgLevel: Math.round(avgLevel * 10) / 10,
        totalRevenue: Math.round(totalRevenue * 0.001), // Convert to dollars
        avgLTV: totalCount ? Math.round(totalRevenue * 0.001 / totalCount) : 0,
        verificationRate: 73, // Dummy data
        avgRiskScore: 24, // Dummy data
      }
      
      console.log('User stats loaded:', stats)
      setStats(stats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // Filter users based on all filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Created date range filter
      if (filters.createdDateRange[0] && filters.createdDateRange[1]) {
        const userDate = user.created_at ? new Date(user.created_at) : null
        if (!userDate || userDate < filters.createdDateRange[0] || userDate > filters.createdDateRange[1]) {
          return false
        }
      }

      // Last active date range filter
      if (filters.lastActiveDateRange[0] && filters.lastActiveDateRange[1]) {
        const lastActive = user.last_active ? new Date(user.last_active) : null
        if (!lastActive || lastActive < filters.lastActiveDateRange[0] || lastActive > filters.lastActiveDateRange[1]) {
          return false
        }
      }

      // Level filter
      const level = user.user_tiers?.smart_bro_level || 0
      if (level < filters.levelRange.min || level > filters.levelRange.max) {
        return false
      }

      // Bits filter
      const bits = user.user_tiers?.bits_earned || 0
      if (bits < filters.bitsRange.min || bits > filters.bitsRange.max) {
        return false
      }

      // Earnings filter
      if (user.total_earnings < filters.earningsRange.min || user.total_earnings > filters.earningsRange.max) {
        return false
      }

      // Referrals filter
      if (user.total_referrals < filters.referralsRange.min || user.total_referrals > filters.referralsRange.max) {
        return false
      }

      // Risk score filter
      if (user.risk_score < filters.riskScoreRange.min || user.risk_score > filters.riskScoreRange.max) {
        return false
      }

      // Segment filter
      if (filters.segments.length > 0 && !filters.segments.includes(user.user_segment)) {
        return false
      }

      // Account status filter
      if (filters.accountStatuses.length > 0 && !filters.accountStatuses.includes(user.account_status)) {
        return false
      }

      // Verification status filter
      if (filters.verificationStatuses.length > 0 && !filters.verificationStatuses.includes(user.verification_status)) {
        return false
      }

      // Country filter
      if (filters.countries.length > 0 && user.last_ip_country && !filters.countries.includes(user.last_ip_country)) {
        return false
      }

      return true
    })
  }, [users, filters])

  // Handle bulk actions
  const handleBulkAction = useCallback((action: BulkAction, selectedUsers: ExtendedUser[]) => {
    console.log('Bulk action:', action, 'on', selectedUsers.length, 'users')
    
    switch (action.type) {
      case 'export':
        // Export logic would go here
        alert(`Exporting ${selectedUsers.length} users as ${action.format}`)
        break
      case 'message':
        alert(`Sending message to ${selectedUsers.length} users`)
        break
      case 'updateStatus':
        alert(`Updating status to ${action.status} for ${selectedUsers.length} users`)
        break
      case 'addTag':
        alert(`Adding tag "${action.tag}" to ${selectedUsers.length} users`)
        break
      default:
        break
    }
  }, [])

  // Column definitions with all 20+ columns
  const columns: ColumnDef<ExtendedUser>[] = [
    // Basic Info
    {
      id: 'avatar',
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
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {row.original.telegram_id}
            </div>
          </div>
        </div>
      ),
      size: 250,
    },
    
    // Tier Info
    {
      id: 'level',
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
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${levelClass}`}>
              {smartLevel}/{synergyLevel}
            </span>
            <Award className="w-4 h-4 text-gray-400" />
          </div>
        )
      },
      size: 120,
    },
    
    {
      id: 'bits_earned',
      accessorKey: 'user_tiers.bits_earned',
      header: 'Bits Earned',
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
      size: 120,
    },
    
    {
      id: 'xp_progress',
      accessorKey: 'xp_progress',
      header: 'XP Progress',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-bro-500 to-bro-600 transition-all"
              style={{ width: `${row.original.xp_progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{row.original.xp_progress}%</span>
        </div>
      ),
      size: 150,
    },
    
    {
      id: 'boost_multiplier',
      accessorKey: 'user_tiers.boost_multiplier',
      header: 'Boost',
      cell: ({ row }) => (
        <span className="text-bro-500 font-medium flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {(row.original.user_tiers?.boost_multiplier || 1).toFixed(1)}x
        </span>
      ),
      size: 80,
    },
    
    // Activity Info
    {
      id: 'last_active',
      accessorKey: 'last_active',
      header: 'Last Active',
      cell: ({ row }) => {
        const lastActive = row.original.last_active
        if (!lastActive) return <span className="text-gray-500">Never</span>
        
        const date = new Date(lastActive)
        const now = new Date()
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
        
        if (diffHours < 24) {
          return <span className="text-green-500 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {diffHours}h ago
          </span>
        } else if (diffHours < 168) {
          return <span className="text-yellow-500">{Math.floor(diffHours / 24)}d ago</span>
        } else {
          return <span className="text-gray-500">{format(date, 'MMM d')}</span>
        }
      },
      size: 120,
    },
    
    {
      id: 'total_sessions',
      accessorKey: 'total_sessions',
      header: 'Sessions',
      cell: ({ row }) => (
        <span className="flex items-center gap-1">
          <BarChart3 className="w-3 h-3 text-gray-400" />
          {row.original.total_sessions.toLocaleString()}
        </span>
      ),
      size: 100,
    },
    
    {
      id: 'play_time',
      accessorKey: 'play_time_minutes',
      header: 'Play Time',
      cell: ({ row }) => {
        const minutes = row.original.play_time_minutes
        const hours = Math.floor(minutes / 60)
        return (
          <span className="flex items-center gap-1 text-sm">
            <Clock className="w-3 h-3 text-gray-400" />
            {hours}h {minutes % 60}m
          </span>
        )
      },
      size: 100,
    },
    
    {
      id: 'streak_days',
      accessorKey: 'streak_days',
      header: 'Streak',
      cell: ({ row }) => (
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3 text-orange-400" />
          {row.original.streak_days}d
        </span>
      ),
      size: 80,
    },
    
    // Referral Info
    {
      id: 'referrer',
      accessorKey: 'referrer_username',
      header: 'Referrer',
      cell: ({ row }) => (
        row.original.referrer_username ? (
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <Link2 className="w-3 h-3" />
            {row.original.referrer_username}
          </span>
        ) : <span className="text-gray-500">None</span>
      ),
      size: 120,
    },
    
    {
      id: 'total_referrals',
      accessorKey: 'total_referrals',
      header: 'Referrals',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="w-3 h-3 text-gray-400" />
          <span>{row.original.total_referrals}</span>
          {row.original.l2_referrals > 0 && (
            <span className="text-xs text-gray-500">(+{row.original.l2_referrals} L2)</span>
          )}
        </div>
      ),
      size: 120,
    },
    
    {
      id: 'referral_earnings',
      accessorKey: 'referral_earnings',
      header: 'Ref Earnings',
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.referral_earnings.toLocaleString()}
        </span>
      ),
      size: 120,
    },
    
    // Financial Info
    {
      id: 'total_earnings',
      accessorKey: 'total_earnings',
      header: 'Total Earnings',
      cell: ({ row }) => (
        <span className="font-medium flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-green-500" />
          {row.original.total_earnings.toLocaleString()}
        </span>
      ),
      size: 130,
    },
    
    {
      id: 'daily_avg',
      accessorKey: 'daily_avg_earnings',
      header: 'Daily Avg',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.daily_avg_earnings.toLocaleString()}
        </span>
      ),
      size: 100,
    },
    
    {
      id: 'weekly_avg',
      accessorKey: 'weekly_avg_earnings',
      header: 'Weekly Avg',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.weekly_avg_earnings.toLocaleString()}
        </span>
      ),
      size: 100,
    },
    
    {
      id: 'monthly_total',
      accessorKey: 'monthly_total_earnings',
      header: 'Monthly Total',
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.monthly_total_earnings.toLocaleString()}
        </span>
      ),
      size: 120,
    },
    
    // Status Info
    {
      id: 'account_status',
      accessorKey: 'account_status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.account_status
        const statusConfig = {
          active: { color: 'text-green-500', icon: CheckCircle },
          inactive: { color: 'text-gray-500', icon: XCircle },
          suspended: { color: 'text-yellow-500', icon: AlertTriangle },
          banned: { color: 'text-red-500', icon: Ban },
        }
        const config = statusConfig[status] || statusConfig.active
        const Icon = config.icon
        
        return (
          <span className={`flex items-center gap-1 text-sm ${config.color}`}>
            <Icon className="w-3 h-3" />
            {status}
          </span>
        )
      },
      size: 100,
    },
    
    {
      id: 'verification_status',
      accessorKey: 'verification_status',
      header: 'Verification',
      cell: ({ row }) => {
        const status = row.original.verification_status
        const statusColors = {
          verified: 'text-green-500 bg-green-500/10',
          pending: 'text-yellow-500 bg-yellow-500/10',
          unverified: 'text-gray-500 bg-gray-500/10',
          rejected: 'text-red-500 bg-red-500/10',
        }
        
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || statusColors.unverified}`}>
            <UserCheck className="w-3 h-3 mr-1" />
            {status}
          </span>
        )
      },
      size: 120,
    },
    
    {
      id: 'risk_score',
      accessorKey: 'risk_score',
      header: 'Risk Score',
      cell: ({ row }) => {
        const score = row.original.risk_score
        const color = score > 70 ? 'text-red-500' : score > 40 ? 'text-yellow-500' : 'text-green-500'
        
        return (
          <div className="flex items-center gap-2">
            <Shield className={`w-3 h-3 ${color}`} />
            <span className={`font-medium ${color}`}>{score}</span>
          </div>
        )
      },
      size: 100,
    },
    
    // Metadata
    {
      id: 'created_date',
      accessorKey: 'created_at',
      header: 'Joined',
      cell: ({ row }) => (
        <span className="text-sm text-gray-400">
          {row.original.created_at ? format(new Date(row.original.created_at), 'MMM d, yyyy') : 'N/A'}
        </span>
      ),
      size: 120,
    },
    
    {
      id: 'last_updated',
      accessorKey: 'updated_at',
      header: 'Updated',
      cell: ({ row }) => (
        <span className="text-sm text-gray-400">
          {row.original.updated_at ? formatDistanceToNow(new Date(row.original.updated_at), { addSuffix: true }) : 'N/A'}
        </span>
      ),
      size: 120,
    },
    
    {
      id: 'ip_country',
      accessorKey: 'last_ip_country',
      header: 'Country',
      cell: ({ row }) => (
        row.original.last_ip_country ? (
          <span className="flex items-center gap-1 text-sm">
            <Globe className="w-3 h-3 text-gray-400" />
            {row.original.last_ip_country}
          </span>
        ) : <span className="text-gray-500">Unknown</span>
      ),
      size: 100,
    },
    
    {
      id: 'device_type',
      accessorKey: 'device_type',
      header: 'Device',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-sm">
          <Smartphone className="w-3 h-3 text-gray-400" />
          {row.original.device_type || 'Unknown'}
        </span>
      ),
      size: 100,
    },
    
    // Actions
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => {
            setSelectedUser(row.original)
            setShowUserDetails(true)
          }}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      ),
      size: 50,
    },
  ]

  // Apply column visibility
  const visibleColumns = columns.filter(col => {
    const colId = col.id || (col as any).accessorKey
    if (!colId || colId === 'actions') return true
    return columnVisibility[colId as keyof typeof columnVisibility] !== false
  })

  // Custom filters component
  const customFilters = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Ranges */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Join Date Range</label>
          <DatePicker
            selectsRange
            startDate={filters.createdDateRange[0]}
            endDate={filters.createdDateRange[1]}
            onChange={(update) => setFilters({ ...filters, createdDateRange: update as [Date | null, Date | null] })}
            placeholderText="Select date range"
            className="w-full px-3 py-2 bg-dark-tertiary border border-white/10 rounded-lg text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Last Active Range</label>
          <DatePicker
            selectsRange
            startDate={filters.lastActiveDateRange[0]}
            endDate={filters.lastActiveDateRange[1]}
            onChange={(update) => setFilters({ ...filters, lastActiveDateRange: update as [Date | null, Date | null] })}
            placeholderText="Select date range"
            className="w-full px-3 py-2 bg-dark-tertiary border border-white/10 rounded-lg text-sm"
          />
        </div>

        {/* Numeric Ranges */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Level Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="10"
              value={filters.levelRange.min}
              onChange={(e) => setFilters({ ...filters, levelRange: { ...filters.levelRange, min: Number(e.target.value) } })}
              className="w-20 px-2 py-1 bg-dark-tertiary border border-white/10 rounded text-sm"
              placeholder="Min"
            />
            <span>-</span>
            <input
              type="number"
              min="0"
              max="10"
              value={filters.levelRange.max}
              onChange={(e) => setFilters({ ...filters, levelRange: { ...filters.levelRange, max: Number(e.target.value) } })}
              className="w-20 px-2 py-1 bg-dark-tertiary border border-white/10 rounded text-sm"
              placeholder="Max"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Bits Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={filters.bitsRange.min}
              onChange={(e) => setFilters({ ...filters, bitsRange: { ...filters.bitsRange, min: Number(e.target.value) } })}
              className="w-24 px-2 py-1 bg-dark-tertiary border border-white/10 rounded text-sm"
              placeholder="Min"
            />
            <span>-</span>
            <input
              type="number"
              min="0"
              value={filters.bitsRange.max}
              onChange={(e) => setFilters({ ...filters, bitsRange: { ...filters.bitsRange, max: Number(e.target.value) } })}
              className="w-24 px-2 py-1 bg-dark-tertiary border border-white/10 rounded text-sm"
              placeholder="Max"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Earnings Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={filters.earningsRange.min}
              onChange={(e) => setFilters({ ...filters, earningsRange: { ...filters.earningsRange, min: Number(e.target.value) } })}
              className="w-24 px-2 py-1 bg-dark-tertiary border border-white/10 rounded text-sm"
              placeholder="Min"
            />
            <span>-</span>
            <input
              type="number"
              min="0"
              value={filters.earningsRange.max}
              onChange={(e) => setFilters({ ...filters, earningsRange: { ...filters.earningsRange, max: Number(e.target.value) } })}
              className="w-24 px-2 py-1 bg-dark-tertiary border border-white/10 rounded text-sm"
              placeholder="Max"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Risk Score Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={filters.riskScoreRange.min}
              onChange={(e) => setFilters({ ...filters, riskScoreRange: { ...filters.riskScoreRange, min: Number(e.target.value) } })}
              className="w-20 px-2 py-1 bg-dark-tertiary border border-white/10 rounded text-sm"
              placeholder="Min"
            />
            <span>-</span>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.riskScoreRange.max}
              onChange={(e) => setFilters({ ...filters, riskScoreRange: { ...filters.riskScoreRange, max: Number(e.target.value) } })}
              className="w-20 px-2 py-1 bg-dark-tertiary border border-white/10 rounded text-sm"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Multi-select filters */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">User Segments</label>
          <div className="space-y-1">
            {['whale', 'shark', 'fish', 'plankton'].map(segment => (
              <label key={segment} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.segments.includes(segment)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters({ ...filters, segments: [...filters.segments, segment] })
                    } else {
                      setFilters({ ...filters, segments: filters.segments.filter(s => s !== segment) })
                    }
                  }}
                  className="rounded border-gray-600 bg-transparent"
                />
                <span className="text-sm capitalize">{segment}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Account Status</label>
          <div className="space-y-1">
            {['active', 'inactive', 'suspended', 'banned'].map(status => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.accountStatuses.includes(status)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters({ ...filters, accountStatuses: [...filters.accountStatuses, status] })
                    } else {
                      setFilters({ ...filters, accountStatuses: filters.accountStatuses.filter(s => s !== status) })
                    }
                  }}
                  className="rounded border-gray-600 bg-transparent"
                />
                <span className="text-sm capitalize">{status}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          onClick={() => {
            setFilters({
              createdDateRange: [null, null],
              lastActiveDateRange: [null, null],
              levelRange: { min: 0, max: 10 },
              bitsRange: { min: 0, max: 10000000 },
              earningsRange: { min: 0, max: 1000000 },
              referralsRange: { min: 0, max: 1000 },
              riskScoreRange: { min: 0, max: 100 },
              segments: [],
              accountStatuses: [],
              verificationStatuses: [],
              countries: [],
              globalSearch: '',
            })
          }}
          className="px-4 py-2 bg-dark-tertiary border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  )

  // Bulk actions configuration
  const bulkActions = [
    {
      label: 'Export Selected',
      icon: <Download className="w-4 h-4" />,
      onClick: (selectedRows: ExtendedUser[]) => {
        handleBulkAction({ type: 'export', format: 'csv' }, selectedRows)
      },
    },
    {
      label: 'Send Message',
      icon: <Send className="w-4 h-4" />,
      onClick: (selectedRows: ExtendedUser[]) => {
        handleBulkAction({ type: 'message', template: 'default' }, selectedRows)
      },
    },
    {
      label: 'Add Tag',
      icon: <Tag className="w-4 h-4" />,
      onClick: (selectedRows: ExtendedUser[]) => {
        const tag = prompt('Enter tag name:')
        if (tag) {
          handleBulkAction({ type: 'addTag', tag }, selectedRows)
        }
      },
    },
    {
      label: 'Suspend',
      icon: <Ban className="w-4 h-4" />,
      onClick: (selectedRows: ExtendedUser[]) => {
        if (confirm(`Suspend ${selectedRows.length} users?`)) {
          handleBulkAction({ type: 'suspend', reason: 'Manual suspension' }, selectedRows)
        }
      },
      variant: 'danger' as const,
    },
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-white/10 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
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
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {filteredUsers.length} of {users.length} users
          </span>
        </div>
      </div>

      {/* Stats Cards - 2 rows of 4 */}
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
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">New This Week</p>
              <p className="text-2xl font-bold mt-1">{stats.newThisWeek.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-w3dv-blue" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Level</p>
              <p className="text-2xl font-bold mt-1">{stats.avgLevel}</p>
            </div>
            <Award className="w-8 h-8 text-w3dv-orange" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg LTV</p>
              <p className="text-2xl font-bold mt-1">${stats.avgLTV}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Verification Rate</p>
              <p className="text-2xl font-bold mt-1">{stats.verificationRate}%</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Risk Score</p>
              <p className="text-2xl font-bold mt-1">{stats.avgRiskScore}</p>
            </div>
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Advanced Data Table */}
      <AdvancedDataTable
        columns={visibleColumns}
        data={filteredUsers}
        exportFilename="bro-users"
        enableRowSelection
        persistPreferences
        preferencesKey="users-table"
        bulkActions={bulkActions}
        customFilters={customFilters}
        searchPlaceholder="Search by username, telegram ID, country..."
      />

      {/* User Details Panel */}
      {showUserDetails && selectedUser && (
        <UserDetailsPanel
          user={selectedUser}
          onClose={() => {
            setShowUserDetails(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}