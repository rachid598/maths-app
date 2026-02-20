import { useState, useCallback, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, Star, Eye } from 'lucide-react'
import confetti from 'canvas-confetti'
import { generateRiddle, computeScore } from './engine'
import LevelPicker from './components/LevelPicker'
import RiddleCard from './components/RiddleCard'
import HintSteps from './components/HintSteps'
import EquationReveal from './components/EquationReveal'
import ScoreScreen from './components/ScoreScreen'

const PROBLEMS = 8

export default function NombreMystere({ onBack }) {
  const [level, setLevel] = useState(null)
  const [riddle, setRiddle] = useState(null)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [solved, setSolved] = useState(false)
  const [score, setScore] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [streak, setStreak] = useState(0)
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)
  const fbRef = useRef(null)

  const newRiddle = useCallback((lvl) => {
    setRiddle(generateRiddle(lvl || level))
    setInput('')
    setFeedback(null)
    setShowHint(false)
    setSolved(false)
  }, [level])

  function selectLevel(id) {
    setLevel(id)
    setScore(0)
    setTotalPoints(0)
    setStreak(0)
    setIndex(0)
    setDone(false)
    setRiddle(generateRiddle(id))
    setInput('')
    setFeedback(null)
    setShowHint(false)
    setSolved(false)
  }

  function handleSubmit() {
    if (!input || solved) return
    clearTimeout(fbRef.current)
    const answer = parseInt(input, 10)
    if (isNaN(answer)) return

    if (answer === riddle.x) {
      const { points, newStreak } = computeScore(true, streak, level)
      setScore((s) => s + 1)
      setTotalPoints((s) => s + points)
      setStreak(newStreak)
      setSolved(true)
      setFeedback(null)
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#fbbf24', '#10b981'] })
    } else {
      setStreak(0)
      setFeedback("Ce n'est pas le bon nombre. Réessaie !")
      fbRef.current = setTimeout(() => setFeedback(null), 2500)
      setInput('')
    }
  }

  function handleNext() {
    if (index + 1 >= PROBLEMS) {
      setDone(true)
      if (score === PROBLEMS) confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } })
    } else {
      setIndex((i) => i + 1)
      newRiddle(level)
    }
  }

  useEffect(() => () => clearTimeout(fbRef.current), [])

  if (done) {
    return (
      <ScoreScreen score={score} total={PROBLEMS} onReplay={() => selectLevel(level)} onChangeLevel={() => setLevel(null)} onBack={onBack} />
    )
  }

  if (!level) {
    return (
      <div className="min-h-screen p-4">
        <header className="flex items-center gap-3 mb-6 pt-2">
          <button onClick={onBack} className="p-2 rounded-xl bg-surface hover:bg-surface-light transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-bold">Nombre Mystère</h2>
        </header>
        <LevelPicker onSelect={selectLevel} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      <header className="flex items-center justify-between mb-4 pt-2">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-surface hover:bg-surface-light transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h2 className="text-lg font-bold">Nombre Mystère</h2>
            <p className="text-xs text-slate-300">{index + 1}/{PROBLEMS}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-accent">{totalPoints} <Star className="w-4 h-4 inline text-accent" /></p>
          {streak > 1 && <p className="text-xs text-amber-400">🔥 Série : {streak}</p>}
        </div>
      </header>

      <div className="h-1.5 bg-surface rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500" style={{ width: `${((index + (solved ? 1 : 0)) / PROBLEMS) * 100}%` }} />
      </div>

      {riddle && <RiddleCard riddleText={riddle.riddleText} />}

      {riddle && !solved && (
        <button onClick={() => setShowHint((h) => !h)} className="mx-auto mt-3 flex items-center gap-1.5 text-sm text-indigo-300 hover:text-indigo-200 transition-colors">
          <Eye className="w-4 h-4" />{showHint ? "Masquer l'aide" : "Afficher l'aide"}
        </button>
      )}

      {riddle && <div className="mt-3"><HintSteps hintSteps={riddle.hintSteps} visible={showHint && !solved} /></div>}

      {riddle && solved && <div className="mt-4"><EquationReveal equation={riddle.equation} x={riddle.x} visible /></div>}

      <div className="h-10 flex items-center justify-center my-2">
        {feedback && <p className="text-sm font-semibold px-4 py-1.5 rounded-full bg-red-900/30 text-danger">{feedback}</p>}
      </div>

      <div className="flex-1" />

      {solved && (
        <button onClick={handleNext} className="mx-auto mb-4 px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.97] transition-all text-white flex items-center gap-2">
          Suivant <ArrowRight className="w-5 h-5" />
        </button>
      )}

      {!solved && (
        <div className="w-full max-w-xs mx-auto">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="text-sm text-slate-300">Le nombre mystère :</span>
            <div className="bg-surface-light rounded-xl px-6 py-2 min-w-[80px] text-center text-2xl font-bold tabular-nums">
              {input || <span className="text-slate-400">?</span>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <button key={n} type="button" onClick={() => input.length < 4 && setInput(input + String(n))} className="py-3 rounded-xl bg-surface-light text-lg font-semibold active:bg-primary/30 transition-colors">{n}</button>
            ))}
            <button type="button" onClick={() => setInput('')} className="py-3 rounded-xl bg-surface text-sm font-medium text-slate-300 active:bg-red-900/30 transition-colors">C</button>
            <button type="button" onClick={() => input.length < 4 && setInput(input + '0')} className="py-3 rounded-xl bg-surface-light text-lg font-semibold active:bg-primary/30 transition-colors">0</button>
            <button type="button" onClick={() => setInput(input.slice(0, -1))} className="py-3 rounded-xl bg-surface text-slate-300 flex items-center justify-center active:bg-red-900/30 transition-colors">⌫</button>
          </div>
          <button type="button" onClick={handleSubmit} disabled={!input} className="mt-3 w-full py-3 rounded-xl font-bold text-lg bg-primary hover:bg-primary-dark active:bg-primary-dark transition-colors text-white disabled:opacity-40 disabled:cursor-not-allowed">Valider</button>
        </div>
      )}

      <div className="h-4" />
    </div>
  )
}
