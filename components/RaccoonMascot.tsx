'use client'
import { type RaccoonMood } from '@/lib/utils'
import { cn } from '@/lib/utils'

// SVG raccoon faces for each mood
const RACCOON_FACES: Record<RaccoonMood, React.ReactNode> = {
  thriving: (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      {/* Body */}
      <ellipse cx="40" cy="52" rx="22" ry="18" fill="#6B6B6B"/>
      {/* Ears */}
      <ellipse cx="22" cy="24" rx="8" ry="9" fill="#6B6B6B"/>
      <ellipse cx="58" cy="24" rx="8" ry="9" fill="#6B6B6B"/>
      <ellipse cx="22" cy="24" rx="5" ry="6" fill="#FFB3B3"/>
      <ellipse cx="58" cy="24" rx="5" ry="6" fill="#FFB3B3"/>
      {/* Head */}
      <ellipse cx="40" cy="36" rx="20" ry="18" fill="#888"/>
      {/* Mask */}
      <ellipse cx="32" cy="33" rx="9" ry="7" fill="#3A3A3A"/>
      <ellipse cx="48" cy="33" rx="9" ry="7" fill="#3A3A3A"/>
      {/* Eyes - happy */}
      <ellipse cx="32" cy="32" rx="4" ry="4" fill="white"/>
      <ellipse cx="48" cy="32" rx="4" ry="4" fill="white"/>
      <ellipse cx="33" cy="32" rx="2.5" ry="2.5" fill="#1A1A1A"/>
      <ellipse cx="49" cy="32" rx="2.5" ry="2.5" fill="#1A1A1A"/>
      {/* Shine */}
      <circle cx="34" cy="31" r="0.8" fill="white"/>
      <circle cx="50" cy="31" r="0.8" fill="white"/>
      {/* Nose */}
      <ellipse cx="40" cy="39" rx="3" ry="2" fill="#3A3A3A"/>
      {/* Big smile */}
      <path d="M 31 43 Q 40 51 49 43" stroke="#3A3A3A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Stars */}
      <text x="8" y="20" fontSize="10" fill="#FFE66D">★</text>
      <text x="60" y="20" fontSize="10" fill="#FFE66D">★</text>
      {/* Flex arms */}
      <path d="M 18 48 Q 10 40 14 34" stroke="#6B6B6B" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M 62 48 Q 70 40 66 34" stroke="#6B6B6B" strokeWidth="4" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  good: (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <ellipse cx="40" cy="52" rx="22" ry="18" fill="#6B6B6B"/>
      <ellipse cx="22" cy="24" rx="8" ry="9" fill="#6B6B6B"/>
      <ellipse cx="58" cy="24" rx="8" ry="9" fill="#6B6B6B"/>
      <ellipse cx="22" cy="24" rx="5" ry="6" fill="#FFB3B3"/>
      <ellipse cx="58" cy="24" rx="5" ry="6" fill="#FFB3B3"/>
      <ellipse cx="40" cy="36" rx="20" ry="18" fill="#888"/>
      <ellipse cx="32" cy="33" rx="9" ry="7" fill="#3A3A3A"/>
      <ellipse cx="48" cy="33" rx="9" ry="7" fill="#3A3A3A"/>
      <ellipse cx="32" cy="32" rx="4" ry="4" fill="white"/>
      <ellipse cx="48" cy="32" rx="4" ry="4" fill="white"/>
      <ellipse cx="33" cy="32" rx="2.5" ry="2.5" fill="#1A1A1A"/>
      <ellipse cx="49" cy="32" rx="2.5" ry="2.5" fill="#1A1A1A"/>
      <circle cx="34" cy="31" r="0.8" fill="white"/>
      <circle cx="50" cy="31" r="0.8" fill="white"/>
      <ellipse cx="40" cy="39" rx="3" ry="2" fill="#3A3A3A"/>
      <path d="M 32 44 Q 40 49 48 44" stroke="#3A3A3A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M 18 50 Q 12 44 16 38" stroke="#6B6B6B" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M 62 50 Q 68 44 64 38" stroke="#6B6B6B" strokeWidth="4" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  meh: (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <ellipse cx="40" cy="52" rx="22" ry="18" fill="#6B6B6B"/>
      <ellipse cx="22" cy="24" rx="8" ry="9" fill="#6B6B6B"/>
      <ellipse cx="58" cy="24" rx="8" ry="9" fill="#6B6B6B"/>
      <ellipse cx="22" cy="24" rx="5" ry="6" fill="#FFB3B3"/>
      <ellipse cx="58" cy="24" rx="5" ry="6" fill="#FFB3B3"/>
      <ellipse cx="40" cy="36" rx="20" ry="18" fill="#888"/>
      <ellipse cx="32" cy="33" rx="9" ry="7" fill="#3A3A3A"/>
      <ellipse cx="48" cy="33" rx="9" ry="7" fill="#3A3A3A"/>
      <ellipse cx="32" cy="33" rx="4" ry="3" fill="white"/>
      <ellipse cx="48" cy="33" rx="4" ry="3" fill="white"/>
      <ellipse cx="32" cy="34" rx="2.5" ry="2" fill="#1A1A1A"/>
      <ellipse cx="48" cy="34" rx="2.5" ry="2" fill="#1A1A1A"/>
      <ellipse cx="40" cy="39" rx="3" ry="2" fill="#3A3A3A"/>
      <path d="M 33 44 L 47 44" stroke="#3A3A3A" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 20 52 L 18 44" stroke="#6B6B6B" strokeWidth="4" strokeLinecap="round"/>
      <path d="M 60 52 L 62 44" stroke="#6B6B6B" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  ),
  struggling: (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <ellipse cx="40" cy="52" rx="22" ry="18" fill="#6B6B6B"/>
      <ellipse cx="22" cy="24" rx="8" ry="9" fill="#6B6B6B"/>
      <ellipse cx="58" cy="24" rx="8" ry="9" fill="#6B6B6B"/>
      <ellipse cx="22" cy="24" rx="5" ry="6" fill="#FFB3B3"/>
      <ellipse cx="58" cy="24" rx="5" ry="6" fill="#FFB3B3"/>
      <ellipse cx="40" cy="36" rx="20" ry="18" fill="#888"/>
      <ellipse cx="32" cy="33" rx="9" ry="7" fill="#3A3A3A"/>
      <ellipse cx="48" cy="33" rx="9" ry="7" fill="#3A3A3A"/>
      <ellipse cx="32" cy="34" rx="4" ry="3" fill="white"/>
      <ellipse cx="48" cy="34" rx="4" ry="3" fill="white"/>
      <ellipse cx="32" cy="35" rx="2.5" ry="2" fill="#1A1A1A"/>
      <ellipse cx="48" cy="35" rx="2.5" ry="2" fill="#1A1A1A"/>
      {/* Sad brows */}
      <path d="M 27 27 L 37 30" stroke="#3A3A3A" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 43 30 L 53 27" stroke="#3A3A3A" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="40" cy="40" rx="3" ry="2" fill="#3A3A3A"/>
      <path d="M 33 46 Q 40 43 47 46" stroke="#3A3A3A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Drop */}
      <ellipse cx="28" cy="42" rx="2" ry="3" fill="#74B9FF" opacity="0.7"/>
    </svg>
  ),
  asleep: (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <ellipse cx="40" cy="52" rx="22" ry="18" fill="#5A5A7A"/>
      <ellipse cx="22" cy="24" rx="8" ry="9" fill="#5A5A7A"/>
      <ellipse cx="58" cy="24" rx="8" ry="9" fill="#5A5A7A"/>
      <ellipse cx="22" cy="24" rx="5" ry="6" fill="#9B7EB3"/>
      <ellipse cx="58" cy="24" rx="5" ry="6" fill="#9B7EB3"/>
      <ellipse cx="40" cy="36" rx="20" ry="18" fill="#6B6B8A"/>
      <ellipse cx="32" cy="33" rx="9" ry="7" fill="#2A2A4A"/>
      <ellipse cx="48" cy="33" rx="9" ry="7" fill="#2A2A4A"/>
      {/* Closed eyes - Z Z Z */}
      <path d="M 28 33 L 36 33" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 44 33 L 52 33" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="40" cy="39" rx="3" ry="2" fill="#2A2A4A"/>
      <path d="M 33 44 Q 40 48 47 44" stroke="#2A2A4A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Zzz */}
      <text x="55" y="18" fontSize="8" fill="#9B7EB3" fontWeight="bold">z</text>
      <text x="61" y="12" fontSize="10" fill="#9B7EB3" fontWeight="bold">z</text>
      <text x="68" y="6" fontSize="12" fill="#9B7EB3" fontWeight="bold">Z</text>
      {/* Moon */}
      <text x="8" y="20" fontSize="14">🌙</text>
    </svg>
  ),
}

interface RaccoonMascotProps {
  mood: RaccoonMood
  message: string
  animate?: boolean
}

export default function RaccoonMascot({ mood, message, animate = true }: RaccoonMascotProps) {
  const moodColors: Record<RaccoonMood, string> = {
    thriving: 'from-orange-500/20 to-yellow-500/20 border-orange-500/30',
    good: 'from-green-500/20 to-teal-500/20 border-green-500/30',
    meh: 'from-blue-500/10 to-purple-500/10 border-blue-500/20',
    struggling: 'from-red-500/10 to-orange-500/10 border-red-500/20',
    asleep: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
  }

  return (
    <div className={cn(
      'rounded-2xl p-4 bg-gradient-to-br border glass flex items-center gap-4',
      moodColors[mood]
    )}>
      <div className={cn('w-16 h-16 flex-shrink-0', animate && mood !== 'asleep' && 'raccoon-bounce')}>
        {RACCOON_FACES[mood]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">
          Rocky says
        </div>
        <p className="text-sm text-white font-medium leading-snug">
          {message}
        </p>
      </div>
    </div>
  )
}
