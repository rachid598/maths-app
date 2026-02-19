import { Delete } from 'lucide-react'

export default function Keypad({ value, onChange, onSubmit, disabled }) {
  function handleDigit(digit) {
    if (disabled) return
    const next = value + String(digit)
    // Limit to 4 digits
    if (next.length <= 4) onChange(next)
  }

  function handleDelete() {
    if (disabled) return
    onChange(value.slice(0, -1))
  }

  function handleClear() {
    if (disabled) return
    onChange('')
  }

  const canSubmit = value.length > 0 && parseInt(value, 10) > 1

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Display */}
      <div className="mb-3 flex items-center justify-center gap-2">
        <span className="text-sm text-slate-400">Diviseur :</span>
        <div className="bg-surface-light rounded-xl px-6 py-2 min-w-[80px] text-center text-2xl font-bold tabular-nums">
          {value || <span className="text-slate-600">?</span>}
        </div>
      </div>

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleDigit(n)}
            disabled={disabled}
            className="py-3 rounded-xl bg-surface-light text-lg font-semibold active:bg-primary/30 transition-colors disabled:opacity-40"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="py-3 rounded-xl bg-surface text-sm font-medium text-slate-400 active:bg-red-900/30 transition-colors disabled:opacity-40"
        >
          C
        </button>
        <button
          type="button"
          onClick={() => handleDigit(0)}
          disabled={disabled}
          className="py-3 rounded-xl bg-surface-light text-lg font-semibold active:bg-primary/30 transition-colors disabled:opacity-40"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={disabled}
          className="py-3 rounded-xl bg-surface text-slate-400 flex items-center justify-center active:bg-red-900/30 transition-colors disabled:opacity-40"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={() => canSubmit && onSubmit(parseInt(value, 10))}
        disabled={disabled || !canSubmit}
        className="mt-3 w-full py-3 rounded-xl font-bold text-lg bg-primary hover:bg-primary-dark active:bg-primary-dark transition-colors text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Valider
      </button>
    </div>
  )
}
