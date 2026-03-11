/**
 * Division posée — format français classique
 *
 *   9 1 4 │ 7
 *  −7     │──────
 *  ──     │ 1 3 0
 *   2↓1   │
 *  −2 1   │
 *  ────   │
 *     ↓4  │
 *    −0   │
 *     ─   │
 *     4   │  reste
 *
 * Grille : col 0 = espace pour le signe −, cols 1..n = chiffres du dividende
 */
export default function DivisionLayout({ division, currentStep, revealedSteps }) {
  const { a, b, r } = division
  const aDigits = String(a).split('').map(Number)
  const steps = division.steps
  const n = aDigits.length
  const totalCols = n + 1 // col 0 = signe, cols 1..n = chiffres

  // ─── Construction des lignes (gauche) ───
  const rows = []

  // Ligne 0 : chiffres du dividende
  {
    const cells = new Array(totalCols).fill(null)
    aDigits.forEach((d, i) => {
      cells[i + 1] = { value: String(d), cls: 'text-gray-800 dark:text-gray-100 font-bold' }
    })
    rows.push({ type: 'digits', cells })
  }

  // Pour chaque étape révélée : soustraction, trait, (flèche), reste
  for (let si = 0; si < Math.min(revealedSteps, steps.length); si++) {
    const step = steps[si]
    const col = step.digitIndex + 1 // colonne du chiffre courant (1-indexed)
    const isLast = si === steps.length - 1

    // ── Ligne de soustraction : −produit ──
    const prodStr = String(step.product)
    const subCells = new Array(totalCols).fill(null)
    // Le produit est aligné à droite sur la colonne `col`
    const prodFirstCol = col - prodStr.length + 1
    // Signe −, une colonne avant le premier chiffre du produit
    const signCol = prodFirstCol - 1
    if (signCol >= 0) {
      subCells[signCol] = { value: '−', cls: 'text-red-500 dark:text-red-400 font-bold' }
    }
    for (let pi = 0; pi < prodStr.length; pi++) {
      const c = prodFirstCol + pi
      if (c >= 0 && c < totalCols) {
        subCells[c] = { value: prodStr[pi], cls: 'text-red-500 dark:text-red-400 font-bold' }
      }
    }
    rows.push({ type: 'digits', cells: subCells, animate: true })

    // ── Trait de séparation ──
    const lineFrom = Math.max(0, signCol)
    const lineTo = col
    rows.push({ type: 'line', from: lineFrom, to: lineTo, animate: true })

    // ── Flèche ↓ pour le chiffre descendu ──
    if (!isLast && step.bringDown !== null) {
      const arrowCells = new Array(totalCols).fill(null)
      arrowCells[col + 1] = {
        value: '↓',
        cls: 'text-blue-500 dark:text-blue-400 text-sm leading-none',
      }
      rows.push({ type: 'arrow', cells: arrowCells, animate: true })
    }

    // ── Reste (+ chiffre descendu) ──
    const remCells = new Array(totalCols).fill(null)
    const remStr = String(step.remainder)
    // Reste aligné à droite sur la colonne `col`
    for (let ri = 0; ri < remStr.length; ri++) {
      const c = col - remStr.length + 1 + ri
      if (c >= 0 && c < totalCols) {
        remCells[c] = {
          value: remStr[ri],
          cls: isLast
            ? (step.remainder === 0
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-amber-600 dark:text-amber-400 font-bold')
            : 'text-emerald-600 dark:text-emerald-400 font-bold',
        }
      }
    }
    // Chiffre descendu
    if (!isLast && step.bringDown !== null) {
      remCells[col + 1] = {
        value: String(step.bringDown),
        cls: 'text-blue-500 dark:text-blue-400 font-bold',
      }
    }
    rows.push({ type: 'digits', cells: remCells, animate: true })
  }

  // ─── Quotient ───
  const quotientDigits = steps.map((s, i) => {
    if (i < revealedSteps) return { value: String(s.quotientDigit), revealed: true }
    if (i === currentStep) return { value: '?', current: true }
    return { value: '·', hidden: true }
  })

  // ─── Rendu ───
  const CW = 28 // largeur cellule en px
  const CH = 28 // hauteur cellule en px
  const arrowH = 16 // hauteur réduite pour la ligne flèche

  return (
    <div className="font-mono text-lg select-none flex justify-center">
      {/* ── Côté gauche : dividende + calculs ── */}
      <div className="flex flex-col">
        {rows.map((row, ri) => {
          if (row.type === 'line') {
            return (
              <div
                key={ri}
                className={`flex ${row.animate ? 'animate-slide-up' : ''}`}
                style={{ height: 6 }}
              >
                {Array.from({ length: totalCols }).map((_, ci) => (
                  <div key={ci} style={{ width: CW }}>
                    {ci >= row.from && ci <= row.to && (
                      <div className="border-b-2 border-gray-400 dark:border-gray-500 w-full" />
                    )}
                  </div>
                ))}
              </div>
            )
          }

          const isArrow = row.type === 'arrow'
          return (
            <div
              key={ri}
              className={`flex ${row.animate ? 'animate-slide-up' : ''}`}
              style={{ height: isArrow ? arrowH : CH }}
            >
              {row.cells.map((cell, ci) => (
                <div
                  key={ci}
                  className="flex items-center justify-center"
                  style={{ width: CW, height: isArrow ? arrowH : CH }}
                >
                  {cell && <span className={cell.cls}>{cell.value}</span>}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* ── Barre verticale ── */}
      <div className="flex flex-col mx-0.5">
        <div
          className="border-l-2 border-gray-600 dark:border-gray-300 flex items-center pl-2"
          style={{ height: CH }}
        >
          <span className="text-gray-800 dark:text-gray-100 font-bold whitespace-nowrap">{b}</span>
        </div>
        <div className="border-l-2 border-gray-600 dark:border-gray-300 flex-1" />
      </div>

      {/* ── Côté droit : quotient ── */}
      <div className="flex flex-col">
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
        {/* Annotation reste final */}
        {revealedSteps === steps.length && r > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 animate-pop-in whitespace-nowrap">
            reste {r}
          </p>
        )}
      </div>
    </div>
  )
}
