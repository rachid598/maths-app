import { Trophy, RotateCcw, ArrowLeft, Eye } from 'lucide-react'
import { computeGrade, GRADE_COLORS } from '../engine'

export default function ScoreScreen({ results, totalTime, onReplay, onBack, onShowCorrection }) {
  const correct = results.filter(r => r.correct).length
  const total = results.length
  const grade = computeGrade(correct, total)
  const gradeColor = GRADE_COLORS[grade]
  let streak = 0, maxStreak = 0
  for (const r of results) { if (r.correct) { streak++; maxStreak = Math.max(maxStreak, streak) } else streak = 0 }
  const mins = Math.floor(totalTime / 60)
  const secs = totalTime % 60

  return (
    <div className="mx-auto max-w-lg text-center">
      <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
      <h2 className="mb-2 text-3xl font-black text-white">Résultats</h2>
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full text-4xl font-black" style={{ backgroundColor: gradeColor + '20', color: gradeColor, border: `3px solid ${gradeColor}` }}>{grade}</div>
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-700 bg-surface p-4"><p className="text-2xl font-black text-white">{correct}/{total}</p><p className="text-xs text-slate-400">Bonnes réponses</p></div>
        <div className="rounded-2xl border border-slate-700 bg-surface p-4"><p className="text-2xl font-black text-yellow-400">{maxStreak}</p><p className="text-xs text-slate-400">Streak max</p></div>
        <div className="rounded-2xl border border-slate-700 bg-surface p-4"><p className="text-2xl font-black text-cyan-400">{mins}:{String(secs).padStart(2, '0')}</p><p className="text-xs text-slate-400">Temps</p></div>
      </div>
      <div className="flex flex-col gap-3">
        <button onClick={onShowCorrection} className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-surface px-4 py-3 font-bold text-white transition hover:border-accent"><Eye className="h-4 w-4" /> Voir correction détaillée</button>
        <button onClick={onReplay} className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-bold text-white transition hover:bg-accent/80"><RotateCcw className="h-4 w-4" /> Rejouer</button>
        <button onClick={onBack} className="flex items-center justify-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Retour au hub</button>
      </div>
    </div>
  )
}
