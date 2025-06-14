'use client'

interface MetricsGridProps {
  metrics: {
    totalUsers: number
    totalBits: number
    activeUsers: number
    totalReferrals: number
  }
  loading: boolean
}

export default function MetricsGrid({ metrics, loading }: MetricsGridProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toLocaleString()
  }

  const cards = [
    {
      title: 'Total Users',
      value: metrics.totalUsers,
      icon: '👥',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Total Bits',
      value: metrics.totalBits,
      icon: '💎',
      change: '+23%',
      trend: 'up',
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers,
      icon: '🔥',
      change: '-5%',
      trend: 'down',
    },
    {
      title: 'Total Referrals',
      value: metrics.totalReferrals,
      icon: '🔗',
      change: '+18%',
      trend: 'up',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className="glass glass-hover rounded-2xl p-6 cursor-pointer"
        >
          {loading ? (
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-white/10 rounded-lg mb-4"></div>
              <div className="h-8 w-24 bg-white/10 rounded mb-2"></div>
              <div className="h-4 w-20 bg-white/10 rounded"></div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-bro-500/20 rounded-xl flex items-center justify-center text-2xl mb-4">
                {card.icon}
              </div>
              <div className="text-3xl font-bold mb-1">{formatNumber(card.value)}</div>
              <div className="text-sm text-gray-400 mb-2">{card.title}</div>
              <div className={`text-sm ${card.trend === 'up' ? 'text-bro-500' : 'text-red-500'}`}>
                {card.change} from last week
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}