import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { LEVELS, generateRound, QUESTIONS_PER_ROUND } from './engine'
import Keypad from '../../components/Keypad'
import ProgressBar from '../../components/ProgressBar'
import Stars, { getStars } from '../../components/Stars'
import PageTransition from '../../components/PageTransition'
import { useSound } from '../../hooks/useSound'
import { addHistory } from '../../hooks/useHistory'

const SCORES_KEY = 'maths6e_dv_scores'

function loadScores() { try { return JSON.parse(localStorage.getItem(SCORES_KEY)) || {} } catch { return {} } }
function saveScores(s) { localStorage.setItem(SCORES_KEY, JSON.stringify(s)) }

export default function Divisix({ player, onBadgeCheck }) {
  const navigate = useNavigate()
  const { playSuccess, playError, playConfetti } = useSound()
  const [level, setLevel] = useState(null)
  const [questions, setQuestions] = useState([])
  const [qi, setQi] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [phase, setPhase] = useState('pick')
  const [bestScores, setBestScores] = useState(loadScores)
  const feedbackTimer = useRef(null)
  const question = questions[qi]

  const startLevel = useCallback((lv) => {
    setLevel(lv)
    setQuestions(generateRound(lv.divisors))
    setQi(0); setInput(''); setScore(0); setStreak(0); setFeedback(null); setPhase('play')
  }, [])

  const handleSubmit = useCallback(() => {
    if (!question || feedback) return
    const correct = parseInt(input, 10) === question.answer
    if (correct) { setScore(s => s + 1); setStreak(s => s + 1); setFeedback('correct'); playSuccess() }
    else { setStreak(0); setFeedback('wrong'); playError() }

    feedbackTimer.current = setTimeout(() => {
      setFeedback(null); setInput('')
      if (qi + 1 >= QUESTIONS_PER_ROUND) {
        const finalScore = correct ? score + 1 : score
        const updated = { ...bestScores }
        if (!updated[level.id] || finalScore > updated[level.id]) { updated[level.id] = finalScore; setBestScores(updated); saveScores(updated) }
        addHistory({ module: 'DV', level: level.id, score: finalScore, total: QUESTIONS_PER_ROUND })
        if (onBadgeCheck) onBadgeCheck(finalScore)
        if (finalScore === QUESTIONS_PER_ROUND) { playConfetti(); confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }) }
        setPhase('result')
      } else { setQi(q => q + 1) }
    }, correct ? 400 : 1200)
  }, [question, input, feedback, qi, score, bestScores, level, playSuccess, playError, playConfetti, onBadgeCheck])

  useEffect(() => () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current) }, [])

  if (phase === 'pick') {
    return (
      <PageTransition><div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
        <header className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
          <button onClick={() => navigate('/')} className="text-2xl">{'\u2190'}</button>
          <div><h1 className="font-extrabold text-primary-dark dark:text-primary-light text-lg">{'\u2797'} Divisix</h1><p className="text-xs text-gray-400">Choisis ton niveau</p></div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">
          <div className="space-y-3">
            {LEVELS.map((lv) => {
              const sc = bestScores[lv.id]; const stars = sc !== undefined ? getStars(sc) : 0
              return (<button key={lv.id} onClick={() => startLevel(lv)} className={`animate-slide-up w-full text-left p-4 rounded-2xl shadow-md bg-gradient-to-r ${lv.color} text-white active:scale-[0.97] transition-transform`}>
                <div className="flex items-center justify-between"><div><span className="text-xs font-mono opacity-80">{lv.label}</span><h3 className="font-bold text-lg leading-tight">{lv.title}</h3></div>
                <div className="flex flex-col items-end gap-1">{sc !== undefined && <span className="bg-white/30 px-3 py-0.5 rounded-full text-sm font-bold">{sc}/10</span>}{stars > 0 && <Stars count={stars} size="text-sm" />}</div></div>
              </button>)
            })}
          </div>
        </main>
      </div></PageTransition>
    )
  }

  if (phase === 'result') {
    const perfect = score === QUESTIONS_PER_ROUND; const stars = getStars(score)
    return (
      <PageTransition><div className="flex flex-col items-center justify-center min-h-screen bg-surface dark:bg-gray-900 px-4">
        <div className="animate-pop-in text-center">
          <div className="text-7xl mb-4">{perfect ? '\uD83C\uDFC6' : score >= 7 ? '\u2B50' : '\uD83D\uDCAA'}</div>
          <h2 className="text-3xl font-extrabold text-primary-dark dark:text-primary-light mb-2">{score} / {QUESTIONS_PER_ROUND}</h2>
          <Stars count={stars} size="text-2xl" />
          <p className="text-gray-500 mb-1 mt-2">{level.title}</p>
          <p className="text-sm text-gray-400 mb-8">{perfect ? 'Parfait !' : score >= 7 ? 'Bravo !' : 'Continue !'}</p>
          <div className="flex gap-3">
            <button onClick={() => startLevel(level)} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold active:scale-95 transition-transform">Rejouer</button>
            <button onClick={() => setPhase('pick')} className="flex-1 py-3 rounded-xl bg-white dark:bg-gray-800 text-primary font-bold border-2 border-primary active:scale-95 transition-transform">Niveaux</button>
          </div>
          <button onClick={() => navigate('/')} className="mt-4 text-sm text-gray-500 dark:text-gray-400">{'\u2190'} Retour au Hub</button>
        </div>
      </div></PageTransition>
    )
  }

  const feedbackColor = feedback === 'correct' ? 'border-success bg-emerald-50 dark:bg-emerald-950' : feedback === 'wrong' ? 'border-danger bg-red-50 dark:bg-red-950 animate-shake' : 'border-transparent bg-white dark:bg-gray-800'

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
      <header className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
        <button onClick={() => setPhase('pick')} className="text-xl text-gray-500 dark:text-gray-400">{'\u2190'}</button>
        <span className="text-sm font-bold text-primary-dark dark:text-primary-light">{'\u2797'} {level.label} — {level.title}</span>
        <span className="text-2xl">{player.avatar?.emoji || '\uD83C\uDFB2'}</span>
      </header>
      <div className="px-4 pt-3"><ProgressBar current={qi} total={QUESTIONS_PER_ROUND} streak={streak} /></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <div className={`w-full max-w-sm rounded-2xl border-3 p-6 shadow-lg transition-all duration-200 ${feedbackColor}`}>
          <p className="text-center text-3xl font-extrabold text-gray-800 dark:text-gray-100 tracking-wide">{question?.display}</p>
          <div className="mt-4 text-center"><div className="inline-block min-w-[80px] border-b-4 border-primary pb-1"><span className="text-4xl font-bold text-primary">{input || '\u00A0'}</span></div></div>
          {feedback === 'wrong' && <p className="text-center text-danger font-bold mt-3 animate-pop-in">Reponse : {question.answer}</p>}
        </div>
        <Keypad value={input} onChange={setInput} onSubmit={handleSubmit} disabled={!!feedback} />
      </div>
    </div>
  )
}
