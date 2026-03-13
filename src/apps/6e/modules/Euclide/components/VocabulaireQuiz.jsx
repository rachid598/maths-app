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
  const [tapped, setTapped] = useState(null) // key tappé par l'élève
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

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      {/* Compteur */}
      <p className="text-sm text-gray-400">{qi + 1} / {QUESTIONS_PER_ROUND}</p>

      {/* Division : a ÷ b = q reste r */}
      <div className="flex flex-wrap items-end justify-center gap-3">
        {TERMS.map((term, i) => (
          <div key={term.key} className="flex items-end gap-3">
            <button
              onClick={() => handleTap(term.key)}
              disabled={!!tapped}
              className={`${getStyle(term.key)} rounded-xl px-5 py-3 min-w-[64px] flex flex-col items-center gap-1 shadow-sm transition-all disabled:cursor-default`}
            >
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {term.value(division)}
              </span>
              {tapped && term.key === question.termKey && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-pop-in">
                  {term.key}
                </span>
              )}
            </button>
            {/* Symboles entre les nombres */}
            {i === 0 && <span className="text-2xl font-bold text-gray-400 pb-3">÷</span>}
            {i === 1 && <span className="text-2xl font-bold text-gray-400 pb-3">=</span>}
            {i === 2 && <span className="text-sm font-semibold text-gray-400 pb-4">reste</span>}
          </div>
        ))}
      </div>

      {/* Question */}
      <p className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center">
        {question.question}
      </p>
    </div>
  )
}
