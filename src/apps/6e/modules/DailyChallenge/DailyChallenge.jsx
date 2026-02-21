import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import Keypad from '../../components/Keypad'
import ProgressBar from '../../components/ProgressBar'
import Stars, { getStars } from '../../components/Stars'
import PageTransition from '../../components/PageTransition'
import { useSound } from '../../hooks/useSound'
import { addHistory } from '../../hooks/useHistory'
import DateIcon from '../../components/DateIcon'

const TOTAL = 10
const DAILY_KEY = 'maths6e_daily'

function seededRandom(seed) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
}

function todaySeed() {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

function generateDailyRound() {
  const rand = seededRandom(todaySeed())
  const tables = [2, 3, 4, 5, 6, 7, 8, 9, 10]
  const questions = []
  for (let i = 0; i < TOTAL; i++) {
    const a = tables[Math.floor(rand() * tables.length)]
    const b = Math.floor(rand() * 9) + 2
    const result = a * b
    const isDirect = rand() < 0.5
    questions.push(isDirect
      ? { display: `${a} \u00D7 ${b} = ?`, answer: result }
      : { display: `${a} \u00D7 ? = ${result}`, answer: b })
  }
  return questions
}

function loadDaily() {
  try {
    const d = JSON.parse(localStorage.getItem(DAILY_KEY))
    return d && d.date === todaySeed() ? d : null
  } catch { return null }
}

function saveDaily(score) {
  const prev = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}')
  const count = (prev.totalCompleted || 0) + 1
  localStorage.setItem(DAILY_KEY, JSON.stringify({ date: todaySeed(), score, totalCompleted: count }))
  return count
}

export default function DailyChallenge({ player, onBadgeCheck }) {
  const navigate = useNavigate()
  const { playSuccess, playError, playConfetti } = useSound()
  const [phase, setPhase] = useState(() => loadDaily() ? 'done' : 'ready')
  const [questions] = useState(generateDailyRound)
  const [qi, setQi] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [savedScore] = useState(() => loadDaily()?.score)
  const feedbackRef = useRef(null)
  const question = questions[qi]

  const start = useCallback(() => { setQi(0); setInput(''); setScore(0); setStreak(0); setFeedback(null); setPhase('play') }, [])

  const handleSubmit = useCallback(() => {
    if (!question || feedback) return
    const correct = parseInt(input, 10) === question.answer
    if (correct) { setScore(s => s + 1); setStreak(s => s + 1); setFeedback('correct'); playSuccess() }
    else { setStreak(0); setFeedback('wrong'); playError() }

    feedbackRef.current = setTimeout(() => {
      setFeedback(null); setInput('')
      if (qi + 1 >= TOTAL) {
        const finalScore = correct ? score + 1 : score
        const dailyCount = saveDaily(finalScore)
        addHistory({ module: 'DC', score: finalScore, total: TOTAL })
        if (onBadgeCheck) onBadgeCheck(finalScore, dailyCount)
        if (finalScore === TOTAL) { playConfetti(); confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }) }
        setPhase('result')
      } else { setQi(q => q + 1) }
    }, correct ? 400 : 1200)
  }, [question, input, feedback, qi, score, playSuccess, playError, playConfetti, onBadgeCheck])

  useEffect(() => () => { if (feedbackRef.current) clearTimeout(feedbackRef.current) }, [])

  if (phase === 'done') {
    return (
      <PageTransition><div className="flex flex-col items-center justify-center min-h-screen bg-surface dark:bg-gray-900 px-4">
        <div className="animate-pop-in text-center max-w-sm">
          <div className="text-6xl mb-4">{'\u2705'}</div>
          <h1 className="text-2xl font-extrabold text-primary-dark dark:text-primary-light mb-2">Defi du jour termine !</h1>
          <p className="text-gray-500 mb-2">Ton score : <strong>{savedScore}/10</strong></p>
          <Stars count={getStars(savedScore || 0)} size="text-2xl" />
          <p className="text-sm text-gray-400 mt-4 mb-6">Reviens demain pour un nouveau defi !</p>
          <button onClick={() => navigate('/')} className="w-full py-3 rounded-xl bg-primary text-white font-bold active:scale-95 transition-transform">{'\u2190'} Retour au Hub</button>
        </div>
      </div></PageTransition>
    )
  }

  if (phase === 'ready') {
    return (
      <PageTransition><div className="flex flex-col items-center justify-center min-h-screen bg-surface dark:bg-gray-900 px-4">
        <div className="animate-pop-in text-center max-w-sm">
          <div className="mb-4 flex justify-center"><DateIcon /></div>
          <h1 className="text-3xl font-extrabold text-primary-dark dark:text-primary-light mb-2">Defi du jour</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">10 questions — les memes pour toute la classe !</p>
          <p className="text-xs text-gray-400 mb-6">Un seul essai par jour.</p>
          <button onClick={start} className="w-full py-4 rounded-xl bg-accent text-gray-900 dark:text-gray-900 font-bold text-xl active:scale-95 transition-transform">Relever le defi !</button>
          <button onClick={() => navigate('/')} className="mt-4 text-sm text-gray-500 dark:text-gray-400">{'\u2190'} Retour au Hub</button>
        </div>
      </div></PageTransition>
    )
  }

  if (phase === 'result') {
    const stars = getStars(score)
    return (
      <PageTransition><div className="flex flex-col items-center justify-center min-h-screen bg-surface dark:bg-gray-900 px-4">
        <div className="animate-pop-in text-center">
          <div className="mb-4 flex justify-center">{score === TOTAL ? <span className="text-7xl">{'\uD83C\uDFC6'}</span> : <DateIcon />}</div>
          <h2 className="text-3xl font-extrabold text-primary-dark dark:text-primary-light mb-2">{score} / {TOTAL}</h2>
          <Stars count={stars} size="text-2xl" />
          <p className="text-sm text-gray-400 mb-8 mt-2">Reviens demain !</p>
          <button onClick={() => navigate('/')} className="w-full py-3 rounded-xl bg-primary text-white font-bold active:scale-95 transition-transform">{'\u2190'} Retour au Hub</button>
        </div>
      </div></PageTransition>
    )
  }

  const feedbackColor = feedback === 'correct' ? 'border-success bg-emerald-50 dark:bg-emerald-950' : feedback === 'wrong' ? 'border-danger bg-red-50 dark:bg-red-950 animate-shake' : 'border-transparent bg-white dark:bg-gray-800'

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
      <header className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
        <span className="text-sm font-bold text-primary-dark dark:text-primary-light flex items-center gap-2"><DateIcon size="small" /> Defi du jour</span>
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
