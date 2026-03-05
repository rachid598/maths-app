import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'
import confetti from 'canvas-confetti'
import {
  generateRushBatch,
  computePoints,
  TOTAL_QUESTIONS,
  TIME_LIMIT,
  saveToLeaderboard,
} from './engine'
import RushTimer from './components/RushTimer'
import ComboCounter from './components/ComboCounter'
import ScoreScreen from './components/ScoreScreen'

export default function PrioRush() {
  const navigate = useNavigate()
  const onBack = () => navigate('/5e')
  const [phase, setPhase] = useState('ready')
  const [expressions, setExpressions] = useState([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [keypadValue, setKeypadValue] = useState('')
  const [timerRunning, setTimerRunning] = useState(false)
  const [responseTimes, setResponseTimes] = useState([])
  const [finalStats, setFinalStats] = useState(null)
  const questionStart = useRef(Date.now())
  const feedbackTimer = useRef(null)
  // Use refs for values needed in callbacks to avoid stale closures
  const stateRef = useRef({})
  stateRef.current = { score, correct, maxStreak, responseTimes, index, streak }

  const doFinish = useCallback((overrides = {}) => {
    const s = { ...stateRef.current, ...overrides }
    setTimerRunning(false)
    setPhase('done')
    const times = s.responseTimes || []
    const avgTime = times.length > 0
      ? (times.reduce((a, b) => a + b, 0) / times.length / 1000).toFixed(1)
      : '—'
    const stats = {
      score: s.score,
      correct: s.correct,
      total: TOTAL_QUESTIONS,
      comboMax: s.maxStreak,
      avgTime,
      date: new Date().toISOString(),
    }
    setFinalStats(stats)
    saveToLeaderboard(stats)
    if (s.correct === TOTAL_QUESTIONS) {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } })
    }
  }, [])

  const startGame = useCallback(() => {
    const batch = generateRushBatch(TOTAL_QUESTIONS)
    setExpressions(batch)
    setIndex(0)
    setScore(0)
    setStreak(0)
    setMaxStreak(0)
    setCorrect(0)
    setFeedback(null)
    setKeypadValue('')
    setResponseTimes([])
    setFinalStats(null)
    setPhase('playing')
    setTimerRunning(true)
    questionStart.current = Date.now()
  }, [])

  const onTimeUp = useCallback(() => doFinish(), [doFinish])

  function handleSubmit() {
    if (keypadValue.length === 0 || phase !== 'playing') return
    const userAnswer = parseInt(keypadValue, 10)
    const expected = expressions[index]?.answer
    const elapsed = Date.now() - questionStart.current
    const newTimes = [...responseTimes, elapsed]
    setResponseTimes(newTimes)

    const isCorrect = userAnswer === expected
    let newScore = score
    let newStreak = streak
    let newMaxStreak = maxStreak
    let newCorrect = correct

    if (isCorrect) {
      newStreak = streak + 1
      const pts = computePoints(newStreak)
      newScore = score + pts
      newMaxStreak = Math.max(maxStreak, newStreak)
      newCorrect = correct + 1
      setStreak(newStreak)
      setMaxStreak(newMaxStreak)
      setScore(newScore)
      setCorrect(newCorrect)
      setFeedback('correct')
    } else {
      newStreak = 0
      setStreak(0)
      setFeedback('wrong')
    }

    clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => {
      setFeedback(null)
      const nextIdx = index + 1
      if (nextIdx >= TOTAL_QUESTIONS) {
        doFinish({ score: newScore, correct: newCorrect, maxStreak: newMaxStreak, responseTimes: newTimes })
      } else {
        setIndex(nextIdx)
        setKeypadValue('')
        questionStart.current = Date.now()
      }
    }, 600)
  }

  useEffect(() => () => clearTimeout(feedbackTimer.current), [])

  if (phase === 'done' && finalStats) {
    return (
      <ScoreScreen
        stats={finalStats}
        onReplay={startGame}
        onBack={onBack}
      />
    )
  }

  if (phase === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-surface rounded-2xl p-8 max-w-sm w-full text-center">
          <Zap className="w-16 h-16 mx-auto mb-4 text-amber-400" />
          <h2 className="text-2xl font-bold mb-2">Prio-Rush</h2>
          <p className="text-slate-300 mb-2">{TOTAL_QUESTIONS} expressions en {TIME_LIMIT}s !</p>
          <p className="text-sm text-slate-400 mb-6">
            Calcule le résultat de chaque expression le plus vite possible.<br />
            3 d'affilée = ×2 &nbsp;|&nbsp; 5 d'affilée = ×3
          </p>
          <button onClick={startGame} className="w-full py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-indigo-500 to-amber-500 hover:from-indigo-600 hover:to-amber-600 transition-all text-white">
            C'est parti !
          </button>
          <button onClick={onBack} className="mt-3 w-full py-2 text-sm text-slate-400 hover:text-white transition-colors">
            ← Retour
          </button>
        </div>
      </div>
    )
  }

  // Playing
  const expr = expressions[index]
  const flashClass = feedback === 'correct'
    ? 'ring-2 ring-emerald-400 bg-emerald-900/20'
    : feedback === 'wrong'
      ? 'ring-2 ring-red-400 bg-red-900/20'
      : 'bg-surface'

  return (
    <div className="min-h-screen flex flex-col p-4">
      <header className="flex items-center justify-between mb-3 pt-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-surface hover:bg-surface-light transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-xs text-slate-400">{index + 1} / {TOTAL_QUESTIONS}</p>
          <p className="text-lg font-black text-amber-400">{score} pts</p>
        </div>
        <div className="w-9" />
      </header>

      <RushTimer running={timerRunning} onTimeUp={onTimeUp} />

      <div className="h-10 flex items-center justify-center mt-2">
        <ComboCounter streak={streak} />
      </div>

      <div className={`rounded-2xl p-6 my-4 text-center transition-all duration-200 ${flashClass}`}>
        <p className="text-3xl font-bold tracking-wide tabular-nums">
          {expr?.display} = ?
        </p>
      </div>

      <div className="flex-1" />

      <div className="w-full max-w-xs mx-auto">
        <div className="mb-3 flex items-center justify-center">
          <div className="bg-surface-light rounded-xl px-6 py-2 min-w-[100px] text-center text-2xl font-bold tabular-nums">
            {keypadValue || <span className="text-slate-400">?</span>}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} type="button" onClick={() => { const next = keypadValue + String(n); if (next.length <= 4) setKeypadValue(next) }}
              className="py-3 rounded-xl bg-surface-light text-lg font-semibold active:bg-indigo-500/30 transition-colors">{n}</button>
          ))}
          <button type="button" onClick={() => setKeypadValue('')}
            className="py-3 rounded-xl bg-surface text-sm font-medium text-slate-300 active:bg-red-900/30 transition-colors">C</button>
          <button type="button" onClick={() => { const next = keypadValue + '0'; if (next.length <= 4) setKeypadValue(next) }}
            className="py-3 rounded-xl bg-surface-light text-lg font-semibold active:bg-indigo-500/30 transition-colors">0</button>
          <button type="button" onClick={() => setKeypadValue(keypadValue.slice(0, -1))}
            className="py-3 rounded-xl bg-surface text-slate-300 flex items-center justify-center active:bg-red-900/30 transition-colors">⌫</button>
        </div>
        <button type="button" onClick={handleSubmit} disabled={keypadValue.length === 0}
          className="mt-3 w-full py-3 rounded-xl font-bold text-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white disabled:opacity-40 disabled:cursor-not-allowed">
          Valider
        </button>
      </div>
      <div className="h-4" />
    </div>
  )
}
