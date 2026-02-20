import { getStars } from '../engine'
import { getHistoryForModule } from '../../../hooks/useHistory'

function MiniChart() {
  const history = getHistoryForModule('CT', 10)
  if (history.length < 2) return null
  const maxScore = Math.max(...history.map(h => h.score), 1)
  const w = 240
  const h = 60
  const step = w / (history.length - 1)

  const points = history.map((entry, i) => {
    const x = i * step
    const y = h - (entry.score / maxScore) * (h - 4)
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="mt-4">
      <p className="text-xs text-[#64748b] mb-1">Historique</p>
      <svg width={w} height={h} className="mx-auto">
        <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {history.map((entry, i) => (
          <circle key={i} cx={i * step} cy={h - (entry.score / maxScore) * (h - 4)} r="3" fill="#6366f1" />
        ))}
      </svg>
    </div>
  )
}

export default function ScoreScreen({ score, maxScore, correct, total, comboMax, avgTime, onReplay, onHome }) {
  const stars = getStars(score, maxScore)

  return (
    <div className="animate-pop-in text-center max-w-sm mx-auto">
      <div className="text-5xl mb-2">
        {stars >= 3 ? '🏆' : stars >= 2 ? '🌟' : stars >= 1 ? '⭐' : '💪'}
      </div>

      <div className="flex justify-center gap-1 mb-3">
        {[1, 2, 3].map(i => (
          <span key={i} className={`text-3xl transition-all ${i <= stars ? 'opacity-100 scale-110' : 'opacity-20'}`}>⭐</span>
        ))}
      </div>

      <h2 className="text-4xl font-extrabold text-[#6366f1] mb-1">{score} pts</h2>
      <p className="text-[#64748b] mb-4">{correct}/{total} bonnes réponses</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-[#64748b]">Combo max</p>
          <p className="text-xl font-bold text-[#fbbf24]">🔥 {comboMax}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-[#64748b]">Précision</p>
          <p className="text-xl font-bold text-[#10b981]">{total > 0 ? Math.round(correct / total * 100) : 0}%</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-[#64748b]">Tps moyen</p>
          <p className="text-xl font-bold text-[#6366f1]">{avgTime.toFixed(1)}s</p>
        </div>
      </div>

      <MiniChart />

      <button onClick={onReplay} className="w-full py-3 rounded-xl bg-[#6366f1] text-white font-bold active:scale-95 transition-transform mb-3 mt-4">
        Rejouer
      </button>
      <button onClick={onHome} className="text-sm text-[#64748b]">← Retour au Hub</button>
    </div>
  )
}
