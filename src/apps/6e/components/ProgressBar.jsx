export default function ProgressBar({ current, total, streak }) {
  const pct = Math.round((current / total) * 100)
  const isGold = streak >= 5

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{current} / {total}</span>
        {streak >= 3 && (
          <span className="text-accent font-bold">
            {'\uD83D\uDD25'} {streak} d'affilée !
          </span>
        )}
      </div>
      <div className={`h-3 rounded-full bg-gray-200 overflow-hidden
        ${isGold ? 'animate-gold-glow ring-2 ring-gold' : ''}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out
            ${isGold
              ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
              : 'bg-gradient-to-r from-primary to-primary-light'
            }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
