import { useState, useCallback } from 'react'
import { Delete } from 'lucide-react'

/**
 * Expert mode: student fills in divisor, simplified numerator, simplified denominator.
 * Order: Diviseur first (active by default), then Numérateur, Dénominateur.
 * Display: num / den = [DIV] × [NUM_SIMP] / [DIV] × [DEN_SIMP]
 * Auto-validates when all 3 fields produce the correct decomposition.
 */
export default function CompletionInput({ num, den, onCorrect, disabled }) {
  const [activeField, setActiveField] = useState('div')
  const [fields, setFields] = useState({ div: '', num: '', den: '' })
  const [prevKey, setPrevKey] = useState(`${num}/${den}`)

  // Reset when fraction changes (React recommended pattern)
  const fractionKey = `${num}/${den}`
  if (fractionKey !== prevKey) {
    setPrevKey(fractionKey)
    setFields({ div: '', num: '', den: '' })
    setActiveField('div')
  }

  // Check if current fields form a correct decomposition
  const checkCompletion = useCallback((newFields) => {
    const d = parseInt(newFields.div, 10)
    const n = parseInt(newFields.num, 10)
    const dn = parseInt(newFields.den, 10)
    if (isNaN(d) || isNaN(n) || isNaN(dn)) return
    if (d === 0) return

    if (d * n === num && d * dn === den) {
      onCorrect(d)
    }
  }, [num, den, onCorrect])

  const handleInput = useCallback((digit) => {
    setFields((prev) => {
      const current = prev[activeField]
      if (current.length >= 4) return prev
      const newFields = { ...prev, [activeField]: current + digit }
      // Defer validation to after state update
      setTimeout(() => checkCompletion(newFields), 0)
      return newFields
    })
  }, [activeField, checkCompletion])

  const handleSign = useCallback(() => {
    setFields((prev) => {
      const current = prev[activeField]
      const newVal = current.startsWith('-') ? current.slice(1) : '-' + current
      const newFields = { ...prev, [activeField]: newVal }
      setTimeout(() => checkCompletion(newFields), 0)
      return newFields
    })
  }, [activeField, checkCompletion])

  const handleDelete = useCallback(() => {
    setFields((prev) => ({ ...prev, [activeField]: prev[activeField].slice(0, -1) }))
  }, [activeField])

  const handleClear = useCallback(() => {
    setFields((prev) => ({ ...prev, [activeField]: '' }))
  }, [activeField])

  const tabs = [
    { key: 'div', label: 'Diviseur', color: 'text-red-400 border-red-400' },
    { key: 'num', label: 'Numérateur', color: 'text-emerald-400 border-emerald-400' },
    { key: 'den', label: 'Dénominateur', color: 'text-blue-400 border-blue-400' },
  ]

  const fmtField = (key) => fields[key] || '?'
  const divDisplay = fmtField('div')
  const numDisplay = fmtField('num')
  const denDisplay = fmtField('den')

  return (
    <div className="mx-auto max-w-sm">
      {/* Decomposition preview */}
      <div className="mb-4 rounded-xl bg-surface p-4 text-center">
        <div className="mb-1 text-sm text-slate-400">Décompose la fraction</div>
        <div className="flex items-center justify-center gap-2 text-lg font-bold">
          <div className="inline-flex flex-col items-center">
            <span className="border-b-2 border-slate-500 px-2 pb-0.5">{num}</span>
            <span className="px-2 pt-0.5">{den}</span>
          </div>
          <span className="text-slate-500">=</span>
          <div className="inline-flex flex-col items-center">
            <span className="border-b-2 border-slate-500 px-2 pb-0.5">
              <span className="text-red-400">{divDisplay}</span>
              <span className="text-slate-500"> {'\u00d7'} </span>
              <span className="text-emerald-400">{numDisplay}</span>
            </span>
            <span className="px-2 pt-0.5">
              <span className="text-red-400">{divDisplay}</span>
              <span className="text-slate-500"> {'\u00d7'} </span>
              <span className="text-blue-400">{denDisplay}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveField(tab.key)}
            disabled={disabled}
            className={`flex-1 rounded-lg border-b-2 px-2 py-1.5 text-xs font-bold transition ${
              activeField === tab.key
                ? tab.color + ' bg-surface-light'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}: {fmtField(tab.key)}
          </button>
        ))}
      </div>

      {/* Keypad with +/− button */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handleInput(String(n))}
            disabled={disabled}
            className="flex h-11 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition hover:bg-slate-600 active:scale-95 disabled:opacity-30"
          >
            {n}
          </button>
        ))}
        <button
          onClick={handleSign}
          disabled={disabled || activeField === 'div'}
          className="flex h-11 items-center justify-center rounded-xl bg-primary-light font-bold text-blue-400 transition hover:bg-primary active:scale-95 disabled:opacity-30"
        >
          +/−
        </button>
        <button
          onClick={handleClear}
          disabled={disabled}
          className="flex h-11 items-center justify-center rounded-xl bg-surface-light font-bold text-red-400 transition hover:bg-slate-600 active:scale-95 disabled:opacity-30"
        >
          C
        </button>
        <button
          onClick={() => handleInput('0')}
          disabled={disabled}
          className="flex h-11 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition hover:bg-slate-600 active:scale-95 disabled:opacity-30"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          disabled={disabled}
          className="flex h-11 items-center justify-center rounded-xl bg-surface-light text-slate-400 transition hover:bg-slate-600 hover:text-white active:scale-95 disabled:opacity-30"
        >
          <Delete className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
