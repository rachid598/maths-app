/**
 * Division posée format français :
 *
 *   6 8 4 │ 5
 *  -5      │──────
 *  ───     │ 1 3 6
 *   1 8    │
 *  -1 5    │
 *  ─────   │
 *     3 4  │
 *    -3 0  │
 *    ────  │
 *       4  │  ← reste
 */
export default function DivisionLayout({ division, currentStep, revealedSteps }) {
  const { a, b, q, r } = division
  const aDigits = String(a).split('')
  const steps = division.steps
  const totalCols = aDigits.length + 1 // extra col for overflow

  // Build rows for the left side (dividend + subtractions)
  const rows = []

  // Row 0: the dividend digits
  const dividendRow = new Array(totalCols).fill(null)
  aDigits.forEach((d, i) => { dividendRow[i + 1] = { value: d, className: 'text-gray-800 dark:text-gray-100 font-bold' } })
  rows.push({ cells: dividendRow, type: 'dividend' })

  // For each revealed step, add: subtraction line, separator, remainder
  for (let si = 0; si < Math.min(revealedSteps, steps.length); si++) {
    const step = steps[si]
    const pos = step.digitIndex + 1 // position of the current digit (1-indexed in our grid)

    // The partial number starts at some position
    // Product line: -product aligned to the partial
    const productStr = String(step.product)
    const subRow = new Array(totalCols).fill(null)
    // Place the minus sign and product digits
    const productEnd = pos + 1 // product aligns to current digit position
    const productStart = productEnd - productStr.length
    subRow[Math.max(0, productStart - 1)] = { value: '−', className: 'text-danger font-bold' }
    for (let pi = 0; pi < productStr.length; pi++) {
      const col = productStart + pi
      if (col >= 0 && col < totalCols) {
        subRow[col] = { value: productStr[pi], className: 'text-danger font-bold' }
      }
    }
    rows.push({ cells: subRow, type: 'subtraction' })

    // Separator line
    const sepStart = Math.max(0, productStart - 1)
    const sepEnd = productEnd
    rows.push({ type: 'separator', from: sepStart, to: sepEnd })

    // Remainder + bring down
    const remRow = new Array(totalCols).fill(null)
    const isLast = si === steps.length - 1

    if (isLast) {
      // Final remainder
      const remStr = String(step.remainder)
      for (let ri = 0; ri < remStr.length; ri++) {
        const col = pos - remStr.length + 1 + ri
        if (col >= 0 && col < totalCols) {
          remRow[col] = {
            value: remStr[ri],
            className: step.remainder === 0
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-amber-600 dark:text-amber-400 font-bold',
          }
        }
      }
    } else {
      // Remainder + next digit brought down
      const nextDigit = aDigits[step.digitIndex + 1]
      const combined = String(step.remainder) + nextDigit
      for (let ci = 0; ci < combined.length; ci++) {
        const col = pos - combined.length + 2 + ci
        if (col >= 0 && col < totalCols) {
          const isBroughtDown = ci === combined.length - 1
          remRow[col] = {
            value: combined[ci],
            className: isBroughtDown
              ? 'text-blue-500 dark:text-blue-400 font-bold'
              : 'text-emerald-600 dark:text-emerald-400 font-bold',
          }
        }
      }
    }
    rows.push({ cells: remRow, type: 'remainder' })
  }

  // Build quotient display
  const quotientDigits = steps.map((s, i) => {
    if (i < revealedSteps) return { value: String(s.quotientDigit), revealed: true }
    if (i === currentStep) return { value: '?', current: true }
    return { value: '·', hidden: true }
  })

  const cellW = 'w-7 sm:w-8'
  const cellH = 'h-7 sm:h-8'
  const fontSize = 'text-lg sm:text-xl'

  return (
    <div className={`font-mono ${fontSize} select-none flex justify-center`}>
      {/* Left side: dividend and work */}
      <div className="flex flex-col items-start">
        {rows.map((row, ri) => {
          if (row.type === 'separator') {
            return (
              <div key={ri} className="flex animate-slide-up">
                {Array.from({ length: totalCols }).map((_, ci) => (
                  <div key={ci} className={cellW}>
                    {ci >= row.from && ci <= row.to && (
                      <div className="border-b-2 border-gray-400 dark:border-gray-500 w-full mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            )
          }
          return (
            <div
              key={ri}
              className={`flex ${ri > 0 ? 'animate-slide-up' : ''}`}
            >
              {row.cells.map((cell, ci) => (
                <div
                  key={ci}
                  className={`${cellW} ${cellH} flex items-center justify-center`}
                >
                  {cell && <span className={cell.className}>{cell.value}</span>}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Vertical bar */}
      <div className="flex flex-col items-center mx-1">
        <div className={`border-l-2 border-gray-600 dark:border-gray-300 ${cellH} flex items-center pl-2`}>
          <span className="text-gray-800 dark:text-gray-100 font-bold">{b}</span>
        </div>
        <div className="border-l-2 border-gray-600 dark:border-gray-300 flex-1" />
      </div>

      {/* Right side: quotient */}
      <div className="flex flex-col items-start">
        {/* Separator under divisor */}
        <div className={`${cellH} flex items-end`}>
          <div className="border-b-2 border-gray-600 dark:border-gray-300 flex">
            {quotientDigits.map((_, i) => (
              <div key={i} className={cellW} />
            ))}
          </div>
        </div>
        {/* Quotient digits */}
        <div className="flex mt-1">
          {quotientDigits.map((d, i) => (
            <div
              key={i}
              className={`${cellW} ${cellH} flex items-center justify-center font-bold ${
                d.revealed
                  ? 'text-primary-dark dark:text-primary-light'
                  : d.current
                    ? 'text-primary animate-pulse'
                    : 'text-gray-300 dark:text-gray-600'
              }`}
            >
              {d.value}
            </div>
          ))}
        </div>
        {/* Final result annotation */}
        {revealedSteps === steps.length && r > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 animate-pop-in">
            reste {r}
          </p>
        )}
      </div>
    </div>
  )
}
