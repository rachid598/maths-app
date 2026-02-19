import { useState, useCallback, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, Trophy, RotateCcw, Star, Zap, HelpCircle } from 'lucide-react'
import confetti from 'canvas-confetti'
import {
  generateExpression,
  findSelectableOps,
  computeStep,
  rebuildTokens,
  isComplete,
  getLevels,
} from './engine'
import ExpressionDisplay from './components/ExpressionDisplay'
import StepChain from './components/StepChain'
import HelpModal from './components/HelpModal'
import Keypad from '../frac-strike/components/Keypad'

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              {level.id === 1 && <Star className="w-5 h-5 text-white" />}
              {level.id === 2 && <Zap className="w-5 h-5 text-white" />}
              {level.id === 3 && <Trophy className="w-5 h-5 text-white" />}
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

export default function PrioCalcul({ onBack }) {
  const [levelId, setLevelId] = useState(null)
  const [tokens, setTokens] = useState([])
  const [stepChain, setStepChain] = useState([])
  const [selectedOpId, setSelectedOpId] = useState(null)
  const [keypadValue, setKeypadValue] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [problemIndex, setProblemIndex] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [phase, setPhase] = useState('select') // 'select' | 'compute'
  const [waiting, setWaiting] = useState(false)
  const [solved, setSolved] = useState(false)
  const feedbackTimeout = useRef(null)

  const selectableOps = tokens.length > 0 ? findSelectableOps(tokens) : []

  const startProblem = useCallback(
    (lvl) => {
      const expr = generateExpression(lvl || levelId)
      setTokens(expr.tokens)
      setStepChain([expr.tokens])
      setSelectedOpId(null)
      setKeypadValue('')
      setFeedback(null)
      setPhase('select')
      setWaiting(false)
      setSolved(false)
    },
    [levelId],
  )

  function selectLevel(id) {
    setLevelId(id)
    setScore(0)
    setProblemIndex(0)
    setShowResult(false)
    startProblem(id)
  }

  function handleSelectOp(opId) {
    if (waiting) return
    clearTimeout(feedbackTimeout.current)

    if (phase === 'select') {
      // Phase 1: check if the operator is a valid priority choice
      if (selectableOps.includes(opId)) {
        setSelectedOpId(opId)
        setPhase('compute')
        setFeedback(null)
        setKeypadValue('')
      } else {
        setFeedback({ type: 'error', message: 'Ce n\'est pas la priorité !' })
        feedbackTimeout.current = setTimeout(() => setFeedback(null), 2000)
      }
    } else if (phase === 'compute') {
      // Allow re-selection during compute phase
      if (selectableOps.includes(opId)) {
        setSelectedOpId(opId)
        setKeypadValue('')
        setFeedback(null)
      } else {
        setFeedback({ type: 'error', message: 'Ce n\'est pas la priorité !' })
        feedbackTimeout.current = setTimeout(() => setFeedback(null), 2000)
      }
    }
  }

  function handleSubmit(value) {
    if (waiting || phase !== 'compute' || !selectedOpId) return
    clearTimeout(feedbackTimeout.current)

    const expected = computeStep(tokens, selectedOpId)
    if (expected === null) return

    if (value !== expected) {
      setFeedback({ type: 'error', message: `${value} n'est pas correct. Essaie encore !` })
      feedbackTimeout.current = setTimeout(() => setFeedback(null), 2000)
      setKeypadValue('')
      return
    }

    // Correct! Rebuild tokens
    setWaiting(true)
    const newTokens = rebuildTokens(tokens, selectedOpId, expected)

    setStepChain((prev) => [...prev, newTokens])
    setTokens(newTokens)
    setSelectedOpId(null)
    setKeypadValue('')

    if (isComplete(newTokens)) {
      // Problem solved! Let student review before advancing
      setFeedback({ type: 'success', message: 'Bravo !' })
      setScore((s) => s + 1)
      setSolved(true)

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b'],
      })
    } else {
      setFeedback({ type: 'info', message: 'Étape suivante !' })
      feedbackTimeout.current = setTimeout(() => setFeedback(null), 1500)
      setPhase('select')
      setWaiting(false)
    }
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

  // Cleanup timeouts
  useEffect(() => {
    return () => clearTimeout(feedbackTimeout.current)
  }, [])

  // Confetti on perfect score
  const perfect = showResult && score === PROBLEMS_PER_LEVEL
  useEffect(() => {
    if (perfect) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
      })
    }
  }, [perfect])

  // Result screen
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
          <p className="text-slate-300 mb-6">expressions résolues</p>

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
  if (!levelId) {
    return (
      <div className="min-h-screen p-4">
        <header className="flex items-center gap-3 mb-6 pt-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-surface hover:bg-surface-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Prio-Calcul</h2>
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
            <h2 className="text-lg font-bold">Prio-Calcul</h2>
            <p className="text-xs text-slate-300">
              {getLevels().find((l) => l.id === levelId)?.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-xl bg-surface hover:bg-surface-light transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-slate-300" />
          </button>
          <div className="text-right">
            <p className="text-sm text-slate-300">
              {problemIndex + 1}/{PROBLEMS_PER_LEVEL}
            </p>
            <p className="text-lg font-bold text-accent">
              {score} <Star className="w-4 h-4 inline text-accent" />
            </p>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1.5 bg-surface rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
          style={{
            width: `${((problemIndex + (isComplete(tokens) ? 1 : 0)) / PROBLEMS_PER_LEVEL) * 100}%`,
          }}
        />
      </div>

      {/* Step chain (history) */}
      <StepChain steps={stepChain} />

      {/* Current expression to solve */}
      {!isComplete(tokens) && (
        <div className="my-4 py-4 bg-surface rounded-2xl">
          <p className="text-xs text-slate-400 text-center mb-2">
            {phase === 'select' ? 'Sélectionne l\'opération prioritaire' : 'Calcule le résultat'}
          </p>
          <ExpressionDisplay
            tokens={tokens}
            selectedOpId={selectedOpId}
            onSelectOp={handleSelectOp}
            disabled={waiting}
          />
        </div>
      )}

      {/* Feedback */}
      <div className="h-10 flex items-center justify-center my-2">
        {feedback && (
          <p
            className={`text-sm font-semibold px-4 py-1.5 rounded-full ${
              feedback.type === 'error'
                ? 'bg-red-900/30 text-danger'
                : feedback.type === 'success'
                  ? 'bg-emerald-900/30 text-success'
                  : 'bg-cyan-900/30 text-cyan-300'
            }`}
          >
            {feedback.message}
          </p>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* "Suivant" button when expression is solved */}
      {solved && (
        <button
          onClick={handleNext}
          className="mx-auto mb-4 px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 active:scale-[0.97] transition-all text-white flex items-center gap-2"
        >
          Suivant
          <ArrowRight className="w-5 h-5" />
        </button>
      )}

      {/* Keypad (only in compute phase, when not complete) */}
      {phase === 'compute' && !isComplete(tokens) && (
        <div className="w-full max-w-xs mx-auto">
          {/* Display */}
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="text-sm text-slate-300">Résultat :</span>
            <div className="bg-surface-light rounded-xl px-6 py-2 min-w-[80px] text-center text-2xl font-bold tabular-nums">
              {keypadValue || <span className="text-slate-400">?</span>}
            </div>
          </div>

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  if (waiting) return
                  const next = keypadValue + String(n)
                  if (next.length <= 4) setKeypadValue(next)
                }}
                disabled={waiting}
                className="py-3 rounded-xl bg-surface-light text-lg font-semibold active:bg-primary/30 transition-colors disabled:opacity-40"
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => !waiting && setKeypadValue('')}
              disabled={waiting}
              className="py-3 rounded-xl bg-surface text-sm font-medium text-slate-300 active:bg-red-900/30 transition-colors disabled:opacity-40"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => {
                if (waiting) return
                const next = keypadValue + '0'
                if (next.length <= 4) setKeypadValue(next)
              }}
              disabled={waiting}
              className="py-3 rounded-xl bg-surface-light text-lg font-semibold active:bg-primary/30 transition-colors disabled:opacity-40"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => !waiting && setKeypadValue(keypadValue.slice(0, -1))}
              disabled={waiting}
              className="py-3 rounded-xl bg-surface text-slate-300 flex items-center justify-center active:bg-red-900/30 transition-colors disabled:opacity-40"
            >
              ⌫
            </button>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={() => {
              if (keypadValue.length > 0) {
                handleSubmit(parseInt(keypadValue, 10))
              }
            }}
            disabled={waiting || keypadValue.length === 0}
            className="mt-3 w-full py-3 rounded-xl font-bold text-lg bg-primary hover:bg-primary-dark active:bg-primary-dark transition-colors text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Valider
          </button>
        </div>
      )}

      {/* Bottom padding */}
      <div className="h-4" />

      {/* Help modal */}
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  )
}
