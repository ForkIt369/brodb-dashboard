export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          telegram_id: string | null
          twitter_user_id: string | null
          twitter_username: string | null
          username: string | null
          first_name: string | null
          last_name: string | null
          photo_url: string | null
          is_blocked: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      user_tiers: {
        Row: {
          id: string
          user_id: string
          bits_earned: number
          brofit_bits_earned: number
          smart_bro_level: number
          synergy_bro_level: number
          boost_multiplier: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_tiers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_tiers']['Insert']>
      }
      raw_earnings: {
        Row: {
          id: string
          user_id: string
          bits: number
          source: string
          metadata: Json | null
          claimr_action_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['raw_earnings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['raw_earnings']['Insert']>
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['referrals']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['referrals']['Insert']>
      }
      leaderboard: {
        Row: {
          id: string
          telegram_id: string
          username: string | null
          rank: number
          bits: number
          referrals: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['leaderboard']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['leaderboard']['Insert']>
      }
      daily_checkins: {
        Row: {
          id: string
          user_id: string
          day: number
          bits_earned: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['daily_checkins']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['daily_checkins']['Insert']>
      }
      processed_boost_earnings: {
        Row: {
          id: string
          raw_earning_id: string
          user_id: string
          original_bits: number
          boost_multiplier: number
          boosted_bits: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['processed_boost_earnings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['processed_boost_earnings']['Insert']>
      }
      processed_brofit_earnings: {
        Row: {
          id: string
          source_earning_id: string
          earner_id: string
          brofit_rate: number
          brofit_bits: number
          brofit_level: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['processed_brofit_earnings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['processed_brofit_earnings']['Insert']>
      }
    }
    Views: {
      smart_leaderboard: {
        Row: {
          telegram_id: string
          username: string | null
          smart_bro_level: number
          bits_earned: number
          rank: number
        }
      }
      synergy_leaderboard: {
        Row: {
          telegram_id: string
          username: string | null
          synergy_bro_level: number
          referral_count: number
          rank: number
        }
      }
      second_level_referrals: {
        Row: {
          referrer_id: string
          second_level_referred_id: string
        }
      }
    }
    Functions: {
      get_active_users_count: {
        Args: { days: number }
        Returns: number
      }
      get_user_activity_summary: {
        Args: { user_uuid: string }
        Returns: Array<{
          source: string
          total_actions: number
          total_bits: number
          last_activity: string
        }>
      }
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']