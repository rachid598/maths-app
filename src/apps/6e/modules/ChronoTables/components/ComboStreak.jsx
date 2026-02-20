import { getComboMultiplier } from '../engine'

export default function ComboStreak({ streak }) {
  if (streak < 2) return null
  const mult = getComboMultiplier(streak)

  return (
    <div className="flex items-center gap-1 animate-pop-in">
      <span className="text-sm font-bold text-[#fbbf24]">🔥 {streak}</span>
      {mult > 1 && (
        <span className="bg-[#fbbf24] text-white text-xs font-bold px-2 py-0.5 rounded-full">
          ×{mult}
        </span>
      )}
    </div>
  )
}
