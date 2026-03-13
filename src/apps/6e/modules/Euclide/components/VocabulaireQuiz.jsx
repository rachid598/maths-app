import { useState, useEffect, useRef } from 'react'
import { generateVocabQuestion, QUESTIONS_PER_ROUND } from '../engine'

const TERM_COLORS = {
  dividende: 'bg-blue-500',
  diviseur: 'bg-purple-500',
  quotient: 'bg-emerald-500',
  reste: 'bg-amber-500',
}

export default function VocabulaireQuiz({ level, onComplete, playSuccess, playError }) {
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [qi, setQi] = useState(0)
  const [score, setScore] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    setQuestion(generateVocabQuestion(level.digits))
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const handleChoice = (choice) => {
    if (selected !== null) return
    setSelected(choice)
    const correct = choice === question.answer
    if (correct) { setScore(s => s + 1); playSuccess() }
    else { playError() }

    timerRef.current = setTimeout(() => {
      setSelected(null)
      if (qi + 1 >= QUESTIONS_PER_ROUND) {
        onComplete(correct ? score + 1 : score)
      } else {
        setQi(q => q + 1)
        setQuestion(generateVocabQuestion(level.digits))
      }
    }, 1500)
  }

  if (!question) return null
  const { division, choices } = question
  const asked = question.termKey
  const revealed = selected !== null

  const TERM_VALUES = {
    dividende: division.a,
    diviseur: division.b,
    quotient: division.q,
    reste: division.r,
  }

  const badge = (key) => {
    const hidden = key === asked && !revealed
    return (
      <span className={`px-3 py-1 rounded-full text-white text-sm ${TERM_COLORS[key]} ${hidden ? 'animate-pulse' : ''}`}>
        {hidden ? '?' : TERM_VALUES[key]}
      </span>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      {/* Compteur */}
      <p className="text-sm text-gray-400">{qi + 1} / {QUESTIONS_PER_ROUND}</p>

      {/* Équation a = b × q + r avec badges */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg w-full max-w-sm">
        <div className="flex flex-wrap items-center justify-center gap-2 text-lg font-bold">
          {badge('dividende')}
          <span className="text-gray-400">=</span>
          {badge('diviseur')}
          <span className="text-gray-400">×</span>
          {badge('quotient')}
          <span className="text-gray-400">+</span>
          {badge('reste')}
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-3 text-xs">
          {Object.entries(TERM_COLORS).map(([key, color]) => (
            <span key={key} className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-gray-500 dark:text-gray-400">{key}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Question */}
      <p className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center">
        {question.question}
      </p>

      {/* Choix */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {choices.map((choice, i) => {
          let bg = 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
          if (selected !== null) {
            if (choice === question.answer) bg = 'bg-emerald-100 dark:bg-emerald-900 border-2 border-emerald-500'
            else if (choice === selected) bg = 'bg-red-100 dark:bg-red-900 border-2 border-danger'
          }
          return (
            <button
              key={i}
              onClick={() => handleChoice(choice)}
              disabled={selected !== null}
              className={`${bg} rounded-xl py-4 text-xl font-bold text-gray-800 dark:text-gray-100 shadow-sm active:scale-95 transition-all disabled:cursor-default`}
            >
              {choice}
            </button>
          )
        })}
      </div>
    </div>
  )
}
