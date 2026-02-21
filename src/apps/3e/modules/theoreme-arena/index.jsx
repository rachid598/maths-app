import { useState, useCallback } from 'react'
import { ArrowLeft, RotateCcw, ChevronDown, ChevronRight, Trophy, Flame } from 'lucide-react'
import { generateRound } from './engine'

/* ─── Step-by-step correction ──────────────────────── */
function CorrectionSteps({ steps }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-accent hover:underline mx-auto">
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        {open ? 'Masquer' : 'Voir'} la correction pas-à-pas
      </button>
      {open && (
        <div className="mt-3 space-y-2 animate-slide-up">
          {steps.map((step, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-3 border-l-4 border-accent">
              <p className="text-xs font-bold text-accent mb-1">Étape {i + 1} — {step.label}</p>
              <p className="text-sm text-slate-200 whitespace-pre-line">{step.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ScoreScreen({ score, total, streak, onRestart, onBack }) {
  const pct = Math.round((score / total) * 100)
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="text-6xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '⚔️' : '💪'}</span>
      <h2 className="text-2xl font-bold mb-2">Arena terminée !</h2>
      <p className="text-4xl font-extrabold text-accent mb-1">{score}/{total}</p>
      {streak > 1 && <p className="text-sm text-orange-400 flex items-center gap-1"><Flame className="w-4 h-4" /> Meilleur streak : {streak}</p>}
      <div className="flex gap-3 mt-6">
        <button onClick={onRestart} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-bold">
          <RotateCcw className="w-4 h-4" /> Rejouer
        </button>
        <button onClick={onBack} className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold">Retour</button>
      </div>
    </div>
  )
}

export default function TheoremeArena({ onBack }) {
  const [questions, setQuestions] = useState(() => generateRound(8))
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [inputVal, setInputVal] = useState('')
  const [done, setDone] = useState(false)

  const q = questions[current]

  const handleRestart = useCallback(() => {
    setQuestions(generateRound(8))
    setCurrent(0); setScore(0); setStreak(0); setBestStreak(0)
    setFeedback(null); setInputVal(''); setDone(false)
  }, [])

  const advance = useCallback((correct) => {
    if (correct) {
      setScore(s => s + 1)
      setStreak(s => { const n = s + 1; setBestStreak(b => Math.max(b, n)); return n })
    } else {
      setStreak(0)
    }
    setTimeout(() => {
      if (current + 1 >= questions.length) setDone(true)
      else { setCurrent(c => c + 1); setFeedback(null); setInputVal('') }
    }, 2500) // More time to read correction
  }, [current, questions.length])

  const handleSubmit = useCallback(() => {
    if (feedback) return
    let correct
    if (q.isYesNo) {
      correct = inputVal.toLowerCase() === q.answer
    } else {
      correct = Math.abs(Number(inputVal) - q.answer) < 0.1
    }
    setFeedback(correct ? 'correct' : 'wrong')
    advance(correct)
  }, [feedback, inputVal, q, advance])

  const handleYesNo = useCallback((ans) => {
    if (feedback) return
    setInputVal(ans)
    const correct = ans === q.answer
    setFeedback(correct ? 'correct' : 'wrong')
    advance(correct)
  }, [feedback, q, advance])

  if (done) return <div className="min-h-screen p-4"><ScoreScreen score={score} total={questions.length} streak={bestStreak} onRestart={handleRestart} onBack={onBack} /></div>

  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="min-h-screen p-4 pb-8">
      <header className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-surface-light hover:bg-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">⚔️ Théorème Arena</h1>
          <p className="text-xs text-slate-400">Question {current + 1}/{questions.length}</p>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <span className="flex items-center gap-1 text-orange-400 text-sm font-bold">
              <Flame className="w-4 h-4" /> {streak}
            </span>
          )}
          <span className="text-lg font-bold text-accent">{score}</span>
        </div>
      </header>

      <div className="w-full h-2 bg-slate-700 rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
      </div>

      {/* Category badge */}
      <div className="flex justify-center mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          q.category === 'Pythagore' ? 'bg-emerald-500/20 text-emerald-400' :
          q.category === 'Thalès' ? 'bg-blue-500/20 text-blue-400' :
          'bg-purple-500/20 text-purple-400'
        }`}>
          {q.category}
        </span>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="bg-slate-800/50 rounded-2xl p-5 mb-4 border border-slate-700">
          <p className="font-bold text-base whitespace-pre-line leading-relaxed">{q.prompt}</p>
        </div>

        {/* Yes/No for reciproque */}
        {q.isYesNo && !feedback && (
          <div className="flex gap-3">
            <button onClick={() => handleYesNo('oui')}
              className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-lg">
              ✅ Oui
            </button>
            <button onClick={() => handleYesNo('non')}
              className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-lg">
              ❌ Non
            </button>
          </div>
        )}

        {/* Numeric input */}
        {!q.isYesNo && !feedback && (
          <div className="flex gap-2">
            <input type="number" value={inputVal} onChange={e => setInputVal(e.target.value)}
              className="flex-1 p-4 rounded-xl bg-slate-800 text-white text-center text-xl font-bold border border-slate-600 focus:border-accent outline-none"
              placeholder={`Réponse en ${q.unit}`}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
            <button onClick={handleSubmit} disabled={!inputVal}
              className="px-6 py-4 bg-accent text-white font-bold rounded-xl disabled:opacity-50 text-lg">
              OK
            </button>
          </div>
        )}

        {/* Feedback + correction */}
        {feedback && (
          <div className={`rounded-xl mt-4 p-4 ${
            feedback === 'correct' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
          }`}>
            <p className="text-center font-bold text-lg">
              {feedback === 'correct' ? '✅ Correct !' : `❌ Réponse : ${q.answer}${q.unit ? ' ' + q.unit : ''}`}
            </p>
            {feedback === 'wrong' && q.steps && <CorrectionSteps steps={q.steps} />}
          </div>
        )}
      </div>
    </div>
  )
}
