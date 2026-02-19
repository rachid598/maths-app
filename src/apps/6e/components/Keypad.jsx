const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['clear', '0', 'ok'],
]

export default function Keypad({ value, onChange, onSubmit, disabled }) {
  const handlePress = (key) => {
    if (disabled) return
    if (key === 'clear') {
      onChange('')
    } else if (key === 'ok') {
      if (value.length > 0) onSubmit()
    } else {
      if (value.length < 3) onChange(value + key)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] mx-auto">
      {KEYS.flat().map((key) => {
        const isAction = key === 'clear' || key === 'ok'
        const bgClass = key === 'ok'
          ? 'bg-primary text-white'
          : key === 'clear'
            ? 'bg-gray-200 text-gray-600'
            : 'bg-white text-gray-800 border border-gray-200'

        return (
          <button
            key={key}
            onClick={() => handlePress(key)}
            disabled={disabled}
            className={`h-14 rounded-xl font-bold text-xl
              ${bgClass}
              active:scale-90 transition-transform
              disabled:opacity-40 shadow-sm`}
          >
            {key === 'clear' ? '\u232B' : key === 'ok' ? '\u2713' : key}
          </button>
        )
      })}
    </div>
  )
}
