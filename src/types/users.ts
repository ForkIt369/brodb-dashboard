import { Tables } from './database'

// Extended user type with all related data
export interface ExtendedUser {
  // Basic user info
  telegram_id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  profile_picture: string | null
  language_code: string | null
  created_at: string | null
  updated_at: string | null
  
  // Tier information
  user_tiers: Tables<'user_tiers'> | null
  
  // Activity data
  last_active: string | null
  total_sessions: number
  play_time_minutes: number
  streak_days: number
  
  // Referral data
  referrer_id: string | null
  referrer_username: string | null
  total_referrals: number
  referral_earnings: number
  l2_referrals: number
  l2_earnings: number
  
  // Financial data
  total_earnings: number
  daily_avg_earnings: number
  weekly_avg_earnings: number
  monthly_total_earnings: number
  boost_earnings: number
  brofit_earnings: number
  
  // Status data
  account_status: 'active' | 'inactive' | 'suspended' | 'banned'
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
  risk_score: number
  
  // Metadata
  last_ip_country: string | null
  user_agent: string | null
  device_type: string | null
  claimr_user_id: string | null
  claimr_xp_balance: number | null
  twitter_username: string | null
  
  // Computed fields
  xp_progress: number // Progress to next level (0-100)
  user_segment: 'whale' | 'shark' | 'fish' | 'plankton'
  lifetime_value: number
}

// Filter types
export interface UserFilters {
  // Date filters
  createdDateRange: [Date | null, Date | null]
  lastActiveDateRange: [Date | null, Date | null]
  
  // Numeric range filters
  levelRange: { min: number; max: number }
  bitsRange: { min: number; max: number }
  earningsRange: { min: number; max: number }
  referralsRange: { min: number; max: number }
  riskScoreRange: { min: number; max: number }
  
  // Multi-select filters
  segments: string[]
  accountStatuses: string[]
  verificationStatuses: string[]
  countries: string[]
  
  // Text search
  globalSearch: string
}

// Column visibility preferences
export interface ColumnPreferences {
  // Basic columns (always visible)
  avatar: boolean
  username: boolean
  telegram_id: boolean
  
  // Tier columns
  level: boolean
  bits_earned: boolean
  xp_progress: boolean
  boost_multiplier: boolean
  
  // Activity columns
  last_active: boolean
  total_sessions: boolean
  play_time: boolean
  streak_days: boolean
  
  // Referral columns
  referrer: boolean
  total_referrals: boolean
  referral_earnings: boolean
  l2_referrals: boolean
  
  // Financial columns
  total_earnings: boolean
  daily_avg: boolean
  weekly_avg: boolean
  monthly_total: boolean
  
  // Status columns
  account_status: boolean
  verification_status: boolean
  risk_score: boolean
  
  // Metadata columns
  created_date: boolean
  last_updated: boolean
  user_agent: boolean
  ip_country: boolean
}

// Default column visibility
export const defaultColumnVisibility: ColumnPreferences = {
  // Basic - always visible
  avatar: true,
  username: true,
  telegram_id: true,
  
  // Tier - visible by default
  level: true,
  bits_earned: true,
  xp_progress: false,
  boost_multiplier: true,
  
  // Activity - mostly visible
  last_active: true,
  total_sessions: false,
  play_time: false,
  streak_days: true,
  
  // Referral - some visible
  referrer: false,
  total_referrals: true,
  referral_earnings: false,
  l2_referrals: false,
  
  // Financial - key metrics visible
  total_earnings: true,
  daily_avg: false,
  weekly_avg: false,
  monthly_total: true,
  
  // Status - visible
  account_status: true,
  verification_status: false,
  risk_score: false,
  
  // Metadata - mostly hidden
  created_date: true,
  last_updated: false,
  user_agent: false,
  ip_country: false,
}

// Bulk action types
export type BulkAction = 
  | { type: 'export'; format: 'csv' | 'json' | 'excel' }
  | { type: 'message'; template: string }
  | { type: 'updateStatus'; status: string }
  | { type: 'addTag'; tag: string }
  | { type: 'removeTag'; tag: string }
  | { type: 'suspend'; reason: string }
  | { type: 'activate' }

// User details for slide-over panel
export interface UserDetails extends ExtendedUser {
  // Activity timeline
  recent_activities: Array<{
    timestamp: string
    type: string
    details: string
    bits_earned?: number
  }>
  
  // Referral tree
  direct_referrals: Array<{
    telegram_id: string
    username: string
    joined_at: string
    bits_earned: number
  }>
  
  // Earnings breakdown
  earnings_by_source: {
    game: number
    referral: number
    boost: number
    daily_checkin: number
    other: number
  }
  
  // Risk factors
  risk_factors: Array<{
    factor: string
    severity: 'low' | 'medium' | 'high'
    description: string
  }>
}