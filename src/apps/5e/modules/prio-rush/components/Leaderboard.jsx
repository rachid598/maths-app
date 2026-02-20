import { Trophy } from 'lucide-react'
import { getLeaderboard } from '../engine'

export default function Leaderboard() {
  const lb = getLeaderboard()
  if (lb.length === 0) return null

  return (
    <div className="bg-surface rounded-2xl p-4 mt-4">
      <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-400" /> Top 5
      </h3>
      <div className="space-y-2">
        {lb.map((entry, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-slate-400 w-6">{i + 1}.</span>
            <span className="flex-1 font-semibold text-white">{entry.score} pts</span>
            <span className="text-slate-400 text-xs">{entry.correct}/10 — combo max {entry.comboMax}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
