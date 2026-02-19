/**
 * Renders a fraction as a vertical numerator/bar/denominator display.
 * Supports strike-through animation on factors.
 */
export default function Fraction({
  numerator,
  denominator,
  factorNum,
  factorDen,
  divisor,
  struck,
  size = 'text-2xl',
}) {
  // If we have factors to show (decomposed form): num = factorNum × divisor
  if (factorNum !== undefined && factorDen !== undefined && divisor) {
    return (
      <span className={`frac ${size}`}>
        <span className="num flex items-center gap-0.5">
          <span className={struck ? 'strike-anim text-danger' : 'text-primary-light'}>
            {divisor}
          </span>
          <span className="text-slate-500 mx-0.5">&times;</span>
          <span>{factorNum}</span>
        </span>
        <span className="bar" />
        <span className="den flex items-center gap-0.5">
          <span className={struck ? 'strike-anim text-danger' : 'text-primary-light'}>
            {divisor}
          </span>
          <span className="text-slate-500 mx-0.5">&times;</span>
          <span>{factorDen}</span>
        </span>
      </span>
    )
  }

  // Simple fraction
  return (
    <span className={`frac ${size}`}>
      <span className="num">{numerator}</span>
      <span className="bar" />
      <span className="den">{denominator}</span>
    </span>
  )
}
