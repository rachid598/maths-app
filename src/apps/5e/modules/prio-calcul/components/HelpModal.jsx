import { X } from 'lucide-react'

export default function HelpModal({ open, onClose }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Ordre de priorité</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">
              1
            </span>
            <div>
              <p className="font-semibold text-accent">Parenthèses ( )</p>
              <p className="text-sm text-slate-600">On calcule d'abord ce qui est entre parenthèses.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary-light flex items-center justify-center text-sm font-bold">
              2
            </span>
            <div>
              <p className="font-semibold text-primary-light">Multiplications ×</p>
              <p className="text-sm text-slate-600">Avant les additions et soustractions.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold">
              3
            </span>
            <div>
              <p className="font-semibold text-slate-700">Additions + et Soustractions -</p>
              <p className="text-sm text-slate-600">De gauche à droite.</p>
            </div>
          </li>
        </ol>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl font-bold bg-primary hover:bg-primary-dark transition-colors text-white"
        >
          Compris !
        </button>
      </div>
    </div>
  )
}
