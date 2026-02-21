import { useState, useCallback } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { generateRound } from './engine'

/* ─── Shape SVGs ───────────────────────────────────── */
function RectangleSVG({ length, width }) {
  const scale = 20
  const w = length * scale, h = width * scale
  return (
    <svg viewBox={`-10 -10 ${w + 40} ${h + 40}`} className="w-48 h-40 mx-auto">
      <rect x="0" y="0" width={w} height={h} fill="rgba(99,102,241,0.2)" stroke="#6366f1" strokeWidth="2" rx="2" />
      <text x={w / 2} y={h + 18} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{length} cm</text>
      <text x={-8} y={h / 2} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" transform={`rotate(-90 -8 ${h / 2})`}>{width} cm</text>
    </svg>
  )
}

function TriangleSVG({ base, hauteur }) {
  const scale = 15
  const w = base * scale, h = hauteur * scale
  return (
    <svg viewBox={`-10 -10 ${w + 30} ${h + 40}`} className="w-48 h-40 mx-auto">
      <polygon points={`0,${h} ${w},${h} ${w / 2},0`} fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="2" />
      <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="#22c55e" strokeWidth="1" strokeDasharray="4" />
      <text x={w / 2} y={h + 18} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{base} cm</text>
      <text x={w / 2 + 15} y={h / 2} fill="white" fontSize="10">h={hauteur}</text>
    </svg>
  )
}

function BoxSVG({ length, width, height }) {
  const s = 15
  const ox = 20, oy = 10
  const l = length * s, w = width * s * 0.5, h = height * s
  return (
    <svg viewBox={`-5 -5 ${l + w + 40} ${h + w + 30}`} className="w-56 h-44 mx-auto">
      {/* Front face */}
      <rect x={ox} y={oy + w} width={l} height={h} fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="2" />
      {/* Top face */}
      <polygon points={`${ox},${oy + w} ${ox + w},${oy} ${ox + w + l},${oy} ${ox + l},${oy + w}`}
        fill="rgba(245,158,11,0.1)" stroke="#f59e0b" strokeWidth="2" />
      {/* Right face */}
      <polygon points={`${ox + l},${oy + w} ${ox + l + w},${oy} ${ox + l + w},${oy + h} ${ox + l},${oy + w + h}`}
        fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="2" />
      <text x={ox + l / 2} y={oy + w + h + 16} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{length}</text>
      <text x={ox - 10} y={oy + w + h / 2} fill="white" fontSize="10" fontWeight="bold">{height}</text>
      <text x={ox + l + w / 2 + 5} y={oy - 2} fill="white" fontSize="10" fontWeight="bold">{width}</text>
    </svg>
  )
}

function CubeSVG({ side }) {
  return <BoxSVG length={side} width={side} height={side} />
}

function ScoreScreen({ score, total, onRestart, onBack }) {
  const pct = Math.round((score / total) * 100)
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="text-6xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '📦' : '💪'}</span>
      <h2 className="text-2xl font-bold mb-2">Partie terminée !</h2>
      <p className="text-4xl font-extrabold text-primary-light mb-2">{score}/{total}</p>
      <div className="flex gap-3 mt-4">
        <button onClick={onRestart} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold">
          <RotateCcw className="w-4 h-4" /> Rejouer
        </button>
        <button onClick={onBack} className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold">Retour</button>
      </div>
    </div>
  )
}

export default function VolumesAires({ onBack }) {
  const [questions, setQuestions] = useState(() => generateRound(10))
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [selected, setSelected] = useState(null)
  const [done, setDone] = useState(false)

  const q = questions[current]

  const handleRestart = useCallback(() => {
    setQuestions(generateRound(10))
    setCurrent(0); setScore(0); setFeedback(null); setSelected(null); setDone(false)
  }, [])

  const advance = useCallback(() => {
    setTimeout(() => {
      if (current + 1 >= questions.length) setDone(true)
      else { setCurrent(c => c + 1); setFeedback(null); setSelected(null) }
    }, 1200)
  }, [current, questions.length])

  const handleChoice = useCallback((choice) => {
    if (feedback) return
    setSelected(choice.text)
    setFeedback(choice.correct ? 'correct' : 'wrong')
    if (choice.correct) setScore(s => s + 1)
    advance()
  }, [feedback, advance])

  if (done) return <div className="min-h-screen p-4"><ScoreScreen score={score} total={questions.length} onRestart={handleRestart} onBack={onBack} /></div>

  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="min-h-screen p-4 pb-8">
      <header className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-surface hover:bg-surface-light">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">📦 Volumes & Aires</h1>
          <p className="text-xs text-slate-400">Question {current + 1}/{questions.length}</p>
        </div>
        <span className="text-lg font-bold text-amber-400">{score} <span className="text-xs text-slate-400">pts</span></span>
      </header>

      <div className="w-full h-2 bg-slate-700 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-lg mx-auto">
        <p className="text-center font-bold text-lg mb-4 whitespace-pre-line">{q.prompt}</p>

        {/* Shape visualization */}
        {q.shape === 'rectangle' && <RectangleSVG length={q.length} width={q.width} />}
        {q.shape === 'triangle' && <TriangleSVG base={q.base} hauteur={q.hauteur} />}
        {q.shape === 'pave' && <BoxSVG length={q.length} width={q.width} height={q.height} />}
        {q.shape === 'cube' && <CubeSVG side={q.side} />}

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

        {feedback && (
          <div className={`text-center py-2 px-4 rounded-xl mt-4 font-bold ${
            feedback === 'correct' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {feedback === 'correct' ? '✅ Bravo !' : `❌ ${q.hint}`}
          </div>
        )}
      </div>
    </div>
  )
}
