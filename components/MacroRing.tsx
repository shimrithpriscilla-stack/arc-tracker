'use client'

interface MacroRingProps {
  value: number
  target: number
  color: string
  label: string
  unit: string
  size?: number
}

export default function MacroRing({ value, target, color, label, unit, size = 80 }: MacroRingProps) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value / target, 1)
  const offset = circumference - pct * circumference
  const over = value > target
  const overPct = over ? Math.min(((value - target) / target) * 100, 99) : 0

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={8}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={over ? '#FF4444' : color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold leading-none" style={{ color: over ? '#FF4444' : color }}>
            {value < 1000 ? Math.round(value) : `${(value/1000).toFixed(1)}k`}
          </span>
          {over && (
            <span className="text-[9px] text-red-400 leading-none mt-0.5">
              +{Math.round(overPct)}%
            </span>
          )}
        </div>
      </div>
      <div className="text-center">
        <div className="text-[10px] text-gray-400 font-medium">{label}</div>
        <div className="text-[9px] text-gray-600">{Math.round(target)}{unit}</div>
      </div>
    </div>
  )
}
