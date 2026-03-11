/**
 * Division posée interactive avec soustractions intermédiaires
 * L'élève entre chaque chiffre du quotient un par un
 */
export default function DivisionLayout({ division, currentStep, revealedSteps }) {
  const { a, b } = division
  const digits = String(a).split('')
  const steps = division.steps

  return (
    <div className="font-mono text-lg sm:text-xl leading-relaxed select-none">
      {/* Ligne du quotient */}
      <div className="flex items-center justify-center mb-1">
        <span className="text-gray-400 dark:text-gray-500 mr-2 w-16 text-right">&nbsp;</span>
        <div className="flex">
          {steps.map((step, i) => (
            <span
              key={i}
              className={`w-8 text-center font-bold ${
                i < revealedSteps
                  ? 'text-primary-dark dark:text-primary-light'
                  : i === currentStep
                    ? 'text-primary animate-pulse'
                    : 'text-transparent'
              }`}
            >
              {i < revealedSteps ? step.quotientDigit : i === currentStep ? '?' : '_'}
            </span>
          ))}
        </div>
      </div>

      {/* Barre de division */}
      <div className="flex items-center justify-center mb-2">
        <span className="text-gray-600 dark:text-gray-300 mr-2 w-16 text-right font-bold">{b}</span>
        <div className="border-l-2 border-t-2 border-gray-600 dark:border-gray-300 pl-2 pt-1 flex">
          {digits.map((d, i) => (
            <span key={i} className="w-8 text-center text-gray-800 dark:text-gray-100 font-bold">{d}</span>
          ))}
        </div>
      </div>

      {/* Soustractions intermédiaires */}
      <div className="space-y-1">
        {steps.map((step, i) => {
          if (i >= revealedSteps) return null
          return (
            <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              {/* Produit (soustraction) */}
              <div className="flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 mr-2 w-16 text-right text-sm">
                  {step.quotientDigit}×{b}=
                </span>
                <div className="flex" style={{ paddingLeft: `${i * 2}rem` }}>
                  <span className="w-16 text-center text-danger font-bold">−{step.product}</span>
                </div>
              </div>
              {/* Trait */}
              <div className="flex justify-center">
                <div
                  className="border-b border-gray-400 dark:border-gray-500"
                  style={{ width: '6rem', marginLeft: `${i * 2 + 4}rem` }}
                />
              </div>
              {/* Reste */}
              <div className="flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 mr-2 w-16 text-right text-sm">reste</span>
                <div className="flex" style={{ paddingLeft: `${i * 2}rem` }}>
                  <span className="w-16 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                    {step.remainder}
                    {step.bringDown !== null && (
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-0.5">↓{step.bringDown}</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Résultat final */}
      {revealedSteps === steps.length && (
        <div className="mt-4 text-center animate-pop-in">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {a} ÷ {b} = <span className="font-bold text-primary-dark dark:text-primary-light">{division.q}</span>
            {division.r > 0 && (
              <> reste <span className="font-bold text-emerald-600 dark:text-emerald-400">{division.r}</span></>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
