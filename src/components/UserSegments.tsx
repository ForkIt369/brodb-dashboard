'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Segment {
  name: string
  icon: string
  count: number
  color: string
}

export default function UserSegments() {
  const [segments, setSegments] = useState<Segment[]>([
    { name: 'Whales', icon: '🐋', count: 0, color: 'bro' },
    { name: 'Sharks', icon: '🦈', count: 0, color: 'blue' },
    { name: 'Active Fish', icon: '🐟', count: 0, color: 'orange' },
    { name: 'Dormant', icon: '💤', count: 0, color: 'purple' },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSegments()
  }, [])

  async function loadSegments() {
    try {
      // Count whales (>10k bits)
      const { count: whalesCount } = await supabase
        .from('user_tiers')
        .select('*', { count: 'exact', head: true })
        .gt('bits_earned', 10000)

      // Count sharks (5k-10k bits)
      const { count: sharksCount } = await supabase
        .from('user_tiers')
        .select('*', { count: 'exact', head: true })
        .gte('bits_earned', 5000)
        .lte('bits_earned', 10000)

      // Count active users (last 7 days, <5k bits)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { data: activeData } = await supabase
        .from('raw_earnings')
        .select('telegram_id')
        .gte('earned_at', sevenDaysAgo.toISOString())
        .limit(1000)

      const activeCount = new Set(activeData?.map(r => r.telegram_id) || []).size

      setSegments([
        { name: 'Whales', icon: '🐋', count: whalesCount || 0, color: 'bro' },
        { name: 'Sharks', icon: '🦈', count: sharksCount || 0, color: 'blue' },
        { name: 'Active Fish', icon: '🐟', count: activeCount, color: 'orange' },
        { name: 'Dormant', icon: '💤', count: 0, color: 'purple' }, // Would need complex query
      ])
      setLoading(false)
    } catch (error) {
      console.error('Error loading segments:', error)
      setLoading(false)
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'bro':
        return 'border-bro-500 hover:bg-bro-500/10'
      case 'blue':
        return 'border-w3dv-blue hover:bg-w3dv-blue/10'
      case 'orange':
        return 'border-w3dv-orange hover:bg-w3dv-orange/10'
      case 'purple':
        return 'border-w3dv-purple hover:bg-w3dv-purple/10'
      default:
        return 'border-gray-500 hover:bg-gray-500/10'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {segments.map((segment) => (
        <button
          key={segment.name}
          className={`glass rounded-xl p-6 text-center transition-all hover:scale-105 border-t-2 ${getColorClasses(segment.color)}`}
        >
          {loading ? (
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-white/10 rounded-lg mx-auto mb-3"></div>
              <div className="h-4 w-20 bg-white/10 rounded mx-auto mb-2"></div>
              <div className="h-6 w-16 bg-white/10 rounded mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl mb-3">{segment.icon}</div>
              <div className="text-sm text-gray-400 mb-1">{segment.name}</div>
              <div className="text-2xl font-bold">{segment.count.toLocaleString()}</div>
            </>
          )}
        </button>
      ))}
    </div>
  )
}