import { useState, useCallback } from 'react'
import { ArrowLeft, RotateCcw, Star } from 'lucide-react'
import { generateProblem, fractionToDecimal } from './engine'

const LEVELS = [
  { id: 1, label: '🟢 Facile', desc: 'Dénominateurs 2, 3, 4' },
  { id: 2, label: '🟡 Moyen', desc: 'Dénominateurs 2 à 6' },
  { id: 3, label: '🔴 Expert', desc: 'Dénominateurs 2 à 10' },
]
const TOTAL = 10

function PizzaVisual({ numer, denom, colored }) {
  const slices = []
  for (let i = 0; i < denom; i++) {
    const startAngle = (i * 2 * Math.PI) / denom - Math.PI / 2
    const endAngle = ((i + 1) * 2 * Math.PI) / denom - Math.PI / 2
    const x1 = 50 + 40 * Math.cos(startAngle)
    const y1 = 50 + 40 * Math.sin(startAngle)
    const x2 = 50 + 40 * Math.cos(endAngle)
    const y2 = 50 + 40 * Math.sin(endAngle)
    const largeArc = (endAngle - startAngle > Math.PI) ? 1 : 0
    const d = `M50,50 L${x1},${y1} A40,40 0 ${largeArc},1 ${x2},${y2} Z`
    slices.push(
      <path key={i} d={d} fill={i < colored ? '#fbbf24' : '#334155'} stroke="#0f172a" strokeWidth="1.5" />
    )
  }
  return (
    <svg viewBox="0 0 100 100" className="w-48 h-48 mx-auto">
      {slices}
      <circle cx="50" cy="50" r="40" fill="none" stroke="#64748b" strokeWidth="2" />
    </svg>
  )
}

export default function FractionsVisuelles({ player, onBadgeCheck }) {
  const [level, setLevel] = useState(null)
  const [problem, setProblem] = useState(null)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [done, setDone] = useState(false)

  const startLevel = useCallback((lvl) => {
    setLevel(lvl)
    setProblem(generateProblem(lvl))
    setIndex(0)
    setScore(0)
    setStreak(0)
    setMaxStreak(0)
    setFeedback(null)
    setDone(false)
  }, [])

  const handleAnswer = (choice) => {
    if (feedback) return
    const correct = choice === problem.answer
    if (correct) {
      const ns = streak + 1
      setScore(s => s + 1)
      setStreak(ns)
      if (ns > maxStreak) setMaxStreak(ns)
      setFeedback({ correct: true, msg: '✅ Bravo !' })
    } else {
      setStreak(0)
      setFeedback({ correct: false, msg: `❌ C'était ${problem.answer}` })
    }
    setTimeout(() => {
      setFeedback(null)
      if (index + 1 >= TOTAL) {
        setDone(true)
        if (onBadgeCheck) onBadgeCheck(score + (correct ? 1 : 0), null, maxStreak)
      } else {
        setIndex(i => i + 1)
        setProblem(generateProblem(level))
      }
    }, 1200)
  }

  if (!level) {
    return (
      <div className="min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-2 pt-4">🍕 Fractions Visuelles</h2>
        <p className="text-slate-400 mb-6">Identifie la fraction coloriée !</p>
        <div className="grid gap-3">
          {LEVELS.map(l => (
            <button key={l.id} onClick={() => startLevel(l.id)} className="p-4 rounded-2xl bg-surface hover:bg-surface-light text-white text-left transition-all active:scale-[0.98]">
              <p className="font-bold text-lg">{l.label}</p>
              <p className="text-sm text-slate-300">{l.desc}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (done) {
    const stars = score >= TOTAL ? 3 : score >= TOTAL * 0.7 ? 2 : score >= TOTAL * 0.4 ? 1 : 0
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Résultat</h2>
        <p className="text-5xl mb-2">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
        <p className="text-xl font-bold mb-1">{score}/{TOTAL}</p>
        <p className="text-slate-300 mb-1">Série max : 🔥 {maxStreak}</p>
        <p className="text-slate-400 text-sm mb-6">Décimal ≈ {fractionToDecimal(score, TOTAL)}</p>
        <div className="flex gap-3">
          <button onClick={() => startLevel(level)} className="px-6 py-3 rounded-xl bg-primary font-bold text-white">Rejouer</button>
          <button onClick={() => setLevel(null)} className="px-6 py-3 rounded-xl bg-surface font-bold">Niveaux</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <header className="flex items-center justify-between mb-4 pt-2">
        <div>
          <h2 className="text-lg font-bold">Fractions Visuelles</h2>
          <p className="text-xs text-slate-300">{index + 1}/{TOTAL}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-accent">{score} <Star className="w-4 h-4 inline" /></p>
          {streak > 1 && <p className="text-xs text-amber-400">🔥 {streak}</p>}
        </div>
      </header>
      <div className="h-1.5 bg-surface rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all" style={{ width: `${((index) / TOTAL) * 100}%` }} />
      </div>
      <p className="text-center text-slate-300 mb-2">Quelle fraction est coloriée ?</p>
      <PizzaVisual numer={problem.numer} denom={problem.denom} colored={problem.numer} />
      <div className="grid grid-cols-2 gap-3 mt-6 max-w-xs mx-auto">
        {problem.choices.map(c => (
          <button key={c} onClick={() => handleAnswer(c)}
            className={`py-4 rounded-xl text-xl font-bold transition-all active:scale-95 ${
              feedback ? (c === problem.answer ? 'bg-green-600 text-white' : feedback.correct ? 'bg-surface' : 'bg-surface') : 'bg-surface-light hover:bg-primary/30 text-white'
            }`}>{c}</button>
        ))}
      </div>
      {feedback && <p className={`text-center mt-4 text-lg font-bold ${feedback.correct ? 'text-green-400' : 'text-red-400'}`}>{feedback.msg}</p>}
    </div>
  )
}
