import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }

function generateFraction(forceReducible = false) {
  if (forceReducible) {
    // Generate a fraction that is always reducible (gcd > 1)
    const k = [2, 3, 4, 5][Math.floor(Math.random() * 4)] // common factor
    const maxB = Math.floor(12 / k)
    const b = Math.max(2, Math.floor(Math.random() * maxB) + 1)
    let a = Math.floor(Math.random() * (b - 1)) + 1
    // Ensure gcd(a, b) === 1 for proper irreducible base
    while (gcd(a, b) !== 1) a = Math.floor(Math.random() * (b - 1)) + 1
    return { num: k * a, denom: k * b }
  }
  const denom = [2, 3, 4, 5, 6, 8, 10, 12][Math.floor(Math.random() * 8)]
  const num = Math.floor(Math.random() * (denom - 1)) + 1
  return { num, denom }
}

function PieChart({ num, denom, interactive, onToggle, size = 120 }) {
  const slices = []
  const cx = size / 2, cy = size / 2, r = size / 2 - 4
  for (let i = 0; i < denom; i++) {
    const a1 = (2 * Math.PI * i) / denom - Math.PI / 2
    const a2 = (2 * Math.PI * (i + 1)) / denom - Math.PI / 2
    const large = a2 - a1 > Math.PI ? 1 : 0
    const d = `M${cx},${cy} L${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} A${r},${r} 0 ${large} 1 ${cx + r * Math.cos(a2)},${cy + r * Math.sin(a2)} Z`
    const filled = i < num
    slices.push(
      <path
        key={i}
        d={d}
        fill={filled ? '#6366f1' : '#e2e8f0'}
        stroke="#fff"
        strokeWidth="2"
        onClick={interactive ? () => onToggle?.(i) : undefined}
        className={interactive ? 'cursor-pointer hover:opacity-80' : ''}
      />
    )
  }
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{slices}</svg>
}

function Bar({ num, denom, size = 200 }) {
  const w = size / denom
  return (
    <div className="flex border-2 border-indigo-300 rounded-lg overflow-hidden" style={{ width: size }}>
      {Array.from({ length: denom }, (_, i) => (
        <div
          key={i}
          className={`h-8 ${i < num ? 'bg-indigo-500' : 'bg-slate-200'} ${i > 0 ? 'border-l border-white' : ''}`}
          style={{ width: w }}
        />
      ))}
    </div>
  )
}

export default function FractionsVisuelles({ player, onBadgeCheck }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState('visualiser') // visualiser | simplifier
  const [frac, setFrac] = useState(generateFraction)
  const [answer, setAnswer] = useState({ num: '', denom: '' })
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)

  const checkSimplification = useCallback(() => {
    const g = gcd(frac.num, frac.denom)
    const sNum = frac.num / g
    const sDenom = frac.denom / g
    const aNum = parseInt(answer.num)
    const aDenom = parseInt(answer.denom)
    if (aNum === sNum && aDenom === sDenom) {
      setFeedback('✅ Bravo ! Fraction irréductible trouvée !')
      setScore(s => {
        const newScore = s + 1
        if (onBadgeCheck) onBadgeCheck('fractions-visuelles', { score: newScore, total: total + 1 })
        return newScore
      })
    } else {
      setFeedback(`❌ La réponse est ${sNum}/${sDenom}`)
    }
    setTotal(t => t + 1)
  }, [frac, answer])

  const next = () => {
    setFrac(generateFraction(mode === 'simplifier'))
    setAnswer({ num: '', denom: '' })
    setFeedback(null)
  }

  const g = gcd(frac.num, frac.denom)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="text-indigo-600 dark:text-indigo-400 font-medium">
            ← Retour
          </button>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {score}/{total}
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-center mb-2 dark:text-white">🥧 Fractions Visuelles</h1>

        {/* Mode toggle */}
        <div className="flex gap-2 justify-center mb-6">
          <button
            onClick={() => { setMode('visualiser'); next() }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${mode === 'visualiser' ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            👁️ Visualiser
          </button>
          <button
            onClick={() => { setMode('simplifier'); setFrac(generateFraction(true)); setAnswer({ num: '', denom: '' }); setFeedback(null) }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${mode === 'simplifier' ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            ✂️ Simplifier
          </button>
        </div>

        {/* Fraction display */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-4">
          <div className="text-center mb-4">
            <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              {frac.num}<span className="text-gray-400 mx-1">/</span>{frac.denom}
            </span>
          </div>

          <div className="flex justify-center gap-8 items-center">
            <div className="text-center">
              <PieChart num={frac.num} denom={frac.denom} size={120} />
              <p className="text-xs text-gray-400 mt-2">Camembert</p>
            </div>
            <div className="text-center">
              <Bar num={frac.num} denom={frac.denom} size={180} />
              <p className="text-xs text-gray-400 mt-2">Barre</p>
            </div>
          </div>
        </div>

        {mode === 'simplifier' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">
              Simplifie cette fraction (forme irréductible) :
            </p>
            {g > 1 && (
              <p className="text-xs text-amber-500 text-center mb-3">
                💡 Indice : le numérateur et le dénominateur sont divisibles par {g}
              </p>
            )}
            <div className="flex items-center justify-center gap-2 mb-4">
              <input
                type="number"
                value={answer.num}
                onChange={e => setAnswer(a => ({ ...a, num: e.target.value }))}
                className="w-16 text-center text-2xl font-bold border-2 border-indigo-200 rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="?"
              />
              <span className="text-2xl text-gray-400 font-bold">/</span>
              <input
                type="number"
                value={answer.denom}
                onChange={e => setAnswer(a => ({ ...a, denom: e.target.value }))}
                className="w-16 text-center text-2xl font-bold border-2 border-indigo-200 rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="?"
              />
            </div>

            {!feedback ? (
              <button
                onClick={checkSimplification}
                disabled={!answer.num || !answer.denom}
                className="w-full py-3 bg-indigo-500 text-white font-bold rounded-xl disabled:opacity-40"
              >
                Vérifier
              </button>
            ) : (
              <>
                <p className="text-center font-bold mb-3">{feedback}</p>
                <button onClick={next} className="w-full py-3 bg-indigo-500 text-white font-bold rounded-xl">
                  Suivant →
                </button>
              </>
            )}
          </div>
        )}

        {mode === 'visualiser' && (
          <div className="text-center">
            <button onClick={next} className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl">
              Autre fraction →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
