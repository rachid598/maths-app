/**
 * Fraction display with strike animation.
 *
 * Normal: num/den stacked vertically.
 * Struck: factor×quotient / factor×quotient with factor struck through in red.
 * Order: diviseur (factor) à gauche, quotient à droite.
 */
export default function Fraction({ num, den, factor, struck, highlight }) {
  // Simple fraction display (no decomposition)
  if (!struck || !factor) {
    return (
      <div className={`inline-flex flex-col items-center ${highlight ? 'text-accent font-bold' : ''}`}>
        <span className="border-b-2 border-slate-500 px-2 pb-0.5 text-xl font-bold leading-tight">
          {num}
        </span>
        <span className="px-2 pt-0.5 text-xl font-bold leading-tight">
          {den}
        </span>
      </div>
    )
  }

  // Decomposed fraction with strike: factor × quotient / factor × quotient
  const quotientNum = num / factor
  const quotientDen = den / factor

  // Format quotient with parentheses if negative
  const fmtQ = (q) => (q < 0 ? `(${q})` : String(q))

  return (
    <div className="inline-flex flex-col items-center">
      <span className="border-b-2 border-slate-500 px-2 pb-0.5 text-xl font-bold leading-tight">
        <span className="strike-through text-red-400">{Math.abs(factor)}</span>
        <span className="text-slate-500">{'\u00d7'}</span>
        <span className="text-emerald-400">{fmtQ(quotientNum)}</span>
      </span>
      <span className="px-2 pt-0.5 text-xl font-bold leading-tight">
        <span className="strike-through text-red-400">{Math.abs(factor)}</span>
        <span className="text-slate-500">{'\u00d7'}</span>
        <span className="text-emerald-400">{fmtQ(quotientDen)}</span>
      </span>
    </div>
  )
}
