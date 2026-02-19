import { useRef, useEffect } from 'react'

/**
 * Displays the vertical chain of calculation steps.
 * Each step is an array of tokens rendered as a line.
 * Lines after the first are prefixed with "=".
 */
export default function StepChain({ steps }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [steps.length])

  if (steps.length === 0) return null

  return (
    <div className="bg-surface/50 rounded-2xl p-4 min-h-[80px] overflow-y-auto max-h-[200px]">
      <div className="space-y-2 font-mono text-xl">
        {steps.map((tokens, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-6 text-right text-slate-400 shrink-0">
              {i > 0 ? '=' : ''}
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {tokens.map((token, j) => {
                if (token.type === 'paren') {
                  return (
                    <span key={j} className="text-accent font-bold px-0.5">
                      {token.value}
                    </span>
                  )
                }
                if (token.type === 'operator') {
                  return (
                    <span key={j} className="text-slate-400 px-1">
                      {token.value}
                    </span>
                  )
                }
                // number
                const isLast = i === steps.length - 1 && tokens.length === 1
                return (
                  <span
                    key={j}
                    className={`tabular-nums px-0.5 ${isLast ? 'text-success font-bold text-2xl' : ''}`}
                  >
                    {token.value}
                  </span>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  )
}
