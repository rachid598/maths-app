import { useState, useCallback, useRef } from 'react'
import {
  ArrowLeft, Star, RotateCcw, Trophy, ChevronRight,
  Smile, Brain, Flame, PenLine, Lightbulb,
} from 'lucide-react'
import { LEVELS, buildPool, createDeck, drawFromDeck, gcd, smallestPrimeFactor } from './engine'
import Fraction from './components/Fraction'
import Chain from './components/Chain'
import Keypad from './components/Keypad'
import CompletionInput from './components/CompletionInput'
import { fireSuccess, fireBigWin } from '../../utils/confetti'

const QUESTIONS_PER_ROUND = 5
const LEVEL_ICONS = { 1: Smile, 2: Brain, 3: Flame, 4: PenLine }

export default function FracStrike({ onBack }) {
  const [level, setLevel] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [fraction, setFraction] = useState(null)
  const [chain, setChain] = useState([])
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [struck, setStruck] = useState(false)
  const [hint, setHint] = useState(null)

  const deckRef = useRef(null)
  const poolRef = useRef(null)

  // ─── Start level ──────────────────────────────────────

  const loadFraction = useCallback((lvl) => {
    const f = drawFromDeck(deckRef.current, lvl)
    setFraction(f)
    setChain([{ num: f.num, den: f.den }])
    setInput('')
    setFeedback(null)
    setStruck(false)
    setHint(null)
  }, [])

  const startLevel = useCallback((lvl) => {
    poolRef.current = buildPool(lvl)
    deckRef.current = createDeck(poolRef.current)
    setLevel(lvl)
    setQIndex(0)
    setScore(0)
    setShowResult(false)
    loadFraction(lvl)
  }, [loadFraction])

  // ─── Normal mode: validate divisor input ──────────────

  const handleValidate = useCallback(() => {
    if (!fraction || struck) return
    const divisor = parseInt(input, 10)
    if (isNaN(divisor) || divisor <= 1) {
      setFeedback({ correct: false, message: 'Entre un diviseur commun > 1' })
      return
    }

    if (fraction.num % divisor !== 0 || fraction.den % divisor !== 0) {
      setFeedback({ correct: false, message: `${divisor} ne divise pas les deux` })
      return
    }

    // Valid divisor — simplify
    const simpNum = fraction.num / divisor
    const simpDen = fraction.den / divisor
    const remaining = gcd(simpNum, simpDen)

    // Append struck + simplified steps to chain
    setChain((prev) => [
      ...prev,
      { num: fraction.num, den: fraction.den, factor: divisor, struck: true },
      { num: simpNum, den: simpDen },
    ])

    fireSuccess()

    if (remaining === 1) {
      // Fully irreducible — question done
      setScore((s) => s + 1)
      setStruck(true)
      setFeedback({ correct: true, message: 'Fraction irréductible !' })
    } else {
      // Partial simplification — continue with simplified fraction
      setFraction({ num: simpNum, den: simpDen })
      setInput('')
      setHint(null)
      setFeedback(null)
    }
  }, [fraction, struck, input])

  // ─── Expert mode: auto-validate from CompletionInput ──

  const handleExpertCorrect = useCallback((divisor) => {
    if (!fraction || struck) return

    const simpNum = fraction.num / divisor
    const simpDen = fraction.den / divisor
    const remaining = gcd(simpNum, simpDen)

    // Append struck + simplified steps to chain
    setChain((prev) => [
      ...prev,
      { num: fraction.num, den: fraction.den, factor: divisor, struck: true },
      { num: simpNum, den: simpDen },
    ])

    fireSuccess()

    if (remaining === 1) {
      // Fully irreducible — question done
      setScore((s) => s + 1)
      setStruck(true)
      setFeedback({ correct: true, message: 'Fraction irréductible !' })
    } else {
      // Partial simplification — continue with simplified fraction
      setFraction({ num: simpNum, den: simpDen })
      setHint(null)
      setFeedback(null)
    }
  }, [fraction, struck])

  // ─── Next question ────────────────────────────────────

  const handleNext = useCallback(() => {
    const next = qIndex + 1
    if (next >= QUESTIONS_PER_ROUND) {
      if (score >= 3) fireBigWin()
      setShowResult(true)
      return
    }
    setQIndex(next)
    loadFraction(level)
  }, [qIndex, score, level, loadFraction])

  // ─── Hint ─────────────────────────────────────────────

  const showHint = useCallback(() => {
    if (!fraction) return
    const g = gcd(fraction.num, fraction.den)
    const spf = smallestPrimeFactor(g)
    setHint(`Indice : essaie de diviser par ${spf}`)
  }, [fraction])

  // ─── Keypad handlers ─────────────────────────────────

  const handleKeyInput = useCallback((digit) => {
    if (input.length >= 4) return
    setInput((prev) => prev + digit)
    setFeedback(null)
  }, [input])

  const handleKeyClear = useCallback(() => {
    setInput('')
    setFeedback(null)
  }, [])

  const handleKeyDelete = useCallback(() => {
    setInput((prev) => prev.slice(0, -1))
    setFeedback(null)
  }, [])

  // ─── Level selection ──────────────────────────────────

  if (level === null) {
    return (
      <div className="min-h-dvh px-4 pb-8 pt-6">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
        <h2 className="mb-2 text-center text-2xl font-bold">
          Frac-<span className="text-accent">Strike</span>
        </h2>
        <p className="mb-8 text-center text-sm text-slate-400">
          Simplifie les fractions en trouvant le diviseur commun
        </p>
        <div className="mx-auto flex max-w-sm flex-col gap-3">
          {Object.entries(LEVELS).map(([lvl, info]) => {
            const Icon = LEVEL_ICONS[lvl]
            return (
              <button
                key={lvl}
                onClick={() => startLevel(Number(lvl))}
                className="flex items-center justify-between rounded-2xl border border-slate-700 bg-surface p-4 transition hover:border-accent"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${info.color}`} />
                  <div className="text-left">
                    <h3 className={`font-bold ${info.color}`}>{info.name}</h3>
                    <p className="text-sm text-slate-400">{info.desc}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500" />
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── Result screen ────────────────────────────────────

  if (showResult) {
    const pct = Math.round((score / QUESTIONS_PER_ROUND) * 100)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-4">
        <Trophy className={`mb-4 h-16 w-16 ${pct >= 60 ? 'text-accent' : 'text-slate-500'}`} />
        <h2 className="mb-2 text-2xl font-bold">Résultat</h2>
        <p className="mb-1 text-4xl font-bold text-accent">
          {score}/{QUESTIONS_PER_ROUND}
        </p>
        <p className="mb-6 text-slate-400">
          {pct >= 80
            ? 'Excellent ! Tu maîtrises la simplification !'
            : pct >= 60
              ? 'Bien joué ! Continue comme ça !'
              : 'Continue à t\'entraîner, tu vas progresser !'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => startLevel(level)}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-black transition hover:bg-accent-light"
          >
            <RotateCcw className="h-4 w-4" /> Rejouer
          </button>
          <button
            onClick={() => setLevel(null)}
            className="rounded-xl border border-slate-600 px-5 py-3 font-bold transition hover:border-accent"
          >
            Niveaux
          </button>
        </div>
      </div>
    )
  }

  // ─── Game screen ──────────────────────────────────────

  const isExpert = level === 4
  const cfg = LEVELS[level]

  return (
    <div className="min-h-dvh px-4 pb-6 pt-4">
      {/* Top bar */}
      <div className="mx-auto mb-4 flex max-w-lg items-center justify-between">
        <button
          onClick={() => setLevel(null)}
          className="flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Niveaux
        </button>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${cfg.color}`}>{cfg.name}</span>
          <span className="text-sm text-slate-400">
            {qIndex + 1}/{QUESTIONS_PER_ROUND}
          </span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-accent" />
            <span className="text-sm font-bold text-accent">{score}</span>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="mx-auto mb-4 flex max-w-lg justify-center gap-1.5">
        {Array.from({ length: QUESTIONS_PER_ROUND }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition ${
              i < qIndex ? 'bg-emerald-400' : i === qIndex ? 'bg-accent' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {fraction && (
        <div className="mx-auto max-w-lg">
          {/* Current fraction */}
          <div className="mb-4 flex items-center justify-center rounded-2xl bg-surface p-6">
            {!struck ? (
              <div className="text-center">
                <p className="mb-2 text-sm text-slate-400">Simplifie cette fraction</p>
                <Fraction num={fraction.num} den={fraction.den} />
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-2 text-sm text-emerald-400">Irréductible !</p>
                <Fraction num={fraction.num} den={fraction.den} highlight />
              </div>
            )}
          </div>

          {/* Chain */}
          <div className="mb-4">
            <Chain steps={chain} />
          </div>

          {/* Input area */}
          {!struck && (
            <>
              {isExpert ? (
                <div className="mb-4">
                  <CompletionInput
                    num={fraction.num}
                    den={fraction.den}
                    onCorrect={handleExpertCorrect}
                    disabled={!!feedback?.correct}
                  />
                </div>
              ) : (
                <>
                  {/* Divisor input display */}
                  <div className="mb-3 text-center">
                    <p className="mb-1 text-sm text-slate-400">Diviseur commun :</p>
                    <div className="mx-auto flex h-12 w-32 items-center justify-center rounded-xl border-2 border-accent/50 bg-surface text-2xl font-bold text-accent">
                      {input || '_'}
                    </div>
                  </div>

                  {/* Keypad */}
                  <div className="mb-4">
                    <Keypad
                      onInput={handleKeyInput}
                      onClear={handleKeyClear}
                      onDelete={handleKeyDelete}
                      onValidate={handleValidate}
                      disabled={!!feedback?.correct}
                    />
                  </div>
                </>
              )}

              {/* Hint button */}
              {!hint && !feedback?.correct && (
                <div className="mb-3 text-center">
                  <button
                    onClick={showHint}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-slate-500 transition hover:bg-surface-light hover:text-slate-300"
                  >
                    <Lightbulb className="h-3.5 w-3.5" /> Besoin d'aide ?
                  </button>
                </div>
              )}
              {hint && (
                <p className="mb-3 text-center text-sm text-amber-400">{hint}</p>
              )}
            </>
          )}

          {/* Feedback */}
          {feedback && (
            <div
              className={`mb-4 rounded-xl p-3 text-center font-medium ${
                feedback.correct
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Next button (after strike) */}
          {struck && (
            <div className="mx-auto max-w-xs">
              <button
                onClick={handleNext}
                className="w-full rounded-xl bg-primary-light py-3 font-bold text-white transition hover:bg-primary active:scale-95"
              >
                {qIndex + 1 >= QUESTIONS_PER_ROUND ? 'Voir le résultat' : 'Suivante'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
