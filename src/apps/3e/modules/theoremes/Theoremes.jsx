import { useState, useCallback } from 'react'
import { ArrowLeft, Star, RotateCcw, Trophy, ChevronRight, Delete } from 'lucide-react'
import { generateQuestion, LEVEL_LABELS } from './engine'
import TriangleFigure from './components/TriangleFigure'
import ThalesFigure from './components/ThalesFigure'
import { fireSuccess, fireBigWin } from '../../utils/confetti'

const QUESTIONS_PER_ROUND = 5

export default function Theoremes({ onBack }) {
  const [level, setLevel] = useState(null)
  const [question, setQuestion] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [userInput, setUserInput] = useState('')

  const loadQuestion = useCallback((lvl) => {
    const q = generateQuestion(lvl)
    setQuestion(q)
    setFeedback(null)
    setShowHint(false)
    setUserInput('')
  }, [])

  const startLevel = useCallback(
    (lvl) => {
      setLevel(lvl)
      setScore(0)
      setQuestionIndex(0)
      setShowResult(false)
      loadQuestion(lvl)
    },
    [loadQuestion]
  )

  const handleValidate = useCallback(() => {
    if (!question || feedback) return

    const isReciproque = question.type.startsWith('reciproque')
    let isCorrect

    if (isReciproque) {
      isCorrect = userInput.toLowerCase() === question.answer
    } else {
      const parsed = parseFloat(userInput.replace(',', '.'))
      isCorrect = !isNaN(parsed) && Math.abs(parsed - question.answer) < 0.01
    }

    if (isCorrect) {
      fireSuccess()
      setScore((s) => s + 1)
      setFeedback({ correct: true, message: 'Bravo ! Bonne réponse !' })
    } else {
      const expected = isReciproque
        ? question.answer === 'oui'
          ? 'Oui'
          : 'Non'
        : `${question.answer} ${question.unit}`
      setFeedback({
        correct: false,
        message: `La réponse était : ${expected}`,
      })
    }
    setShowHint(true)
  }, [question, feedback, userInput])

  const handleNext = useCallback(() => {
    const nextIndex = questionIndex + 1
    if (nextIndex >= QUESTIONS_PER_ROUND) {
      if (score >= 3) fireBigWin()
      setShowResult(true)
      return
    }
    setQuestionIndex(nextIndex)
    loadQuestion(level)
  }, [questionIndex, level, score, loadQuestion])

  // Numeric keypad input
  const handleKeyInput = useCallback(
    (value) => {
      if (feedback) return
      if (value === 'backspace') {
        setUserInput((v) => v.slice(0, -1))
      } else if (value === ',') {
        if (!userInput.includes(',')) setUserInput((v) => v + ',')
      } else {
        setUserInput((v) => (v.length < 8 ? v + value : v))
      }
    },
    [feedback, userInput]
  )

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
          <span className="text-purple-400">Théorèmes</span>
        </h2>
        <p className="mb-8 text-center text-sm text-slate-400">
          Pythagore, Thalès et leurs réciproques
        </p>
        <div className="mx-auto flex max-w-sm flex-col gap-3">
          {Object.entries(LEVEL_LABELS).map(([lvl, info]) => (
            <button
              key={lvl}
              onClick={() => startLevel(Number(lvl))}
              className="flex items-center justify-between rounded-2xl border border-slate-700 bg-surface p-4 transition hover:border-purple-400"
            >
              <div className="text-left">
                <h3 className={`font-bold ${info.color}`}>{info.name}</h3>
                <p className="text-sm text-slate-400">{info.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Result screen ────────────────────────────────────
  if (showResult) {
    const pct = Math.round((score / QUESTIONS_PER_ROUND) * 100)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-4">
        <Trophy className={`mb-4 h-16 w-16 ${pct >= 60 ? 'text-purple-400' : 'text-slate-500'}`} />
        <h2 className="mb-2 text-2xl font-bold">Résultat</h2>
        <p className="mb-1 text-4xl font-bold text-purple-400">
          {score}/{QUESTIONS_PER_ROUND}
        </p>
        <p className="mb-6 text-slate-400">
          {pct >= 80
            ? 'Excellent ! Tu maîtrises les théorèmes !'
            : pct >= 60
              ? 'Bien joué ! Continue comme ça !'
              : "Continue à t'entraîner, tu vas progresser !"}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => startLevel(level)}
            className="flex items-center gap-2 rounded-xl bg-purple-500 px-5 py-3 font-bold text-white transition hover:bg-purple-400"
          >
            <RotateCcw className="h-4 w-4" /> Rejouer
          </button>
          <button
            onClick={() => setLevel(null)}
            className="rounded-xl border border-slate-600 px-5 py-3 font-bold transition hover:border-purple-400"
          >
            Niveaux
          </button>
        </div>
      </div>
    )
  }

  // ─── Game screen ──────────────────────────────────────
  const isReciproque = question?.type?.startsWith('reciproque')

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
          <span className={`text-sm font-medium ${LEVEL_LABELS[level].color}`}>
            {LEVEL_LABELS[level].name}
          </span>
          <span className="text-sm text-slate-400">
            {questionIndex + 1}/{QUESTIONS_PER_ROUND}
          </span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-bold text-purple-400">{score}</span>
          </div>
        </div>
      </div>

      {question && (
        <div className="mx-auto max-w-lg">
          {/* Question prompt */}
          <div className="mb-4 rounded-2xl bg-surface p-4 text-center">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
              {question.prompt}
            </p>
          </div>

          {/* Figure */}
          <div className="mb-4">
            {question.type === 'pythagore' && (
              <TriangleFigure
                sides={question.sides}
                rightAngle={question.triangle.rightAngle}
              />
            )}
            {question.type === 'thales' && (
              <ThalesFigure config={question.config} />
            )}
            {question.type === 'reciproque-pythagore' && (
              <TriangleFigure
                sides={{
                  AB: question.sides.find((s) => s.label === 'AB')?.value ?? '',
                  AC: question.sides.find((s) => s.label === 'AC')?.value ?? '',
                  BC: question.sides.find((s) => s.label === 'BC')?.value ?? '',
                }}
                rightAngle="?"
              />
            )}
            {question.type === 'reciproque-thales' && (
              <ThalesFigure config={question.config} />
            )}
          </div>

          {/* Input area */}
          {isReciproque ? (
            <ReciproqueButtons
              selected={userInput}
              onSelect={setUserInput}
              disabled={!!feedback}
              questionType={question.type}
            />
          ) : (
            <NumericInput
              value={userInput}
              unit={question.unit}
              onInput={handleKeyInput}
              disabled={!!feedback}
            />
          )}

          {/* Hint (shown after validation) */}
          {showHint && question.hint && (
            <div className="mt-4 rounded-xl bg-indigo-500/10 p-3 text-center text-sm text-indigo-300">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-indigo-400">
                Méthode
              </p>
              <p className="whitespace-pre-line">{question.hint}</p>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div
              className={`mt-4 rounded-xl p-3 text-center font-medium ${
                feedback.correct
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Actions */}
          <div className="mx-auto mt-4 max-w-xs">
            {!feedback ? (
              <button
                onClick={handleValidate}
                disabled={!userInput}
                className="w-full rounded-xl bg-purple-500 py-3 font-bold text-white transition hover:bg-purple-400 active:scale-95 disabled:opacity-40"
              >
                Valider
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full rounded-xl bg-primary-light py-3 font-bold text-white transition hover:bg-primary active:scale-95"
              >
                {questionIndex + 1 >= QUESTIONS_PER_ROUND
                  ? 'Voir le résultat'
                  : 'Question suivante'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────

function ReciproqueButtons({ selected, onSelect, disabled, questionType }) {
  const isPythagore = questionType === 'reciproque-pythagore'
  return (
    <div className="mx-auto flex max-w-xs gap-3">
      <button
        onClick={() => !disabled && onSelect('oui')}
        className={`flex-1 rounded-xl py-3 text-center font-bold transition active:scale-95 ${
          selected === 'oui'
            ? 'bg-emerald-500 text-white'
            : 'bg-surface-light text-slate-300 hover:bg-slate-600'
        } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        {isPythagore ? 'Oui, rectangle' : 'Oui, parallèles'}
      </button>
      <button
        onClick={() => !disabled && onSelect('non')}
        className={`flex-1 rounded-xl py-3 text-center font-bold transition active:scale-95 ${
          selected === 'non'
            ? 'bg-red-500 text-white'
            : 'bg-surface-light text-slate-300 hover:bg-slate-600'
        } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        {isPythagore ? 'Non' : 'Non'}
      </button>
    </div>
  )
}

function NumericInput({ value, unit, onInput, disabled }) {
  return (
    <div>
      {/* Display */}
      <div className="mx-auto mb-3 flex max-w-xs items-center justify-center gap-2 rounded-xl bg-surface p-3">
        <span className="min-w-[4rem] text-right text-2xl font-bold text-white">
          {value || <span className="text-slate-500">…</span>}
        </span>
        <span className="text-lg text-slate-400">{unit}</span>
      </div>

      {/* Keypad */}
      <div className="mx-auto grid w-full max-w-xs grid-cols-4 gap-2">
        {['7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => onInput(d)}
            disabled={disabled}
            className="flex h-12 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition hover:bg-slate-600 active:scale-95 disabled:opacity-30"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => onInput('backspace')}
          disabled={disabled}
          className="flex h-12 items-center justify-center rounded-xl bg-surface-light text-slate-400 transition hover:bg-slate-600 hover:text-white active:scale-95 disabled:opacity-30"
        >
          <Delete className="h-5 w-5" />
        </button>

        {['4', '5', '6', ','].map((d) => (
          <button
            key={d}
            onClick={() => onInput(d)}
            disabled={disabled}
            className="flex h-12 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition hover:bg-slate-600 active:scale-95 disabled:opacity-30"
          >
            {d}
          </button>
        ))}

        {['1', '2', '3', '0'].map((d) => (
          <button
            key={d}
            onClick={() => onInput(d)}
            disabled={disabled}
            className="flex h-12 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition hover:bg-slate-600 active:scale-95 disabled:opacity-30"
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}
