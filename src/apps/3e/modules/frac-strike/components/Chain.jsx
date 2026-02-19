import Fraction from './Fraction'

/**
 * Equality chain: 12/18 = 6×2/6×3 = 2/3
 * Horizontal scroll on mobile.
 */
export default function Chain({ steps }) {
  if (!steps || steps.length === 0) return null

  return (
    <div className="mx-auto max-w-lg rounded-xl bg-surface/70 px-4 py-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
        Chaîne d'égalités
      </p>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {steps.map((step, i) => (
          <span key={i} className="flex shrink-0 items-center gap-2">
            {i > 0 && <span className="text-xl text-slate-500">=</span>}
            <Fraction
              num={step.num}
              den={step.den}
              factor={step.factor}
              struck={step.struck}
              highlight={i === steps.length - 1 && !step.struck}
            />
          </span>
        ))}
      </div>
    </div>
  )
}
