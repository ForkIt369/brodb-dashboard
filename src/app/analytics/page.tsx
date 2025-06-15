'use client'

export const dynamic = "force-dynamic"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Users, Zap, Calendar, Activity, DollarSign } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface DailyMetric {
  date: string
  users: number
  activeUsers: number
  bits: number
  newUsers: number
}

interface SegmentData {
  name: string
  value: number
  color: string
}

interface RetentionData {
  cohort: string
  day1: number
  day7: number
  day30: number
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    subDays(new Date(), 30),
    new Date()
  ])
  
  // Metrics
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([])
  const [segmentData, setSegmentData] = useState<SegmentData[]>([])
  const [retentionData, setRetentionData] = useState<RetentionData[]>([])
  const [levelDistribution, setLevelDistribution] = useState<{ level: number; count: number }[]>([])
  
  // Summary stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    avgUserValue: 0,
    growthRate: 0,
    churnRate: 0,
    dau: 0,
    wau: 0,
    mau: 0,
    dauWauRatio: 0,
  })

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  async function loadAnalytics() {
    setLoading(true)
    try {
      console.log('Starting to load analytics...')
      
      await Promise.all([
        loadDailyMetrics(),
        loadSegmentData(),
        loadRetentionData(),
        loadLevelDistribution(),
        loadSummaryStats(),
      ])
      
      console.log('Analytics loaded successfully')
    } catch (error) {
      console.error('Error loading analytics:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadDailyMetrics() {
    try {
      console.log('Loading daily metrics...')
      
      const metrics: DailyMetric[] = []
      const start = startOfDay(dateRange[0])
      const end = endOfDay(dateRange[1])
      
      // Generate dates
      const dates = []
      let currentDate = new Date(start)
      while (currentDate <= end) {
        dates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }

      for (const date of dates) {
        const dayStart = startOfDay(date).toISOString()
        const dayEnd = endOfDay(date).toISOString()

        // Get new users for this day
        const { count: newUsers, error: newUsersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dayStart)
          .lt('created_at', dayEnd)
          
        if (newUsersError) {
          console.error('Error fetching new users for', date, newUsersError)
        }

        // Get active users for this day
        const { data: activeData, error: activeError } = await supabase
          .from('raw_earnings')
          .select('telegram_id')
          .gte('earned_at', dayStart)
          .lt('earned_at', dayEnd)
          
        if (activeError) {
          console.error('Error fetching active users for', date, activeError)
        }

        const activeUsers = new Set(activeData?.map(r => r.telegram_id) || []).size

        // Get bits earned for this day
        const { data: bitsData, error: bitsError } = await supabase
          .from('raw_earnings')
          .select('bits')
          .gte('earned_at', dayStart)
          .lt('earned_at', dayEnd)
          
        if (bitsError) {
          console.error('Error fetching bits for', date, bitsError)
        }

        const totalBits = bitsData?.reduce((sum, r) => sum + (r.bits || 0), 0) || 0

        // Get cumulative users up to this day
        const { count: totalUsers, error: totalError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', dayEnd)
          
        if (totalError) {
          console.error('Error fetching total users for', date, totalError)
        }

        metrics.push({
          date: format(date, 'MMM d'),
          users: totalUsers || 0,
          activeUsers,
          bits: totalBits,
          newUsers: newUsers || 0,
        })
      }

      console.log('Daily metrics loaded:', metrics.length, 'days')
      setDailyMetrics(metrics)
    } catch (error) {
      console.error('Error in loadDailyMetrics:', error)
      throw error
    }
  }

  async function loadSegmentData() {
    // Count users by segment
    const { data: tiersData } = await supabase
      .from('user_tiers')
      .select('bits_earned')

    const segments = {
      whale: 0,
      shark: 0,
      fish: 0,
      plankton: 0,
    }

    tiersData?.forEach(tier => {
      const bits = tier.bits_earned || 0
      if (bits > 10000) segments.whale++
      else if (bits > 5000) segments.shark++
      else if (bits > 1000) segments.fish++
      else segments.plankton++
    })

    setSegmentData([
      { name: 'Whales', value: segments.whale, color: '#FF6B6B' },
      { name: 'Sharks', value: segments.shark, color: '#4ECDC4' },
      { name: 'Fish', value: segments.fish, color: '#45B7D1' },
      { name: 'Plankton', value: segments.plankton, color: '#96CEB4' },
    ])
  }

  async function loadRetentionData() {
    // Calculate retention for weekly cohorts
    const cohorts: RetentionData[] = []
    
    for (let i = 0; i < 4; i++) {
      const cohortStart = subDays(new Date(), (i + 1) * 7)
      const cohortEnd = subDays(new Date(), i * 7)
      
      // Get users who joined in this cohort
      const { data: cohortUsers } = await supabase
        .from('users')
        .select('telegram_id')
        .gte('created_at', cohortStart.toISOString())
        .lt('created_at', cohortEnd.toISOString())

      const cohortUserIds = cohortUsers?.map(u => u.telegram_id) || []
      
      if (cohortUserIds.length > 0) {
        // Day 1 retention
        const day1Date = new Date(cohortEnd)
        day1Date.setDate(day1Date.getDate() + 1)
        const { data: day1Active } = await supabase
          .from('raw_earnings')
          .select('telegram_id')
          .in('telegram_id', cohortUserIds)
          .gte('earned_at', day1Date.toISOString())
          .lt('earned_at', new Date(day1Date.getTime() + 24 * 60 * 60 * 1000).toISOString())

        const day1Retention = ((new Set(day1Active?.map(r => r.telegram_id) || []).size / cohortUserIds.length) * 100)

        cohorts.push({
          cohort: `Week ${i + 1}`,
          day1: Math.round(day1Retention),
          day7: Math.round(day1Retention * 0.7), // Simulated for now
          day30: Math.round(day1Retention * 0.4), // Simulated for now
        })
      }
    }

    setRetentionData(cohorts)
  }

  async function loadLevelDistribution() {
    const { data } = await supabase
      .from('user_tiers')
      .select('smart_bro_level')

    const distribution = new Map<number, number>()
    
    data?.forEach(tier => {
      const level = tier.smart_bro_level || 0
      distribution.set(level, (distribution.get(level) || 0) + 1)
    })

    const levels = Array.from({ length: 11 }, (_, i) => ({
      level: i,
      count: distribution.get(i) || 0,
    }))

    setLevelDistribution(levels)
  }

  async function loadSummaryStats() {
    const now = new Date()
    const day1Ago = subDays(now, 1)
    const day7Ago = subDays(now, 7)
    const day30Ago = subDays(now, 30)

    // DAU
    const { data: dauData } = await supabase
      .from('raw_earnings')
      .select('telegram_id')
      .gte('earned_at', day1Ago.toISOString())
    const dau = new Set(dauData?.map(r => r.telegram_id) || []).size

    // WAU
    const { data: wauData } = await supabase
      .from('raw_earnings')
      .select('telegram_id')
      .gte('earned_at', day7Ago.toISOString())
    const wau = new Set(wauData?.map(r => r.telegram_id) || []).size

    // MAU
    const { data: mauData } = await supabase
      .from('raw_earnings')
      .select('telegram_id')
      .gte('earned_at', day30Ago.toISOString())
    const mau = new Set(mauData?.map(r => r.telegram_id) || []).size

    // Total revenue (bits)
    const { data: revenueData } = await supabase
      .from('raw_earnings')
      .select('bits')
    const totalRevenue = revenueData?.reduce((sum, r) => sum + (r.bits || 0), 0) || 0

    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Growth rate (new users this week vs last week)
    const { count: thisWeek } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', day7Ago.toISOString())

    const { count: lastWeek } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', subDays(now, 14).toISOString())
      .lt('created_at', day7Ago.toISOString())

    const growthRate = lastWeek ? ((thisWeek! - lastWeek) / lastWeek) * 100 : 0

    setStats({
      totalRevenue,
      avgUserValue: totalUsers ? totalRevenue / totalUsers : 0,
      growthRate,
      churnRate: 100 - (wau / mau) * 100, // Simplified churn
      dau,
      wau,
      mau,
      dauWauRatio: wau ? (dau / wau) * 100 : 0,
    })
  }

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#48DBFB']

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-2">
          <DatePicker
            selectsRange
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            onChange={(update) => setDateRange(update as [Date, Date])}
            className="px-4 py-2 glass rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">{(stats.totalRevenue / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-gray-500 mt-1">bits earned</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Growth Rate</p>
              <p className="text-2xl font-bold mt-1">
                {stats.growthRate > 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">week over week</p>
            </div>
            <TrendingUp className="w-8 h-8 text-bro-500" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">DAU/WAU</p>
              <p className="text-2xl font-bold mt-1">{stats.dauWauRatio.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">stickiness</p>
            </div>
            <Activity className="w-8 h-8 text-w3dv-blue" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg User Value</p>
              <p className="text-2xl font-bold mt-1">{(stats.avgUserValue / 1000).toFixed(1)}K</p>
              <p className="text-xs text-gray-500 mt-1">bits per user</p>
            </div>
            <Zap className="w-8 h-8 text-w3dv-orange" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">DAU</p>
              <p className="text-2xl font-bold mt-1">{stats.dau.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">daily active</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">WAU</p>
              <p className="text-2xl font-bold mt-1">{stats.wau.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">weekly active</p>
            </div>
            <Calendar className="w-8 h-8 text-w3dv-purple" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">MAU</p>
              <p className="text-2xl font-bold mt-1">{stats.mau.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">monthly active</p>
            </div>
            <Activity className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Churn Rate</p>
              <p className="text-2xl font-bold mt-1">{stats.churnRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">monthly</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-500 rotate-180" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#00D4FF"
                fill="#00D4FF"
                fillOpacity={0.3}
                name="Total Users"
              />
              <Area
                type="monotone"
                dataKey="newUsers"
                stroke="#FF9500"
                fill="#FF9500"
                fillOpacity={0.3}
                name="New Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Metrics */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="activeUsers"
                stroke="#30D158"
                strokeWidth={2}
                dot={false}
                name="Active Users"
              />
              <Line
                type="monotone"
                dataKey="bits"
                stroke="#9D4EDD"
                strokeWidth={2}
                dot={false}
                name="Bits Earned"
                yAxisId="right"
              />
              <YAxis yAxisId="right" orientation="right" stroke="#666" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Segments */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">User Segments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={segmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {segmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Level Distribution */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={levelDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="level" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#FF6B6B" name="Users">
                {levelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Retention Cohorts */}
        <div className="glass rounded-xl p-6 col-span-full">
          <h3 className="text-lg font-semibold mb-4">Retention Cohorts</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                  <th className="pb-3 pr-4">Cohort</th>
                  <th className="pb-3 pr-4">Size</th>
                  <th className="pb-3 pr-4">Day 1</th>
                  <th className="pb-3 pr-4">Day 7</th>
                  <th className="pb-3">Day 30</th>
                </tr>
              </thead>
              <tbody>
                {retentionData.map((cohort) => (
                  <tr key={cohort.cohort} className="border-b border-white/5">
                    <td className="py-3 pr-4">{cohort.cohort}</td>
                    <td className="py-3 pr-4">-</td>
                    <td className="py-3 pr-4">
                      <span className={`${cohort.day1 > 50 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {cohort.day1}%
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`${cohort.day7 > 30 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {cohort.day7}%
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`${cohort.day30 > 20 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {cohort.day30}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}