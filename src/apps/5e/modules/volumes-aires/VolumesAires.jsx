import { useState, useCallback } from 'react'
import { ArrowLeft, Star, Eye } from 'lucide-react'
import { generateProblem } from './engine'

const LEVELS = [
  { id: 1, label: '🟢 Aires 2D', desc: 'Rectangle, triangle, disque' },
  { id: 2, label: '🟡 Mixte', desc: 'Aires + volumes simples' },
  { id: 3, label: '🔴 Volumes 3D', desc: 'Pavé, cube, cylindre' },
]
const TOTAL = 8

export default function VolumesAires({ onBack }) {
  const [level, setLevel] = useState(null)
  const [problem, setProblem] = useState(null)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [done, setDone] = useState(false)

  const start = useCallback((lvl) => {
    setLevel(lvl); setProblem(generateProblem(lvl)); setIndex(0); setScore(0); setInput(''); setFeedback(null); setDone(false)
  }, [])

  const submit = () => {
    if (!input) return
    const val = parseFloat(input)
    const tol = problem.answer > 100 ? 1 : 0.5
    const correct = Math.abs(val - problem.answer) < tol
    if (correct) { setScore(s => s + 1); setFeedback({ ok: true, msg: `✅ ${problem.answer} ${problem.unit}` }) }
    else { setFeedback({ ok: false, msg: `❌ Réponse : ${problem.answer} ${problem.unit}` }) }
  }

  const next = () => {
    setFeedback(null); setInput('')
    if (index + 1 >= TOTAL) setDone(true)
    else { setIndex(i => i + 1); setProblem(generateProblem(level)) }
  }

  if (!level) {
    return (
      <div className="min-h-screen p-4">
        <header className="flex items-center gap-3 mb-6 pt-2">
          {onBack && <button onClick={onBack} className="p-2 rounded-xl bg-surface hover:bg-surface-light"><ArrowLeft className="w-5 h-5" /></button>}
          <h2 className="text-xl font-bold">📐 Volumes & Aires</h2>
        </header>
        <div className="grid gap-3">
          {LEVELS.map(l => (
            <button key={l.id} onClick={() => start(l.id)} className="p-4 rounded-2xl bg-surface hover:bg-surface-light text-left active:scale-[0.98]">
              <p className="font-bold text-lg">{l.label}</p><p className="text-sm text-slate-300">{l.desc}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (done) {
    const stars = score >= TOTAL ? 3 : score >= TOTAL * 0.7 ? 2 : score >= TOTAL * 0.4 ? 1 : 0
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Résultat</h2>
        <p className="text-5xl mb-2">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
        <p className="text-xl font-bold mb-4">{score}/{TOTAL}</p>
        <div className="flex gap-3">
          <button onClick={() => start(level)} className="px-6 py-3 rounded-xl bg-primary font-bold text-white">Rejouer</button>
          <button onClick={() => setLevel(null)} className="px-6 py-3 rounded-xl bg-surface font-bold">Niveaux</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <header className="flex items-center justify-between mb-4 pt-2">
        <div className="flex items-center gap-3">
          {onBack && <button onClick={onBack} className="p-2 rounded-xl bg-surface hover:bg-surface-light"><ArrowLeft className="w-5 h-5" /></button>}
          <div><h2 className="text-lg font-bold">Volumes & Aires</h2><p className="text-xs text-slate-300">{index + 1}/{TOTAL}</p></div>
        </div>
        <p className="text-lg font-bold text-accent">{score} <Star className="w-4 h-4 inline" /></p>
      </header>
      <div className="h-1.5 bg-surface rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all" style={{ width: `${(index / TOTAL) * 100}%` }} />
      </div>
      <div className="bg-surface rounded-2xl p-5 mb-4">
        <p className="text-lg font-bold mb-2">{problem.prompt}</p>
        <p className="text-accent font-bold">{problem.question} ({problem.unit})</p>
      </div>
      {!feedback && (
        <div className="flex gap-2 max-w-xs mx-auto">
          <input type="number" step="0.01" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
            className="flex-1 bg-surface-light rounded-xl px-4 py-3 text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary" placeholder="?" />
          <button onClick={submit} disabled={!input} className="px-6 py-3 rounded-xl bg-primary font-bold text-white disabled:opacity-40">OK</button>
        </div>
      )}
      {feedback && (
        <div className="text-center mt-4">
          <p className={`text-lg font-bold mb-3 ${feedback.ok ? 'text-green-400' : 'text-red-400'}`}>{feedback.msg}</p>
          <button onClick={next} className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-white">Suivant →</button>
        </div>
      )}
    </div>
  )
}
