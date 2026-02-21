import { useState, useCallback } from 'react'
import { ArrowLeft, Star, Eye, Zap } from 'lucide-react'
import { generateProblem } from './engine'

const TOTAL = 10

export default function TheoremArena({ onBack }) {
  const [problem, setProblem] = useState(null)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [showExpl, setShowExpl] = useState(false)
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)

  const start = useCallback(() => {
    setStarted(true); setProblem(generateProblem()); setIndex(0); setScore(0); setStreak(0); setMaxStreak(0); setInput(''); setFeedback(null); setShowExpl(false); setDone(false)
  }, [])

  const submit = () => {
    if (!input) return
    const val = parseFloat(input)
    const correct = Math.abs(val - problem.answer) < 0.5
    if (correct) {
      const ns = streak + 1
      setScore(s => s + 1); setStreak(ns); if (ns > maxStreak) setMaxStreak(ns)
      setFeedback({ ok: true, msg: `✅ ${problem.answer} cm` })
    } else {
      setStreak(0); setFeedback({ ok: false, msg: `❌ Réponse : ${problem.answer} cm` })
    }
  }

  const next = () => {
    setFeedback(null); setShowExpl(false); setInput('')
    if (index + 1 >= TOTAL) setDone(true)
    else { setIndex(i => i + 1); setProblem(generateProblem()) }
  }

  if (!started) {
    return (
      <div className="min-h-screen p-4">
        <header className="flex items-center gap-3 mb-6 pt-2">
          {onBack && <button onClick={onBack} className="p-2 rounded-xl bg-surface hover:bg-surface-light"><ArrowLeft className="w-5 h-5" /></button>}
          <h2 className="text-xl font-bold">⚔️ Théorème Arena</h2>
        </header>
        <p className="text-slate-300 mb-2">Pythagore ou Thalès ? Les deux !</p>
        <p className="text-slate-400 text-sm mb-6">10 questions aléatoires, enchaîne les bonnes réponses pour un max de streak 🔥</p>
        <button onClick={start} className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-600 font-bold text-lg text-white active:scale-[0.98]">
          <Zap className="w-5 h-5 inline mr-2" />Lancer l'Arena
        </button>
      </div>
    )
  }

  if (done) {
    const grade = score >= 9 ? 'A+' : score >= 7 ? 'A' : score >= 5 ? 'B' : score >= 3 ? 'C' : 'D'
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Arena terminée !</h2>
        <p className="text-6xl font-black text-accent mb-2">{grade}</p>
        <p className="text-xl font-bold mb-1">{score}/{TOTAL}</p>
        <p className="text-slate-300 mb-4">Streak max : 🔥 {maxStreak}</p>
        <div className="flex gap-3">
          <button onClick={start} className="px-6 py-3 rounded-xl bg-primary font-bold text-white">Rejouer</button>
          {onBack && <button onClick={onBack} className="px-6 py-3 rounded-xl bg-surface font-bold">Retour</button>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <header className="flex items-center justify-between mb-4 pt-2">
        <div className="flex items-center gap-3">
          {onBack && <button onClick={onBack} className="p-2 rounded-xl bg-surface hover:bg-surface-light"><ArrowLeft className="w-5 h-5" /></button>}
          <div><h2 className="text-lg font-bold">Théorème Arena</h2><p className="text-xs text-slate-300">{index + 1}/{TOTAL}</p></div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-accent">{score} <Star className="w-4 h-4 inline" /></p>
          {streak > 1 && <p className="text-xs text-amber-400">🔥 {streak}</p>}
        </div>
      </header>
      <div className="h-1.5 bg-surface rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-red-400 to-orange-500 rounded-full transition-all" style={{ width: `${(index / TOTAL) * 100}%` }} />
      </div>

      <div className="bg-surface rounded-2xl p-5 mb-4">
        <span className={`text-xs px-2 py-1 rounded-full font-bold ${problem.type === 'pythagore' ? 'bg-blue-900/50 text-blue-300' : 'bg-amber-900/50 text-amber-300'}`}>
          {problem.type === 'pythagore' ? '📐 Pythagore' : '📏 Thalès'}
        </span>
        <p className="text-lg font-bold mt-3">{problem.prompt}</p>
      </div>

      {!feedback && (
        <div className="flex gap-2 max-w-xs mx-auto">
          <input type="number" step="0.1" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
            className="flex-1 bg-surface-light rounded-xl px-4 py-3 text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary" placeholder="?" />
          <button onClick={submit} disabled={!input} className="px-6 py-3 rounded-xl bg-primary font-bold text-white disabled:opacity-40">OK</button>
        </div>
      )}

      {feedback && (
        <div className="text-center mt-4">
          <p className={`text-lg font-bold mb-3 ${feedback.ok ? 'text-green-400' : 'text-red-400'}`}>{feedback.msg}</p>
          <button onClick={() => setShowExpl(!showExpl)} className="text-sm text-indigo-300 flex items-center gap-1 mx-auto mb-3"><Eye className="w-4 h-4" />{showExpl ? 'Masquer' : 'Correction détaillée'}</button>
          {showExpl && <p className="text-sm text-slate-300 bg-surface rounded-xl p-3 max-w-sm mx-auto mb-3">{problem.explanation}</p>}
          <button onClick={next} className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 font-bold text-white">Suivant →</button>
        </div>
      )}
    </div>
  )
}
