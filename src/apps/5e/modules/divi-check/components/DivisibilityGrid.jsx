import { Check, X } from 'lucide-react'

export default function DivisibilityGrid({
  numbers,
  divisors,
  checked,
  onToggle,
  results,
  disabled,
}) {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full border-separate border-spacing-1 min-w-[420px]">
        {/* Header */}
        <thead>
          <tr>
            <th className="text-left text-sm text-slate-400 font-medium py-2 px-1 w-16">
              Nombre
            </th>
            {divisors.map((d) => (
              <th
                key={d}
                className="text-center text-sm text-slate-400 font-medium py-2 px-1"
              >
                ÷{d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {numbers.map((num, row) => {
            const rowPerfect =
              results &&
              results[row].every((r) => r === 'correct' || r === 'neutral')

            return (
              <tr key={row}>
                {/* Number cell */}
                <td
                  className={`font-bold text-lg text-center py-2 px-2 rounded-lg ${
                    results
                      ? rowPerfect
                        ? 'bg-emerald-900/30 text-success'
                        : 'bg-red-900/20 text-slate-300'
                      : 'bg-surface text-white'
                  }`}
                >
                  {num}
                </td>

                {/* Checkbox cells */}
                {divisors.map((_, col) => {
                  const isChecked = checked[row][col]
                  const result = results ? results[row][col] : null

                  let cellClass = ''
                  let content = null

                  if (!results) {
                    // Before validation
                    cellClass = isChecked
                      ? 'bg-primary text-white'
                      : 'bg-surface-light text-transparent hover:bg-surface'
                    content = <Check className="w-5 h-5 mx-auto" />
                  } else {
                    // After validation
                    switch (result) {
                      case 'correct':
                        cellClass = 'bg-emerald-900/40 text-success'
                        content = <Check className="w-5 h-5 mx-auto" />
                        break
                      case 'missed':
                        cellClass = 'bg-red-900/40 text-danger animate-pulse'
                        content = <Check className="w-5 h-5 mx-auto" />
                        break
                      case 'wrong':
                        cellClass = 'bg-red-900/40 text-danger'
                        content = <X className="w-5 h-5 mx-auto" />
                        break
                      default:
                        cellClass = 'bg-surface-light/50 text-transparent'
                        content = null
                        break
                    }
                  }

                  return (
                    <td key={col} className="p-0.5">
                      <button
                        type="button"
                        onClick={() => !disabled && !results && onToggle(row, col)}
                        disabled={disabled || !!results}
                        className={`w-full min-h-[44px] rounded-lg transition-colors flex items-center justify-center ${cellClass} ${
                          !results && !disabled
                            ? 'cursor-pointer active:scale-95'
                            : 'cursor-default'
                        }`}
                      >
                        {content}
                      </button>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
