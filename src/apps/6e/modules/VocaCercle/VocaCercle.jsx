import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { LEVELS, generateRound, QUESTIONS_PER_ROUND } from './engine'
import CercleSVG from './components/CercleSVG'
import ProgressBar from '../../components/ProgressBar'
import Stars, { getStars } from '../../components/Stars'
import PageTransition from '../../components/PageTransition'
import Keypad from '../../components/Keypad'
import { useSound } from '../../hooks/useSound'
import { useHistory } from '../../../../shared/hooks/useHistory'
import { KEYS_6E } from '../../../../shared/utils/storageKeys'

const SCORES_KEY = KEYS_6E.vocaCercle.scores

function loadScores() { try { return JSON.parse(localStorage.getItem(SCORES_KEY)) || {} } catch { return {} } }
function saveScores(s) { localStorage.setItem(SCORES_KEY, JSON.stringify(s)) }

export default function VocaCercle({ player, onBadgeCheck }) {
  const navigate = useNavigate()
  const { playSuccess, playError, playConfetti } = useSound()
  const { addHistory } = useHistory('6e')
  const [level, setLevel] = useState(null)
  const [questions, setQuestions] = useState([])
  const [qi, setQi] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [selected, setSelected] = useState(null)
  const [phase, setPhase] = useState('pick')
  const [bestScores, setBestScores] = useState(loadScores)
  const [inputValue, setInputValue] = useState('')
  const [inputFeedback, setInputFeedback] = useState(null)
  const feedbackTimer = useRef(null)
  const question = questions[qi]

  const startLevel = useCallback((lv) => {
    setLevel(lv)
    setQuestions(generateRound(lv.id))
    setQi(0); setScore(0); setStreak(0); setSelected(null); setInputValue(''); setInputFeedback(null); setPhase('play')
  }, [])

  const advance = useCallback((correct) => {
    const delay = correct ? 600 : 1500
    feedbackTimer.current = setTimeout(() => {
      setSelected(null)
      setInputValue('')
      setInputFeedback(null)
      if (qi + 1 >= QUESTIONS_PER_ROUND) {
        const finalScore = correct ? score + 1 : score
        const updated = { ...bestScores }
        if (!updated[level.id] || finalScore > updated[level.id]) { updated[level.id] = finalScore; setBestScores(updated); saveScores(updated) }
        addHistory({ module: 'VC', level: level.id, score: finalScore, total: QUESTIONS_PER_ROUND })
        if (onBadgeCheck) onBadgeCheck(finalScore)
        if (finalScore === QUESTIONS_PER_ROUND) { playConfetti(); confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }) }
        setPhase('result')
      } else { setQi(q => q + 1) }
    }, delay)
  }, [qi, score, bestScores, level, playConfetti, onBadgeCheck, addHistory])

  const handleChoice = useCallback((choiceIndex) => {
    if (selected !== null || !question) return
    const correct = choiceIndex === question.correctIndex
    setSelected(choiceIndex)
    if (correct) { setScore(s => s + 1); setStreak(s => s + 1); playSuccess() }
    else { setStreak(0); playError() }
    advance(correct)
  }, [question, selected, playSuccess, playError, advance])

  const handleCalculSubmit = useCallback(() => {
    if (!question || inputFeedback !== null) return
    const correct = parseInt(inputValue, 10) === question.inputAnswer
    setInputFeedback(correct ? 'correct' : 'wrong')
    if (correct) { setScore(s => s + 1); setStreak(s => s + 1); playSuccess() }
    else { setStreak(0); playError() }
    advance(correct)
  }, [question, inputValue, inputFeedback, playSuccess, playError, advance])

  useEffect(() => () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current) }, [])

  // ── Pick phase ──
  if (phase === 'pick') {
    return (
      <PageTransition><div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
        <header className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
          <button onClick={() => navigate('/')} className="text-2xl">{'\u2190'}</button>
          <div><h1 className="font-extrabold text-primary-dark dark:text-primary-light text-lg">{'\u2B55'} Vocab Cercle</h1><p className="text-xs text-gray-400">Choisis ton niveau</p></div>
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

  // ── Result phase ──
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

  // ── Play phase ──
  const isCalc = question?.type === 'calcul'

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
      <header className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
        <button onClick={() => setPhase('pick')} className="text-xl text-gray-500 dark:text-gray-400">{'\u2190'}</button>
        <span className="text-sm font-bold text-primary-dark dark:text-primary-light">{'\u2B55'} {level.label} — {level.title}</span>
        <span className="text-2xl">{player.avatar?.emoji || '\uD83C\uDFB2'}</span>
      </header>
      <div className="px-4 pt-3"><ProgressBar current={qi} total={QUESTIONS_PER_ROUND} streak={streak} /></div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-5">
        {/* Figure SVG si question de type figure */}
        {question?.figure && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md w-full max-w-sm">
            <CercleSVG kind={question.figure.kind} />
          </div>
        )}

        {/* Prompt */}
        <p className="text-lg font-bold text-gray-800 dark:text-gray-100 text-center max-w-sm">
          {question?.prompt}
        </p>

        {/* QCM choices */}
        {!isCalc && question?.choices && (
          <div className="w-full max-w-sm space-y-2">
            {question.choices.map((choice, i) => {
              let bg = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
              if (selected !== null) {
                if (i === question.correctIndex) bg = 'bg-emerald-100 dark:bg-emerald-900 border-emerald-500'
                else if (i === selected) bg = 'bg-red-100 dark:bg-red-900 border-red-500 animate-shake'
              }
              return (
                <button
                  key={i}
                  onClick={() => handleChoice(i)}
                  disabled={selected !== null}
                  className={`w-full text-left px-5 py-3 rounded-xl border-2 font-semibold text-base transition-all active:scale-[0.97] ${bg}`}
                >
                  <span className="text-gray-800 dark:text-gray-100">{choice}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Calcul input */}
        {isCalc && (
          <div className="w-full max-w-sm flex flex-col items-center gap-4">
            <div className={`text-4xl font-extrabold min-h-[3rem] px-6 py-2 rounded-xl border-2 text-center min-w-[120px] ${
              inputFeedback === 'correct' ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' :
              inputFeedback === 'wrong' ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/30 animate-shake' :
              'border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800'
            }`}>
              {inputValue || <span className="text-gray-300">?</span>}
              {inputFeedback === 'wrong' && <span className="block text-base mt-1">Réponse : {question.inputAnswer} cm</span>}
            </div>
            <Keypad value={inputValue} onChange={setInputValue} onSubmit={handleCalculSubmit} disabled={inputFeedback !== null} />
          </div>
        )}
      </div>
    </div>
  )
}
