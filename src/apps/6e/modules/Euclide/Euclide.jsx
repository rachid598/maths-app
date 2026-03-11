import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { LEVELS, generateDivision, QUESTIONS_PER_ROUND } from './engine'
import DivisionLayout from './components/DivisionLayout'
import VocabulaireQuiz from './components/VocabulaireQuiz'
import ProgressBar from '../../components/ProgressBar'
import Stars, { getStars } from '../../components/Stars'
import PageTransition from '../../components/PageTransition'
import { useSound } from '../../hooks/useSound'
import { useHistory } from '../../../../shared/hooks/useHistory'
import { KEYS_6E } from '../../../../shared/utils/storageKeys'

const SCORES_KEY = KEYS_6E.custom('euclide_scores')

function loadScores() { try { return JSON.parse(localStorage.getItem(SCORES_KEY)) || {} } catch { return {} } }
function saveScores(s) { localStorage.setItem(SCORES_KEY, JSON.stringify(s)) }

const TABS = [
  { id: 'division', label: 'Division posée' },
  { id: 'vocab', label: 'Vocabulaire' },
]

export default function Euclide({ player, onBadgeCheck }) {
  const navigate = useNavigate()
  const { playSuccess, playError, playConfetti } = useSound()
  const { addHistory } = useHistory('6e')
  const [level, setLevel] = useState(null)
  const [tab, setTab] = useState('division')
  const [phase, setPhase] = useState('pick') // pick | play | result
  const [bestScores, setBestScores] = useState(loadScores)

  // Division posée state
  const [division, setDivision] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [revealedSteps, setRevealedSteps] = useState(0)
  const [divScore, setDivScore] = useState(0)
  const [divCount, setDivCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const feedbackTimer = useRef(null)

  useEffect(() => () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current) }, [])

  const startLevel = useCallback((lv, selectedTab) => {
    setLevel(lv)
    setTab(selectedTab || 'division')
    setPhase('play')
    setDivScore(0)
    setDivCount(0)
    setStreak(0)
    setFeedback(null)
    if (!selectedTab || selectedTab === 'division') {
      const d = generateDivision(lv.digits)
      setDivision(d)
      setCurrentStep(0)
      setRevealedSteps(0)
    }
  }, [])

  const finishRound = useCallback((finalScore) => {
    const key = `${level.id}-${tab}`
    const updated = { ...bestScores }
    if (!updated[key] || finalScore > updated[key]) {
      updated[key] = finalScore
      setBestScores(updated)
      saveScores(updated)
    }
    addHistory({ module: 'EU', level: level.id, mode: tab, score: finalScore, total: QUESTIONS_PER_ROUND })
    if (onBadgeCheck) onBadgeCheck(finalScore)
    if (finalScore === QUESTIONS_PER_ROUND) {
      playConfetti()
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    }
    setDivScore(finalScore)
    setPhase('result')
  }, [level, tab, bestScores, addHistory, onBadgeCheck, playConfetti])

  // Handle digit press for division posée
  const handleDigitPress = useCallback((digit) => {
    if (!division || feedback) return
    const step = division.steps[currentStep]
    if (digit === step.quotientDigit) {
      playSuccess()
      setStreak(s => s + 1)
      setFeedback('correct')
      feedbackTimer.current = setTimeout(() => {
        setFeedback(null)
        const nextRevealed = revealedSteps + 1
        setRevealedSteps(nextRevealed)
        if (currentStep + 1 >= division.steps.length) {
          // Division terminée
          const newCount = divCount + 1
          const newScore = divScore + 1
          setDivCount(newCount)
          setDivScore(newScore)
          if (newCount >= QUESTIONS_PER_ROUND) {
            finishRound(newScore)
          } else {
            // Prochaine division après un délai
            feedbackTimer.current = setTimeout(() => {
              const d = generateDivision(level.digits)
              setDivision(d)
              setCurrentStep(0)
              setRevealedSteps(0)
            }, 800)
          }
        } else {
          setCurrentStep(currentStep + 1)
        }
      }, 400)
    } else {
      playError()
      setStreak(0)
      setFeedback('wrong')
      feedbackTimer.current = setTimeout(() => {
        setFeedback(null)
      }, 800)
    }
  }, [division, currentStep, revealedSteps, feedback, divCount, divScore, level, playSuccess, playError, finishRound])

  // --- PHASE: Choix du niveau ---
  if (phase === 'pick') {
    return (
      <PageTransition><div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
        <header className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
          <button onClick={() => navigate('/')} className="text-2xl">←</button>
          <div>
            <h1 className="font-extrabold text-primary-dark dark:text-primary-light text-lg">➗ Euclide</h1>
            <p className="text-xs text-gray-400">Division euclidienne</p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">
          {/* Sélecteur de mode */}
          <div className="flex gap-2 mb-5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                  tab === t.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {LEVELS.map((lv) => {
              const key = `${lv.id}-${tab}`
              const sc = bestScores[key]
              const stars = sc !== undefined ? getStars(sc) : 0
              return (
                <button
                  key={lv.id}
                  onClick={() => startLevel(lv, tab)}
                  className={`animate-slide-up w-full text-left p-4 rounded-2xl shadow-md bg-gradient-to-r ${lv.color} text-white active:scale-[0.97] transition-transform`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono opacity-80">{lv.label}</span>
                      <h3 className="font-bold text-lg leading-tight">{lv.title}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {sc !== undefined && <span className="bg-white/30 px-3 py-0.5 rounded-full text-sm font-bold">{sc}/{QUESTIONS_PER_ROUND}</span>}
                      {stars > 0 && <Stars count={stars} size="text-sm" />}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </main>
      </div></PageTransition>
    )
  }

  // --- PHASE: Résultat ---
  if (phase === 'result') {
    const perfect = divScore === QUESTIONS_PER_ROUND
    const stars = getStars(divScore)
    return (
      <PageTransition><div className="flex flex-col items-center justify-center min-h-screen bg-surface dark:bg-gray-900 px-4">
        <div className="animate-pop-in text-center">
          <div className="text-7xl mb-4">{perfect ? '🏆' : divScore >= 3 ? '⭐' : '💪'}</div>
          <h2 className="text-3xl font-extrabold text-primary-dark dark:text-primary-light mb-2">{divScore} / {QUESTIONS_PER_ROUND}</h2>
          <Stars count={stars} size="text-2xl" />
          <p className="text-gray-500 mb-1 mt-2">{level.title} — {tab === 'division' ? 'Division posée' : 'Vocabulaire'}</p>
          <p className="text-sm text-gray-400 mb-8">{perfect ? 'Parfait !' : divScore >= 3 ? 'Bravo !' : 'Continue !'}</p>
          <div className="flex gap-3">
            <button onClick={() => startLevel(level, tab)} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold active:scale-95 transition-transform">Rejouer</button>
            <button onClick={() => setPhase('pick')} className="flex-1 py-3 rounded-xl bg-white dark:bg-gray-800 text-primary font-bold border-2 border-primary active:scale-95 transition-transform">Niveaux</button>
          </div>
          <button onClick={() => navigate('/')} className="mt-4 text-sm text-gray-500 dark:text-gray-400">← Retour au Hub</button>
        </div>
      </div></PageTransition>
    )
  }

  // --- PHASE: Jeu ---
  // Mode Vocabulaire
  if (tab === 'vocab') {
    return (
      <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
        <header className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
          <button onClick={() => setPhase('pick')} className="text-xl text-gray-500 dark:text-gray-400">←</button>
          <span className="text-sm font-bold text-primary-dark dark:text-primary-light">📖 Vocabulaire — {level.label}</span>
          <span className="text-2xl">{player.avatar?.emoji || '🎲'}</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center">
          <VocabulaireQuiz
            level={level}
            onComplete={finishRound}
            playSuccess={playSuccess}
            playError={playError}
          />
        </div>
      </div>
    )
  }

  // Mode Division posée
  const step = division?.steps[currentStep]
  const feedbackColor = feedback === 'correct'
    ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950'
    : feedback === 'wrong'
      ? 'ring-2 ring-danger bg-red-50 dark:bg-red-950 animate-shake'
      : 'bg-white dark:bg-gray-800'

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
      <header className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
        <button onClick={() => setPhase('pick')} className="text-xl text-gray-500 dark:text-gray-400">←</button>
        <span className="text-sm font-bold text-primary-dark dark:text-primary-light">➗ Division — {level.label}</span>
        <span className="text-2xl">{player.avatar?.emoji || '🎲'}</span>
      </header>
      <div className="px-4 pt-3">
        <ProgressBar current={divCount} total={QUESTIONS_PER_ROUND} streak={streak} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        {/* Division posée */}
        <div className={`w-full max-w-sm rounded-2xl p-6 shadow-lg transition-all duration-200 ${feedbackColor}`}>
          {division && (
            <DivisionLayout
              division={division}
              currentStep={currentStep}
              revealedSteps={revealedSteps}
            />
          )}
        </div>

        {/* Question */}
        {step && (
          <p className="text-center text-lg font-bold text-gray-700 dark:text-gray-200">
            Combien de fois <span className="text-primary font-extrabold">{division.b}</span> dans <span className="text-primary font-extrabold">{step.partial}</span> ?
          </p>
        )}

        {/* Pavé numérique 0-9 */}
        <div className="grid grid-cols-5 gap-2 w-full max-w-[320px] mx-auto">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <button
              key={d}
              onClick={() => handleDigitPress(d)}
              disabled={!!feedback}
              className="h-14 rounded-xl font-bold text-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 active:scale-90 transition-transform disabled:opacity-40 shadow-sm"
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
