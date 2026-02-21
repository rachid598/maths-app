import { useState, useCallback } from 'react'
import { ArrowLeft, RotateCcw, Trophy, ChevronRight } from 'lucide-react'
import { generateRound, checkAnswer, LEVELS } from './engine'

/* ─── Pizza SVG Component ──────────────────────────── */
function PizzaSVG({ denominator, colored = 0, onSliceClick, interactive = false }) {
  const slices = []
  const cx = 100, cy = 100, r = 90
  
  for (let i = 0; i < denominator; i++) {
    const startAngle = (i * 2 * Math.PI) / denominator - Math.PI / 2
    const endAngle = ((i + 1) * 2 * Math.PI) / denominator - Math.PI / 2
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0
    
    const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`
    const isColored = i < colored
    
    slices.push(
      <path
        key={i}
        d={d}
        fill={isColored ? '#f97316' : '#fef3c7'}
        stroke="#92400e"
        strokeWidth="2"
        onClick={interactive ? () => onSliceClick?.(i) : undefined}
        className={interactive ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
      />
    )
  }
  
  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto drop-shadow-lg">
      <circle cx={cx} cy={cy} r={r + 2} fill="#92400e" />
      {slices}
      {/* Pepperoni dots for fun */}
      <circle cx="70" cy="70" r="6" fill="#dc2626" opacity="0.6" />
      <circle cx="130" cy="85" r="5" fill="#dc2626" opacity="0.6" />
      <circle cx="95" cy="125" r="6" fill="#dc2626" opacity="0.6" />
    </svg>
  )
}

/* ─── Score Screen ─────────────────────────────────── */
function ScoreScreen({ score, total, onRestart, onBack }) {
  const pct = Math.round((score / total) * 100)
  const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="text-6xl mb-4">{emoji}</span>
      <h2 className="text-2xl font-bold mb-2">Partie terminée !</h2>
      <p className="text-4xl font-extrabold text-primary mb-2">{score}/{total}</p>
      <p className="text-gray-400 mb-6">{pct}% de réussite</p>
      <div className="flex gap-3">
        <button onClick={onRestart} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold">
          <RotateCcw className="w-4 h-4" /> Rejouer
        </button>
        <button onClick={onBack} className="px-6 py-3 bg-gray-700 text-white rounded-xl font-bold">
          Retour
        </button>
      </div>
    </div>
  )
}

/* ─── Main Component ───────────────────────────────── */
export default function FractionsVisuelles({ onBack }) {
  const [questions, setQuestions] = useState(() => generateRound(10))
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [coloredSlices, setColoredSlices] = useState(new Set())
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong' | null
  const [done, setDone] = useState(false)

  const q = questions[current]

  const handleRestart = useCallback(() => {
    setQuestions(generateRound(10))
    setCurrent(0)
    setScore(0)
    setSelected(null)
    setColoredSlices(new Set())
    setFeedback(null)
    setDone(false)
  }, [])

  const advance = useCallback(() => {
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setDone(true)
      } else {
        setCurrent(c => c + 1)
        setSelected(null)
        setColoredSlices(new Set())
        setFeedback(null)
      }
    }, 1200)
  }, [current, questions.length])

  const handleChoice = useCallback((choice) => {
    if (feedback) return
    setSelected(choice.text)
    const correct = choice.correct
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) setScore(s => s + 1)
    advance()
  }, [feedback, advance])

  const handleSliceClick = useCallback((sliceIndex) => {
    if (feedback) return
    setColoredSlices(prev => {
      const next = new Set(prev)
      if (next.has(sliceIndex)) next.delete(sliceIndex)
      else next.add(sliceIndex)
      return next
    })
  }, [feedback])

  const handleColorSubmit = useCallback(() => {
    if (feedback) return
    const correct = coloredSlices.size === q.targetSlices
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) setScore(s => s + 1)
    advance()
  }, [feedback, coloredSlices, q, advance])

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
      {/* Header */}
      <header className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">🍕 Fractions Visuelles</h1>
          <p className="text-xs text-gray-400">Question {current + 1}/{questions.length}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-primary">{score}</span>
          <span className="text-xs text-gray-400"> pts</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-700 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="max-w-lg mx-auto">
        <p className="text-center font-bold text-lg mb-4">{q.prompt}</p>
        
        {/* Pizza visualization */}
        {(q.type === 'pizza' || q.type === 'color-pizza') && (
          <PizzaSVG
            denominator={q.denominator}
            colored={q.type === 'color-pizza' ? coloredSlices.size : q.numerator}
            onSliceClick={q.type === 'color-pizza' ? handleSliceClick : undefined}
            interactive={q.type === 'color-pizza'}
          />
        )}

        {q.type === 'fraction-to-decimal' && (
          <div className="text-center my-6">
            <span className="text-5xl font-bold">
              <span className="text-orange-400">{q.numerator}</span>
              <span className="text-gray-400">/</span>
              <span className="text-orange-400">{q.denominator}</span>
            </span>
            <p className="text-sm text-gray-400 mt-2">= ?</p>
          </div>
        )}

        {/* Feedback banner */}
        {feedback && (
          <div className={`text-center py-2 px-4 rounded-xl mb-4 font-bold text-lg ${
            feedback === 'correct' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {feedback === 'correct' ? '✅ Bravo !' : `❌ La réponse était ${q.answer}`}
          </div>
        )}

        {/* Choices (for pizza and fraction-to-decimal types) */}
        {q.choices && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {q.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleChoice(choice)}
                disabled={!!feedback}
                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                  selected === choice.text
                    ? choice.correct
                      ? 'bg-green-500 text-white scale-105'
                      : 'bg-red-500 text-white'
                    : feedback && choice.correct
                      ? 'bg-green-500/30 text-green-300'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {choice.text}
              </button>
            ))}
          </div>
        )}

        {/* Color pizza submit button */}
        {q.type === 'color-pizza' && !feedback && (
          <button
            onClick={handleColorSubmit}
            className="mt-4 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
          >
            Valider ({coloredSlices.size} part{coloredSlices.size > 1 ? 's' : ''})
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
