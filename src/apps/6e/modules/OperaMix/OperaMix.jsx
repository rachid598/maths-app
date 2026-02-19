import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import Keypad from '../../components/Keypad'
import ProgressBar from '../../components/ProgressBar'
import Stars, { getStars } from '../../components/Stars'
import PageTransition from '../../components/PageTransition'
import { useSound } from '../../hooks/useSound'
import { addHistory } from '../../hooks/useHistory'

const TOTAL = 10
const BEST_KEY = 'maths6e_om_best'

function genQuestion() {
  const ops = ['+', '-', '\u00D7']
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a, b, answer

  if (op === '+') {
    a = Math.floor(Math.random() * 90) + 10
    b = Math.floor(Math.random() * 90) + 10
    answer = a + b
  } else if (op === '-') {
    a = Math.floor(Math.random() * 80) + 20
    b = Math.floor(Math.random() * (a - 1)) + 1
    answer = a - b
  } else {
    a = Math.floor(Math.random() * 9) + 2
    b = Math.floor(Math.random() * 9) + 2
    answer = a * b
  }

  return { display: `${a} ${op} ${b} = ?`, answer, op }
}

function generateRound() {
  const questions = []
  for (let i = 0; i < TOTAL; i++) questions.push(genQuestion())
  return questions
}

export default function OperaMix({ player, onBadgeCheck }) {
  const navigate = useNavigate()
  const { playSuccess, playError, playConfetti } = useSound()
  const [phase, setPhase] = useState('ready')
  const [questions, setQuestions] = useState([])
  const [qi, setQi] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [best, setBest] = useState(() => { try { return parseInt(localStorage.getItem(BEST_KEY)) || 0 } catch { return 0 } })
  const feedbackRef = useRef(null)
  const question = questions[qi]

  const start = useCallback(() => {
    setQuestions(generateRound())
    setQi(0); setInput(''); setScore(0); setStreak(0); setFeedback(null); setPhase('play')
  }, [])

  const handleSubmit = useCallback(() => {
    if (!question || feedback) return
    const correct = parseInt(input, 10) === question.answer
    if (correct) { setScore(s => s + 1); setStreak(s => s + 1); setFeedback('correct'); playSuccess() }
    else { setStreak(0); setFeedback('wrong'); playError() }

    feedbackRef.current = setTimeout(() => {
      setFeedback(null); setInput('')
      if (qi + 1 >= TOTAL) {
        const finalScore = correct ? score + 1 : score
        addHistory({ module: 'OM', score: finalScore, total: TOTAL })
        if (finalScore > best) { setBest(finalScore); localStorage.setItem(BEST_KEY, finalScore.toString()) }
        if (onBadgeCheck) onBadgeCheck(finalScore)
        if (finalScore === TOTAL) { playConfetti(); confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }) }
        setPhase('result')
      } else { setQi(q => q + 1) }
    }, correct ? 400 : 1200)
  }, [question, input, feedback, qi, score, best, playSuccess, playError, playConfetti, onBadgeCheck])

  useEffect(() => () => { if (feedbackRef.current) clearTimeout(feedbackRef.current) }, [])

  if (phase === 'ready') {
    return (
      <PageTransition><div className="flex flex-col items-center justify-center min-h-screen bg-surface dark:bg-gray-900 px-4">
        <div className="animate-pop-in text-center max-w-sm">
          <div className="text-6xl mb-4">{'\uD83C\uDFB0'}</div>
          <h1 className="text-3xl font-extrabold text-primary-dark dark:text-primary-light mb-2">Opera-Mix</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">Additions, soustractions et multiplications melangees !</p>
          <p className="text-sm text-gray-400 mb-4">10 questions — quelle operation va tomber ?</p>
          <button onClick={start} className="w-full py-4 rounded-xl bg-primary text-white font-bold text-xl active:scale-95 transition-transform">C'est parti !</button>
          <button onClick={() => navigate('/6e')} className="mt-4 text-sm text-gray-400">{'\u2190'} Retour au Hub</button>
        </div>
      </div></PageTransition>
    )
  }

  if (phase === 'result') {
    const perfect = score === TOTAL; const stars = getStars(score)
    return (
      <PageTransition><div className="flex flex-col items-center justify-center min-h-screen bg-surface dark:bg-gray-900 px-4">
        <div className="animate-pop-in text-center">
          <div className="text-7xl mb-4">{perfect ? '\uD83C\uDFC6' : score >= 7 ? '\u2B50' : '\uD83D\uDCAA'}</div>
          <h2 className="text-3xl font-extrabold text-primary-dark dark:text-primary-light mb-2">{score} / {TOTAL}</h2>
          <Stars count={stars} size="text-2xl" />
          <p className="text-sm text-gray-400 mb-8 mt-2">{perfect ? 'Parfait !' : score >= 7 ? 'Bravo !' : 'Continue !'}</p>
          <button onClick={start} className="w-full py-3 rounded-xl bg-primary text-white font-bold active:scale-95 transition-transform mb-3">Rejouer</button>
          <button onClick={() => navigate('/6e')} className="text-sm text-gray-400">{'\u2190'} Retour au Hub</button>
        </div>
      </div></PageTransition>
    )
  }

  const feedbackColor = feedback === 'correct' ? 'border-success bg-emerald-50 dark:bg-emerald-950' : feedback === 'wrong' ? 'border-danger bg-red-50 dark:bg-red-950 animate-shake' : 'border-transparent bg-white dark:bg-gray-800'

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
      <header className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
        <button onClick={() => setPhase('ready')} className="text-xl text-gray-400">{'\u2190'}</button>
        <span className="text-sm font-bold text-primary-dark dark:text-primary-light">{'\uD83C\uDFB0'} Opera-Mix</span>
        <span className="text-2xl">{player.avatar?.emoji || '\uD83C\uDFB2'}</span>
      </header>
      <div className="px-4 pt-3"><ProgressBar current={qi} total={TOTAL} streak={streak} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <div className={`w-full max-w-sm rounded-2xl border-3 p-6 shadow-lg transition-all duration-200 ${feedbackColor}`}>
          <p className="text-center text-3xl font-extrabold text-gray-800 dark:text-gray-100 tracking-wide">{question?.display}</p>
          <div className="mt-4 text-center"><div className="inline-block min-w-[80px] border-b-4 border-primary pb-1"><span className="text-4xl font-bold text-primary">{input || '\u00A0'}</span></div></div>
          {feedback === 'wrong' && <p className="text-center text-danger font-bold mt-3 animate-pop-in">{question.answer}</p>}
        </div>
        <Keypad value={input} onChange={setInput} onSubmit={handleSubmit} disabled={!!feedback} />
      </div>
    </div>
  )
}
