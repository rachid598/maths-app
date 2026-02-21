import { useState, useCallback } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { generateRound } from './engine'

/* ─── Graph SVG ────────────────────────────────────── */
function GraphSVG({ a, b, targetX, highlight }) {
  const size = 300
  const mid = size / 2
  const scale = 30 // pixels per unit
  const range = 5

  // Line points
  const x1 = -range, y1 = a * x1 + b
  const x2 = range, y2 = a * x2 + b

  const toSvgX = (x) => mid + x * scale
  const toSvgY = (y) => mid - y * scale

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-xs mx-auto bg-slate-900 rounded-xl border border-slate-700">
      {/* Grid */}
      {Array.from({ length: 2 * range + 1 }, (_, i) => i - range).map(v => (
        <g key={v}>
          <line x1={toSvgX(v)} y1={0} x2={toSvgX(v)} y2={size} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1={0} y1={toSvgY(v)} x2={size} y2={toSvgY(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          {v !== 0 && (
            <>
              <text x={toSvgX(v)} y={mid + 14} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">{v}</text>
              <text x={mid - 12} y={toSvgY(v) + 3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9">{v}</text>
            </>
          )}
        </g>
      ))}
      {/* Axes */}
      <line x1={0} y1={mid} x2={size} y2={mid} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <line x1={mid} y1={0} x2={mid} y2={size} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <text x={mid + 4} y={12} fill="rgba(255,255,255,0.5)" fontSize="10">y</text>
      <text x={size - 12} y={mid - 4} fill="rgba(255,255,255,0.5)" fontSize="10">x</text>

      {/* Function line */}
      <line x1={toSvgX(x1)} y1={toSvgY(y1)} x2={toSvgX(x2)} y2={toSvgY(y2)}
        stroke="#818cf8" strokeWidth="2.5" />

      {/* Target point highlight */}
      {targetX !== undefined && (
        <>
          <line x1={toSvgX(targetX)} y1={mid} x2={toSvgX(targetX)} y2={toSvgY(a * targetX + b)}
            stroke="#f59e0b" strokeWidth="1" strokeDasharray="4" />
          <line x1={mid} y1={toSvgY(a * targetX + b)} x2={toSvgX(targetX)} y2={toSvgY(a * targetX + b)}
            stroke="#f59e0b" strokeWidth="1" strokeDasharray="4" />
          <circle cx={toSvgX(targetX)} cy={toSvgY(a * targetX + b)} r="5" fill="#f59e0b" />
        </>
      )}

      {highlight && (
        <circle cx={toSvgX(highlight.x)} cy={toSvgY(highlight.y)} r="7" fill="none" stroke="#22c55e" strokeWidth="2">
          <animate attributeName="r" values="5;9;5" dur="1s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  )
}

function ScoreScreen({ score, total, onRestart, onBack }) {
  const pct = Math.round((score / total) * 100)
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="text-6xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '📈' : '💪'}</span>
      <h2 className="text-2xl font-bold mb-2">Partie terminée !</h2>
      <p className="text-4xl font-extrabold text-accent mb-2">{score}/{total}</p>
      <div className="flex gap-3 mt-4">
        <button onClick={onRestart} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-bold">
          <RotateCcw className="w-4 h-4" /> Rejouer
        </button>
        <button onClick={onBack} className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold">Retour</button>
      </div>
    </div>
  )
}

export default function FonctionsInteractives({ onBack }) {
  const [questions, setQuestions] = useState(() => generateRound(10))
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [selected, setSelected] = useState(null)
  const [inputVal, setInputVal] = useState('')
  const [done, setDone] = useState(false)

  const q = questions[current]

  const handleRestart = useCallback(() => {
    setQuestions(generateRound(10))
    setCurrent(0); setScore(0); setFeedback(null); setSelected(null); setInputVal(''); setDone(false)
  }, [])

  const advance = useCallback(() => {
    setTimeout(() => {
      if (current + 1 >= questions.length) setDone(true)
      else { setCurrent(c => c + 1); setFeedback(null); setSelected(null); setInputVal('') }
    }, 1500)
  }, [current, questions.length])

  const handleChoice = useCallback((choice) => {
    if (feedback) return
    setSelected(choice.text)
    setFeedback(choice.correct ? 'correct' : 'wrong')
    if (choice.correct) setScore(s => s + 1)
    advance()
  }, [feedback, advance])

  const handleGraphSubmit = useCallback(() => {
    if (feedback) return
    const correct = Number(inputVal) === q.answer
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) setScore(s => s + 1)
    advance()
  }, [feedback, inputVal, q, advance])

  if (done) return <div className="min-h-screen p-4"><ScoreScreen score={score} total={questions.length} onRestart={handleRestart} onBack={onBack} /></div>

  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="min-h-screen p-4 pb-8">
      <header className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-surface-light hover:bg-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">📈 Fonctions</h1>
          <p className="text-xs text-slate-400">Question {current + 1}/{questions.length}</p>
        </div>
        <span className="text-lg font-bold text-accent">{score} <span className="text-xs text-slate-400">pts</span></span>
      </header>

      <div className="w-full h-2 bg-slate-700 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-lg mx-auto">
        <p className="text-center font-bold text-lg mb-4 whitespace-pre-line">{q.prompt}</p>

        {/* Graph for graph-read type */}
        {q.type === 'graph-read' && (
          <>
            <GraphSVG a={q.a} b={q.b} targetX={q.targetX} />
            <div className="flex gap-2 mt-4">
              <input type="number" value={inputVal} onChange={e => setInputVal(e.target.value)}
                disabled={!!feedback} placeholder="f(x) = ?"
                className="flex-1 p-3 rounded-xl bg-slate-800 text-white text-center text-lg font-bold border border-slate-600" />
              <button onClick={handleGraphSubmit} disabled={!!feedback || !inputVal}
                className="px-5 py-3 bg-accent text-white font-bold rounded-xl disabled:opacity-50">OK</button>
            </div>
          </>
        )}

        {/* Choices for image and antecedent types */}
        {q.choices && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {q.choices.map((choice, i) => (
              <button key={i} onClick={() => handleChoice(choice)} disabled={!!feedback}
                className={`p-4 rounded-xl font-bold text-lg transition-all ${
                  selected === choice.text
                    ? choice.correct ? 'bg-green-500 text-white scale-105' : 'bg-red-500 text-white'
                    : feedback && choice.correct ? 'bg-green-500/30 text-green-300'
                    : 'bg-surface hover:bg-surface-light text-white'
                }`}>
                {choice.text}
              </button>
            ))}
          </div>
        )}

        {feedback && (
          <div className={`text-center py-2 px-4 rounded-xl mt-4 font-bold ${
            feedback === 'correct' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {feedback === 'correct' ? '✅ Bravo !' : `❌ Réponse : ${q.answer}`}
            {feedback === 'wrong' && q.hint && <p className="text-sm mt-1 opacity-80">{q.hint}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
