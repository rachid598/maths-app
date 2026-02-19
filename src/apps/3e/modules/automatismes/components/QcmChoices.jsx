/**
 * QCM (multiple choice) display — 4 buttons in a 2×2 grid.
 */
export default function QcmChoices({ choices, selected, onSelect, feedback }) {
  return (
    <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
      {choices.map((choice, i) => {
        let style = 'bg-surface-light text-white hover:bg-slate-600'

        if (feedback) {
          if (choice.correct) {
            style = 'bg-emerald-500/30 text-emerald-300 ring-2 ring-emerald-500'
          } else if (selected === choice.text && !choice.correct) {
            style = 'bg-red-500/30 text-red-300 ring-2 ring-red-500'
          } else {
            style = 'bg-surface-light/50 text-slate-500'
          }
        } else if (selected === choice.text) {
          style = 'bg-cyan-500/30 text-cyan-300 ring-2 ring-cyan-500'
        }

        return (
          <button
            key={i}
            onClick={() => !feedback && onSelect(choice.text)}
            disabled={!!feedback}
            className={`rounded-xl px-3 py-3 text-center font-semibold transition active:scale-95 ${style}`}
          >
            {choice.text}
          </button>
        )
      })}
    </div>
  )
}
