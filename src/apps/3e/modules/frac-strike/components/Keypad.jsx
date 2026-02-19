import { Delete } from 'lucide-react'

/**
 * Tactile numeric keypad for fraction input.
 * 4×3 grid: 1-9, 0, C (clear), backspace + Valider button.
 */
export default function Keypad({ onInput, onClear, onDelete, onValidate, disabled = false }) {
  return (
    <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button
          key={n}
          onClick={() => onInput(String(n))}
          disabled={disabled}
          className="flex h-12 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition hover:bg-slate-600 active:scale-95 disabled:opacity-30"
        >
          {n}
        </button>
      ))}
      <button
        onClick={onClear}
        disabled={disabled}
        className="flex h-12 items-center justify-center rounded-xl bg-surface-light font-bold text-red-400 transition hover:bg-slate-600 active:scale-95 disabled:opacity-30"
      >
        C
      </button>
      <button
        onClick={() => onInput('0')}
        disabled={disabled}
        className="flex h-12 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition hover:bg-slate-600 active:scale-95 disabled:opacity-30"
      >
        0
      </button>
      <button
        onClick={onDelete}
        disabled={disabled}
        className="flex h-12 items-center justify-center rounded-xl bg-surface-light text-slate-400 transition hover:bg-slate-600 hover:text-white active:scale-95 disabled:opacity-30"
      >
        <Delete className="h-5 w-5" />
      </button>
      <button
        onClick={onValidate}
        disabled={disabled}
        className="col-span-3 flex h-12 items-center justify-center rounded-xl bg-accent font-bold text-black transition hover:bg-accent-light active:scale-95 disabled:opacity-30"
      >
        Valider
      </button>
    </div>
  )
}
