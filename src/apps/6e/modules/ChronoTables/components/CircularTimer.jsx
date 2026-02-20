import { useMemo } from 'react'

const SIZE = 80
const STROKE = 6
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function CircularTimer({ timeLeft, totalTime }) {
  const progress = totalTime > 0 ? timeLeft / totalTime : 1
  const offset = CIRCUMFERENCE * (1 - progress)
  const color = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#fbbf24' : '#6366f1'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          fill="none" stroke="#e5e7eb" strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          fill="none" stroke={color} strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span className="absolute text-lg font-extrabold" style={{ color }}>
        {timeLeft}
      </span>
    </div>
  )
}
