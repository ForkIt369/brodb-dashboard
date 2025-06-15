'use client'

export const dynamic = "force-dynamic"

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
      console.log('Starting to load dashboard data...')
      
      // Load metrics
      const [usersCount, bitsData, referralsCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('user_tiers').select('bits_earned'),
        supabase.from('referrals').select('*', { count: 'exact', head: true }),
      ])
      
      console.log('Users count:', usersCount)
      console.log('Bits data:', bitsData)
      console.log('Referrals count:', referralsCount)

      // Check for errors
      if (usersCount.error) {
        console.error('Error fetching users count:', usersCount.error)
      }
      if (bitsData.error) {
        console.error('Error fetching bits data:', bitsData.error)
      }
      if (referralsCount.error) {
        console.error('Error fetching referrals count:', referralsCount.error)
      }

      const totalBits = bitsData.data?.reduce((sum, row) => sum + (row.bits_earned || 0), 0) || 0

      // Active users (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { data: activeData, error: activeError } = await supabase
        .from('raw_earnings')
        .select('telegram_id')
        .gte('earned_at', sevenDaysAgo.toISOString())
        .limit(1000)
        
      if (activeError) {
        console.error('Error fetching active users:', activeError)
      }
      console.log('Active users data:', activeData)

      const activeUsers = new Set(activeData?.map(r => r.telegram_id) || []).size

      setMetrics({
        totalUsers: usersCount.count || 0,
        totalBits: totalBits,
        activeUsers: activeUsers,
        totalReferrals: referralsCount.count || 0,
      })
      
      console.log('Dashboard metrics loaded successfully')
      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
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