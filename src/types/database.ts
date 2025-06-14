export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_checkins: {
        Row: {
          created_at: string
          current_streak: number
          id: number
          last_checkin_at: string
          last_reward_bits: number
          telegram_id: string
          total_checkins: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: number
          last_checkin_at?: string
          last_reward_bits?: number
          telegram_id: string
          total_checkins?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: number
          last_checkin_at?: string
          last_reward_bits?: number
          telegram_id?: string
          total_checkins?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: true
            referencedRelation: "smart_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "daily_checkins_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: true
            referencedRelation: "synergy_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "daily_checkins_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: true
            referencedRelation: "synergy_new_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "daily_checkins_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      game_cooldowns: {
        Row: {
          created_at: string
          id: string
          last_played_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_played_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_played_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_cooldowns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "smart_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "game_cooldowns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "synergy_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "game_cooldowns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "synergy_new_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "game_cooldowns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      leaderboard: {
        Row: {
          bits: number
          bros: number
          rank: number | null
          telegram_id: string
          updated_at: string | null
        }
        Insert: {
          bits?: number
          bros?: number
          rank?: number | null
          telegram_id: string
          updated_at?: string | null
        }
        Update: {
          bits?: number
          bros?: number
          rank?: number | null
          telegram_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: true
            referencedRelation: "smart_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "leaderboard_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: true
            referencedRelation: "synergy_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "leaderboard_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: true
            referencedRelation: "synergy_new_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "leaderboard_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      metis_claimr_campaign: {
        Row: {
          action_id: string
          action_weight: number
          campaign_id: string
          created_at: string | null
          group_id: string
          id: number
          updated_at: string | null
          user_action_completed_bit: number
          user_id: string
          user_profile: Json | null
          user_ref_id: string | null
          user_ref_total_xp: number
          user_referrer_id: string | null
          user_total_xp: number
        }
        Insert: {
          action_id: string
          action_weight: number
          campaign_id: string
          created_at?: string | null
          group_id: string
          id?: number
          updated_at?: string | null
          user_action_completed_bit?: number
          user_id: string
          user_profile?: Json | null
          user_ref_id?: string | null
          user_ref_total_xp?: number
          user_referrer_id?: string | null
          user_total_xp?: number
        }
        Update: {
          action_id?: string
          action_weight?: number
          campaign_id?: string
          created_at?: string | null
          group_id?: string
          id?: number
          updated_at?: string | null
          user_action_completed_bit?: number
          user_id?: string
          user_profile?: Json | null
          user_ref_id?: string | null
          user_ref_total_xp?: number
          user_referrer_id?: string | null
          user_total_xp?: number
        }
        Relationships: []
      }
      partner_leaderboard: {
        Row: {
          bits: number
          id: number
          name: string | null
          oid: string
          percentile: number
          pid: string
          rank: number
          total_users: number
          uid: string
          updated_at: string
        }
        Insert: {
          bits?: number
          id?: number
          name?: string | null
          oid: string
          percentile: number
          pid: string
          rank: number
          total_users: number
          uid: string
          updated_at?: string
        }
        Update: {
          bits?: number
          id?: number
          name?: string | null
          oid?: string
          percentile?: number
          pid?: string
          rank?: number
          total_users?: number
          uid?: string
          updated_at?: string
        }
        Relationships: []
      }
      processed_boost_earnings: {
        Row: {
          boost_multiplier: number
          boosted_bits: number
          earning_id: number
          original_bits: number
          processed_at: string
          raw_earning_id: number
          telegram_id: string
        }
        Insert: {
          boost_multiplier: number
          boosted_bits: number
          earning_id?: number
          original_bits: number
          processed_at?: string
          raw_earning_id: number
          telegram_id: string
        }
        Update: {
          boost_multiplier?: number
          boosted_bits?: number
          earning_id?: number
          original_bits?: number
          processed_at?: string
          raw_earning_id?: number
          telegram_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processed_boost_earnings_raw_earning_id_fkey"
            columns: ["raw_earning_id"]
            isOneToOne: true
            referencedRelation: "raw_earnings"
            referencedColumns: ["earning_id"]
          },
          {
            foreignKeyName: "processed_boost_earnings_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "smart_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "processed_boost_earnings_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "synergy_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "processed_boost_earnings_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "synergy_new_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "processed_boost_earnings_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      processed_brofit_earnings: {
        Row: {
          brofit_bits: number
          brofit_rate: number
          earning_id: number
          l2_bits: number | null
          l2_rate: number | null
          l2_referrer_telegram_id: string | null
          original_bits: number
          processed_at: string
          raw_earning_id: number
          referred_telegram_id: string
          referrer_telegram_id: string
        }
        Insert: {
          brofit_bits: number
          brofit_rate: number
          earning_id?: number
          l2_bits?: number | null
          l2_rate?: number | null
          l2_referrer_telegram_id?: string | null
          original_bits: number
          processed_at?: string
          raw_earning_id: number
          referred_telegram_id: string
          referrer_telegram_id: string
        }
        Update: {
          brofit_bits?: number
          brofit_rate?: number
          earning_id?: number
          l2_bits?: number | null
          l2_rate?: number | null
          l2_referrer_telegram_id?: string | null
          original_bits?: number
          processed_at?: string
          raw_earning_id?: number
          referred_telegram_id?: string
          referrer_telegram_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processed_brofit_earnings_l2_referrer_telegram_id_fkey"
            columns: ["l2_referrer_telegram_id"]
            isOneToOne: false
            referencedRelation: "smart_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "processed_brofit_earnings_l2_referrer_telegram_id_fkey"
            columns: ["l2_referrer_telegram_id"]
            isOneToOne: false
            referencedRelation: "synergy_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "processed_brofit_earnings_l2_referrer_telegram_id_fkey"
            columns: ["l2_referrer_telegram_id"]
            isOneToOne: false
            referencedRelation: "synergy_new_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "processed_brofit_earnings_l2_referrer_telegram_id_fkey"
            columns: ["l2_referrer_telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "processed_brofit_earnings_raw_earning_id_fkey"
            columns: ["raw_earning_id"]
            isOneToOne: false
            referencedRelation: "raw_earnings"
            referencedColumns: ["earning_id"]
          },
          {
            foreignKeyName: "processed_brofit_earnings_referred_telegram_id_fkey"
            columns: ["referred_telegram_id"]
            isOneToOne: false
            referencedRelation: "smart_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "processed_brofit_earnings_referred_telegram_id_fkey"
            columns: ["referred_telegram_id"]
            isOneToOne: false
            referencedRelation: "synergy_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "processed_brofit_earnings_referred_telegram_id_fkey"
            columns: ["referred_telegram_id"]
            isOneToOne: false
            referencedRelation: "synergy_new_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "processed_brofit_earnings_referred_telegram_id_fkey"
            columns: ["referred_telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "processed_brofit_earnings_referrer_telegram_id_fkey"
            columns: ["referrer_telegram_id"]
            isOneToOne: false
            referencedRelation: "smart_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "processed_brofit_earnings_referrer_telegram_id_fkey"
            columns: ["referrer_telegram_id"]
            isOneToOne: false
            referencedRelation: "synergy_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "processed_brofit_earnings_referrer_telegram_id_fkey"
            columns: ["referrer_telegram_id"]
            isOneToOne: false
            referencedRelation: "synergy_new_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "processed_brofit_earnings_referrer_telegram_id_fkey"
            columns: ["referrer_telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      raw_bits: {
        Row: {
          bits: number
          claimr_action_id: string | null
          earned_at: string
          earning_id: number
          source: string
          telegram_id: string
        }
        Insert: {
          bits: number
          claimr_action_id?: string | null
          earned_at?: string
          earning_id?: number
          source: string
          telegram_id: string
        }
        Update: {
          bits?: number
          claimr_action_id?: string | null
          earned_at?: string
          earning_id?: number
          source?: string
          telegram_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raw_bits_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "smart_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "raw_bits_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "synergy_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "raw_bits_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "synergy_new_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "raw_bits_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      raw_earnings: {
        Row: {
          bits: number
          claimr_action_id: string | null
          earned_at: string
          earning_id: number
          source: string
          telegram_id: string
        }
        Insert: {
          bits: number
          claimr_action_id?: string | null
          earned_at?: string
          earning_id?: number
          source: string
          telegram_id: string
        }
        Update: {
          bits?: number
          claimr_action_id?: string | null
          earned_at?: string
          earning_id?: number
          source?: string
          telegram_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raw_earnings_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "smart_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "raw_earnings_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "synergy_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "raw_earnings_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "synergy_new_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "raw_earnings_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      referrals: {
        Row: {
          referred_at: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          referred_at?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          referred_at?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "smart_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "synergy_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "synergy_new_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "smart_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "synergy_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "synergy_new_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      user_activitywebhook: {
        Row: {
          campaign_id: string
          campaign_name: string | null
          claimr_id: string | null
          combined_user_campaign_id: string | null
          contest_id: string | null
          contest_name: string | null
          created_at: string | null
          email: string | null
          event_account: string | null
          event_type: string | null
          event_xp: number | null
          id: number
          rank: number | null
          ref_count: number | null
          ref_xp: number | null
          scope: string | null
          team: string | null
          total_xp: number | null
          ugc_xp: number | null
          user_id: string | null
          wallet: string | null
          xp_mul: number | null
        }
        Insert: {
          campaign_id: string
          campaign_name?: string | null
          claimr_id?: string | null
          combined_user_campaign_id?: string | null
          contest_id?: string | null
          contest_name?: string | null
          created_at?: string | null
          email?: string | null
          event_account?: string | null
          event_type?: string | null
          event_xp?: number | null
          id?: never
          rank?: number | null
          ref_count?: number | null
          ref_xp?: number | null
          scope?: string | null
          team?: string | null
          total_xp?: number | null
          ugc_xp?: number | null
          user_id?: string | null
          wallet?: string | null
          xp_mul?: number | null
        }
        Update: {
          campaign_id?: string
          campaign_name?: string | null
          claimr_id?: string | null
          combined_user_campaign_id?: string | null
          contest_id?: string | null
          contest_name?: string | null
          created_at?: string | null
          email?: string | null
          event_account?: string | null
          event_type?: string | null
          event_xp?: number | null
          id?: never
          rank?: number | null
          ref_count?: number | null
          ref_xp?: number | null
          scope?: string | null
          team?: string | null
          total_xp?: number | null
          ugc_xp?: number | null
          user_id?: string | null
          wallet?: string | null
          xp_mul?: number | null
        }
        Relationships: []
      }
      user_tiers: {
        Row: {
          bits_earned: number
          boost_multiplier: number
          brofit_bits_earned: number
          brofit_rate: number
          l2_brofit_bits_earned: number
          referrals_count: number
          smart_bro_level: number
          synergy_bro_level: number
          telegram_id: string
          w3to_brofit_bits_earned: number
        }
        Insert: {
          bits_earned?: number
          boost_multiplier?: number
          brofit_bits_earned?: number
          brofit_rate?: number
          l2_brofit_bits_earned?: number
          referrals_count?: number
          smart_bro_level?: number
          synergy_bro_level?: number
          telegram_id: string
          w3to_brofit_bits_earned?: number
        }
        Update: {
          bits_earned?: number
          boost_multiplier?: number
          brofit_bits_earned?: number
          brofit_rate?: number
          l2_brofit_bits_earned?: number
          referrals_count?: number
          smart_bro_level?: number
          synergy_bro_level?: number
          telegram_id?: string
          w3to_brofit_bits_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_tiers_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: true
            referencedRelation: "smart_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "user_tiers_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: true
            referencedRelation: "synergy_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "user_tiers_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: true
            referencedRelation: "synergy_new_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "user_tiers_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      users: {
        Row: {
          claimr_ref_xp_balance: number | null
          claimr_token: string | null
          claimr_ugc_xp_balance: number | null
          claimr_user_id: string | null
          claimr_xp_balance: number | null
          created_at: string | null
          first_name: string | null
          intro_version_seen: number | null
          language_code: string | null
          last_name: string | null
          profile_picture: string | null
          referrer_id: string | null
          telegram_id: string
          twitter_user_id: string | null
          twitter_username: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          claimr_ref_xp_balance?: number | null
          claimr_token?: string | null
          claimr_ugc_xp_balance?: number | null
          claimr_user_id?: string | null
          claimr_xp_balance?: number | null
          created_at?: string | null
          first_name?: string | null
          intro_version_seen?: number | null
          language_code?: string | null
          last_name?: string | null
          profile_picture?: string | null
          referrer_id?: string | null
          telegram_id: string
          twitter_user_id?: string | null
          twitter_username?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          claimr_ref_xp_balance?: number | null
          claimr_token?: string | null
          claimr_ugc_xp_balance?: number | null
          claimr_user_id?: string | null
          claimr_xp_balance?: number | null
          created_at?: string | null
          first_name?: string | null
          intro_version_seen?: number | null
          language_code?: string | null
          last_name?: string | null
          profile_picture?: string | null
          referrer_id?: string | null
          telegram_id?: string
          twitter_user_id?: string | null
          twitter_username?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      second_level_referrals: {
        Row: {
          original_referrer: string | null
          second_level_referred: string | null
          second_level_referred_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["second_level_referred"]
            isOneToOne: false
            referencedRelation: "smart_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["second_level_referred"]
            isOneToOne: false
            referencedRelation: "synergy_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["second_level_referred"]
            isOneToOne: false
            referencedRelation: "synergy_new_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["second_level_referred"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["original_referrer"]
            isOneToOne: false
            referencedRelation: "smart_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["original_referrer"]
            isOneToOne: false
            referencedRelation: "synergy_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["original_referrer"]
            isOneToOne: false
            referencedRelation: "synergy_new_leaderboard"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["original_referrer"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      smart_leaderboard: {
        Row: {
          bits: number | null
          first_name: string | null
          level: number | null
          percentile: number | null
          rank: number | null
          telegram_id: string | null
          tier_title: string | null
          total_users: number | null
        }
        Relationships: []
      }
      synergy_leaderboard: {
        Row: {
          bits: number | null
          first_name: string | null
          level: number | null
          percentile: number | null
          rank: number | null
          telegram_id: string | null
          tier_title: string | null
          total_users: number | null
        }
        Relationships: []
      }
      synergy_new_leaderboard: {
        Row: {
          bits: number | null
          first_name: string | null
          level: number | null
          percentile: number | null
          rank: number | null
          telegram_id: string | null
          tier_title: string | null
          total_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_boost_multiplier: {
        Args: { bits_earned: number }
        Returns: number
      }
      calculate_brofit_rate: {
        Args: { referral_count: number }
        Returns: number
      }
      calculate_daily_bits: {
        Args: { streak: number; total_checkins: number }
        Returns: number
      }
      calculate_user_referral_count: {
        Args: { user_telegram_id: string }
        Returns: number
      }
      calculate_user_total_bits: {
        Args: { user_telegram_id: string }
        Returns: number
      }
      get_all_referral_counts: {
        Args: { user_id: string }
        Returns: {
          direct_count: number
          second_level_count: number
        }[]
      }
      get_second_level_referral_count: {
        Args: { user_id: string }
        Returns: number
      }
      get_smart_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          telegram_id: string
          name: string
          bits: number
          level: number
          bros: number
          rank: number
        }[]
      }
      get_synergy_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          telegram_id: string
          name: string
          bits: number
          level: number
          bros: number
          rank: number
        }[]
      }
      get_synergy_new_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          telegram_id: string
          name: string
          bits: number
          level: number
          bros: number
          rank: number
        }[]
      }
      get_user_total_earnings: {
        Args: { p_telegram_id: string }
        Returns: {
          boost_total: number
          brofit_total: number
          l2_brofit_total: number
        }[]
      }
      handle_daily_checkin: {
        Args: { user_telegram_id: string }
        Returns: {
          bits: number
          new_streak: number
          total_checkins: number
        }[]
      }
      manual_process_raw_earning: {
        Args: {
          p_earning_id: number
          p_telegram_id: string
          p_bits: number
          p_earned_at: string
        }
        Returns: undefined
      }
      manual_sync_user_tiers: {
        Args: { p_telegram_id: string }
        Returns: undefined
      }
      process_all_brofit_earnings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_existing_boost_earnings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_single_raw_earning: {
        Args: { raw_id: number }
        Returns: undefined
      }
      round_to_second: {
        Args: { ts: string }
        Returns: number
      }
      set_telegram_user: {
        Args: { telegram_id: string }
        Returns: undefined
      }
      sync_bros_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_user_tiers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_user_tiers_with_processed_earnings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      test_rls_access: {
        Args: { test_id: string }
        Returns: {
          test_name: string
          passed: boolean
          details: string
        }[]
      }
      update_all_user_levels: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_leaderboard_bits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_leaderboard_bros: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_single_user_leaderboard: {
        Args: { target_telegram_id: string }
        Returns: {
          telegram_id: string
          previous_bits: number
          new_bits: number
          w3to_bits: number
          boost_bits: number
          brofit_bits: number
          l2_bits: number
        }[]
      }
      upsert_leaderboard_entry: {
        Args: { p_user_id: string; p_bits: number; p_bros: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const