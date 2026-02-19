import { X } from 'lucide-react'

const rules = [
  { divisor: 2, rule: 'Dernier chiffre pair (0, 2, 4, 6, 8)', color: 'text-cyan-400' },
  { divisor: 3, rule: 'Somme des chiffres divisible par 3', color: 'text-emerald-400' },
  { divisor: 4, rule: 'Deux derniers chiffres divisibles par 4', color: 'text-amber-400' },
  { divisor: 5, rule: 'Dernier chiffre = 0 ou 5', color: 'text-cyan-400' },
  { divisor: 6, rule: 'Divisible par 2 ET par 3', color: 'text-purple-400' },
  { divisor: 9, rule: 'Somme des chiffres divisible par 9', color: 'text-emerald-400' },
  { divisor: 10, rule: 'Dernier chiffre = 0', color: 'text-cyan-400' },
]

export default function HelpModal({ open, onClose }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Critères de divisibilité</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-3">
          {rules.map((r) => (
            <div key={r.divisor} className="flex gap-3 items-start">
              <span
                className={`shrink-0 w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center font-bold ${r.color}`}
              >
                ÷{r.divisor}
              </span>
              <p className="text-sm text-slate-300 pt-2">{r.rule}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl font-bold bg-primary hover:bg-primary-dark transition-colors"
        >
          Compris !
        </button>
      </div>
    </div>
  )
}
