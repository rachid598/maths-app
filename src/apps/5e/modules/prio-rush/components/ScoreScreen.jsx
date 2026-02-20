import { Trophy, RotateCcw, ArrowLeft } from 'lucide-react'
import Leaderboard from './Leaderboard'

export default function ScoreScreen({ stats, onReplay, onBack }) {
  const { score, correct, total, comboMax, avgTime } = stats
  const perfect = correct === total

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-surface rounded-2xl p-8 max-w-sm w-full text-center">
        <Trophy className={`w-16 h-16 mx-auto mb-4 ${perfect ? 'text-amber-400' : 'text-indigo-400'}`} />
        <h2 className="text-2xl font-bold mb-2">{perfect ? 'Parfait !' : 'Bien joué !'}</h2>
        <p className="text-4xl font-black text-amber-400 mb-1">{score} pts</p>

        <div className="grid grid-cols-3 gap-3 my-4 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-400">{correct}/{total}</p>
            <p className="text-xs text-slate-400">Bonnes rép.</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">🔥 {comboMax}</p>
            <p className="text-xs text-slate-400">Combo max</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo-400">{avgTime}s</p>
            <p className="text-xs text-slate-400">Moy/rép.</p>
          </div>
        </div>

        <Leaderboard />

        <div className="space-y-3 mt-6">
          <button onClick={onReplay} className="w-full py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 transition-colors text-white">
            <RotateCcw className="w-4 h-4 inline mr-2" />Rejouer
          </button>
          <button onClick={onBack} className="w-full py-3 rounded-xl font-bold text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 inline mr-2" />Retour au menu
          </button>
        </div>
      </div>
    </div>
  )
}
