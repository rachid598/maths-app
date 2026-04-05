import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, RotateCcw, Trophy, ChevronRight, Delete } from 'lucide-react'
import { LEVELS, generateRound, questionsForLevel } from './engine'
import TriangleSVG from './components/TriangleSVG'
import { useHistory } from '../../../../shared/hooks/useHistory'
import { getStorageKeys } from '../../../../shared/utils/storageKeys'

const KEYS = getStorageKeys('4e')
const SCORES_KEY = KEYS.custom('pyth_scores')

function loadScores() { try { return JSON.parse(localStorage.getItem(SCORES_KEY)) || {} } catch { return {} } }
function saveScores(s) { localStorage.setItem(SCORES_KEY, JSON.stringify(s)) }

export default function Pythagore() {
  const navigate = useNavigate()
  const { addHistory } = useHistory('4e')
  const [level, setLevel] = useState(null)
  const [questions, setQuestions] = useState([])
  const [qi, setQi] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [phase, setPhase] = useState('pick')
  const [bestScores, setBestScores] = useState(loadScores)
  // Step-by-step state (for calcul questions)
  const [stepIndex, setStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [stepInput, setStepInput] = useState('')
  const [stepFeedback, setStepFeedback] = useState(null)
  const [stepErrors, setStepErrors] = useState(0)
  const feedbackTimer = useRef(null)
  const question = questions[qi]

  const totalQ = level ? questionsForLevel(level.id) : 10

  const startLevel = useCallback((lv) => {
    setLevel(lv)
    setQuestions(generateRound(lv.id))
    setQi(0); setScore(0); setSelected(null)
    setStepIndex(0); setCompletedSteps([]); setStepInput(''); setStepFeedback(null); setStepErrors(0)
    setPhase('play')
  }, [])

  const finishRound = useCallback((finalScore) => {
    const updated = { ...bestScores }
    if (!updated[level.id] || finalScore > updated[level.id]) {
      updated[level.id] = finalScore
      setBestScores(updated)
      saveScores(updated)
    }
    addHistory({ module: 'PY', level: level.id, score: finalScore, total: totalQ })
    setScore(finalScore)
    setPhase('result')
  }, [bestScores, level, totalQ, addHistory])

  const nextQuestion = useCallback((currentScore) => {
    if (qi + 1 >= totalQ) {
      finishRound(currentScore)
    } else {
      setQi(q => q + 1)
      setSelected(null)
      setStepIndex(0); setCompletedSteps([]); setStepInput(''); setStepFeedback(null); setStepErrors(0)
    }
  }, [qi, totalQ, finishRound])

  // ─── QCM handler (N1, N2, N4 non-calcul) ─────
  const handleChoice = useCallback((choiceIndex) => {
    if (selected !== null || !question) return
    const correct = choiceIndex === question.correctIndex
    setSelected(choiceIndex)
    const newScore = correct ? score + 1 : score
    if (correct) setScore(s => s + 1)
    feedbackTimer.current = setTimeout(() => {
      nextQuestion(newScore)
    }, correct ? 600 : 1500)
  }, [question, selected, score, nextQuestion])

  // ─── Step-by-step handlers (N3 calcul) ────────

  // Advance to next step or finish question
  const advanceStep = useCallback((currentStepIdx, hadErrors) => {
    const steps = question.steps
    let nextIdx = currentStepIdx + 1

    // Skip 'display' steps — auto-complete them
    while (nextIdx < steps.length && steps[nextIdx].type === 'display') {
      setCompletedSteps(prev => [...prev, { line: steps[nextIdx].completedLine }])
      nextIdx++
    }

    if (nextIdx >= steps.length) {
      // Question done — score 1 point if no errors
      const newScore = hadErrors ? score : score + 1
      if (!hadErrors) setScore(s => s + 1)
      feedbackTimer.current = setTimeout(() => {
        nextQuestion(newScore)
      }, 1200)
    } else {
      setStepIndex(nextIdx)
      setStepInput('')
      setStepFeedback(null)
    }
  }, [question, score, nextQuestion])

  // Handle QCM step answer
  const handleStepChoice = useCallback((choiceIndex) => {
    if (stepFeedback !== null || !question) return
    const step = question.steps[stepIndex]
    const correct = choiceIndex === step.correctIndex
    setStepFeedback(correct ? 'correct' : 'wrong')
    if (!correct) setStepErrors(e => e + 1)

    feedbackTimer.current = setTimeout(() => {
      setCompletedSteps(prev => [...prev, { line: step.completedLine }])
      setStepFeedback(null)
      advanceStep(stepIndex, !correct ? true : stepErrors > 0)
    }, correct ? 600 : 1200)
  }, [question, stepIndex, stepFeedback, stepErrors, advanceStep])

  // Handle numeric step input
  const handleStepValidate = useCallback(() => {
    if (stepFeedback !== null || !question) return
    const step = question.steps[stepIndex]
    const parsed = parseFloat(stepInput.replace(',', '.'))
    const correct = !isNaN(parsed) && Math.abs(parsed - step.answer) < 0.01
    setStepFeedback(correct ? 'correct' : 'wrong')
    if (!correct) setStepErrors(e => e + 1)

    feedbackTimer.current = setTimeout(() => {
      setCompletedSteps(prev => [...prev, { line: step.completedLine }])
      setStepFeedback(null)
      advanceStep(stepIndex, !correct ? true : stepErrors > 0)
    }, correct ? 600 : 1500)
  }, [question, stepIndex, stepInput, stepFeedback, stepErrors, advanceStep])

  const handleKeyInput = useCallback((value) => {
    if (stepFeedback) return
    if (value === 'backspace') setStepInput(v => v.slice(0, -1))
    else if (value === ',') { if (!stepInput.includes(',')) setStepInput(v => v + ',') }
    else setStepInput(v => v.length < 6 ? v + value : v)
  }, [stepFeedback, stepInput])

  useEffect(() => () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current) }, [])

  // Auto-skip display steps at the start of a calcul question
  useEffect(() => {
    if (question?.type === 'calcul' && stepIndex === 0 && completedSteps.length === 0) {
      let idx = 0
      const auto = []
      while (idx < question.steps.length && question.steps[idx].type === 'display') {
        auto.push({ line: question.steps[idx].completedLine })
        idx++
      }
      if (auto.length > 0) {
        setCompletedSteps(auto)
        setStepIndex(idx)
      }
    }
  }, [question, stepIndex, completedSteps.length])

  // ─── Level selection ──────────────────────────
  if (phase === 'pick') {
    return (
      <div className="min-h-dvh px-4 pb-8 pt-6">
        <button onClick={() => navigate('/4e')}
          className="mb-6 flex items-center gap-2 text-sm text-slate-300 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
        <h2 className="mb-2 text-center text-2xl font-bold">
          <span className="text-emerald-400">Pythagore</span>
        </h2>
        <p className="mb-8 text-center text-sm text-slate-300">
          L'égalité de Pythagore dans un triangle rectangle
        </p>
        <div className="mx-auto flex max-w-sm flex-col gap-3">
          {LEVELS.map((lv) => {
            const sc = bestScores[lv.id]
            const total = questionsForLevel(lv.id)
            return (
              <button key={lv.id} onClick={() => startLevel(lv)}
                className="flex items-center justify-between rounded-2xl border border-slate-700 bg-surface p-4 transition hover:border-emerald-400">
                <div className="text-left">
                  <h3 className="font-bold text-emerald-400">{lv.label} — {lv.title}</h3>
                  <p className="text-sm text-slate-300">{lv.desc}</p>
                  {sc !== undefined && <p className="text-xs text-slate-400 mt-1">Meilleur : {sc}/{total}</p>}
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── Result ───────────────────────────────────
  if (phase === 'result') {
    const pct = Math.round((score / totalQ) * 100)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-4">
        <Trophy className={`mb-4 h-16 w-16 ${pct >= 60 ? 'text-emerald-400' : 'text-slate-400'}`} />
        <h2 className="mb-2 text-2xl font-bold">Résultat</h2>
        <p className="mb-1 text-4xl font-bold text-emerald-400">{score}/{totalQ}</p>
        <p className="mb-6 text-slate-300">
          {pct >= 80 ? 'Excellent !' : pct >= 60 ? 'Bien joué !' : "Continue à t'entraîner !"}
        </p>
        <div className="flex gap-3">
          <button onClick={() => startLevel(level)}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-white transition hover:bg-emerald-400">
            <RotateCcw className="h-4 w-4" /> Rejouer
          </button>
          <button onClick={() => setPhase('pick')}
            className="rounded-xl border border-slate-600 px-5 py-3 font-bold transition hover:border-emerald-400">
            Niveaux
          </button>
        </div>
      </div>
    )
  }

  // ─── Play ─────────────────────────────────────
  const isCalc = question?.type === 'calcul'
  const currentStep = isCalc ? question.steps[stepIndex] : null

  return (
    <div className="min-h-dvh px-4 pb-6 pt-4">
      {/* Top bar */}
      <div className="mx-auto mb-4 flex max-w-lg items-center justify-between">
        <button onClick={() => setPhase('pick')}
          className="flex items-center gap-1 text-sm text-slate-300 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Niveaux
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-emerald-400">{level.label}</span>
          <span className="text-sm text-slate-300">{qi + 1}/{totalQ}</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">{score}</span>
          </div>
        </div>
      </div>

      {question && (
        <div className="mx-auto max-w-lg">
          {/* Figure */}
          <div className="mb-4">
            <TriangleSVG vertices={question.vertices} rightAngle={question.rightAngle} sides={question.sides} />
          </div>

          {/* Prompt */}
          <div className="mb-4 rounded-2xl bg-surface p-4 text-center">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">{question.prompt}</p>
          </div>

          {/* ════════ QCM mode (N1, N2, N4 non-calcul) ════════ */}
          {!isCalc && question.choices && (
            <div className="space-y-2 max-w-sm mx-auto">
              {question.choices.map((choice, i) => {
                let cls = 'bg-surface-light text-slate-200 border-slate-700 hover:border-emerald-400'
                if (selected !== null) {
                  if (i === question.correctIndex) cls = 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                  else if (i === selected) cls = 'bg-red-500/20 text-red-400 border-red-500 animate-shake'
                }
                return (
                  <button key={i} onClick={() => handleChoice(i)} disabled={selected !== null}
                    className={`w-full text-left px-5 py-3 rounded-xl border-2 font-mono font-semibold text-base transition-all active:scale-[0.97] ${cls}`}>
                    {choice}
                  </button>
                )
              })}
            </div>
          )}

          {/* ════════ Step-by-step calcul (N3) ════════ */}
          {isCalc && (
            <div className="max-w-sm mx-auto">
              {/* Lignes complétées */}
              <div className="mb-4 space-y-1">
                {completedSteps.map((s, i) => (
                  <div key={i} className="animate-slide-up rounded-lg bg-surface px-4 py-2">
                    <p className="font-mono text-sm text-emerald-400">{s.line}</p>
                  </div>
                ))}
              </div>

              {/* Étape courante */}
              {currentStep && (
                <div className="animate-slide-up">
                  <p className="text-sm font-medium text-slate-400 mb-2">{currentStep.label}</p>

                  {/* QCM step */}
                  {currentStep.type === 'qcm' && (
                    <div className="space-y-2">
                      {currentStep.choices.map((choice, i) => {
                        let cls = 'bg-surface-light text-slate-200 border-slate-700 hover:border-emerald-400'
                        if (stepFeedback !== null) {
                          if (i === currentStep.correctIndex) cls = 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                          else if (i === selected) cls = 'bg-red-500/20 text-red-400 border-red-500 animate-shake'
                        }
                        return (
                          <button key={i}
                            onClick={() => { setSelected(i); handleStepChoice(i) }}
                            disabled={stepFeedback !== null}
                            className={`w-full text-left px-4 py-2.5 rounded-xl border-2 font-mono font-semibold text-sm transition-all active:scale-[0.97] ${cls}`}>
                            {choice}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Input step */}
                  {currentStep.type === 'input' && (
                    <div>
                      {/* Display */}
                      <div className={`mb-3 flex items-center justify-center gap-2 rounded-xl p-3 ${
                        stepFeedback === 'correct' ? 'bg-emerald-500/20 ring-2 ring-emerald-500' :
                        stepFeedback === 'wrong' ? 'bg-red-500/20 ring-2 ring-red-500' :
                        'bg-surface'
                      }`}>
                        <span className={`min-w-[3rem] text-right text-2xl font-bold font-mono ${
                          stepFeedback === 'correct' ? 'text-emerald-400' :
                          stepFeedback === 'wrong' ? 'text-red-400' :
                          'text-white'
                        }`}>
                          {stepInput || <span className="text-slate-500">?</span>}
                        </span>
                      </div>

                      {/* Wrong answer hint */}
                      {stepFeedback === 'wrong' && (
                        <p className="text-center text-sm text-red-400 mb-2">
                          Réponse : {currentStep.answer}
                        </p>
                      )}

                      {/* Keypad */}
                      <div className="grid w-full grid-cols-4 gap-2">
                        {['7','8','9'].map(d => (
                          <button key={d} onClick={() => handleKeyInput(d)} disabled={!!stepFeedback}
                            className="flex h-11 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition active:scale-95 disabled:opacity-30">{d}</button>
                        ))}
                        <button onClick={() => handleKeyInput('backspace')} disabled={!!stepFeedback}
                          className="flex h-11 items-center justify-center rounded-xl bg-surface-light text-slate-300 transition active:scale-95 disabled:opacity-30">
                          <Delete className="h-5 w-5" />
                        </button>
                        {['4','5','6',','].map(d => (
                          <button key={d} onClick={() => handleKeyInput(d)} disabled={!!stepFeedback}
                            className="flex h-11 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition active:scale-95 disabled:opacity-30">{d}</button>
                        ))}
                        {['1','2','3','0'].map(d => (
                          <button key={d} onClick={() => handleKeyInput(d)} disabled={!!stepFeedback}
                            className="flex h-11 items-center justify-center rounded-xl bg-surface-light font-bold text-white transition active:scale-95 disabled:opacity-30">{d}</button>
                        ))}
                      </div>

                      {/* Validate button */}
                      {!stepFeedback && (
                        <button onClick={handleStepValidate} disabled={!stepInput}
                          className="mt-3 w-full rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-400 active:scale-95 disabled:opacity-40">
                          Valider
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* All steps done — waiting to advance */}
              {!currentStep && completedSteps.length > 0 && (
                <div className="animate-pop-in text-center mt-2">
                  <p className={`text-lg font-bold ${stepErrors === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {stepErrors === 0 ? 'Parfait !' : 'Terminé !'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
