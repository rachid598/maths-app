import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, RotateCcw, Trophy, ChevronRight } from 'lucide-react'
import { LEVELS, generateRound, QUESTIONS_PER_ROUND } from './engine'
import TriangleSVG from './components/TriangleSVG'
import { useGrade } from '../../../../shared/components/GradeLayout'
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
  const feedbackTimer = useRef(null)
  const question = questions[qi]

  const startLevel = useCallback((lv) => {
    setLevel(lv)
    setQuestions(generateRound(lv.id))
    setQi(0); setScore(0); setSelected(null); setPhase('play')
  }, [])

  const handleChoice = useCallback((choiceIndex) => {
    if (selected !== null || !question) return
    const correct = choiceIndex === question.correctIndex
    setSelected(choiceIndex)

    feedbackTimer.current = setTimeout(() => {
      setSelected(null)
      if (qi + 1 >= QUESTIONS_PER_ROUND) {
        const finalScore = correct ? score + 1 : score
        const updated = { ...bestScores }
        if (!updated[level.id] || finalScore > updated[level.id]) {
          updated[level.id] = finalScore
          setBestScores(updated)
          saveScores(updated)
        }
        addHistory({ module: 'PY', level: level.id, score: finalScore, total: QUESTIONS_PER_ROUND })
        setScore(finalScore)
        setPhase('result')
      } else {
        if (correct) setScore(s => s + 1)
        setQi(q => q + 1)
      }
    }, correct ? 600 : 1500)

    if (correct && qi + 1 < QUESTIONS_PER_ROUND) setScore(s => s + 1)
  }, [question, selected, qi, score, bestScores, level, addHistory])

  useEffect(() => () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current) }, [])

  // ─── Level selection ──────────────────────────
  if (phase === 'pick') {
    return (
      <div className="min-h-dvh px-4 pb-8 pt-6">
        <button
          onClick={() => navigate('/4e')}
          className="mb-6 flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
        >
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
            return (
              <button
                key={lv.id}
                onClick={() => startLevel(lv)}
                className="flex items-center justify-between rounded-2xl border border-slate-700 bg-surface p-4 transition hover:border-emerald-400"
              >
                <div className="text-left">
                  <h3 className="font-bold text-emerald-400">{lv.label} — {lv.title}</h3>
                  <p className="text-sm text-slate-300">{lv.desc}</p>
                  {sc !== undefined && (
                    <p className="text-xs text-slate-400 mt-1">Meilleur : {sc}/{QUESTIONS_PER_ROUND}</p>
                  )}
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
    const pct = Math.round((score / QUESTIONS_PER_ROUND) * 100)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-4">
        <Trophy className={`mb-4 h-16 w-16 ${pct >= 60 ? 'text-emerald-400' : 'text-slate-400'}`} />
        <h2 className="mb-2 text-2xl font-bold">Résultat</h2>
        <p className="mb-1 text-4xl font-bold text-emerald-400">
          {score}/{QUESTIONS_PER_ROUND}
        </p>
        <p className="mb-6 text-slate-300">
          {pct >= 80 ? 'Excellent !' : pct >= 60 ? 'Bien joué !' : "Continue à t'entraîner !"}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => startLevel(level)}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-white transition hover:bg-emerald-400"
          >
            <RotateCcw className="h-4 w-4" /> Rejouer
          </button>
          <button
            onClick={() => setPhase('pick')}
            className="rounded-xl border border-slate-600 px-5 py-3 font-bold transition hover:border-emerald-400"
          >
            Niveaux
          </button>
        </div>
      </div>
    )
  }

  // ─── Play ─────────────────────────────────────
  return (
    <div className="min-h-dvh px-4 pb-6 pt-4">
      {/* Top bar */}
      <div className="mx-auto mb-4 flex max-w-lg items-center justify-between">
        <button
          onClick={() => setPhase('pick')}
          className="flex items-center gap-1 text-sm text-slate-300 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Niveaux
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-emerald-400">
            {level.label} — {level.title}
          </span>
          <span className="text-sm text-slate-300">
            {qi + 1}/{QUESTIONS_PER_ROUND}
          </span>
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
            <TriangleSVG vertices={question.vertices} rightAngle={question.rightAngle} />
          </div>

          {/* Prompt */}
          <div className="mb-5 rounded-2xl bg-surface p-4 text-center">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
              {question.prompt}
            </p>
          </div>

          {/* Choices */}
          <div className="space-y-2 max-w-sm mx-auto">
            {question.choices.map((choice, i) => {
              let cls = 'bg-surface-light text-slate-200 border-slate-700 hover:border-emerald-400'
              if (selected !== null) {
                if (i === question.correctIndex) cls = 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                else if (i === selected) cls = 'bg-red-500/20 text-red-400 border-red-500 animate-shake'
              }
              return (
                <button
                  key={i}
                  onClick={() => handleChoice(i)}
                  disabled={selected !== null}
                  className={`w-full text-left px-5 py-3 rounded-xl border-2 font-mono font-semibold text-base transition-all active:scale-[0.97] ${cls}`}
                >
                  {choice}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
