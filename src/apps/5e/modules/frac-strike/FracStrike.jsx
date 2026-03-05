import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Trophy, RotateCcw, Star, Zap, PenLine } from 'lucide-react'
import confetti from 'canvas-confetti'
import {
  generateFraction,
  resetDeck,
  isValidDivisor,
  simplify,
  isFullySimplified,
  getLevels,
  gcd,
} from './engine'
import Chain from './components/Chain'
import Keypad from './components/Keypad'
import CompletionInput from './components/CompletionInput'

const PROBLEMS_PER_LEVEL = 5

function LevelSelector({ onSelect }) {
  const levels = getLevels()
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-center mb-4">Choisis ton niveau</h3>
      {levels.map((level) => (
        <button
          key={level.id}
          onClick={() => onSelect(level.id)}
          className="w-full p-4 rounded-2xl bg-surface hover:bg-surface-light transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              {level.id === 1 && <Star className="w-5 h-5 text-white" />}
              {level.id === 2 && <Zap className="w-5 h-5 text-white" />}
              {level.id === 3 && <Trophy className="w-5 h-5 text-white" />}
              {level.id === 4 && <PenLine className="w-5 h-5 text-white" />}
            </div>
            <div>
              <p className="font-semibold">{level.name}</p>
              <p className="text-sm text-slate-300">{level.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

export default function FracStrike() {
  const navigate = useNavigate()
  const onBack = () => navigate('/5e')
  const [levelId, setLevelId] = useState(null)
  const [problem, setProblem] = useState(null)
  const [currentNum, setCurrentNum] = useState(0)
  const [currentDen, setCurrentDen] = useState(0)
  const [chain, setChain] = useState([])
  const [keypadValue, setKeypadValue] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [problemIndex, setProblemIndex] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [solved, setSolved] = useState(false)
  const feedbackTimeout = useRef(null)

  const startProblem = useCallback(
    (lvl) => {
      const p = generateFraction(lvl || levelId)
      setProblem(p)
      setCurrentNum(p.numerator)
      setCurrentDen(p.denominator)
      setChain([
        { type: 'original', numerator: p.numerator, denominator: p.denominator },
      ])
      setKeypadValue('')
      setFeedback(null)
      setAnimating(false)
      setSolved(false)
    },
    [levelId],
  )

  function selectLevel(id) {
    resetDeck(id)
    setLevelId(id)
    setScore(0)
    setProblemIndex(0)
    setShowResult(false)
    startProblem(id)
  }

  function handleSubmit(divisor) {
    if (animating) return
    clearTimeout(feedbackTimeout.current)

    if (!isValidDivisor(currentNum, currentDen, divisor)) {
      setFeedback({ type: 'error', message: `${divisor} ne divise pas les deux !` })
      feedbackTimeout.current = setTimeout(() => setFeedback(null), 2000)
      setKeypadValue('')
      return
    }

    // Valid divisor — animate the decomposition then simplification
    setAnimating(true)
    const factorNum = currentNum / divisor
    const factorDen = currentDen / divisor

    // Step 1: Show decomposition (not struck yet)
    setChain((prev) => [
      ...prev,
      {
        type: 'decomposed',
        factorNum,
        factorDen,
        divisor,
        struck: false,
      },
    ])

    // Step 2: Strike animation after a short delay
    setTimeout(() => {
      setChain((prev) => {
        const updated = [...prev]
        const last = { ...updated[updated.length - 1] }
        last.struck = true
        updated[updated.length - 1] = last
        return updated
      })
    }, 400)

    // Step 3: Show simplified result
    setTimeout(() => {
      const { numerator: newNum, denominator: newDen } = simplify(
        currentNum,
        currentDen,
        divisor,
      )
      const fullyDone = isFullySimplified(newNum, newDen)

      setChain((prev) => [
        ...prev,
        {
          type: 'simplified',
          numerator: newNum,
          denominator: newDen,
          final: fullyDone,
        },
      ])

      setCurrentNum(newNum)
      setCurrentDen(newDen)
      setKeypadValue('')

      if (fullyDone) {
        setFeedback({ type: 'success', message: 'Fraction irréductible !' })
        setScore((s) => s + 1)
        setSolved(true)

        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6366f1', '#f59e0b', '#10b981', '#ef4444'],
        })
      } else {
        setFeedback({ type: 'info', message: 'Continue à simplifier !' })
        feedbackTimeout.current = setTimeout(() => setFeedback(null), 1500)
      }

      setAnimating(false)
    }, 900)
  }

  function handleHint() {
    const d = gcd(currentNum, currentDen)
    if (d > 1) {
      // Find the smallest prime factor of d
      for (let i = 2; i <= d; i++) {
        if (d % i === 0 && currentNum % i === 0 && currentDen % i === 0) {
          setFeedback({ type: 'hint', message: `Essaie de diviser par ${i}` })
          feedbackTimeout.current = setTimeout(() => setFeedback(null), 3000)
          return
        }
      }
    }
  }

  // Expert mode: student completed the decomposition themselves
  function handleExpertCorrect(numResult, divisor, denResult) {
    if (animating) return
    clearTimeout(feedbackTimeout.current)

    setAnimating(true)

    // Step 1: Show decomposition (not struck yet)
    setChain((prev) => [
      ...prev,
      {
        type: 'decomposed',
        factorNum: numResult,
        factorDen: denResult,
        divisor,
        struck: false,
      },
    ])

    // Step 2: Auto-strike after delay
    setTimeout(() => {
      setChain((prev) => {
        const updated = [...prev]
        const last = { ...updated[updated.length - 1] }
        last.struck = true
        updated[updated.length - 1] = last
        return updated
      })
    }, 400)

    // Step 3: Show simplified result
    setTimeout(() => {
      const newNum = numResult
      const newDen = denResult
      const fullyDone = isFullySimplified(newNum, newDen)

      setChain((prev) => [
        ...prev,
        {
          type: 'simplified',
          numerator: newNum,
          denominator: newDen,
          final: fullyDone,
        },
      ])

      setCurrentNum(newNum)
      setCurrentDen(newDen)
      setKeypadValue('')

      if (fullyDone) {
        setFeedback({ type: 'success', message: 'Fraction irréductible !' })
        setScore((s) => s + 1)
        setSolved(true)

        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6366f1', '#f59e0b', '#10b981', '#ef4444'],
        })
      } else {
        setFeedback({ type: 'info', message: 'Continue à simplifier !' })
        feedbackTimeout.current = setTimeout(() => setFeedback(null), 1500)
      }

      setAnimating(false)
    }, 900)
  }

  function handleNext() {
    const nextIndex = problemIndex + 1
    if (nextIndex >= PROBLEMS_PER_LEVEL) {
      setShowResult(true)
    } else {
      setProblemIndex(nextIndex)
      startProblem(levelId)
    }
  }

  const isExpert = getLevels().find((l) => l.id === levelId)?.expert

  // Cleanup timeouts
  useEffect(() => {
    return () => clearTimeout(feedbackTimeout.current)
  }, [])

  // Confetti on perfect score — must be in useEffect, not render body
  const perfect = showResult && score === PROBLEMS_PER_LEVEL
  useEffect(() => {
    if (perfect) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#ec4899'],
      })
    }
  }, [perfect])

  // End-of-level result screen
  if (showResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-surface rounded-2xl p-8 max-w-sm w-full text-center">
          <Trophy
            className={`w-16 h-16 mx-auto mb-4 ${perfect ? 'text-accent' : 'text-primary-light'}`}
          />
          <h2 className="text-2xl font-bold mb-2">
            {perfect ? 'Parfait !' : 'Bien joué !'}
          </h2>
          <p className="text-4xl font-bold mb-1">
            {score}/{PROBLEMS_PER_LEVEL}
          </p>
          <p className="text-slate-300 mb-6">fractions simplifiées</p>

          <div className="space-y-3">
            <button
              onClick={() => selectLevel(levelId)}
              className="w-full py-3 rounded-xl font-bold bg-primary hover:bg-primary-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Rejouer ce niveau
            </button>
            <button
              onClick={() => setLevelId(null)}
              className="w-full py-3 rounded-xl font-bold bg-surface-light hover:bg-surface-light/80 transition-colors"
            >
              Changer de niveau
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 rounded-xl font-bold text-slate-300 hover:text-white transition-colors"
            >
              Retour au menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Level selection
  if (!levelId || !problem) {
    return (
      <div className="min-h-screen p-4">
        <header className="flex items-center gap-3 mb-6 pt-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-surface hover:bg-surface-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Frac-Strike</h2>
        </header>
        <LevelSelector onSelect={selectLevel} />
      </div>
    )
  }

  // Main game UI
  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-4 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-surface hover:bg-surface-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold">Frac-Strike</h2>
            <p className="text-xs text-slate-300">
              {getLevels().find((l) => l.id === levelId)?.description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-300">
            {problemIndex + 1}/{PROBLEMS_PER_LEVEL}
          </p>
          <p className="text-lg font-bold text-accent">
            {score} <Star className="w-4 h-4 inline text-accent" />
          </p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1.5 bg-surface rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
          style={{
            width: `${((problemIndex + (isFullySimplified(currentNum, currentDen) ? 1 : 0.5)) / PROBLEMS_PER_LEVEL) * 100}%`,
          }}
        />
      </div>

      {/* Chain of equalities */}
      <Chain steps={chain} />

      {/* Feedback */}
      <div className="h-10 flex items-center justify-center my-2">
        {feedback && (
          <p
            className={`text-sm font-semibold px-4 py-1.5 rounded-full ${
              feedback.type === 'error'
                ? 'bg-red-900/30 text-danger'
                : feedback.type === 'success'
                  ? 'bg-emerald-900/30 text-success'
                  : feedback.type === 'hint'
                    ? 'bg-amber-900/30 text-accent-light'
                    : 'bg-indigo-900/30 text-primary-light'
            }`}
          >
            {feedback.message}
          </p>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* "Suivant" button when fraction is fully simplified */}
      {solved && (
        <button
          onClick={handleNext}
          className="mx-auto mb-4 px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.97] transition-all text-white flex items-center gap-2"
        >
          Suivant
          <ArrowRight className="w-5 h-5" />
        </button>
      )}

      {/* Hint button (not in expert mode) */}
      {!isFullySimplified(currentNum, currentDen) && !isExpert && (
        <button
          onClick={handleHint}
          className="mb-3 mx-auto text-sm text-slate-400 hover:text-slate-300 transition-colors"
        >
          Besoin d'un indice ?
        </button>
      )}

      {/* Input: Keypad (normal) or CompletionInput (expert) */}
      {!isFullySimplified(currentNum, currentDen) && (
        isExpert ? (
          <CompletionInput
            numerator={currentNum}
            denominator={currentDen}
            onCorrect={handleExpertCorrect}
            disabled={animating}
          />
        ) : (
          <Keypad
            value={keypadValue}
            onChange={setKeypadValue}
            onSubmit={handleSubmit}
            disabled={animating}
          />
        )
      )}

      {/* Bottom padding for mobile */}
      <div className="h-4" />
    </div>
  )
}
