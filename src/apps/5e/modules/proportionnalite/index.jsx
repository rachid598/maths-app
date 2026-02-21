import { useState, useCallback } from 'react'
import { ArrowLeft, RotateCcw, ChevronRight } from 'lucide-react'
import { generateRound } from './engine'

function ScoreScreen({ score, total, onRestart, onBack }) {
  const pct = Math.round((score / total) * 100)
  const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '🍳' : '💪'
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="text-6xl mb-4">{emoji}</span>
      <h2 className="text-2xl font-bold mb-2">Partie terminée !</h2>
      <p className="text-4xl font-extrabold text-primary-light mb-2">{score}/{total}</p>
      <p className="text-slate-400 mb-6">{pct}% de réussite</p>
      <div className="flex gap-3">
        <button onClick={onRestart} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold">
          <RotateCcw className="w-4 h-4" /> Rejouer
        </button>
        <button onClick={onBack} className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold">Retour</button>
      </div>
    </div>
  )
}

function ProportionTable({ table }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="mx-auto border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 border border-slate-600 bg-slate-800 text-sm">x</th>
            {table.map((t, i) => (
              <td key={i} className="px-4 py-2 border border-slate-600 bg-slate-700 text-center font-bold">{t.x}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="px-4 py-2 border border-slate-600 bg-slate-800 text-sm">y</th>
            {table.map((t, i) => (
              <td key={i} className="px-4 py-2 border border-slate-600 bg-slate-700 text-center font-bold">{t.y}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function Proportionnalite({ onBack }) {
  const [questions, setQuestions] = useState(() => generateRound(10))
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [selected, setSelected] = useState(null)
  const [sliderValue, setSliderValue] = useState(1)
  const [done, setDone] = useState(false)

  const q = questions[current]

  const handleRestart = useCallback(() => {
    setQuestions(generateRound(10))
    setCurrent(0)
    setScore(0)
    setFeedback(null)
    setSelected(null)
    setSliderValue(1)
    setDone(false)
  }, [])

  const advance = useCallback(() => {
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setDone(true)
      } else {
        setCurrent(c => c + 1)
        setFeedback(null)
        setSelected(null)
        setSliderValue(1)
      }
    }, 1500)
  }, [current, questions.length])

  const handleChoice = useCallback((choice) => {
    if (feedback) return
    setSelected(choice.text)
    const correct = choice.correct
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) setScore(s => s + 1)
    advance()
  }, [feedback, advance])

  const handleSliderSubmit = useCallback(() => {
    if (feedback) return
    const correct = Math.abs(sliderValue - q.answer) < 0.5
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) setScore(s => s + 1)
    advance()
  }, [feedback, sliderValue, q, advance])

  const handleYesNo = useCallback((ans) => {
    if (feedback) return
    const correct = ans === q.answer
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) setScore(s => s + 1)
    advance()
  }, [feedback, q, advance])

  if (done) {
    return (
      <div className="min-h-screen p-4">
        <ScoreScreen score={score} total={questions.length} onRestart={handleRestart} onBack={onBack} />
      </div>
    )
  }

  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="min-h-screen p-4 pb-8">
      <header className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-surface hover:bg-surface-light">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">🍳 Proportionnalité</h1>
          <p className="text-xs text-slate-400">Question {current + 1}/{questions.length}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-primary-light">{score}</span>
          <span className="text-xs text-slate-400"> pts</span>
        </div>
      </header>

      <div className="w-full h-2 bg-slate-700 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-lg mx-auto">
        <p className="text-center font-bold text-lg mb-4 whitespace-pre-line">{q.prompt}</p>

        {/* Recipe type: choices */}
        {q.type === 'recipe' && q.choices && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {q.choices.map((choice, i) => (
              <button key={i} onClick={() => handleChoice(choice)} disabled={!!feedback}
                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                  selected === choice.text
                    ? choice.correct ? 'bg-green-500 text-white scale-105' : 'bg-red-500 text-white'
                    : feedback && choice.correct ? 'bg-green-500/30 text-green-300'
                    : 'bg-surface hover:bg-surface-light text-white'
                }`}>
                {choice.text}
              </button>
            ))}
          </div>
        )}

        {/* Proportion type: slider */}
        {q.type === 'proportion' && (
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <span className="text-4xl font-extrabold text-primary-light">{sliderValue}</span>
            </div>
            <input
              type="range"
              min={q.min}
              max={q.max}
              step={1}
              value={sliderValue}
              onChange={e => setSliderValue(Number(e.target.value))}
              disabled={!!feedback}
              className="w-full h-3 rounded-full appearance-none bg-slate-700 accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>{q.min}</span>
              <span>{q.max}</span>
            </div>
            {!feedback && (
              <button onClick={handleSliderSubmit}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                Valider <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Is-proportional type: table + yes/no */}
        {q.type === 'is-proportional' && (
          <>
            <ProportionTable table={q.table} />
            {!feedback && (
              <div className="flex gap-3 mt-4">
                <button onClick={() => handleYesNo('oui')}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">
                  ✅ Oui
                </button>
                <button onClick={() => handleYesNo('non')}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl">
                  ❌ Non
                </button>
              </div>
            )}
          </>
        )}

        {feedback && (
          <div className={`text-center py-2 px-4 rounded-xl mt-4 font-bold ${
            feedback === 'correct' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {feedback === 'correct' ? '✅ Bravo !' : `❌ Réponse : ${q.answer}${q.unit ? ' ' + q.unit : ''}`}
            {feedback === 'wrong' && q.hint && <p className="text-sm mt-1 opacity-80">{q.hint}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
