import { useState, useCallback, useRef } from 'react'
import { generateQuestion, checkAnswer, checkPlacement, simplify, getLevelConfig } from './engine'

/* ─── Demi-droite graduée SVG ─── */
function NumberLine({ maxVal, denom, highlightValue, interactive, onClickLine, showPoint }) {
  const width = 340
  const height = 80
  const padL = 30
  const padR = 20
  const lineY = 45
  const usable = width - padL - padR
  const totalTicks = maxVal * denom

  const xFor = (val) => padL + (val / maxVal) * usable

  const handleClick = (e) => {
    if (!interactive) return
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
    const x = clientX - rect.left
    const val = ((x - padL) / usable) * maxVal
    const clamped = Math.max(0, Math.min(maxVal, val))
    onClickLine?.(clamped)
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto select-none"
      onClick={handleClick}
      onTouchEnd={handleClick}
      style={{ cursor: interactive ? 'crosshair' : 'default' }}
    >
      {/* Axe principal */}
      <line x1={padL} y1={lineY} x2={width - padR} y2={lineY} stroke="#94a3b8" strokeWidth="2" />
      {/* Flèche */}
      <polygon points={`${width - padR},${lineY} ${width - padR - 8},${lineY - 5} ${width - padR - 8},${lineY + 5}`} fill="#94a3b8" />

      {/* Graduations */}
      {Array.from({ length: totalTicks + 1 }, (_, i) => {
        const val = i / denom
        if (val > maxVal) return null
        const x = xFor(val)
        const isMajor = i % denom === 0
        const tickH = isMajor ? 14 : 8
        return (
          <g key={i}>
            <line
              x1={x} y1={lineY - tickH} x2={x} y2={lineY + tickH}
              stroke={isMajor ? '#e2e8f0' : '#475569'}
              strokeWidth={isMajor ? 2 : 1}
            />
            {isMajor && (
              <text x={x} y={lineY + 28} textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
                {Math.round(val)}
              </text>
            )}
          </g>
        )
      })}

      {/* Point à deviner (mode lire) */}
      {showPoint && highlightValue != null && (
        <>
          <circle cx={xFor(highlightValue)} cy={lineY} r="7" fill="#6366f1" stroke="#fff" strokeWidth="2" />
          <text x={xFor(highlightValue)} y={lineY - 16} textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="bold">
            ?
          </text>
        </>
      )}
    </svg>
  )
}

/* ─── Sélecteur de niveau ─── */
function LevelPicker({ level, onPick }) {
  return (
    <div className="flex gap-2 justify-center mb-6">
      {[1, 2, 3].map(l => (
        <button
          key={l}
          onClick={() => onPick(l)}
          className={`px-4 py-2 rounded-full text-sm font-bold transition ${
            level === l ? 'bg-cyan-500 text-white' : 'bg-surface text-slate-400'
          }`}
        >
          {getLevelConfig(l).label}
        </button>
      ))}
    </div>
  )
}

/* ─── Composant principal ─── */
export default function ReperageFractions({ onBack }) {
  const [level, setLevel] = useState(1)
  const [mode, setMode] = useState('lire') // lire | placer
  const [question, setQuestion] = useState(() => generateQuestion(1))
  const [answer, setAnswer] = useState({ num: '', denom: '' })
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [placedValue, setPlacedValue] = useState(null)

  const next = useCallback((lvl = level, md = mode) => {
    setQuestion(generateQuestion(lvl))
    setAnswer({ num: '', denom: '' })
    setFeedback(null)
    setPlacedValue(null)
  }, [level, mode])

  const changeLevel = (l) => {
    setLevel(l)
    next(l, mode)
  }

  const changeMode = (m) => {
    setMode(m)
    next(level, m)
  }

  /* Mode LIRE : l'élève donne la fraction */
  const checkLire = useCallback(() => {
    const aNum = parseInt(answer.num)
    const aDenom = parseInt(answer.denom)
    if (checkAnswer(question.num, question.denom, aNum, aDenom)) {
      setFeedback({ ok: true, msg: '✅ Bravo !' })
      setScore(s => s + 1)
    } else {
      const s = simplify(question.num, question.denom)
      const display = s.denom === 1 ? `${s.num}` : `${s.num}/${s.denom}`
      setFeedback({ ok: false, msg: `❌ C'était ${question.num}/${question.denom}${s.num !== question.num ? ` = ${display}` : ''}` })
    }
    setTotal(t => t + 1)
  }, [answer, question])

  /* Mode PLACER : l'élève clique sur la droite */
  const handlePlace = useCallback((val) => {
    if (feedback) return // déjà répondu
    setPlacedValue(val)
    if (checkPlacement(question.value, val)) {
      setFeedback({ ok: true, msg: '✅ Bien placé !' })
      setScore(s => s + 1)
    } else {
      setFeedback({ ok: false, msg: `❌ Pas tout à fait… La bonne position était ${question.num}/${question.denom}` })
    }
    setTotal(t => t + 1)
  }, [feedback, question])

  const s = simplify(question.num, question.denom)

  return (
    <div className="min-h-screen p-4 pb-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-cyan-400 font-medium">← Retour</button>
          <span className="text-sm font-bold text-cyan-400">{score}/{total}</span>
        </div>

        <h1 className="text-2xl font-extrabold text-center mb-2">📏 Repérage Fractions</h1>
        <p className="text-sm text-slate-400 text-center mb-4">Place ou lis des fractions sur la demi-droite graduée</p>

        {/* Mode toggle */}
        <div className="flex gap-2 justify-center mb-4">
          <button
            onClick={() => changeMode('lire')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${mode === 'lire' ? 'bg-cyan-500 text-white' : 'bg-surface text-slate-400'}`}
          >
            👁️ Lire
          </button>
          <button
            onClick={() => changeMode('placer')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${mode === 'placer' ? 'bg-cyan-500 text-white' : 'bg-surface text-slate-400'}`}
          >
            📍 Placer
          </button>
        </div>

        <LevelPicker level={level} onPick={changeLevel} />

        {/* Demi-droite */}
        <div className="bg-surface rounded-2xl p-4 mb-4">
          {mode === 'lire' && (
            <>
              <p className="text-sm text-slate-400 text-center mb-3">
                Quelle fraction correspond au point <span className="text-indigo-400 font-bold">?</span> sur la demi-droite ?
              </p>
              <p className="text-xs text-slate-500 text-center mb-2">
                La demi-droite est graduée en <span className="font-bold text-white">1/{question.denom}</span>
              </p>
              <NumberLine
                maxVal={question.maxVal}
                denom={question.denom}
                highlightValue={question.value}
                showPoint
                interactive={false}
              />
            </>
          )}

          {mode === 'placer' && (
            <>
              <p className="text-sm text-slate-400 text-center mb-3">
                Place le point <span className="text-cyan-400 font-bold">{question.num}/{question.denom}</span> sur la demi-droite
              </p>
              <p className="text-xs text-slate-500 text-center mb-2">
                Graduée en <span className="font-bold text-white">1/{question.denom}</span> — Clique pour placer
              </p>
              <div className="relative">
                <NumberLine
                  maxVal={question.maxVal}
                  denom={question.denom}
                  highlightValue={feedback ? question.value : null}
                  showPoint={!!feedback}
                  interactive={!feedback}
                  onClickLine={handlePlace}
                />
                {/* Point placé par l'élève */}
                {placedValue != null && (
                  <div
                    className="absolute w-4 h-4 rounded-full border-2 border-white"
                    style={{
                      backgroundColor: feedback?.ok ? '#10b981' : '#ef4444',
                      left: `${(30 + (placedValue / question.maxVal) * (340 - 50)) / 340 * 100}%`,
                      top: '42px',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Zone de réponse (mode lire) */}
        {mode === 'lire' && (
          <div className="bg-surface rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <input
                type="number"
                inputMode="numeric"
                value={answer.num}
                onChange={e => setAnswer(a => ({ ...a, num: e.target.value }))}
                className="w-16 text-center text-2xl font-bold bg-slate-800 border-2 border-cyan-500/30 rounded-lg p-2 text-white"
                placeholder="?"
                disabled={!!feedback}
              />
              <span className="text-2xl text-slate-400 font-bold">/</span>
              <input
                type="number"
                inputMode="numeric"
                value={answer.denom}
                onChange={e => setAnswer(a => ({ ...a, denom: e.target.value }))}
                className="w-16 text-center text-2xl font-bold bg-slate-800 border-2 border-cyan-500/30 rounded-lg p-2 text-white"
                placeholder="?"
                disabled={!!feedback}
              />
            </div>

            {!feedback ? (
              <button
                onClick={checkLire}
                disabled={!answer.num || !answer.denom}
                className="w-full py-3 bg-cyan-500 text-white font-bold rounded-xl disabled:opacity-40 active:scale-[0.98] transition-transform"
              >
                Vérifier
              </button>
            ) : (
              <>
                <p className={`text-center font-bold mb-3 ${feedback.ok ? 'text-emerald-400' : 'text-red-400'}`}>{feedback.msg}</p>
                {!feedback.ok && (
                  <p className="text-xs text-slate-500 text-center mb-2">
                    💡 Il y a {question.num} graduation{question.num > 1 ? 's' : ''} de 1/{question.denom} depuis 0
                  </p>
                )}
                <button onClick={() => next()} className="w-full py-3 bg-cyan-500 text-white font-bold rounded-xl active:scale-[0.98] transition-transform">
                  Suivant →
                </button>
              </>
            )}
          </div>
        )}

        {/* Feedback (mode placer) */}
        {mode === 'placer' && feedback && (
          <div className="bg-surface rounded-2xl p-4 mb-4">
            <p className={`text-center font-bold mb-3 ${feedback.ok ? 'text-emerald-400' : 'text-red-400'}`}>{feedback.msg}</p>
            {!feedback.ok && (
              <p className="text-xs text-slate-500 text-center mb-2">
                💡 {question.num}/{question.denom} = {question.num} × (1/{question.denom}) depuis l'origine
              </p>
            )}
            <button onClick={() => next()} className="w-full py-3 bg-cyan-500 text-white font-bold rounded-xl active:scale-[0.98] transition-transform">
              Suivant →
            </button>
          </div>
        )}

        {/* Aide mémoire */}
        <details className="bg-surface rounded-2xl p-4 text-sm text-slate-400">
          <summary className="cursor-pointer font-bold text-slate-300">💡 Comment lire une fraction sur la droite ?</summary>
          <div className="mt-3 space-y-2">
            <p>1. Regarde l'<strong className="text-white">unité</strong> entre 0 et 1 : elle est divisée en <strong className="text-white">parts égales</strong>.</p>
            <p>2. Le <strong className="text-white">dénominateur</strong> = nombre de parts entre 0 et 1.</p>
            <p>3. Le <strong className="text-white">numérateur</strong> = nombre de graduations depuis 0 jusqu'au point.</p>
            <p>Exemple : si l'unité est divisée en 4 et le point est à la 3e graduation → <strong className="text-cyan-400">3/4</strong></p>
          </div>
        </details>
      </div>
    </div>
  )
}
