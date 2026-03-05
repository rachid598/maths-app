import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'
import { pickQuestions, checkAnswer, TOTAL_TIME, NUM_QUESTIONS } from './engine'
import QuestionCard from './components/QuestionCard'
import ScoreScreen from './components/ScoreScreen'
import CorrectionModal from './components/CorrectionModal'

export default function BrevetFlash() {
  const navigate = useNavigate()
  const onBack = () => navigate('/3e')
  const [phase, setPhase] = useState('intro')
  const [questions, setQuestions] = useState([])
  const [qIndex, setQIndex] = useState(0)
  const [results, setResults] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [showCorrection, setShowCorrection] = useState(false)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  const startGame = useCallback(() => {
    setQuestions(pickQuestions(NUM_QUESTIONS))
    setQIndex(0)
    setResults([])
    setFeedback(null)
    setTimeLeft(TOTAL_TIME)
    startTimeRef.current = Date.now()
    setPhase('playing')
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setPhase('done'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  const totalTime = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000)

  const handleAnswer = useCallback((userAnswer) => {
    const q = questions[qIndex]
    const correct = checkAnswer(userAnswer, q.answer)
    setFeedback({ correct })
    setResults(prev => [...prev, { question: q, userAnswer, correct }])
    setTimeout(() => {
      setFeedback(null)
      if (qIndex + 1 >= questions.length) { clearInterval(timerRef.current); setPhase('done') }
      else setQIndex(i => i + 1)
    }, 1500)
  }, [questions, qIndex])

  const pct = (timeLeft / TOTAL_TIME) * 100
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  if (phase === 'intro') {
    return (
      <div className="min-h-dvh px-4 pb-8 pt-6">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"><ArrowLeft className="h-4 w-4" /> Retour</button>
        <div className="mx-auto max-w-lg text-center">
          <Zap className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
          <h1 className="mb-2 text-3xl font-black text-white">Brevet Flash</h1>
          <p className="mb-6 text-slate-400">5 questions type brevet en 5 minutes max.<br />Calcul, Pythagore, Thalès, fonctions, probas, littéral.</p>
          <button onClick={startGame} className="rounded-xl bg-accent px-8 py-4 text-lg font-bold text-white transition hover:bg-accent/80">Commencer 🚀</button>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="min-h-dvh px-4 pb-8 pt-6">
        <ScoreScreen results={results} totalTime={totalTime} onReplay={startGame} onBack={onBack} onShowCorrection={() => setShowCorrection(true)} />
        {showCorrection && <CorrectionModal results={results} onClose={() => setShowCorrection(false)} />}
      </div>
    )
  }

  return (
    <div className="min-h-dvh px-4 pb-8 pt-6">
      <div className="mx-auto mb-2 max-w-lg">
        <div className="flex items-center justify-between text-sm text-slate-400 mb-1">
          <span>⏱ {mins}:{String(secs).padStart(2, '0')}</span>
          <button onClick={onBack} className="text-xs text-slate-500 hover:text-white transition">Quitter</button>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: pct > 40 ? '#10b981' : pct > 15 ? '#fbbf24' : '#ef4444' }} />
        </div>
      </div>
      <div className="mt-6">
        <QuestionCard key={qIndex} question={questions[qIndex]} index={qIndex} total={questions.length} onAnswer={handleAnswer} feedback={feedback} />
      </div>
    </div>
  )
}
