/**
 * Vrai / Faux toggle buttons.
 */
export default function VraiFauxButtons({ selected, onSelect, feedback, correctAnswer }) {
  const btnStyle = (value) => {
    const isSelected = selected === value

    if (feedback) {
      if (value === correctAnswer) {
        return 'bg-emerald-500/30 text-emerald-300 ring-2 ring-emerald-500'
      }
      if (isSelected && value !== correctAnswer) {
        return 'bg-red-500/30 text-red-300 ring-2 ring-red-500'
      }
      return 'bg-surface-light/50 text-slate-500'
    }

    if (isSelected) {
      return value
        ? 'bg-emerald-500/30 text-emerald-300 ring-2 ring-emerald-500'
        : 'bg-red-500/30 text-red-300 ring-2 ring-red-500'
    }

    return 'bg-surface-light text-white hover:bg-slate-600'
  }

  return (
    <div className="mx-auto flex max-w-xs gap-3">
      <button
        onClick={() => !feedback && onSelect(true)}
        disabled={!!feedback}
        className={`flex-1 rounded-xl py-3 text-center font-bold transition active:scale-95 ${btnStyle(true)}`}
      >
        VRAI
      </button>
      <button
        onClick={() => !feedback && onSelect(false)}
        disabled={!!feedback}
        className={`flex-1 rounded-xl py-3 text-center font-bold transition active:scale-95 ${btnStyle(false)}`}
      >
        FAUX
      </button>
    </div>
  )
}
