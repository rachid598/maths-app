import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { generateRound, QUESTIONS_PER_ROUND } from './engine'
import LevelPicker from './LevelPicker'
import Keypad from '../../components/Keypad'
import ProgressBar from '../../components/ProgressBar'
import Stars, { getStars } from '../../components/Stars'
import PageTransition from '../../components/PageTransition'
import { useSound } from '../../hooks/useSound'
import { useHistory } from '../../../../shared/hooks/useHistory'

const SCORES_KEY = 'maths6e_ts_scores'
const WEAK_KEY = 'maths6e_ts_weak'

function loadScores() {
  try { return JSON.parse(localStorage.getItem(SCORES_KEY)) || {} } catch { return {} }
}
function saveScores(scores) { localStorage.setItem(SCORES_KEY, JSON.stringify(scores)) }
function loadWeak() {
  try { return JSON.parse(localStorage.getItem(WEAK_KEY)) || [] } catch { return [] }
}
function saveWeak(tables) { localStorage.setItem(WEAK_KEY, JSON.stringify(tables)) }

export default function TableStrike({ player, onBadgeCheck }) {
  const navigate = useNavigate()
  const { playSuccess, playError, playConfetti } = useSound()
  const { addHistory } = useHistory('6e')

  const [level, setLevel] = useState(null)
  const [questions, setQuestions] = useState([])
  const [qi, setQi] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [phase, setPhase] = useState('pick')
  const [bestScores, setBestScores] = useState(loadScores)
  const [isGoldCard, setIsGoldCard] = useState(false)
  const [isDiamondCard, setIsDiamondCard] = useState(false)
  const [questionStart, setQuestionStart] = useState(null)
  const [totalTime, setTotalTime] = useState(0)
  const [missedTables, setMissedTables] = useState([])
  const feedbackTimer = useRef(null)

  const question = questions[qi]

  const startLevel = useCallback((lv) => {
    const weak = loadWeak()
    setLevel(lv)
    setQuestions(generateRound(lv.tables, QUESTIONS_PER_ROUND, weak))
    setQi(0)
    setInput('')
    setScore(0)
    setStreak(0)
    setMaxStreak(0)
    setFeedback(null)
    setIsGoldCard(false)
    setIsDiamondCard(false)
    setQuestionStart(Date.now())
    setTotalTime(0)
    setMissedTables([])
    setPhase('play')
  }, [])

  const handleSubmit = useCallback(() => {
    if (!question || feedback) return
    const userAnswer = parseInt(input, 10)
    const correct = userAnswer === question.answer
    const elapsed = Date.now() - questionStart

    setTotalTime((t) => t + elapsed)

    if (correct) {
      const newStreak = streak + 1
      setScore((s) => s + 1)
      setStreak(newStreak)
      if (newStreak > maxStreak) setMaxStreak(newStreak)
      setFeedback('correct')
      playSuccess()
      if (newStreak >= 10) setIsDiamondCard(true)
      else if (newStreak >= 5 && !isGoldCard) setIsGoldCard(true)
    } else {
      setStreak(0)
      setFeedback('wrong')
      setIsGoldCard(false)
      setIsDiamondCard(false)
      playError()
      setMissedTables((prev) => [...prev, question.a])
    }

    feedbackTimer.current = setTimeout(() => {
      setFeedback(null)
      setInput('')
      setQuestionStart(Date.now())
      if (qi + 1 >= QUESTIONS_PER_ROUND) {
        const finalScore = correct ? score + 1 : score
        const finalStreak = correct ? Math.max(maxStreak, streak + 1) : maxStreak
        const updated = { ...bestScores }
        if (!updated[level.id] || finalScore > updated[level.id]) {
          updated[level.id] = finalScore
          setBestScores(updated)
          saveScores(updated)
        }
        const allMissed = correct ? missedTables : [...missedTables, question.a]
        saveWeak(allMissed.length > 0 ? [...new Set(allMissed)] : [])
        addHistory({ module: 'TS', level: level.id, score: finalScore, total: QUESTIONS_PER_ROUND, maxStreak: finalStreak })
        if (onBadgeCheck) onBadgeCheck(finalScore, updated, finalStreak)
        if (finalScore === QUESTIONS_PER_ROUND) {
          playConfetti()
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#ffd700'] })
        }
        setPhase('result')
      } else {
        setQi((q) => q + 1)
      }
    }, correct ? 400 : 1200)
  }, [question, input, feedback, streak, maxStreak, isGoldCard, qi, score, bestScores, level, missedTables, questionStart, playSuccess, playError, playConfetti, onBadgeCheck])

  useEffect(() => () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current) }, [])

  if (phase === 'pick') {
    return (
      <PageTransition>
        <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
          <header className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
            <button onClick={() => navigate('/')} className="text-2xl">{'\u2190'}</button>
            <div>
              <h1 className="font-extrabold text-primary-dark dark:text-primary-light text-lg">{'\u26A1'} Table-Strike</h1>
              <p className="text-xs text-gray-400">Choisis ton niveau</p>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">
            <LevelPicker onSelect={startLevel} bestScores={bestScores} />
          </main>
        </div>
      </PageTransition>
    )
  }

  if (phase === 'result') {
    const perfect = score === QUESTIONS_PER_ROUND
    const stars = getStars(score)
    const avgTime = Math.round(totalTime / QUESTIONS_PER_ROUND / 100) / 10
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface dark:bg-gray-900 px-4">
          <div className="animate-pop-in text-center">
            <div className="text-7xl mb-4">{perfect ? '\uD83C\uDFC6' : score >= 7 ? '\u2B50' : '\uD83D\uDCAA'}</div>
            <h2 className="text-3xl font-extrabold text-primary-dark dark:text-primary-light mb-2">{score} / {QUESTIONS_PER_ROUND}</h2>
            <Stars count={stars} size="text-2xl" />
            <p className="text-gray-500 dark:text-gray-400 mb-1 mt-2">{level.title}</p>
            <p className="text-xs text-gray-400 mb-1">Temps moyen : {avgTime}s / question</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
              {perfect ? 'Parfait ! Tu es un champion !' : score >= 7 ? 'Bravo, continue comme ca !' : 'Entraine-toi encore, tu vas y arriver !'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => startLevel(level)} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold active:scale-95 transition-transform">Rejouer</button>
              <button onClick={() => setPhase('pick')} className="flex-1 py-3 rounded-xl bg-white dark:bg-gray-800 text-primary font-bold border-2 border-primary active:scale-95 transition-transform">Niveaux</button>
            </div>
            <button onClick={() => navigate('/')} className="mt-4 text-sm text-gray-500 dark:text-gray-400">{'\u2190'} Retour au Hub</button>
          </div>
        </div>
      </PageTransition>
    )
  }

  const feedbackColor = feedback === 'correct'
    ? 'border-success bg-emerald-50 dark:bg-emerald-950'
    : feedback === 'wrong'
      ? 'border-danger bg-red-50 dark:bg-red-950 animate-shake'
      : 'border-transparent bg-white dark:bg-gray-800'

  const cardGlow = isDiamondCard
    ? 'ring-2 ring-blue-400 shadow-blue-400/50 shadow-xl'
    : isGoldCard
      ? 'animate-gold-glow ring-2 ring-gold'
      : ''

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
      <header className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
        <button onClick={() => setPhase('pick')} className="text-xl text-gray-500 dark:text-gray-400">{'\u2190'}</button>
        <span className="text-sm font-bold text-primary-dark dark:text-primary-light">{'\u26A1'} {level.label} — {level.title}</span>
        <span className="text-2xl">{player.avatar?.emoji || '\uD83C\uDFB2'}</span>
      </header>

      <div className="px-4 pt-3">
        <ProgressBar current={qi} total={QUESTIONS_PER_ROUND} streak={streak} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <div className={`w-full max-w-sm rounded-2xl border-3 p-6 shadow-lg transition-all duration-200 ${feedbackColor} ${cardGlow}`}>
          {isDiamondCard && (
            <div className="text-center mb-2">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full">{'\uD83D\uDC8E'} Mode diamant !</span>
            </div>
          )}
          {isGoldCard && !isDiamondCard && (
            <div className="text-center mb-2">
              <span className="bg-gold/20 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">{'\u2B50'} Mode sans erreur !</span>
            </div>
          )}
          <p className="text-center text-3xl font-extrabold text-gray-800 dark:text-gray-100 tracking-wide">{question?.display}</p>
          <div className="mt-4 text-center">
            <div className="inline-block min-w-[80px] border-b-4 border-primary pb-1">
              <span className="text-4xl font-bold text-primary">{input || '\u00A0'}</span>
            </div>
          </div>
          {feedback === 'wrong' && (
            <p className="text-center text-danger font-bold mt-3 animate-pop-in">Reponse : {question.answer}</p>
          )}
        </div>
        <Keypad value={input} onChange={setInput} onSubmit={handleSubmit} disabled={!!feedback} />
      </div>
    </div>
  )
}
