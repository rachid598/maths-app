import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import Keypad from '../../components/Keypad'
import PageTransition from '../../components/PageTransition'
import { useSound } from '../../hooks/useSound'
import { addHistory } from '../../hooks/useHistory'
import { generateQuestion, getComboMultiplier, getStars, getTimerDuration, TOTAL_QUESTIONS, DIFFICULTIES } from './engine'
import CircularTimer from './components/CircularTimer'
import ComboStreak from './components/ComboStreak'
import ScoreScreen from './components/ScoreScreen'
import DifficultyPicker from './components/DifficultyPicker'

const BEST_KEY = 'maths6e_chrono_best'

export default function ChronoTables({ player, onBadgeCheck }) {
  const navigate = useNavigate()
  const { playSuccess, playError, playConfetti, playTick } = useSound()

  const [phase, setPhase] = useState('ready') // ready | play | result
  const [difficulty, setDifficulty] = useState('medium')
  const [question, setQuestion] = useState(() => generateQuestion('medium'))
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [feedback, setFeedback] = useState(null) // null | 'correct' | 'wrong'
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [responseTimes, setResponseTimes] = useState([])
  const [best, setBest] = useState(() => {
    try { return parseInt(localStorage.getItem(BEST_KEY)) || 0 } catch { return 0 }
  })

  const timerRef = useRef(null)
  const feedbackRef = useRef(null)
  const questionStartRef = useRef(Date.now())

  const start = useCallback(() => {
    const duration = getTimerDuration(difficulty)
    setPhase('play')
    setScore(0)
    setCorrect(0)
    setQuestionIndex(0)
    setTimeLeft(duration)
    setTotalTime(duration)
    setQuestion(generateQuestion(difficulty))
    setInput('')
    setFeedback(null)
    setStreak(0)
    setMaxStreak(0)
    setResponseTimes([])
    questionStartRef.current = Date.now()
  }, [difficulty])

  // Timer countdown
  useEffect(() => {
    if (phase !== 'play') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setPhase('result')
          return 0
        }
        if (t <= 6) playTick()
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, playTick])

  // End when all questions answered
  useEffect(() => {
    if (phase === 'play' && questionIndex >= TOTAL_QUESTIONS) {
      clearInterval(timerRef.current)
      setPhase('result')
    }
  }, [questionIndex, phase])

  // On result
  useEffect(() => {
    if (phase !== 'result') return
    addHistory({ module: 'CT', score, total: questionIndex, correct, difficulty })
    if (score > best) {
      setBest(score)
      localStorage.setItem(BEST_KEY, score.toString())
    }
    if (onBadgeCheck) onBadgeCheck(score)
    if (getStars(score, TOTAL_QUESTIONS * 3) >= 3) {
      playConfetti()
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    }
  }, [phase])

  const handleSubmit = useCallback(() => {
    if (phase !== 'play' || feedback) return
    const isCorrect = parseInt(input, 10) === question.answer
    const responseTime = (Date.now() - questionStartRef.current) / 1000

    if (isCorrect) {
      const newStreak = streak + 1
      const mult = getComboMultiplier(newStreak)
      setStreak(newStreak)
      setMaxStreak(ms => Math.max(ms, newStreak))
      setScore(s => s + mult)
      setCorrect(c => c + 1)
      setFeedback('correct')
      setResponseTimes(rt => [...rt, responseTime])
      playSuccess()
    } else {
      setStreak(0)
      setFeedback('wrong')
      playError()
    }

    feedbackRef.current = setTimeout(() => {
      setFeedback(null)
      setInput('')
      setQuestionIndex(qi => qi + 1)
      setQuestion(generateQuestion(difficulty))
      questionStartRef.current = Date.now()
    }, isCorrect ? 300 : 900)
  }, [phase, input, question, feedback, streak, difficulty, playSuccess, playError])

  useEffect(() => () => { if (feedbackRef.current) clearTimeout(feedbackRef.current) }, [])

  // === READY SCREEN ===
  if (phase === 'ready') {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0f4ff] px-4">
          <div className="animate-pop-in text-center max-w-sm w-full">
            <div className="text-6xl mb-4">⏱️</div>
            <h1 className="text-3xl font-extrabold text-[#1f2937] mb-2">Chrono-Tables</h1>
            <p className="text-[#64748b] mb-4">{TOTAL_QUESTIONS} calculs. Sois rapide et précis !</p>
            {best > 0 && <p className="text-[#fbbf24] font-bold mb-4">🏆 Record : {best} pts</p>}

            <DifficultyPicker value={difficulty} onChange={setDifficulty} />

            <button onClick={start} className="w-full py-4 rounded-xl bg-[#6366f1] text-white font-bold text-xl active:scale-95 transition-transform mt-6 shadow-lg">
              C'est parti !
            </button>
            <button onClick={() => navigate('/6e')} className="mt-4 text-sm text-[#64748b]">← Retour au Hub</button>
          </div>
        </div>
      </PageTransition>
    )
  }

  // === RESULT SCREEN ===
  if (phase === 'result') {
    const avgTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0

    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0f4ff] px-4">
          <ScoreScreen
            score={score}
            maxScore={TOTAL_QUESTIONS * 3}
            correct={correct}
            total={questionIndex}
            comboMax={maxStreak}
            avgTime={avgTime}
            onReplay={start}
            onHome={() => navigate('/6e')}
          />
        </div>
      </PageTransition>
    )
  }

  // === PLAY SCREEN ===
  const feedbackColor = feedback === 'correct'
    ? 'border-[#10b981] bg-emerald-50'
    : feedback === 'wrong'
      ? 'border-red-500 bg-red-50 animate-shake'
      : 'border-transparent bg-white'

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f4ff]">
      <header className="flex items-center justify-between px-4 py-3 bg-white/80 border-b border-[#6366f1]/10">
        <div className="flex items-center gap-3">
          <CircularTimer timeLeft={timeLeft} totalTime={totalTime} />
          <ComboStreak streak={streak} />
        </div>
        <div className="text-center">
          <span className="text-xs text-[#64748b]">{questionIndex + 1}/{TOTAL_QUESTIONS}</span>
        </div>
        <span className="bg-[#6366f1]/10 px-3 py-1 rounded-full text-sm font-bold text-[#6366f1]">
          {score} pts
        </span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <div className={`w-full max-w-sm rounded-2xl border-3 p-6 shadow-lg transition-all duration-200 ${feedbackColor}`}>
          {feedback === 'correct' && (
            <div className="absolute top-2 right-2 text-2xl animate-pop-in">✅</div>
          )}
          {feedback === 'wrong' && (
            <div className="absolute top-2 right-2 text-2xl animate-pop-in">❌</div>
          )}
          <p className="text-center text-3xl font-extrabold text-[#1f2937] tracking-wide">
            {question.display}
          </p>
          <div className="mt-4 text-center">
            <div className="inline-block min-w-[80px] border-b-4 border-[#6366f1] pb-1">
              <span className="text-4xl font-bold text-[#6366f1]">{input || '\u00A0'}</span>
            </div>
          </div>
          {feedback === 'wrong' && (
            <p className="text-center text-red-500 font-bold mt-3 animate-pop-in">
              {question.answer}
            </p>
          )}
        </div>

        <Keypad value={input} onChange={setInput} onSubmit={handleSubmit} disabled={!!feedback} />
      </div>
    </div>
  )
}
