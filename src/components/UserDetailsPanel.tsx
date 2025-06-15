'use client'

import { useState, useEffect } from 'react'
import { ExtendedUser, UserDetails } from '@/types/users'
import { format, formatDistanceToNow } from 'date-fns'
import { 
  X, User, Award, Zap, Users, DollarSign, Activity, 
  Shield, Globe, Smartphone, Calendar, TrendingUp, 
  AlertTriangle, CheckCircle, Hash, Link2, Clock,
  BarChart3, PieChart, Target, Ban, Send, Edit
} from 'lucide-react'
import Avatar from './Avatar'
import { supabase } from '@/lib/supabase'

interface UserDetailsPanelProps {
  user: ExtendedUser
  onClose: () => void
}

export function UserDetailsPanel({ user, onClose }: UserDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'referrals' | 'earnings' | 'risk'>('overview')
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserDetails()
  }, [user.telegram_id])

  async function loadUserDetails() {
    try {
      // Load recent activities
      const { data: activities } = await supabase
        .from('raw_earnings')
        .select('*')
        .eq('telegram_id', user.telegram_id)
        .order('earned_at', { ascending: false })
        .limit(20)

      // Load direct referrals
      const { data: referrals } = await supabase
        .from('referrals')
        .select(`
          referred_id,
          referred_at,
          users!referrals_referred_id_fkey (
            username,
            telegram_id
          ),
          user_tiers!referrals_referred_id_fkey (
            bits_earned
          )
        `)
        .eq('referrer_id', user.telegram_id)
        .limit(10)

      // Create detailed user object with dummy data for now
      const details: UserDetails = {
        ...user,
        recent_activities: activities?.map(a => ({
          timestamp: a.earned_at,
          type: a.source,
          details: `Earned ${a.bits} bits from ${a.source}`,
          bits_earned: a.bits,
        })) || [],
        direct_referrals: referrals?.map(r => ({
          telegram_id: r.referred_id,
          username: (r.users as any)?.username || 'Unknown',
          joined_at: r.referred_at,
          bits_earned: (r.user_tiers as any)?.bits_earned || 0,
        })) || [],
        earnings_by_source: {
          game: Math.floor(user.total_earnings * 0.6),
          referral: Math.floor(user.total_earnings * 0.25),
          boost: Math.floor(user.total_earnings * 0.1),
          daily_checkin: Math.floor(user.total_earnings * 0.04),
          other: Math.floor(user.total_earnings * 0.01),
        },
        risk_factors: generateRiskFactors(user),
      }

      setUserDetails(details)
      setLoading(false)
    } catch (error) {
      console.error('Error loading user details:', error)
      setLoading(false)
    }
  }

  function generateRiskFactors(user: ExtendedUser) {
    const factors = []
    
    if (user.risk_score > 70) {
      factors.push({
        factor: 'High Risk Score',
        severity: 'high' as const,
        description: 'User has accumulated multiple risk indicators',
      })
    }
    
    if (user.verification_status === 'unverified') {
      factors.push({
        factor: 'Unverified Account',
        severity: 'medium' as const,
        description: 'User has not completed verification process',
      })
    }
    
    if (user.total_earnings > 100000 && user.total_sessions < 10) {
      factors.push({
        factor: 'Suspicious Earning Pattern',
        severity: 'high' as const,
        description: 'High earnings with low session count',
      })
    }
    
    if (!user.last_active || new Date(user.last_active) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      factors.push({
        factor: 'Inactive Account',
        severity: 'low' as const,
        description: 'No activity in the last 30 days',
      })
    }
    
    return factors
  }

  const renderTabContent = () => {
    if (!userDetails) return null

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* User Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">User Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Username</p>
                  <p className="font-medium">{user.username || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Telegram ID</p>
                  <p className="font-medium flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {user.telegram_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Language</p>
                  <p className="font-medium">{user.language_code || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Country</p>
                  <p className="font-medium flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {user.last_ip_country || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Device</p>
                  <p className="font-medium flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    {user.device_type || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Joined</p>
                  <p className="font-medium">
                    {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-tertiary rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Level</p>
                      <p className="text-xl font-bold">
                        {user.user_tiers?.smart_bro_level || 0}/{user.user_tiers?.synergy_bro_level || 0}
                      </p>
                    </div>
                    <Award className="w-6 h-6 text-bro-500" />
                  </div>
                </div>
                <div className="bg-dark-tertiary rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Bits</p>
                      <p className="text-xl font-bold">
                        {(user.user_tiers?.bits_earned || 0).toLocaleString()}
                      </p>
                    </div>
                    <Zap className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                <div className="bg-dark-tertiary rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Referrals</p>
                      <p className="text-xl font-bold">{user.total_referrals}</p>
                    </div>
                    <Users className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div className="bg-dark-tertiary rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Play Time</p>
                      <p className="text-xl font-bold">
                        {Math.floor(user.play_time_minutes / 60)}h
                      </p>
                    </div>
                    <Clock className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    user.account_status === 'active' ? 'bg-green-500' : 
                    user.account_status === 'inactive' ? 'bg-gray-500' : 
                    user.account_status === 'suspended' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-sm text-gray-400">Account Status</p>
                    <p className="font-medium capitalize">{user.account_status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    user.verification_status === 'verified' ? 'bg-green-500' : 
                    user.verification_status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className="text-sm text-gray-400">Verification</p>
                    <p className="font-medium capitalize">{user.verification_status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'activity':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <div className="space-y-2">
              {userDetails.recent_activities.length > 0 ? (
                userDetails.recent_activities.map((activity, idx) => (
                  <div key={idx} className="bg-dark-tertiary rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{activity.details}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {activity.bits_earned && (
                      <span className="text-sm font-medium text-green-500">
                        +{activity.bits_earned.toLocaleString()}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>
        )

      case 'referrals':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Referral Summary</h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-dark-tertiary rounded-lg p-4">
                  <p className="text-sm text-gray-400">Direct Referrals</p>
                  <p className="text-2xl font-bold">{user.total_referrals}</p>
                </div>
                <div className="bg-dark-tertiary rounded-lg p-4">
                  <p className="text-sm text-gray-400">L2 Referrals</p>
                  <p className="text-2xl font-bold">{user.l2_referrals}</p>
                </div>
                <div className="bg-dark-tertiary rounded-lg p-4">
                  <p className="text-sm text-gray-400">Referral Earnings</p>
                  <p className="text-2xl font-bold">{user.referral_earnings.toLocaleString()}</p>
                </div>
                <div className="bg-dark-tertiary rounded-lg p-4">
                  <p className="text-sm text-gray-400">L2 Earnings</p>
                  <p className="text-2xl font-bold">{user.l2_earnings.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Direct Referrals</h3>
              <div className="space-y-2 mt-4">
                {userDetails.direct_referrals.length > 0 ? (
                  userDetails.direct_referrals.map((referral, idx) => (
                    <div key={idx} className="bg-dark-tertiary rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{referral.username}</p>
                          <p className="text-xs text-gray-500">
                            Joined {format(new Date(referral.joined_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {referral.bits_earned.toLocaleString()} bits
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No referrals yet</p>
                )}
              </div>
            </div>
          </div>
        )

      case 'earnings':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Earnings Overview</h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-dark-tertiary rounded-lg p-4">
                  <p className="text-sm text-gray-400">Total Earnings</p>
                  <p className="text-2xl font-bold">{user.total_earnings.toLocaleString()}</p>
                </div>
                <div className="bg-dark-tertiary rounded-lg p-4">
                  <p className="text-sm text-gray-400">Daily Average</p>
                  <p className="text-2xl font-bold">{user.daily_avg_earnings.toLocaleString()}</p>
                </div>
                <div className="bg-dark-tertiary rounded-lg p-4">
                  <p className="text-sm text-gray-400">Weekly Average</p>
                  <p className="text-2xl font-bold">{user.weekly_avg_earnings.toLocaleString()}</p>
                </div>
                <div className="bg-dark-tertiary rounded-lg p-4">
                  <p className="text-sm text-gray-400">Monthly Total</p>
                  <p className="text-2xl font-bold">{user.monthly_total_earnings.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Earnings by Source</h3>
              <div className="space-y-3 mt-4">
                {Object.entries(userDetails.earnings_by_source).map(([source, amount]) => {
                  const percentage = user.total_earnings > 0 
                    ? (amount / user.total_earnings * 100).toFixed(1)
                    : '0'
                  
                  return (
                    <div key={source} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{source.replace('_', ' ')}</span>
                        <span>{amount.toLocaleString()} ({percentage}%)</span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-bro-500 to-bro-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 'risk':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Risk Assessment</h3>
              <div className="bg-dark-tertiary rounded-lg p-6 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium">Risk Score</span>
                  <span className={`text-3xl font-bold ${
                    user.risk_score > 70 ? 'text-red-500' : 
                    user.risk_score > 40 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {user.risk_score}
                  </span>
                </div>
                <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      user.risk_score > 70 ? 'bg-red-500' : 
                      user.risk_score > 40 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${user.risk_score}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Risk Factors</h3>
              <div className="space-y-3 mt-4">
                {userDetails.risk_factors.length > 0 ? (
                  userDetails.risk_factors.map((factor, idx) => (
                    <div key={idx} className="bg-dark-tertiary rounded-lg p-4 flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                        factor.severity === 'high' ? 'text-red-500' :
                        factor.severity === 'medium' ? 'text-yellow-500' : 'text-gray-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium">{factor.factor}</p>
                        <p className="text-sm text-gray-400 mt-1">{factor.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        factor.severity === 'high' ? 'bg-red-500/20 text-red-500' :
                        factor.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' : 
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {factor.severity}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="bg-dark-tertiary rounded-lg p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-green-500 font-medium">No risk factors detected</p>
                    <p className="text-sm text-gray-400 mt-1">This user appears to be in good standing</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50">
      <div className="w-full max-w-2xl bg-dark-primary border-l border-white/10 h-full overflow-hidden flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Avatar
              username={user.username}
              telegramId={user.telegram_id}
              profilePicture={user.profile_picture}
              size="lg"
            />
            <div>
              <h2 className="text-xl font-bold">{user.username || 'Unknown User'}</h2>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {user.telegram_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-white/10">
          <button className="px-3 py-1.5 bg-bro-500/20 text-bro-500 rounded-lg text-sm font-medium hover:bg-bro-500/30 transition-colors flex items-center gap-2">
            <Send className="w-3 h-3" />
            Send Message
          </button>
          <button className="px-3 py-1.5 bg-dark-tertiary rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
            <Edit className="w-3 h-3" />
            Edit User
          </button>
          {user.account_status === 'active' ? (
            <button className="px-3 py-1.5 bg-red-500/20 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors flex items-center gap-2">
              <Ban className="w-3 h-3" />
              Suspend User
            </button>
          ) : (
            <button className="px-3 py-1.5 bg-green-500/20 text-green-500 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              Activate User
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4">
          {['overview', 'activity', 'referrals', 'earnings', 'risk'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-bro-500/20 text-bro-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-white/10 rounded-lg"></div>
              ))}
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  )
}