import { useState, useCallback } from 'react'
import { ArrowLeft, Star, Eye } from 'lucide-react'
import { generateProblem } from './engine'

const TOTAL = 10

function MiniGraph({ a, b }) {
  const points = []
  for (let x = -5; x <= 5; x++) { points.push({ x, y: a * x + b }) }
  const toSvgX = (x) => 50 + x * 8
  const toSvgY = (y) => 50 - y * 8
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ')

  return (
    <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto mb-4">
      <line x1="10" y1="50" x2="90" y2="50" stroke="#475569" strokeWidth="0.5" />
      <line x1="50" y1="10" x2="50" y2="90" stroke="#475569" strokeWidth="0.5" />
      {[-4,-2,2,4].map(t => <text key={`x${t}`} x={toSvgX(t)} y="55" fill="#64748b" fontSize="4" textAnchor="middle">{t}</text>)}
      {[-4,-2,2,4].map(t => <text key={`y${t}`} x="45" y={toSvgY(t)+1} fill="#64748b" fontSize="4" textAnchor="end">{t}</text>)}
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="1.5" />
    </svg>
  )
}

export default function FonctionsInteractives({ onBack }) {
  const [problem, setProblem] = useState(null)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [showExpl, setShowExpl] = useState(false)
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)

  const start = useCallback(() => {
    setStarted(true); setProblem(generateProblem()); setIndex(0); setScore(0); setInput(''); setFeedback(null); setShowExpl(false); setDone(false)
  }, [])

  const submit = () => {
    if (!input) return
    const val = parseInt(input, 10)
    const correct = val === problem.answer
    if (correct) { setScore(s => s + 1); setFeedback({ ok: true, msg: `✅ f(x) = ${problem.answer}` }) }
    else { setFeedback({ ok: false, msg: `❌ Réponse : ${problem.answer}` }) }
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
          <h2 className="text-xl font-bold">📈 Fonctions Interactives</h2>
        </header>
        <p className="text-slate-300 mb-6">Calcule images et antécédents de fonctions linéaires et affines.</p>
        <button onClick={start} className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-lg text-white active:scale-[0.98]">Commencer ({TOTAL} questions)</button>
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
          <div><h2 className="text-lg font-bold">Fonctions</h2><p className="text-xs text-slate-300">{index + 1}/{TOTAL}</p></div>
        </div>
        <p className="text-lg font-bold text-accent">{score} <Star className="w-4 h-4 inline" /></p>
      </header>
      <div className="h-1.5 bg-surface rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all" style={{ width: `${(index / TOTAL) * 100}%` }} />
      </div>

      <MiniGraph a={problem.func.a} b={problem.func.b} />

      <div className="bg-surface rounded-2xl p-5 mb-4 text-center">
        <p className="text-sm text-slate-400 mb-1">{problem.func.label}</p>
        <p className="text-lg font-bold">{problem.question}</p>
      </div>

      {!feedback && (
        <div className="flex gap-2 max-w-xs mx-auto">
          <input type="number" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
            className="flex-1 bg-surface-light rounded-xl px-4 py-3 text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary" placeholder="?" />
          <button onClick={submit} disabled={!input} className="px-6 py-3 rounded-xl bg-primary font-bold text-white disabled:opacity-40">OK</button>
        </div>
      )}

      {feedback && (
        <div className="text-center mt-4">
          <p className={`text-lg font-bold mb-3 ${feedback.ok ? 'text-green-400' : 'text-red-400'}`}>{feedback.msg}</p>
          <button onClick={() => setShowExpl(!showExpl)} className="text-sm text-indigo-300 flex items-center gap-1 mx-auto mb-3"><Eye className="w-4 h-4" />{showExpl ? 'Masquer' : 'Explication'}</button>
          {showExpl && <p className="text-sm text-slate-300 bg-surface rounded-xl p-3 max-w-sm mx-auto mb-3">{problem.explanation}</p>}
          <button onClick={next} className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-white">Suivant →</button>
        </div>
      )}
    </div>
  )
}
