import { useRef, useEffect } from 'react'
import Fraction from './Fraction'

/**
 * Displays the chain of equalities:
 * 12/18 = (2×6)/(3×6) = 2/3
 *
 * Each step in the chain is an object:
 * { type: 'original' | 'decomposed' | 'simplified', ...fractionProps }
 */
export default function Chain({ steps }) {
  const scrollRef = useRef(null)

  // Auto-scroll to the right when new steps are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [steps.length])

  if (steps.length === 0) return null

  return (
    <div
      ref={scrollRef}
      className="chain-scroll overflow-x-auto flex items-center gap-2 py-4 px-2 bg-surface/50 rounded-2xl min-h-[100px]"
    >
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2 shrink-0">
          {i > 0 && (
            <span className="text-xl text-slate-400 font-light">=</span>
          )}
          {step.type === 'original' && (
            <Fraction numerator={step.numerator} denominator={step.denominator} />
          )}
          {step.type === 'decomposed' && (
            <Fraction
              factorNum={step.factorNum}
              factorDen={step.factorDen}
              divisor={step.divisor}
              struck={step.struck}
            />
          )}
          {step.type === 'simplified' && (
            <Fraction
              numerator={step.numerator}
              denominator={step.denominator}
              size={step.final ? 'text-3xl text-success font-bold' : 'text-2xl'}
            />
          )}
        </div>
      ))}
    </div>
  )
}
