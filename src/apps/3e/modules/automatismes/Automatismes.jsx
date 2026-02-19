import { useState, useCallback, useRef } from 'react'
import {
  ArrowLeft, Star, RotateCcw, Trophy, Timer, ChevronRight,
  CheckCircle, XCircle, Brain, Zap, Ruler,
} from 'lucide-react'
import { generateSession, generateCustomSession, checkAnswer, CATEGORY_COLORS, SPECIAL_RELATIFS_CONVERSIONS } from './engine'
import QcmChoices from './components/QcmChoices'
import VraiFauxButtons from './components/VraiFauxButtons'
import AnswerInput from './components/AnswerInput'
import { fireSuccess, fireSpeedBonus, fireBigWin } from '../../utils/confetti'

const MODES = {
  flash: { label: 'Flash', desc: '10 questions', count: 10 },
  brevet: { label: 'Mode Brevet', desc: '10 questions', count: 10 },
  zen: { label: 'Zen', desc: '10 questions', count: 10 },
  'relatifs-conversions': {
    label: 'Relatifs & Conversions',
    desc: 'Relatifs (+,\u2212,\u00d7) et conversions',
    count: 10,
    custom: SPECIAL_RELATIFS_CONVERSIONS,
  },
}

export default function Automatismes({ onBack }) {
  const [mode, setMode] = useState(null)
  const [questions, setQuestions] = useState([])
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [vraiSelected, setVraiSelected] = useState(null)
  const [results, setResults] = useState([])
  const [showResult, setShowResult] = useState(false)
  const questionStartRef = useRef(0)

  const startMode = useCallback((modeKey) => {
    const cfg = MODES[modeKey]
    const session = cfg.custom
      ? generateCustomSession(cfg.count, cfg.custom)
      : generateSession(cfg.count)
    setMode(modeKey)
    setQuestions(session)
    setQIndex(0)
    setScore(0)
    setFeedback(null)
    setUserAnswer('')
    setVraiSelected(null)
    setResults([])
    setShowResult(false)
    questionStartRef.current = Date.now()
  }, [])

  const currentQ = questions[qIndex]
  const cfg = mode ? MODES[mode] : null

  const doValidate = useCallback(
    (answer) => {
      if (!currentQ || feedback) return
      const elapsed = (Date.now() - questionStartRef.current) / 1000

      let isCorrect = false
      if (currentQ.format === 'qcm') {
        isCorrect = currentQ.choices.find((c) => c.correct)?.text === answer
      } else if (currentQ.format === 'vraifaux') {
        isCorrect = answer === currentQ.answer
      } else {
        isCorrect = checkAnswer(currentQ, answer)
      }

      if (isCorrect) {
        if (elapsed < 3) {
          fireSpeedBonus()
        } else {
          fireSuccess()
        }
        setScore((s) => s + 1)
      }

      setFeedback({ correct: isCorrect, elapsed })
      setResults((r) => [...r, { question: currentQ, userAnswer: answer, correct: isCorrect, elapsed }])
    },
    [currentQ, feedback]
  )

  const handleValidate = useCallback(() => {
    if (currentQ.format === 'vraifaux') {
      if (vraiSelected === null) return
      doValidate(vraiSelected)
    } else if (currentQ.format === 'qcm') {
      if (!userAnswer) return
      doValidate(userAnswer)
    } else {
      if (!userAnswer.trim()) return
      doValidate(userAnswer.trim())
    }
  }, [currentQ, userAnswer, vraiSelected, doValidate])

  const handleNext = useCallback(() => {
    const next = qIndex + 1
    if (next >= questions.length) {
      if (score >= Math.ceil(questions.length * 0.6)) fireBigWin()
      setShowResult(true)
      return
    }
    setQIndex(next)
    setFeedback(null)
    setUserAnswer('')
    setVraiSelected(null)
    questionStartRef.current = Date.now()
  }, [qIndex, questions.length, score])

  // ─── Mode selection ───────────────────────────────────
  if (mode === null) {
    return (
      <div className="min-h-dvh px-4 pb-8 pt-6">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
        <div className="mb-2 flex items-center justify-center gap-2">
          <Brain className="h-7 w-7 text-cyan-400" />
          <h2 className="text-center text-2xl font-bold">
            <span className="text-cyan-400">Automatismes</span>
          </h2>
        </div>
        <p className="mb-8 text-center text-sm text-slate-400">
          Entraînement rapide multi-domaines — type Brevet partie 1
        </p>
        <div className="mx-auto flex max-w-sm flex-col gap-3">
          {Object.entries(MODES).map(([key, m]) => (
            <button
              key={key}
              onClick={() => startMode(key)}
              className="flex items-center justify-between rounded-2xl border border-slate-700 bg-surface p-4 transition hover:border-cyan-400"
            >
              <div className="flex items-center gap-3">
                {m.custom
                  ? <Ruler className="h-5 w-5 text-cyan-400" />
                  : <Timer className="h-5 w-5 text-cyan-400" />}
                <div className="text-left">
                  <h3 className="font-bold text-cyan-300">{m.label}</h3>
                  <p className="text-sm text-slate-400">{m.desc}</p>
                </div>
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
    const pct = Math.round((score / questions.length) * 100)
    const byCategory = {}
    results.forEach((r) => {
      const cat = r.question.category
      if (!byCategory[cat]) byCategory[cat] = { total: 0, correct: 0 }
      byCategory[cat].total++
      if (r.correct) byCategory[cat].correct++
    })

    return (
      <div className="min-h-dvh px-4 pb-8 pt-6">
        <div className="mx-auto max-w-lg">
          <div className="mb-6 flex flex-col items-center">
            <Trophy className={`mb-3 h-14 w-14 ${pct >= 60 ? 'text-cyan-400' : 'text-slate-500'}`} />
            <h2 className="mb-1 text-2xl font-bold">Résultat</h2>
            <p className="text-4xl font-bold text-cyan-400">
              {score}/{questions.length}
            </p>
            <p className="mt-1 text-slate-400">
              {pct >= 80
                ? 'Excellent ! Tu es prêt(e) pour le Brevet !'
                : pct >= 60
                  ? 'Bien joué ! Encore un peu d\'entraînement !'
                  : 'Continue à t\'entraîner, ça va venir !'}
            </p>
          </div>

          {/* Category breakdown */}
          <div className="mb-6 rounded-2xl bg-surface p-4">
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500">
              Par domaine
            </h3>
            <div className="flex flex-col gap-2">
              {Object.entries(byCategory).map(([cat, data]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[cat] || 'bg-slate-700 text-slate-300'}`}>
                    {cat}
                  </span>
                  <span className="text-sm font-bold text-slate-300">
                    {data.correct}/{data.total}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Question review */}
          <div className="mb-6 rounded-2xl bg-surface p-4">
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500">
              Récapitulatif
            </h3>
            <div className="flex flex-col gap-2">
              {results.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {r.correct ? (
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  )}
                  <span className={r.correct ? 'text-slate-300' : 'text-slate-400'}>
                    {r.question.question.split('\n')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => startMode(mode)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 font-bold text-black transition hover:bg-cyan-400"
            >
              <RotateCcw className="h-4 w-4" /> Rejouer
            </button>
            <button
              onClick={() => setMode(null)}
              className="flex-1 rounded-xl border border-slate-600 py-3 font-bold transition hover:border-cyan-400"
            >
              Modes
            </button>
            <button
              onClick={onBack}
              className="flex-1 rounded-xl border border-slate-600 py-3 font-bold transition hover:border-cyan-400"
            >
              Accueil
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Game screen ──────────────────────────────────────
  return (
    <div className="min-h-dvh px-4 pb-6 pt-4">
      {/* Top bar */}
      <div className="mx-auto mb-2 flex max-w-lg items-center justify-between">
        <button
          onClick={() => setMode(null)}
          className="flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Modes
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-cyan-400">{cfg.label}</span>
          <span className="text-sm text-slate-400">
            {qIndex + 1}/{questions.length}
          </span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-bold text-cyan-400">{score}</span>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="mx-auto mb-4 flex max-w-lg justify-center gap-1">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition ${
              i < qIndex
                ? results[i]?.correct
                  ? 'bg-emerald-400'
                  : 'bg-red-400'
                : i === qIndex
                  ? 'bg-cyan-400'
                  : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {currentQ && (
        <div className="mx-auto max-w-lg">
          {/* Category badge + question */}
          <div className="mb-5 rounded-2xl bg-surface p-4">
            <div className="mb-3 flex items-center justify-center">
              <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${CATEGORY_COLORS[currentQ.category] || 'bg-slate-700 text-slate-300'}`}>
                {currentQ.category}
              </span>
            </div>
            <p className="whitespace-pre-line text-center text-lg leading-relaxed font-medium">
              {currentQ.question}
            </p>
          </div>

          {/* Answer area by format */}
          <div className="mb-4">
            {currentQ.format === 'qcm' && (
              <QcmChoices
                choices={currentQ.choices}
                selected={userAnswer}
                onSelect={setUserAnswer}
                feedback={feedback}
              />
            )}
            {currentQ.format === 'vraifaux' && (
              <VraiFauxButtons
                selected={vraiSelected}
                onSelect={setVraiSelected}
                feedback={feedback}
                correctAnswer={currentQ.answer}
              />
            )}
            {currentQ.format === 'input' && (
              <AnswerInput
                value={userAnswer}
                onChange={setUserAnswer}
                disabled={!!feedback}
              />
            )}
          </div>

          {/* Correct answer reveal */}
          {feedback && !feedback.correct && currentQ.format === 'input' && (
            <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-center text-sm">
              <span className="text-slate-400">Réponse attendue : </span>
              <span className="font-bold text-red-400">{currentQ.answer}</span>
            </div>
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
              {feedback.correct
                ? feedback.elapsed < 3
                  ? <span className="flex items-center justify-center gap-1"><Zap className="h-4 w-4" /> Ultra rapide !</span>
                  : feedback.elapsed < 6
                    ? <span className="flex items-center justify-center gap-1"><Zap className="h-4 w-4" /> Rapide !</span>
                    : 'Bonne réponse !'
                : 'Mauvaise réponse'}
            </div>
          )}

          {/* Validate / Next */}
          <div className="mx-auto max-w-xs">
            {!feedback ? (
              <button
                onClick={handleValidate}
                disabled={
                  (currentQ.format === 'input' && !userAnswer.trim()) ||
                  (currentQ.format === 'qcm' && !userAnswer) ||
                  (currentQ.format === 'vraifaux' && vraiSelected === null)
                }
                className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-black transition hover:bg-cyan-400 active:scale-95 disabled:opacity-40"
              >
                Valider
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full rounded-xl bg-primary-light py-3 font-bold text-white transition hover:bg-primary active:scale-95"
              >
                {qIndex + 1 >= questions.length ? 'Voir le résultat' : 'Suivante →'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
