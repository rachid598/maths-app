import { useState, useCallback } from 'react'
import { ArrowLeft, RotateCcw, ChevronRight } from 'lucide-react'
import { generateRound, checkPlacement } from './engine'

/* ─── Grid SVG ─────────────────────────────────────── */
function GridSVG({ size = 10, points = [], vertices = [], onCellClick, highlight }) {
  const cellSize = 30
  const w = size * cellSize
  
  return (
    <svg viewBox={`0 0 ${w} ${w}`} className="w-full max-w-xs mx-auto bg-white/5 rounded-xl border border-white/10">
      {/* Grid lines */}
      {Array.from({ length: size + 1 }, (_, i) => (
        <g key={i}>
          <line x1={0} y1={i * cellSize} x2={w} y2={i * cellSize} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1={i * cellSize} y1={0} x2={i * cellSize} y2={w} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          {i < size && (
            <>
              <text x={i * cellSize + cellSize / 2} y={w - 4} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle">{i + 1}</text>
              <text x={4} y={w - i * cellSize - cellSize / 2 + 3} fill="rgba(255,255,255,0.3)" fontSize="8">{i + 1}</text>
            </>
          )}
        </g>
      ))}
      
      {/* Clickable cells */}
      {onCellClick && Array.from({ length: size * size }, (_, idx) => {
        const x = (idx % size) + 1
        const y = Math.floor(idx / size) + 1
        return (
          <rect
            key={idx}
            x={(x - 1) * cellSize}
            y={w - y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="transparent"
            className="cursor-pointer hover:fill-white/10"
            onClick={() => onCellClick(x, y)}
          />
        )
      })}
      
      {/* Shape vertices and edges */}
      {vertices.length > 1 && (
        <polygon
          points={vertices.map(v => `${(v.x - 0.5) * cellSize},${w - (v.y - 0.5) * cellSize}`).join(' ')}
          fill="rgba(59,130,246,0.15)"
          stroke="#3b82f6"
          strokeWidth="2"
        />
      )}
      
      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={(p.x - 0.5) * cellSize} cy={w - (p.y - 0.5) * cellSize} r="5" fill="#f97316" />
          {p.label && (
            <text x={(p.x - 0.5) * cellSize + 8} y={w - (p.y - 0.5) * cellSize - 8}
              fill="white" fontSize="12" fontWeight="bold">{p.label}</text>
          )}
        </g>
      ))}
      
      {/* Highlight */}
      {highlight && (
        <circle cx={(highlight.x - 0.5) * cellSize} cy={w - (highlight.y - 0.5) * cellSize}
          r="8" fill="none" stroke="#22c55e" strokeWidth="3">
          <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  )
}

/* ─── Score Screen ─────────────────────────────────── */
function ScoreScreen({ score, total, onRestart, onBack }) {
  const pct = Math.round((score / total) * 100)
  const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '📐' : '💪'
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="text-6xl mb-4">{emoji}</span>
      <h2 className="text-2xl font-bold mb-2">Partie terminée !</h2>
      <p className="text-4xl font-extrabold text-primary mb-2">{score}/{total}</p>
      <p className="text-gray-400 mb-6">{pct}% de réussite</p>
      <div className="flex gap-3">
        <button onClick={onRestart} className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-bold">
          <RotateCcw className="w-4 h-4" /> Rejouer
        </button>
        <button onClick={onBack} className="px-6 py-3 bg-gray-700 text-white rounded-xl font-bold">Retour</button>
      </div>
    </div>
  )
}

/* ─── Main Component ───────────────────────────────── */
export default function GeoBuilder({ onBack }) {
  const [questions, setQuestions] = useState(() => generateRound(8))
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [selected, setSelected] = useState(null)
  const [placedPoint, setPlacedPoint] = useState(null)
  const [done, setDone] = useState(false)

  const q = questions[current]

  const handleRestart = useCallback(() => {
    setQuestions(generateRound(8))
    setCurrent(0)
    setScore(0)
    setFeedback(null)
    setSelected(null)
    setPlacedPoint(null)
    setDone(false)
  }, [])

  const advance = useCallback(() => {
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setDone(true)
      } else {
        setCurrent(c => c + 1)
        setFeedback(null)
        setSelected(null)
        setPlacedPoint(null)
      }
    }, 1200)
  }, [current, questions.length])

  const handleCellClick = useCallback((x, y) => {
    if (feedback || q.type !== 'place-point') return
    setPlacedPoint({ x, y, label: q.label })
    const correct = checkPlacement(q, x, y)
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) setScore(s => s + 1)
    advance()
  }, [feedback, q, advance])

  const handleChoice = useCallback((choice) => {
    if (feedback) return
    setSelected(choice.text)
    setFeedback(choice.correct ? 'correct' : 'wrong')
    if (choice.correct) setScore(s => s + 1)
    advance()
  }, [feedback, advance])

  const handlePerimeterInput = useCallback((value) => {
    if (feedback) return
    const correct = Math.abs(Number(value) - q.answer) < 0.2
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) setScore(s => s + 1)
    advance()
  }, [feedback, q, advance])

  if (done) {
    return (
      <div className="min-h-screen p-4">
        <ScoreScreen score={score} total={questions.length} onRestart={handleRestart} onBack={onBack} />
      </div>
    )
  }

  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="min-h-screen p-4 pb-8">
      <header className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">📐 Géo-Builder</h1>
          <p className="text-xs text-gray-400">Question {current + 1}/{questions.length}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-teal-400">{score}</span>
          <span className="text-xs text-gray-400"> pts</span>
        </div>
      </header>

      <div className="w-full h-2 bg-gray-700 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-teal-400 to-green-500 transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-lg mx-auto">
        <p className="text-center font-bold text-lg mb-4 whitespace-pre-line">{q.prompt}</p>

        {/* Grid for point placement */}
        {q.type === 'place-point' && (
          <GridSVG
            size={9}
            points={placedPoint ? [placedPoint] : []}
            onCellClick={handleCellClick}
            highlight={feedback === 'wrong' ? { x: q.targetX, y: q.targetY } : null}
          />
        )}

        {/* Grid for perimeter rect */}
        {q.type === 'perimeter-rect' && (
          <>
            <GridSVG size={9} vertices={q.vertices} />
            <div className="grid grid-cols-2 gap-3 mt-4">
              {q.choices.map((choice, i) => (
                <button key={i} onClick={() => handleChoice(choice)} disabled={!!feedback}
                  className={`p-4 rounded-xl font-bold text-lg transition-all ${
                    selected === choice.text
                      ? choice.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      : feedback && choice.correct ? 'bg-green-500/30 text-green-300'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}>
                  {choice.text}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Perimeter triangle - input */}
        {q.type === 'perimeter-triangle' && (
          <>
            <GridSVG size={9} vertices={q.vertices} />
            <PerimeterInput onSubmit={handlePerimeterInput} disabled={!!feedback} unit={q.unit} />
          </>
        )}

        {feedback && (
          <div className={`text-center py-2 px-4 rounded-xl mt-4 font-bold ${
            feedback === 'correct' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {feedback === 'correct' ? '✅ Bravo !' : `❌ Réponse : ${q.answer}${q.unit ? ` ${q.unit}` : ''}`}
            {feedback === 'wrong' && q.hint && <p className="text-sm mt-1 opacity-80">{q.hint}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function PerimeterInput({ onSubmit, disabled, unit }) {
  const [value, setValue] = useState('')
  return (
    <div className="flex gap-2 mt-4">
      <input
        type="number" step="0.1" value={value} onChange={e => setValue(e.target.value)}
        disabled={disabled}
        className="flex-1 p-3 rounded-xl bg-white/10 text-white text-center text-lg font-bold"
        placeholder="Périmètre ?"
      />
      <button onClick={() => onSubmit(value)} disabled={disabled || !value}
        className="px-4 py-3 bg-teal-500 text-white font-bold rounded-xl disabled:opacity-50">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
