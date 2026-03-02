import { useState, useRef, useEffect } from 'react'

/**
 * Expert mode: student fills in the decomposition themselves.
 * Shows: num/den = [?] × [?] / [?] × [?]
 * The student enters: simplifiedNum, commonDivisor, simplifiedDen
 * The divisor appears both top and bottom.
 */
export default function CompletionInput({
  numerator,
  denominator,
  onCorrect,
  disabled,
}) {
  const [numField, setNumField] = useState('')
  const [divField, setDivField] = useState('')
  const [denField, setDenField] = useState('')
  const [activeField, setActiveField] = useState('div')
  const [error, setError] = useState(null)
  const errorTimeout = useRef(null)

  // Focus tracking for which field gets keypad input
  const fields = { num: [numField, setNumField], div: [divField, setDivField], den: [denField, setDenField] }

  function handleDigit(digit) {
    if (disabled) return
    const [val, setter] = fields[activeField]
    if ((val + String(digit)).length <= 4) {
      setter(val + String(digit))
    }
  }

  function handleDelete() {
    if (disabled) return
    const [val, setter] = fields[activeField]
    setter(val.slice(0, -1))
  }

  function handleClear() {
    if (disabled) return
    const [, setter] = fields[activeField]
    setter('')
  }

  function handleValidate() {
    if (disabled) return
    clearTimeout(errorTimeout.current)

    const n = parseInt(numField, 10)
    const d = parseInt(divField, 10)
    const dn = parseInt(denField, 10)

    if (!n || !d || !dn || d < 2) {
      setError('Remplis les 3 cases !')
      errorTimeout.current = setTimeout(() => setError(null), 2000)
      return
    }

    // Check: n × d must equal numerator AND dn × d must equal denominator
    if (n * d !== numerator || dn * d !== denominator) {
      setError('La décomposition est incorrecte')
      errorTimeout.current = setTimeout(() => setError(null), 2000)
      return
    }

    // Correct! Pass the divisor back
    onCorrect(n, d, dn)
  }

  // Cleanup
  useEffect(() => {
    return () => clearTimeout(errorTimeout.current)
  }, [])

  // Reset fields when fraction changes
  useEffect(() => {
    setNumField('')
    setDivField('')
    setDenField('')
    setActiveField('div')
    setError(null)
  }, [numerator, denominator])

  const fieldStyle = (name) =>
    `w-12 h-10 rounded-lg text-center text-lg font-bold outline-none transition-all ${
      activeField === name
        ? 'bg-primary/30 ring-2 ring-primary text-white'
        : 'bg-surface-light text-slate-200'
    }`

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Decomposition preview */}
      <div className="mb-4 flex items-center justify-center">
        <div className="flex flex-col items-center">
          {/* Original fraction */}
          <div className="text-sm text-slate-400 mb-2">Décompose :</div>
          <div className="flex items-center gap-3">
            {/* Original */}
            <span className="frac text-xl">
              <span className="num">{numerator}</span>
              <span className="bar" />
              <span className="den">{denominator}</span>
            </span>

            <span className="text-xl text-slate-400">=</span>

            {/* Input fraction */}
            <span className="frac text-xl">
              <span className="num flex items-center gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  readOnly
                  value={divField}
                  onFocus={() => setActiveField('div')}
                  onClick={() => setActiveField('div')}
                  placeholder="?"
                  className={fieldStyle('div')}
                />
                <span className="text-slate-400">&times;</span>
                <input
                  type="text"
                  inputMode="numeric"
                  readOnly
                  value={numField}
                  onFocus={() => setActiveField('num')}
                  onClick={() => setActiveField('num')}
                  placeholder="?"
                  className={fieldStyle('num')}
                />
              </span>
              <span className="bar" />
              <span className="den flex items-center gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  readOnly
                  value={divField}
                  className="w-12 h-10 rounded-lg text-center text-lg font-bold bg-surface-light/50 text-slate-400 outline-none"
                  disabled
                  placeholder="?"
                />
                <span className="text-slate-400">&times;</span>
                <input
                  type="text"
                  inputMode="numeric"
                  readOnly
                  value={denField}
                  onFocus={() => setActiveField('den')}
                  onClick={() => setActiveField('den')}
                  placeholder="?"
                  className={fieldStyle('den')}
                />
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Field tabs */}
      <div className="flex gap-2 mb-3 justify-center">
        {[
          { key: 'div', label: 'Diviseur' },
          { key: 'num', label: 'Numérateur' },
          { key: 'den', label: 'Dénominateur' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveField(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeField === key
                ? 'bg-primary text-white'
                : 'bg-surface-light text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-center text-sm text-danger mb-2">{error}</p>
      )}

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleDigit(n)}
            disabled={disabled}
            className="py-3 rounded-xl bg-surface-light text-lg font-semibold text-white active:bg-primary/30 transition-colors disabled:opacity-40"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="py-3 rounded-xl bg-surface-light text-sm font-medium text-slate-400 active:bg-red-900/30 transition-colors disabled:opacity-40"
        >
          C
        </button>
        <button
          type="button"
          onClick={() => handleDigit(0)}
          disabled={disabled}
          className="py-3 rounded-xl bg-surface-light text-lg font-semibold text-white active:bg-primary/30 transition-colors disabled:opacity-40"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={disabled}
          className="py-3 rounded-xl bg-surface-light text-sm font-medium text-slate-400 active:bg-red-900/30 transition-colors disabled:opacity-40"
        >
          &larr;
        </button>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleValidate}
        disabled={disabled || !numField || !divField || !denField}
        className="mt-3 w-full py-3 rounded-xl font-bold text-lg bg-primary hover:bg-primary-dark active:bg-primary-dark transition-colors text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Valider
      </button>
    </div>
  )
}
