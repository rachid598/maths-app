import { ArrowRight } from 'lucide-react'

export default function HintSteps({ hintSteps, visible }) {
  if (!visible) return null
  return (
    <div className="bg-surface rounded-2xl p-4 space-y-2 border border-indigo-500/30">
      <p className="text-xs text-indigo-300 font-semibold text-center mb-1">💡 Aide — Étapes inversées</p>
      {hintSteps.map((step, i) => (
        <div key={i} className="flex items-center justify-center gap-2 text-sm">
          <span className="text-white font-mono font-bold">{step.from}</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 italic">{step.text}</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <span className="text-accent font-mono font-bold">{step.to}</span>
        </div>
      ))}
    </div>
  )
}
