'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import MetricsGrid from '@/components/MetricsGrid'
import UserSegments from '@/components/UserSegments'
import ActivityChart from '@/components/ActivityChart'
import UsersTable from '@/components/UsersTable'

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalBits: 0,
    activeUsers: 0,
    totalReferrals: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      // Load metrics
      const [usersCount, bitsData, referralsCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('user_tiers').select('bits_earned'),
        supabase.from('referrals').select('*', { count: 'exact', head: true }),
      ])

      const totalBits = bitsData.data?.reduce((sum, row) => sum + (row.bits_earned || 0), 0) || 0

      // Active users (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { data: activeData } = await supabase
        .from('raw_earnings')
        .select('telegram_id')
        .gte('earned_at', sevenDaysAgo.toISOString())
        .limit(1000)

      const activeUsers = new Set(activeData?.map(r => r.telegram_id) || []).size

      setMetrics({
        totalUsers: usersCount.count || 0,
        totalBits: totalBits,
        activeUsers: activeUsers,
        totalReferrals: referralsCount.count || 0,
      })

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2">Welcome to your BRO Admin Dashboard</p>
      </header>

      <div className="space-y-6">
        <MetricsGrid metrics={metrics} loading={loading} />
        <UserSegments />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityChart />
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
            <UsersTable limit={5} />
          </div>
        </div>
      </div>
    </div>
  )
}