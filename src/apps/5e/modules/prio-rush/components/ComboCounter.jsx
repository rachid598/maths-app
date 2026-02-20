import { getComboMultiplier } from '../engine'

export default function ComboCounter({ streak }) {
  const multiplier = getComboMultiplier(streak)
  if (streak < 2) return null

  return (
    <div className="flex items-center gap-2 animate-bounce">
      <span className="text-amber-400 font-black text-lg">
        🔥 {streak} combo
      </span>
      {multiplier > 1 && (
        <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full">
          ×{multiplier}
        </span>
      )}
    </div>
  )
}
