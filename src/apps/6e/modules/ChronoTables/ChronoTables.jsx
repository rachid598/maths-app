import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import Keypad from '../../components/Keypad'
import PageTransition from '../../components/PageTransition'
import { useSound } from '../../hooks/useSound'
import { addHistory } from '../../hooks/useHistory'

const DURATION = 60
const ALL_TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10]
const BEST_KEY = 'maths6e_chrono_best'

function genQuestion() {
  const a = ALL_TABLES[Math.floor(Math.random() * ALL_TABLES.length)]
  const b = Math.floor(Math.random() * 9) + 2
  return { display: `${a} \u00D7 ${b} = ?`, answer: a * b }
}

export default function ChronoTables({ player, onBadgeCheck }) {
  const navigate = useNavigate()
  const { playSuccess, playError, playConfetti, playTick } = useSound()
  const [phase, setPhase] = useState('ready')
  const [question, setQuestion] = useState(genQuestion)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [feedback, setFeedback] = useState(null)
  const [best, setBest] = useState(() => {
    try { return parseInt(localStorage.getItem(BEST_KEY)) || 0 } catch { return 0 }
  })
  const timerRef = useRef(null)
  const feedbackRef = useRef(null)

  const start = useCallback(() => {
    setPhase('play')
    setScore(0)
    setTimeLeft(DURATION)
    setQuestion(genQuestion())
    setInput('')
    setFeedback(null)
  }, [])

  useEffect(() => {
    if (phase !== 'play') return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
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

  useEffect(() => {
    if (phase === 'result') {
      addHistory({ module: 'CT', score, total: score })
      if (score > best) {
        setBest(score)
        localStorage.setItem(BEST_KEY, score.toString())
      }
      if (onBadgeCheck) onBadgeCheck(score)
      if (score >= 20) {
        playConfetti()
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      }
    }
  }, [phase])

  const handleSubmit = useCallback(() => {
    if (phase !== 'play' || feedback) return
    const correct = parseInt(input, 10) === question.answer
    if (correct) {
      setScore((s) => s + 1)
      setFeedback('correct')
      playSuccess()
    } else {
      setFeedback('wrong')
      playError()
    }
    feedbackRef.current = setTimeout(() => {
      setFeedback(null)
      setInput('')
      setQuestion(genQuestion())
    }, correct ? 200 : 800)
  }, [phase, input, question, feedback, playSuccess, playError])

  useEffect(() => () => { if (feedbackRef.current) clearTimeout(feedbackRef.current) }, [])

  if (phase === 'ready') {
    return (
      <PageTransition><div className="flex flex-col items-center justify-center min-h-screen bg-surface dark:bg-gray-900 px-4">
        <div className="animate-pop-in text-center max-w-sm">
          <div className="text-6xl mb-4">{'\u23F1\uFE0F'}</div>
          <h1 className="text-3xl font-extrabold text-primary-dark dark:text-primary-light mb-2">Chrono-Tables</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">60 secondes. Le plus de bonnes reponses possible.</p>
          {best > 0 && <p className="text-accent font-bold mb-4">Record : {best}</p>}
          <button onClick={start} className="w-full py-4 rounded-xl bg-primary text-white font-bold text-xl active:scale-95 transition-transform">C'est parti !</button>
          <button onClick={() => navigate('/6e')} className="mt-4 text-sm text-gray-400">{'\u2190'} Retour au Hub</button>
        </div>
      </div></PageTransition>
    )
  }

  if (phase === 'result') {
    const isRecord = score >= best
    return (
      <PageTransition><div className="flex flex-col items-center justify-center min-h-screen bg-surface dark:bg-gray-900 px-4">
        <div className="animate-pop-in text-center">
          <div className="text-7xl mb-4">{isRecord ? '\uD83C\uDFC6' : '\u23F1\uFE0F'}</div>
          <h2 className="text-4xl font-extrabold text-primary-dark dark:text-primary-light mb-2">{score}</h2>
          <p className="text-gray-500 mb-1">bonnes reponses en 60s</p>
          {isRecord && <p className="text-accent font-bold">Nouveau record !</p>}
          <p className="text-sm text-gray-400 mb-8">Meilleur : {best}</p>
          <button onClick={start} className="w-full py-3 rounded-xl bg-primary text-white font-bold active:scale-95 transition-transform mb-3">Rejouer</button>
          <button onClick={() => navigate('/6e')} className="text-sm text-gray-400">{'\u2190'} Retour au Hub</button>
        </div>
      </div></PageTransition>
    )
  }

  const feedbackColor = feedback === 'correct' ? 'border-success bg-emerald-50 dark:bg-emerald-950' : feedback === 'wrong' ? 'border-danger bg-red-50 dark:bg-red-950 animate-shake' : 'border-transparent bg-white dark:bg-gray-800'
  const timerColor = timeLeft <= 10 ? 'text-danger' : timeLeft <= 20 ? 'text-accent' : 'text-primary'

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
      <header className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
        <span className="text-sm font-bold text-primary-dark dark:text-primary-light">{'\u23F1\uFE0F'} Chrono-Tables</span>
        <span className={`text-2xl font-extrabold ${timerColor}`}>{timeLeft}s</span>
        <span className="bg-primary/10 px-3 py-1 rounded-full text-sm font-bold text-primary">{score}</span>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <div className={`w-full max-w-sm rounded-2xl border-3 p-6 shadow-lg transition-all duration-200 ${feedbackColor}`}>
          <p className="text-center text-3xl font-extrabold text-gray-800 dark:text-gray-100 tracking-wide">{question.display}</p>
          <div className="mt-4 text-center"><div className="inline-block min-w-[80px] border-b-4 border-primary pb-1"><span className="text-4xl font-bold text-primary">{input || '\u00A0'}</span></div></div>
          {feedback === 'wrong' && <p className="text-center text-danger font-bold mt-3 animate-pop-in">{question.answer}</p>}
        </div>
        <Keypad value={input} onChange={setInput} onSubmit={handleSubmit} disabled={!!feedback} />
      </div>
    </div>
  )
}
