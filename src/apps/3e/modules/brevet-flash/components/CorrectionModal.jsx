import { X, CheckCircle, XCircle } from 'lucide-react'
import { THEME_COLORS } from '../engine'

export default function CorrectionModal({ results, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-surface p-6">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white"><X className="h-5 w-5" /></button>
        <h3 className="mb-4 text-xl font-black text-white">Correction détaillée</h3>
        <div className="space-y-4">
          {results.map((r, i) => (
            <div key={i} className={`rounded-xl border p-4 ${r.correct ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: THEME_COLORS[r.question.theme] || '#6366f1' }}>{r.question.theme}</span>
                {r.correct ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-red-400" />}
              </div>
              <p className="mb-2 text-sm font-medium text-white">{r.question.text}</p>
              <p className="text-xs text-slate-400">Ta réponse : <span className={r.correct ? 'text-emerald-400' : 'text-red-400'}>{r.userAnswer}</span>{!r.correct && <> — Attendue : <span className="text-white">{r.question.answer}</span></>}</p>
              <p className="mt-1 text-xs text-slate-500">{r.question.explanation}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-xl bg-accent py-3 font-bold text-white transition hover:bg-accent/80">Fermer</button>
      </div>
    </div>
  )
}
