/**
 * Division posée — format français
 *
 * Grille de N colonnes (= nb chiffres du dividende).
 * Le signe − est positionné en absolu à gauche du premier chiffre du produit.
 * Les flèches ↓ indiquent le chiffre qu'on descend.
 */
export default function DivisionLayout({ division, currentStep, revealedSteps }) {
  const { a, b, r } = division
  const aDigits = String(a).split('').map(Number)
  const steps = division.steps
  const n = aDigits.length

  const CW = 30 // cell width px
  const CH = 30 // cell height px

  // ─── Construction des lignes ───
  const rows = []

  // Ligne dividende
  const divCells = Array(n).fill(null)
  aDigits.forEach((d, i) => {
    divCells[i] = { value: String(d), cls: 'text-gray-800 dark:text-gray-100 font-bold' }
  })
  rows.push({ type: 'digits', cells: [...divCells] })

  for (let si = 0; si < Math.min(revealedSteps, steps.length); si++) {
    const step = steps[si]
    const di = step.digitIndex // colonne du chiffre courant (0-indexed)
    const isLast = si === steps.length - 1
    const prodStr = String(step.product)
    const prodFirstCol = di - prodStr.length + 1

    // ── Soustraction ──
    const subCells = Array(n).fill(null)
    for (let pi = 0; pi < prodStr.length; pi++) {
      const col = prodFirstCol + pi
      if (col >= 0 && col < n) {
        subCells[col] = {
          value: prodStr[pi],
          cls: 'text-red-500 dark:text-red-400 font-bold',
          minus: pi === 0, // afficher − avant ce chiffre
        }
      }
    }
    rows.push({ type: 'digits', cells: [...subCells], animate: true })

    // ── Trait ──
    rows.push({
      type: 'line',
      from: Math.max(0, prodFirstCol),
      to: di,
      animate: true,
    })

    // ── Reste + chiffre descendu ──
    const remStr = String(step.remainder)
    const remCells = Array(n).fill(null)

    // Chiffres du reste, alignés à droite sur la colonne di
    for (let ri = 0; ri < remStr.length; ri++) {
      const col = di - remStr.length + 1 + ri
      if (col >= 0 && col < n) {
        remCells[col] = {
          value: remStr[ri],
          cls: isLast
            ? step.remainder === 0
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-amber-600 dark:text-amber-400 font-bold'
            : 'text-emerald-600 dark:text-emerald-400 font-bold',
        }
      }
    }

    // Chiffre descendu avec flèche
    if (!isLast && step.bringDown !== null) {
      const bdCol = di + 1
      if (bdCol < n) {
        remCells[bdCol] = {
          value: String(step.bringDown),
          cls: 'text-blue-500 dark:text-blue-400 font-bold',
          arrow: true,
        }
      }
    }

    rows.push({ type: 'digits', cells: [...remCells], animate: true })
  }

  // ─── Quotient ───
  const quotientDigits = steps.map((s, i) => {
    if (i < revealedSteps) return { value: String(s.quotientDigit), revealed: true }
    if (i === currentStep) return { value: '?', current: true }
    return { value: '·', hidden: true }
  })

  const isComplete = revealedSteps === steps.length

  // ─── Rendu ───
  return (
    <div className="flex flex-col items-center gap-3">
    <div className="font-mono text-lg select-none flex justify-center gap-0">
      {/* ── Gauche : dividende + calculs ── */}
      <div className="flex flex-col">
        {rows.map((row, ri) => {
          if (row.type === 'line') {
            return (
              <div
                key={ri}
                className={`flex ${row.animate ? 'animate-slide-up' : ''}`}
                style={{ height: 6 }}
              >
                {Array.from({ length: n }).map((_, ci) => (
                  <div key={ci} style={{ width: CW }}>
                    {ci >= row.from && ci <= row.to && (
                      <div className="border-b-2 border-gray-400 dark:border-gray-500 w-full" />
                    )}
                  </div>
                ))}
              </div>
            )
          }
          return (
            <div
              key={ri}
              className={`flex ${row.animate ? 'animate-slide-up' : ''}`}
              style={{ height: CH }}
            >
              {row.cells.map((cell, ci) => (
                <div
                  key={ci}
                  className="flex items-center justify-center relative"
                  style={{ width: CW, height: CH }}
                >
                  {/* Signe − positionné à gauche */}
                  {cell?.minus && (
                    <span
                      className="text-red-500 dark:text-red-400 font-bold absolute"
                      style={{ right: '80%', top: '50%', transform: 'translateY(-50%)' }}
                    >
                      −
                    </span>
                  )}
                  {/* Flèche ↓ au-dessus du chiffre descendu */}
                  {cell?.arrow && (
                    <span
                      className="text-blue-500 dark:text-blue-400 absolute text-xs font-bold"
                      style={{ top: -2, left: '50%', transform: 'translateX(-50%)' }}
                    >
                      ↓
                    </span>
                  )}
                  {cell && <span className={cell.cls}>{cell.value}</span>}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* ── Barre verticale ── */}
      <div className="flex flex-col">
        <div
          className="border-l-2 border-gray-600 dark:border-gray-300 flex items-center pl-2"
          style={{ height: CH }}
        >
          <span className="text-gray-800 dark:text-gray-100 font-bold whitespace-nowrap">{b}</span>
        </div>
        <div className="border-l-2 border-gray-600 dark:border-gray-300 flex-1" />
      </div>

      {/* ── Droite : quotient ── */}
      <div className="flex flex-col pl-1">
        {/* Trait sous le diviseur */}
        <div className="flex items-end" style={{ height: CH }}>
          <div className="border-b-2 border-gray-600 dark:border-gray-300 flex">
            {quotientDigits.map((_, i) => (
              <div key={i} style={{ width: CW }} />
            ))}
          </div>
        </div>
        {/* Chiffres du quotient */}
        <div className="flex" style={{ height: CH }}>
          {quotientDigits.map((d, i) => (
            <div
              key={i}
              className={`flex items-center justify-center font-bold ${
                d.revealed
                  ? 'text-primary-dark dark:text-primary-light'
                  : d.current
                    ? 'text-primary animate-pulse'
                    : 'text-gray-300 dark:text-gray-600'
              }`}
              style={{ width: CW }}
            >
              {d.value}
            </div>
          ))}
        </div>
        {/* Reste final */}
        {revealedSteps === steps.length && r > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 animate-pop-in whitespace-nowrap">
            reste {r}
          </p>
        )}
      </div>
    </div>

    {/* Égalité en ligne */}
    {isComplete && (
      <div className="animate-pop-in text-center mt-1">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
          <span className="text-primary-dark dark:text-primary-light">{a}</span>
          {' = '}
          <span className="text-primary-dark dark:text-primary-light">{b}</span>
          {' × '}
          <span className="text-primary-dark dark:text-primary-light">{division.q}</span>
          {' + '}
          <span className={r > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>{r}</span>
        </p>
        {r > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">
            {r} {'<'} {b} {'\u2714\uFE0F'}
          </p>
        )}
      </div>
    )}
    </div>
  )
}
