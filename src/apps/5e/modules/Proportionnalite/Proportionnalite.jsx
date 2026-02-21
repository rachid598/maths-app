import { useState, useCallback } from 'react'

function generateProblem() {
  const coeff = [2, 3, 4, 5, 6, 7, 8][Math.floor(Math.random() * 7)]
  const a = Math.floor(Math.random() * 9) + 2
  const b = Math.floor(Math.random() * 9) + 2
  const c = Math.floor(Math.random() * 9) + 2
  // Row 1: a, b, c  |  Row 2: a*coeff, b*coeff, ?
  const hideIndex = Math.floor(Math.random() * 3) // which column to hide in row2
  const row1 = [a, b, c]
  const row2 = [a * coeff, b * coeff, c * coeff]
  return { row1, row2, hideIndex, coeff }
}

function generateCrossProblem() {
  const a = Math.floor(Math.random() * 10) + 2
  const b = Math.floor(Math.random() * 10) + 2
  const c = Math.floor(Math.random() * 10) + 2
  // a/b = c/x → x = b*c/a
  const x = (b * c) / a
  return { a, b, c, answer: Math.round(x * 100) / 100 }
}

export default function Proportionnalite({ onBack }) {
  const [mode, setMode] = useState('tableau') // tableau | produit
  const [problem, setProblem] = useState(generateProblem)
  const [crossProblem, setCrossProblem] = useState(generateCrossProblem)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)

  const checkTableau = useCallback(() => {
    const expected = problem.row2[problem.hideIndex]
    if (parseInt(input) === expected) {
      setFeedback('✅ Bravo !')
      setScore(s => s + 1)
    } else {
      setFeedback(`❌ La réponse était ${expected} (×${problem.coeff})`)
    }
    setTotal(t => t + 1)
  }, [input, problem])

  const checkCross = useCallback(() => {
    const val = parseFloat(input)
    if (Math.abs(val - crossProblem.answer) < 0.01) {
      setFeedback('✅ Exact !')
      setScore(s => s + 1)
    } else {
      setFeedback(`❌ La réponse était ${crossProblem.answer}`)
    }
    setTotal(t => t + 1)
  }, [input, crossProblem])

  const next = () => {
    setProblem(generateProblem())
    setCrossProblem(generateCrossProblem())
    setInput('')
    setFeedback(null)
  }

  return (
    <div className="min-h-screen p-4 pb-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-cyan-400 font-medium">← Retour</button>
          <span className="text-sm font-bold text-cyan-400">{score}/{total}</span>
        </div>

        <h1 className="text-2xl font-extrabold text-center mb-2">⚖️ Proportionnalité</h1>

        {/* Mode toggle */}
        <div className="flex gap-2 justify-center mb-6">
          <button
            onClick={() => { setMode('tableau'); next() }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${mode === 'tableau' ? 'bg-cyan-500 text-white' : 'bg-surface text-slate-400'}`}
          >
            📊 Tableau
          </button>
          <button
            onClick={() => { setMode('produit'); next() }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${mode === 'produit' ? 'bg-cyan-500 text-white' : 'bg-surface text-slate-400'}`}
          >
            ✖️ Produit en croix
          </button>
        </div>

        {mode === 'tableau' ? (
          <div className="bg-surface rounded-2xl p-6 mb-4">
            <p className="text-sm text-slate-400 mb-4 text-center">Complète le tableau de proportionnalité :</p>

            <div className="overflow-hidden rounded-xl border border-slate-700">
              <table className="w-full text-center">
                <tbody>
                  <tr className="bg-slate-700/50">
                    {problem.row1.map((v, i) => (
                      <td key={i} className="py-3 px-4 text-lg font-bold">{v}</td>
                    ))}
                  </tr>
                  <tr className="bg-surface-light">
                    {problem.row2.map((v, i) => (
                      <td key={i} className="py-3 px-4 text-lg font-bold">
                        {i === problem.hideIndex ? (
                          <span className="text-amber-400 text-2xl">?</span>
                        ) : v}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-500 text-center mt-2">
              Coefficient : ×?
            </p>

            <div className="mt-4 flex gap-2">
              <input
                type="number"
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 text-center text-xl font-bold bg-slate-800 border-2 border-cyan-500/30 rounded-xl p-3 text-white"
                placeholder="Ta réponse"
              />
              {!feedback ? (
                <button
                  onClick={checkTableau}
                  disabled={!input}
                  className="px-6 py-3 bg-cyan-500 text-white font-bold rounded-xl disabled:opacity-40"
                >
                  OK
                </button>
              ) : (
                <button onClick={next} className="px-6 py-3 bg-cyan-500 text-white font-bold rounded-xl">
                  →
                </button>
              )}
            </div>
            {feedback && <p className="text-center font-bold mt-3">{feedback}</p>}
          </div>
        ) : (
          <div className="bg-surface rounded-2xl p-6 mb-4">
            <p className="text-sm text-slate-400 mb-4 text-center">Trouve x avec le produit en croix :</p>

            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="bg-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{crossProblem.a}</p>
                <div className="border-t-2 border-cyan-400 my-2" />
                <p className="text-2xl font-bold">{crossProblem.b}</p>
              </div>
              <span className="text-2xl text-slate-400">=</span>
              <div className="bg-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{crossProblem.c}</p>
                <div className="border-t-2 border-cyan-400 my-2" />
                <p className="text-2xl font-bold text-amber-400">x</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center mb-3">
              {crossProblem.a} × x = {crossProblem.b} × {crossProblem.c} → x = ?
            </p>

            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 text-center text-xl font-bold bg-slate-800 border-2 border-cyan-500/30 rounded-xl p-3 text-white"
                placeholder="x = ?"
              />
              {!feedback ? (
                <button
                  onClick={checkCross}
                  disabled={!input}
                  className="px-6 py-3 bg-cyan-500 text-white font-bold rounded-xl disabled:opacity-40"
                >
                  OK
                </button>
              ) : (
                <button onClick={next} className="px-6 py-3 bg-cyan-500 text-white font-bold rounded-xl">
                  →
                </button>
              )}
            </div>
            {feedback && <p className="text-center font-bold mt-3">{feedback}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
