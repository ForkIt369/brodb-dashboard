import { useMemo } from 'react'

interface AvatarProps {
  username?: string | null
  telegramId: string
  profilePicture?: string | null
  size?: 'sm' | 'md' | 'lg'
}

export default function Avatar({ username, telegramId, profilePicture, size = 'md' }: AvatarProps) {
  // Generate a consistent color based on telegram ID
  const avatarColor = useMemo(() => {
    const colors = [
      'from-bro-500 to-bro-600',
      'from-w3dv-blue to-blue-600',
      'from-w3dv-orange to-orange-600',
      'from-w3dv-purple to-purple-600',
      'from-green-500 to-green-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-yellow-500 to-yellow-600',
    ]
    
    // Create a hash from telegram ID
    let hash = 0
    for (let i = 0; i < telegramId.length; i++) {
      hash = ((hash << 5) - hash) + telegramId.charCodeAt(i)
      hash = hash & hash
    }
    
    return colors[Math.abs(hash) % colors.length]
  }, [telegramId])

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg'
  }

  // Try to use Telegram CDN for avatars (this sometimes works for public profiles)
  const telegramAvatarUrl = `https://cdn4.telegram-cdn.org/file/${telegramId}.jpg`

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {profilePicture ? (
        <>
          <img 
            src={profilePicture} 
            alt={username || 'User'}
            className={`${sizeClasses[size]} rounded-full object-cover`}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
          <div className={`${sizeClasses[size]} bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center font-semibold text-white hidden`}>
            {(username || 'U').charAt(0).toUpperCase()}
          </div>
        </>
      ) : (
        <div className={`${sizeClasses[size]} bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center font-semibold text-white`}>
          {(username || 'U').charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}