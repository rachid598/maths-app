import { useState, useEffect, useRef } from 'react'
import { generateVocabQuestion, QUESTIONS_PER_ROUND } from '../engine'

const TERMS = [
  { key: 'dividende', value: (d) => d.a },
  { key: 'diviseur', value: (d) => d.b },
  { key: 'quotient', value: (d) => d.q },
  { key: 'reste', value: (d) => d.r },
]

export default function VocabulaireQuiz({ level, onComplete, playSuccess, playError }) {
  const [question, setQuestion] = useState(null)
  const [tapped, setTapped] = useState(null)
  const [qi, setQi] = useState(0)
  const [score, setScore] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    setQuestion(generateVocabQuestion(level.digits))
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const handleTap = (key) => {
    if (tapped) return
    setTapped(key)
    const correct = key === question.termKey
    if (correct) { setScore(s => s + 1); playSuccess() }
    else { playError() }

    timerRef.current = setTimeout(() => {
      setTapped(null)
      if (qi + 1 >= QUESTIONS_PER_ROUND) {
        onComplete(correct ? score + 1 : score)
      } else {
        setQi(q => q + 1)
        setQuestion(generateVocabQuestion(level.digits))
      }
    }, 1500)
  }

  if (!question) return null
  const { division } = question

  const getStyle = (key) => {
    if (!tapped) return 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 active:scale-95'
    if (key === question.termKey) return 'bg-emerald-100 dark:bg-emerald-900 border-2 border-emerald-500 scale-105'
    if (key === tapped) return 'bg-red-100 dark:bg-red-900 border-2 border-red-500'
    return 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 opacity-40'
  }

  const TapButton = ({ termKey, children }) => {
    const term = TERMS.find(t => t.key === termKey)
    return (
      <button
        onClick={() => handleTap(termKey)}
        disabled={!!tapped}
        className={`${getStyle(termKey)} rounded-xl px-4 py-2 min-w-[56px] flex flex-col items-center gap-1 shadow-sm transition-all disabled:cursor-default`}
      >
        <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {term.value(division)}
        </span>
        {tapped && termKey === question.termKey && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-pop-in">
            {termKey}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      <p className="text-sm text-gray-400">{qi + 1} / {QUESTIONS_PER_ROUND}</p>

      {question.mode === 'posee' ? (
        /* ── Division posée (potence) ── */
        <div className="flex gap-0 font-mono select-none">
          {/* Gauche : dividende + reste */}
          <div className="flex flex-col items-end gap-2 pr-1">
            <TapButton termKey="dividende" />
            <div className="h-2" />
            <TapButton termKey="reste" />
          </div>

          {/* Barre verticale */}
          <div className="flex flex-col">
            <div className="border-l-2 border-gray-400 dark:border-gray-500 pl-2 pb-1">
              <TapButton termKey="diviseur" />
            </div>
            <div className="border-l-2 border-gray-400 dark:border-gray-500 border-t-2 pl-2 pt-1">
              <TapButton termKey="quotient" />
            </div>
          </div>
        </div>
      ) : (
        /* ── Division en ligne : a = b × q + r ── */
        <div className="flex flex-wrap items-end justify-center gap-3">
          {TERMS.map((term, i) => (
            <div key={term.key} className="flex items-end gap-3">
              <TapButton termKey={term.key} />
              {i === 0 && <span className="text-2xl font-bold text-gray-400 pb-2">=</span>}
              {i === 1 && <span className="text-2xl font-bold text-gray-400 pb-2">×</span>}
              {i === 2 && <span className="text-2xl font-bold text-gray-400 pb-2">+</span>}
            </div>
          ))}
        </div>
      )}

      <p className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center">
        {question.question}
      </p>
    </div>
  )
}
