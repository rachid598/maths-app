import { Delete } from 'lucide-react'

/**
 * Numeric answer input with on-screen keypad.
 * Supports negative numbers via +/− key.
 */
export default function AnswerInput({ value, onChange, disabled }) {
  const handleKey = (key) => {
    if (disabled) return
    if (key === 'backspace') {
      onChange(value.slice(0, -1))
    } else if (key === '+-') {
      onChange(value.startsWith('-') ? value.slice(1) : '-' + value)
    } else if (key === ',') {
      if (!value.includes(',') && !value.includes('/')) onChange(value + ',')
    } else if (key === '/') {
      if (!value.includes('/') && !value.includes(',')) onChange(value + '/')
    } else {
      if (value.length < 10) onChange(value + key)
    }
  }

  return (
    <div>
      {/* Display */}
      <div className="mx-auto mb-3 flex max-w-xs items-center justify-center rounded-xl bg-surface p-3">
        <span className="min-h-[2rem] min-w-[4rem] text-center text-2xl font-bold text-white">
          {value || <span className="text-slate-500">Ta réponse…</span>}
        </span>
      </div>

      {/* Keypad */}
      <div className="mx-auto grid w-full max-w-xs grid-cols-4 gap-2">
        {['7', '8', '9'].map((d) => (
          <button key={d} onClick={() => handleKey(d)} disabled={disabled}
            className="flex h-11 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition hover:bg-slate-600 active:scale-95 disabled:opacity-30">
            {d}
          </button>
        ))}
        <button onClick={() => handleKey('backspace')} disabled={disabled}
          className="flex h-11 items-center justify-center rounded-xl bg-surface-light text-slate-400 transition hover:bg-slate-600 active:scale-95 disabled:opacity-30">
          <Delete className="h-5 w-5" />
        </button>

        {['4', '5', '6'].map((d) => (
          <button key={d} onClick={() => handleKey(d)} disabled={disabled}
            className="flex h-11 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition hover:bg-slate-600 active:scale-95 disabled:opacity-30">
            {d}
          </button>
        ))}
        <button onClick={() => handleKey('/')} disabled={disabled}
          className="flex h-11 items-center justify-center rounded-xl bg-primary-light font-bold text-blue-400 transition hover:bg-primary active:scale-95 disabled:opacity-30">
          a/b
        </button>

        {['1', '2', '3'].map((d) => (
          <button key={d} onClick={() => handleKey(d)} disabled={disabled}
            className="flex h-11 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition hover:bg-slate-600 active:scale-95 disabled:opacity-30">
            {d}
          </button>
        ))}
        <button onClick={() => handleKey('+-')} disabled={disabled}
          className="flex h-11 items-center justify-center rounded-xl bg-primary-light font-bold text-blue-400 transition hover:bg-primary active:scale-95 disabled:opacity-30">
          +/−
        </button>

        <button onClick={() => handleKey(',')} disabled={disabled}
          className="flex h-11 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition hover:bg-slate-600 active:scale-95 disabled:opacity-30">
          ,
        </button>
        <button onClick={() => handleKey('0')} disabled={disabled}
          className="flex h-11 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition hover:bg-slate-600 active:scale-95 disabled:opacity-30">
          0
        </button>
        <button onClick={() => handleKey('π')} disabled={disabled}
          className="flex h-11 items-center justify-center rounded-xl bg-primary-light font-bold text-purple-400 transition hover:bg-primary active:scale-95 disabled:opacity-30">
          π
        </button>
        <div />
      </div>
    </div>
  )
}
