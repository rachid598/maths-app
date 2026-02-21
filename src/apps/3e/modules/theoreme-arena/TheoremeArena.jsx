import { useState, useCallback } from 'react'

function generatePythagore() {
  const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15]]
  const [a, b, c] = triples[Math.floor(Math.random() * triples.length)]
  const hideIdx = Math.floor(Math.random() * 3) // 0=a, 1=b, 2=c
  return { a, b, c, hideIdx, answer: [a, b, c][hideIdx] }
}

function generateThales() {
  const k = [1.5, 2, 2.5, 3, 4][Math.floor(Math.random() * 5)]
  const ab = Math.floor(Math.random() * 6) + 2
  const ac = Math.floor(Math.random() * 6) + 2
  const ad = Math.round(ab * k * 10) / 10
  const ae = Math.round(ac * k * 10) / 10
  const bc = Math.floor(Math.random() * 5) + 2
  const de = Math.round(bc * k * 10) / 10
  // Hide one of: ad, ae, de
  const hideOptions = [
    { label: 'AD', answer: ad },
    { label: 'AE', answer: ae },
    { label: 'DE', answer: de },
  ]
  const hide = hideOptions[Math.floor(Math.random() * 3)]
  return { ab, ac, ad, ae, bc, de, k, hide }
}

function TriangleSVG({ a, b, c, hideIdx }) {
  // Right triangle
  const scale = 8
  const bLen = Math.min(b, 15) * scale
  const aLen = Math.min(a, 15) * scale
  const pts = `10,${aLen + 10} ${bLen + 10},${aLen + 10} 10,10`
  const labels = [
    { text: hideIdx === 0 ? '?' : a, x: 0, y: aLen / 2 + 10, anchor: 'end' },
    { text: hideIdx === 1 ? '?' : b, x: bLen / 2 + 10, y: aLen + 28, anchor: 'middle' },
    { text: hideIdx === 2 ? '?' : c, x: bLen / 2 + 16, y: aLen / 2 + 2, anchor: 'start' },
  ]
  return (
    <svg width={bLen + 30} height={aLen + 40} className="mx-auto">
      <polygon points={pts} fill="none" stroke="#6366f1" strokeWidth="2.5" />
      {/* Right angle marker */}
      <rect x={10} y={aLen - 4} width={14} height={14} fill="none" stroke="#6366f1" strokeWidth="1.5" />
      {labels.map((l, i) => (
        <text key={i} x={l.x + 8} y={l.y} textAnchor={l.anchor} fill="#e2e8f0" fontSize="14" fontWeight="bold">
          {l.text}
        </text>
      ))}
    </svg>
  )
}

function ThalesSVG({ data }) {
  return (
    <svg width="200" height="180" viewBox="0 0 200 180" className="mx-auto">
      {/* Triangle ABD with parallel BC//DE */}
      <line x1="100" y1="10" x2="30" y2="170" stroke="#6366f1" strokeWidth="2" />
      <line x1="100" y1="10" x2="170" y2="170" stroke="#6366f1" strokeWidth="2" />
      {/* BC line */}
      <line x1="58" y1="100" x2="142" y2="100" stroke="#10b981" strokeWidth="2" />
      {/* DE line */}
      <line x1="30" y1="170" x2="170" y2="170" stroke="#f59e0b" strokeWidth="2" />
      {/* Labels */}
      <text x="100" y="8" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">A</text>
      <text x="48" y="98" textAnchor="end" fill="#10b981" fontSize="11">B</text>
      <text x="152" y="98" textAnchor="start" fill="#10b981" fontSize="11">C</text>
      <text x="22" y="175" textAnchor="end" fill="#f59e0b" fontSize="11">D</text>
      <text x="178" y="175" textAnchor="start" fill="#f59e0b" fontSize="11">E</text>
      {/* Values */}
      <text x="68" y="55" textAnchor="end" fill="#94a3b8" fontSize="10">AB={data.ab}</text>
      <text x="100" y="115" textAnchor="middle" fill="#10b981" fontSize="10">BC={data.bc}</text>
      <text x="55" y="140" textAnchor="end" fill="#94a3b8" fontSize="10">
        AD={data.hide.label === 'AD' ? '?' : data.ad}
      </text>
      <text x="100" y="165" textAnchor="middle" fill="#f59e0b" fontSize="10">
        DE={data.hide.label === 'DE' ? '?' : data.de}
      </text>
    </svg>
  )
}

export default function TheoremeArena({ onBack }) {
  const [mode, setMode] = useState('pythagore')
  const [pyth, setPyth] = useState(generatePythagore)
  const [thales, setThales] = useState(generateThales)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)

  const check = useCallback(() => {
    const val = parseFloat(input)
    let expected
    if (mode === 'pythagore') {
      if (pyth.hideIdx === 2) {
        expected = Math.round(Math.sqrt(pyth.a ** 2 + pyth.b ** 2) * 10) / 10
      } else if (pyth.hideIdx === 0) {
        expected = Math.round(Math.sqrt(pyth.c ** 2 - pyth.b ** 2) * 10) / 10
      } else {
        expected = Math.round(Math.sqrt(pyth.c ** 2 - pyth.a ** 2) * 10) / 10
      }
    } else {
      expected = thales.hide.answer
    }
    if (Math.abs(val - expected) < 0.2) {
      setFeedback('✅ Bravo !')
      setScore(s => s + 1)
    } else {
      setFeedback(`❌ Réponse : ${expected}`)
    }
    setTotal(t => t + 1)
  }, [input, mode, pyth, thales])

  const next = () => {
    setPyth(generatePythagore())
    setThales(generateThales())
    setInput('')
    setFeedback(null)
  }

  return (
    <div className="min-h-screen p-4 pb-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-accent font-medium">← Retour</button>
          <span className="text-sm font-bold text-accent">{score}/{total}</span>
        </div>

        <h1 className="text-2xl font-extrabold text-center mb-2">🏟️ Théorème Arena</h1>

        <div className="flex gap-2 justify-center mb-6">
          <button
            onClick={() => { setMode('pythagore'); next() }}
            className={`px-4 py-2 rounded-full text-sm font-bold ${mode === 'pythagore' ? 'bg-purple-500 text-white' : 'bg-surface text-slate-400'}`}
          >
            📐 Pythagore
          </button>
          <button
            onClick={() => { setMode('thales'); next() }}
            className={`px-4 py-2 rounded-full text-sm font-bold ${mode === 'thales' ? 'bg-purple-500 text-white' : 'bg-surface text-slate-400'}`}
          >
            🔺 Thalès
          </button>
        </div>

        <div className="bg-surface rounded-2xl p-6 mb-4">
          {mode === 'pythagore' ? (
            <>
              <p className="text-center text-slate-400 text-sm mb-4">
                Trouve le côté manquant (triangle rectangle)
              </p>
              <TriangleSVG a={pyth.a} b={pyth.b} c={pyth.c} hideIdx={pyth.hideIdx} />
              <p className="text-xs text-slate-500 text-center mt-3">
                {pyth.hideIdx === 2
                  ? `c² = ${pyth.a}² + ${pyth.b}² = ${pyth.a ** 2 + pyth.b ** 2}`
                  : pyth.hideIdx === 0
                  ? `a² = ${pyth.c}² - ${pyth.b}² = ${pyth.c ** 2 - pyth.b ** 2}`
                  : `b² = ${pyth.c}² - ${pyth.a}² = ${pyth.c ** 2 - pyth.a ** 2}`
                }
              </p>
            </>
          ) : (
            <>
              <p className="text-center text-slate-400 text-sm mb-4">
                (BC) // (DE) — Trouve {thales.hide.label}
              </p>
              <ThalesSVG data={thales} />
              <p className="text-xs text-slate-500 text-center mt-3">
                AB/AD = BC/DE = AC/AE
              </p>
            </>
          )}

          <div className="flex gap-2 mt-4">
            <input
              type="number"
              step="0.1"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 text-center text-xl font-bold bg-slate-800 border-2 border-purple-500/30 rounded-xl p-3 text-white"
              placeholder="?"
            />
            {!feedback ? (
              <button onClick={check} disabled={!input}
                className="px-6 py-3 bg-purple-500 text-white font-bold rounded-xl disabled:opacity-40">OK</button>
            ) : (
              <button onClick={next} className="px-6 py-3 bg-purple-500 text-white font-bold rounded-xl">→</button>
            )}
          </div>
          {feedback && <p className="text-center font-bold mt-3">{feedback}</p>}
        </div>
      </div>
    </div>
  )
}
