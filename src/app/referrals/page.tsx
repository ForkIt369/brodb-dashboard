'use client'

export const dynamic = "force-dynamic"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/types/database'
import Avatar from '@/components/Avatar'
import { format } from 'date-fns'
import { Users, TrendingUp, Zap, Gift, Link2, Share2, Trophy, DollarSign } from 'lucide-react'

interface ReferralUser extends Pick<Tables<'users'>, 'telegram_id' | 'username' | 'profile_picture' | 'created_at'> {
  user_tiers: Tables<'user_tiers'> | null
  total_referred: number
  total_earnings: number
  active_referrals: number
}

interface ReferralNetwork {
  referrer: ReferralUser
  referrals: Array<{
    user: ReferralUser
    referred_at: string
    earnings_generated: number
    is_active: boolean
  }>
}

interface ReferralStats {
  totalReferrers: number
  totalReferred: number
  totalReferralEarnings: number
  avgReferralsPerUser: number
  conversionRate: number
  viralCoefficient: number
  topReferrerEarnings: number
  activeReferralRate: number
}

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrers: 0,
    totalReferred: 0,
    totalReferralEarnings: 0,
    avgReferralsPerUser: 0,
    conversionRate: 0,
    viralCoefficient: 0,
    topReferrerEarnings: 0,
    activeReferralRate: 0,
  })
  const [topReferrers, setTopReferrers] = useState<ReferralUser[]>([])
  const [referralNetworks, setReferralNetworks] = useState<ReferralNetwork[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  useEffect(() => {
    loadReferralData()
  }, [])

  async function loadReferralData() {
    try {
      console.log('Starting to load referral data...')
      
      await Promise.all([
        loadReferralStats(),
        loadTopReferrers(),
        loadReferralNetworks(),
      ])
      
      console.log('Referral data loaded successfully')
    } catch (error) {
      console.error('Error loading referral data:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadReferralStats() {
    try {
      console.log('Loading referral stats...')
      
      // Get total referrers (users who have referred someone)
      const { count: referrerCount, error: referrerError } = await supabase
        .from('referrals')
        .select('referrer_id', { count: 'exact', head: true })
        
      if (referrerError) {
        console.error('Error fetching referrer count:', referrerError)
      }

      // Get total referred users
      const { count: referredCount, error: referredError } = await supabase
        .from('referrals')
        .select('referred_id', { count: 'exact', head: true })
        
      if (referredError) {
        console.error('Error fetching referred count:', referredError)
      }

      // Get total users with referrals_count > 0
      const { data: referralData, error: referralDataError } = await supabase
        .from('user_tiers')
        .select('referrals_count')
        .gt('referrals_count', 0)
        
      if (referralDataError) {
        console.error('Error fetching referral data:', referralDataError)
      }

      // Get referral earnings data
      const { data: earningsData, error: earningsError } = await supabase
        .from('processed_brofit_earnings')
        .select('brofit_bits, l2_bits')
        
      if (earningsError) {
        console.error('Error fetching earnings data:', earningsError)
      }

    const totalReferralEarnings = earningsData?.reduce((sum, e) => {
      return sum + (e.brofit_bits || 0) + (e.l2_bits || 0)
    }, 0) || 0

    // Calculate average referrals per user
    const avgReferralsPerUser = referralData?.length 
      ? referralData.reduce((sum, r) => sum + (r.referrals_count || 0), 0) / referralData.length
      : 0

    // Get active users to calculate conversion rate
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const conversionRate = totalUsers ? (referredCount! / totalUsers) * 100 : 0

    // Calculate viral coefficient (avg referrals * conversion rate)
    const viralCoefficient = avgReferralsPerUser * (conversionRate / 100)

    // Get top referrer earnings
    const { data: topEarner } = await supabase
      .from('processed_brofit_earnings')
      .select('referrer_telegram_id')
      .order('brofit_bits', { ascending: false })
      .limit(1)

    let topReferrerEarnings = 0
    if (topEarner?.[0]) {
      const { data: topEarnings } = await supabase
        .from('processed_brofit_earnings')
        .select('brofit_bits')
        .eq('referrer_telegram_id', topEarner[0].referrer_telegram_id)

      topReferrerEarnings = topEarnings?.reduce((sum, e) => sum + (e.brofit_bits || 0), 0) || 0
    }

    // Calculate active referral rate (referred users who are active)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: referredUsers } = await supabase
      .from('referrals')
      .select('referred_id')

    const referredIds = referredUsers?.map(r => r.referred_id) || []
    
    if (referredIds.length > 0) {
      const { data: activeReferrals } = await supabase
        .from('raw_earnings')
        .select('telegram_id')
        .in('telegram_id', referredIds)
        .gte('earned_at', sevenDaysAgo.toISOString())

      const activeCount = new Set(activeReferrals?.map(r => r.telegram_id) || []).size
      const activeReferralRate = (activeCount / referredIds.length) * 100

      setStats({
        totalReferrers: referrerCount || 0,
        totalReferred: referredCount || 0,
        totalReferralEarnings,
        avgReferralsPerUser: Math.round(avgReferralsPerUser * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10,
        viralCoefficient: Math.round(viralCoefficient * 100) / 100,
        topReferrerEarnings,
        activeReferralRate: Math.round(activeReferralRate * 10) / 10,
      })
    }
  }

  async function loadTopReferrers() {
    // Get users with most referrals
    const { data: topUsers } = await supabase
      .from('user_tiers')
      .select(`
        telegram_id,
        referrals_count,
        brofit_bits_earned,
        l2_brofit_bits_earned,
        users!inner (
          telegram_id,
          username,
          profile_picture,
          created_at
        )
      `)
      .gt('referrals_count', 0)
      .order('referrals_count', { ascending: false })
      .limit(20)

    if (!topUsers) return

    // Enrich with referral data
    const enrichedUsers = await Promise.all(
      topUsers.map(async (userData) => {
        const user = userData.users as any

        // Count active referrals (active in last 7 days)
        const { data: referrals } = await supabase
          .from('referrals')
          .select('referred_id')
          .eq('referrer_id', user.telegram_id)

        const referredIds = referrals?.map(r => r.referred_id) || []
        let activeCount = 0

        if (referredIds.length > 0) {
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

          const { data: activeData } = await supabase
            .from('raw_earnings')
            .select('telegram_id')
            .in('telegram_id', referredIds)
            .gte('earned_at', sevenDaysAgo.toISOString())

          activeCount = new Set(activeData?.map(r => r.telegram_id) || []).size
        }

        return {
          ...user,
          user_tiers: userData,
          total_referred: userData.referrals_count || 0,
          total_earnings: (userData.brofit_bits_earned || 0) + (userData.l2_brofit_bits_earned || 0),
          active_referrals: activeCount,
        }
      })
    )

    setTopReferrers(enrichedUsers)
  }

  async function loadReferralNetworks() {
    // Get top 5 referrers for network visualization
    const { data: topReferrers } = await supabase
      .from('user_tiers')
      .select('telegram_id')
      .gt('referrals_count', 0)
      .order('referrals_count', { ascending: false })
      .limit(5)

    if (!topReferrers) return

    const networks = await Promise.all(
      topReferrers.map(async (referrerData) => {
        // Get referrer details
        const { data: referrerUser } = await supabase
          .from('users')
          .select(`
            telegram_id,
            username,
            profile_picture,
            created_at,
            user_tiers (*)
          `)
          .eq('telegram_id', referrerData.telegram_id)
          .single()

        // Get all referrals
        const { data: referrals } = await supabase
          .from('referrals')
          .select(`
            referred_id,
            referred_at,
            users!referrals_referred_id_fkey (
              telegram_id,
              username,
              profile_picture,
              created_at,
              user_tiers (*)
            )
          `)
          .eq('referrer_id', referrerData.telegram_id)
          .order('referred_at', { ascending: false })
          .limit(10)

        // Calculate earnings per referral
        const referralDetails = await Promise.all(
          (referrals || []).map(async (ref) => {
            const { data: earnings } = await supabase
              .from('processed_brofit_earnings')
              .select('original_bits')
              .eq('referred_telegram_id', ref.referred_id)

            const totalEarnings = earnings?.reduce((sum, e) => sum + (e.original_bits || 0), 0) || 0

            // Check if active (earned in last 7 days)
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            const { data: recentActivity } = await supabase
              .from('raw_earnings')
              .select('telegram_id')
              .eq('telegram_id', ref.referred_id)
              .gte('earned_at', sevenDaysAgo.toISOString())
              .limit(1)

            return {
              user: ref.users as any,
              referred_at: ref.referred_at,
              earnings_generated: totalEarnings,
              is_active: !!recentActivity?.length,
            }
          })
        )

        return {
          referrer: {
            ...referrerUser,
            total_referred: referrals?.length || 0,
            total_earnings: 0,
            active_referrals: referralDetails.filter(r => r.is_active).length,
          } as ReferralUser,
          referrals: referralDetails,
        }
      })
    )

    setReferralNetworks(networks)
  }

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
        <h1 className="text-3xl font-bold">Referral Network</h1>
        <button className="px-4 py-2 glass rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors">
          <Share2 className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Referrers</p>
              <p className="text-2xl font-bold mt-1">{stats.totalReferrers.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">users who referred</p>
            </div>
            <Users className="w-8 h-8 text-bro-500" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Referred</p>
              <p className="text-2xl font-bold mt-1">{stats.totalReferred.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">new users</p>
            </div>
            <Link2 className="w-8 h-8 text-w3dv-blue" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Referral Earnings</p>
              <p className="text-2xl font-bold mt-1">{(stats.totalReferralEarnings / 1000).toFixed(1)}K</p>
              <p className="text-xs text-gray-500 mt-1">bits earned</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg per User</p>
              <p className="text-2xl font-bold mt-1">{stats.avgReferralsPerUser}</p>
              <p className="text-xs text-gray-500 mt-1">referrals</p>
            </div>
            <TrendingUp className="w-8 h-8 text-w3dv-orange" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Conversion Rate</p>
              <p className="text-2xl font-bold mt-1">{stats.conversionRate}%</p>
              <p className="text-xs text-gray-500 mt-1">referred users</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Viral Coefficient</p>
              <p className="text-2xl font-bold mt-1">{stats.viralCoefficient}</p>
              <p className="text-xs text-gray-500 mt-1">K-factor</p>
            </div>
            <Gift className="w-8 h-8 text-w3dv-purple" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Top Earner</p>
              <p className="text-2xl font-bold mt-1">{(stats.topReferrerEarnings / 1000).toFixed(1)}K</p>
              <p className="text-xs text-gray-500 mt-1">bits earned</p>
            </div>
            <Trophy className="w-8 h-8 text-bro-500" />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Rate</p>
              <p className="text-2xl font-bold mt-1">{stats.activeReferralRate}%</p>
              <p className="text-xs text-gray-500 mt-1">7-day active</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Top Referrers Leaderboard */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Top Referrers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                <th className="pb-3 pr-4">Rank</th>
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Total Referred</th>
                <th className="pb-3 pr-4">Active Referrals</th>
                <th className="pb-3 pr-4">Total Earnings</th>
                <th className="pb-3">Activity Rate</th>
              </tr>
            </thead>
            <tbody>
              {topReferrers.map((user, index) => (
                <tr 
                  key={user.telegram_id}
                  className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => setSelectedUser(user.telegram_id)}
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      {index < 3 ? (
                        <span className={`text-2xl ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-orange-600'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="text-gray-500 font-medium w-8 text-center">
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </td>
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
                        <div className="text-sm text-gray-500">Level {user.user_tiers?.smart_bro_level || 0}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="font-medium">{user.total_referred}</div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{user.active_referrals}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="font-medium text-bro-500">
                      {user.total_earnings >= 1000 
                        ? `${(user.total_earnings / 1000).toFixed(1)}K`
                        : user.total_earnings.toLocaleString()
                      }
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-600"
                          style={{ width: `${user.total_referred ? (user.active_referrals / user.total_referred) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">
                        {user.total_referred ? Math.round((user.active_referrals / user.total_referred) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Referral Networks */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Referral Networks</h3>
        {referralNetworks.map((network) => (
          <div key={network.referrer.telegram_id} className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar
                  username={network.referrer.username}
                  telegramId={network.referrer.telegram_id}
                  profilePicture={network.referrer.profile_picture}
                  size="lg"
                />
                <div>
                  <div className="font-semibold text-lg">{network.referrer.username || 'Unknown'}</div>
                  <div className="text-sm text-gray-400">
                    {network.referrer.total_referred} referrals • {network.referrer.active_referrals} active
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-colors">
                View Details
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {network.referrals.slice(0, 6).map((referral) => (
                <div 
                  key={referral.user.telegram_id}
                  className={`p-3 rounded-lg border transition-all ${
                    referral.is_active 
                      ? 'border-green-500/30 bg-green-500/5' 
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Avatar
                      username={referral.user.username}
                      telegramId={referral.user.telegram_id}
                      profilePicture={referral.user.profile_picture}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {referral.user.username || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(referral.referred_at), 'MMM d')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-bro-500">
                        {referral.earnings_generated >= 1000 
                          ? `${(referral.earnings_generated / 1000).toFixed(1)}K`
                          : referral.earnings_generated
                        }
                      </div>
                      <div className="text-xs text-gray-500">bits</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {network.referrals.length > 6 && (
              <div className="mt-3 text-center">
                <button className="text-sm text-gray-400 hover:text-white transition-colors">
                  +{network.referrals.length - 6} more referrals
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}