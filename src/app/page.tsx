'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/types/database'
import Sidebar from '@/components/Sidebar'
import MetricsGrid from '@/components/MetricsGrid'
import UserSegments from '@/components/UserSegments'
import ActivityChart from '@/components/ActivityChart'
import UsersTable from '@/components/UsersTable'

export default function Dashboard() {
  const [currentView, setCurrentView] = useState('dashboard')
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
        .select('user_id')
        .gte('created_at', sevenDaysAgo.toISOString())
        .limit(1000)

      const activeUsers = new Set(activeData?.map(r => r.user_id) || []).size

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
    <div className="flex h-screen bg-dark-primary">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 overflow-y-auto">
        <header className="bg-dark-secondary border-b border-white/5 px-8 py-6">
          <h1 className="text-2xl font-semibold">
            {currentView === 'dashboard' && 'Dashboard Overview'}
            {currentView === 'users' && 'User Management'}
            {currentView === 'analytics' && 'Analytics'}
            {currentView === 'referrals' && 'Referral Network'}
          </h1>
        </header>

        <div className="p-8">
          {currentView === 'dashboard' && (
            <>
              <MetricsGrid metrics={metrics} loading={loading} />
              <UserSegments />
              <ActivityChart />
              <UsersTable limit={10} />
            </>
          )}
          
          {currentView === 'users' && (
            <UsersTable />
          )}
          
          {/* Other views to be implemented */}
        </div>
      </main>
    </div>
  )
}