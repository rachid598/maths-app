import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateQuestion, checkAnswer, checkPlacement, simplify, getLevelConfig } from './engine'

/* ─── Demi-droite graduée SVG avec drag ─── */
function NumberLine({ maxVal, denom, highlightValue, interactive, onDragUpdate, onDragEnd, showPoint, placedValue, placedOk, dragValue, showCorrection, correctionValue }) {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(340)
  const dragging = useRef(false)

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth
        setWidth(Math.max(280, Math.min(w, 500)))
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const height = 90
  const padL = 35
  const padR = 25
  const lineY = 50
  const usable = width - padL - padR

  const xFor = (val) => padL + (val / maxVal) * usable

  const valFromX = (clientX) => {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return 0
    const rect = svg.getBoundingClientRect()
    const x = clientX - rect.left
    const rawVal = ((x - padL) / usable) * maxVal
    const snapped = Math.round(rawVal * denom) / denom
    return Math.max(0, Math.min(maxVal, snapped))
  }

  const handlePointerDown = (e) => {
    if (!interactive) return
    e.preventDefault()
    dragging.current = true
    const clientX = e.clientX
    const val = valFromX(clientX)
    onDragUpdate?.(val)
    // Capture pointer for smooth drag
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!interactive || !dragging.current) return
    e.preventDefault()
    const val = valFromX(e.clientX)
    onDragUpdate?.(val)
  }

  const handlePointerUp = (e) => {
    if (!dragging.current) return
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
    // Ne pas appeler onDragEnd ici — l'élève valide avec le bouton
  }

  const totalTicks = maxVal * denom

  return (
    <div ref={containerRef} className="w-full">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto select-none touch-none"
        onPointerDown={interactive ? handlePointerDown : undefined}
        onPointerMove={interactive ? handlePointerMove : undefined}
        onPointerUp={interactive ? handlePointerUp : undefined}
        style={{ cursor: interactive ? 'grab' : 'default' }}
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
          const tickH = isMajor ? 16 : 9
          return (
            <g key={i}>
              <line
                x1={x} y1={lineY - tickH} x2={x} y2={lineY + tickH}
                stroke={isMajor ? '#e2e8f0' : '#475569'}
                strokeWidth={isMajor ? 2 : 1}
              />
              {isMajor && (
                <text x={x} y={lineY + 32} textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="bold">
                  {Math.round(val)}
                </text>
              )}
            </g>
          )
        })}

        {/* Indicateur "X parts" sous 0-1 */}
        {maxVal >= 1 && (
          <>
            <line x1={xFor(0)} y1={lineY + 38} x2={xFor(1)} y2={lineY + 38} stroke="#6366f1" strokeWidth="1" strokeDasharray="3 2" />
            <text x={xFor(0.5)} y={lineY + 52} textAnchor="middle" fill="#818cf8" fontSize="10">
              {denom} parts
            </text>
          </>
        )}

        {/* Point à deviner (mode lire) */}
        {showPoint && highlightValue != null && (
          <>
            <line x1={xFor(highlightValue)} y1={lineY - 20} x2={xFor(highlightValue)} y2={lineY} stroke="#6366f1" strokeWidth="1" strokeDasharray="3 2" />
            <circle cx={xFor(highlightValue)} cy={lineY} r="8" fill="#6366f1" stroke="#fff" strokeWidth="2.5" />
            <text x={xFor(highlightValue)} y={lineY - 24} textAnchor="middle" fill="#a5b4fc" fontSize="12" fontWeight="bold">
              ?
            </text>
          </>
        )}

        {/* Point draggable (mode placer — en cours de drag) */}
        {dragValue != null && !placedOk && (
          <>
            {/* Ligne pointillée verticale */}
            <line x1={xFor(dragValue)} y1={lineY - 18} x2={xFor(dragValue)} y2={lineY} stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 2" />
            {/* Point cyan — pas de fraction affichée pour ne pas donner la réponse */}
            <circle cx={xFor(dragValue)} cy={lineY} r="10" fill="#06b6d4" stroke="#fff" strokeWidth="2.5" className="drop-shadow-lg" />
          </>
        )}

        {/* Point final après validation */}
        {placedValue != null && placedOk != null && (
          <circle
            cx={xFor(placedValue)}
            cy={lineY}
            r="8"
            fill={placedOk ? '#10b981' : '#ef4444'}
            stroke="#fff"
            strokeWidth="2.5"
          />
        )}

        {/* Point correction (bonne réponse) si faux */}
        {showCorrection && correctionValue != null && (
          <>
            <line x1={xFor(correctionValue)} y1={lineY - 18} x2={xFor(correctionValue)} y2={lineY} stroke="#6366f1" strokeWidth="1" strokeDasharray="3 2" />
            <circle cx={xFor(correctionValue)} cy={lineY} r="7" fill="#6366f1" stroke="#fff" strokeWidth="2" />
          </>
        )}
      </svg>
    </div>
  )
}

/* ─── Sélecteur de niveau ─── */
function LevelPicker({ level, onPick }) {
  return (
    <div className="flex gap-2 justify-center mb-5">
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
export default function ReperageFractions() {
  const navigate = useNavigate()
  const onBack = () => navigate('/5e')
  const [level, setLevel] = useState(1)
  const [mode, setMode] = useState('lire')
  const [question, setQuestion] = useState(() => generateQuestion(1))
  const [answer, setAnswer] = useState({ num: '', denom: '' })
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [placedValue, setPlacedValue] = useState(null)
  const [dragValue, setDragValue] = useState(null)

  const next = useCallback((lvl) => {
    const l = lvl ?? level
    setQuestion(generateQuestion(l))
    setAnswer({ num: '', denom: '' })
    setFeedback(null)
    setPlacedValue(null)
    setDragValue(null)
  }, [level])

  const changeLevel = (l) => {
    setLevel(l)
    next(l)
  }

  const changeMode = (m) => {
    setMode(m)
    next()
  }

  /* Mode LIRE */
  const checkLire = useCallback(() => {
    const aNum = parseInt(answer.num)
    const aDenom = parseInt(answer.denom)
    if (isNaN(aNum) || isNaN(aDenom) || aDenom === 0) {
      setFeedback({ ok: false, msg: '❌ Vérifie ta réponse (dénominateur ≠ 0)' })
      setTotal(t => t + 1)
      return
    }
    if (checkAnswer(question.num, question.denom, aNum, aDenom)) {
      setFeedback({ ok: true, msg: '✅ Bravo !' })
      setScore(s => s + 1)
    } else {
      const s = simplify(question.num, question.denom)
      const display = s.denom === 1 ? `${s.num}` : `${s.num}/${s.denom}`
      setFeedback({
        ok: false,
        msg: `❌ C'était ${question.num}/${question.denom}${s.num !== question.num ? ` = ${display}` : ''}`
      })
    }
    setTotal(t => t + 1)
  }, [answer, question])

  /* Mode PLACER — drag update (preview) */
  const handleDragUpdate = useCallback((val) => {
    if (feedback) return
    setDragValue(val)
  }, [feedback])

  /* Mode PLACER — validation par bouton */
  const validatePlacement = useCallback(() => {
    if (dragValue == null || feedback) return
    setPlacedValue(dragValue)
    if (checkPlacement(question.value, dragValue)) {
      setFeedback({ ok: true, msg: '✅ Bien placé !' })
      setScore(s => s + 1)
    } else {
      setFeedback({ ok: false, msg: `❌ Pas tout à fait…` })
    }
    setTotal(t => t + 1)
  }, [dragValue, feedback, question])

  return (
    <div className="min-h-screen p-4 pb-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-cyan-400 font-medium text-base min-h-[44px] min-w-[44px] flex items-center">← Retour</button>
          <span className="text-sm font-bold text-cyan-400">{score}/{total}</span>
        </div>

        <h1 className="text-2xl font-extrabold text-center mb-1">📏 Repérage Fractions</h1>
        <p className="text-sm text-slate-400 text-center mb-4">Place ou lis des fractions sur la demi-droite graduée</p>

        {/* Mode toggle */}
        <div className="flex gap-2 justify-center mb-4">
          <button
            onClick={() => changeMode('lire')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition min-h-[44px] ${mode === 'lire' ? 'bg-cyan-500 text-white' : 'bg-surface text-slate-400'}`}
          >
            👁️ Lire
          </button>
          <button
            onClick={() => changeMode('placer')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition min-h-[44px] ${mode === 'placer' ? 'bg-cyan-500 text-white' : 'bg-surface text-slate-400'}`}
          >
            📍 Placer
          </button>
        </div>

        <LevelPicker level={level} onPick={changeLevel} />

        {/* Demi-droite */}
        <div className="bg-surface rounded-2xl p-4 mb-4 overflow-hidden">
          {mode === 'lire' && (
            <>
              <p className="text-sm text-slate-300 text-center mb-2">
                Quelle fraction correspond au point <span className="text-indigo-400 font-bold">?</span> ?
              </p>
              <p className="text-xs text-slate-500 text-center mb-3">
                Graduée en <span className="font-bold text-cyan-400">1/{question.denom}</span>
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
              <p className="text-sm text-slate-300 text-center mb-2">
                Place <span className="text-cyan-400 font-bold text-lg">{question.num}/{question.denom}</span> sur la demi-droite
              </p>
              <p className="text-xs text-slate-500 text-center mb-3">
                {!feedback ? '👆 Glisse le point sur la droite puis valide' : `Graduée en 1/${question.denom}`}
              </p>
              <NumberLine
                maxVal={question.maxVal}
                denom={question.denom}
                interactive={!feedback}
                onDragUpdate={handleDragUpdate}
                dragValue={dragValue}
                placedValue={feedback ? (placedValue ?? dragValue) : null}
                placedOk={feedback?.ok ?? null}
                showCorrection={feedback != null && !feedback.ok}
                correctionValue={question.value}
                showPoint={false}
              />
            </>
          )}
        </div>

        {/* Zone de réponse (mode lire) */}
        {mode === 'lire' && (
          <div className="bg-surface rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <input
                type="number"
                inputMode="numeric"
                value={answer.num}
                onChange={e => setAnswer(a => ({ ...a, num: e.target.value }))}
                className="w-20 h-14 text-center text-2xl font-bold bg-slate-800 border-2 border-cyan-500/30 rounded-xl text-white focus:border-cyan-400 outline-none"
                placeholder="?"
                disabled={!!feedback}
              />
              <span className="text-3xl text-slate-400 font-bold select-none">/</span>
              <input
                type="number"
                inputMode="numeric"
                value={answer.denom}
                onChange={e => setAnswer(a => ({ ...a, denom: e.target.value }))}
                className="w-20 h-14 text-center text-2xl font-bold bg-slate-800 border-2 border-cyan-500/30 rounded-xl text-white focus:border-cyan-400 outline-none"
                placeholder="?"
                disabled={!!feedback}
              />
            </div>

            {!feedback ? (
              <button
                onClick={checkLire}
                disabled={!answer.num || !answer.denom}
                className="w-full py-3.5 bg-cyan-500 text-white font-bold rounded-xl disabled:opacity-40 active:scale-[0.98] transition-transform min-h-[48px]"
              >
                Vérifier
              </button>
            ) : (
              <>
                <p className={`text-center font-bold mb-3 text-lg ${feedback.ok ? 'text-emerald-400' : 'text-red-400'}`}>{feedback.msg}</p>
                {!feedback.ok && (
                  <p className="text-sm text-slate-400 text-center mb-3 leading-relaxed">
                    💡 Il y a <strong className="text-white">{question.num}</strong> graduation{question.num > 1 ? 's' : ''} de <strong className="text-white">1/{question.denom}</strong> depuis 0
                  </p>
                )}
                <button onClick={() => next()} className="w-full py-3.5 bg-cyan-500 text-white font-bold rounded-xl active:scale-[0.98] transition-transform min-h-[48px]">
                  Suivant →
                </button>
              </>
            )}
          </div>
        )}

        {/* Bouton valider + feedback (mode placer) */}
        {mode === 'placer' && (
          <div className="bg-surface rounded-2xl p-5 mb-4">
            {!feedback ? (
              <>
                {dragValue == null && (
                  <p className="text-center text-sm text-slate-500 mb-3">
                    Touche ou glisse sur la droite pour placer le point
                  </p>
                )}
                {dragValue != null && (
                  <p className="text-center text-sm text-slate-500 mb-3">
                    📍 Point placé — valide quand tu es prêt
                  </p>
                )}
                <button
                  onClick={validatePlacement}
                  disabled={dragValue == null}
                  className="w-full py-3.5 bg-cyan-500 text-white font-bold rounded-xl disabled:opacity-40 active:scale-[0.98] transition-transform min-h-[48px]"
                >
                  Valider ✓
                </button>
              </>
            ) : (
              <>
                <p className={`text-center font-bold mb-3 text-lg ${feedback.ok ? 'text-emerald-400' : 'text-red-400'}`}>{feedback.msg}</p>
                {!feedback.ok && (
                  <p className="text-sm text-slate-400 text-center mb-3 leading-relaxed">
                    💡 <strong className="text-white">{question.num}/{question.denom}</strong> = {question.num} graduation{question.num > 1 ? 's' : ''} de 1/{question.denom} depuis 0
                    <br />
                    <span className="text-indigo-400">● point violet</span> = bonne position
                  </p>
                )}
                <button onClick={() => next()} className="w-full py-3.5 bg-cyan-500 text-white font-bold rounded-xl active:scale-[0.98] transition-transform min-h-[48px]">
                  Suivant →
                </button>
              </>
            )}
          </div>
        )}

        {/* Aide mémoire */}
        <details className="bg-surface rounded-2xl p-4 text-sm text-slate-400">
          <summary className="cursor-pointer font-bold text-slate-300 min-h-[44px] flex items-center">💡 Comment lire une fraction sur la droite ?</summary>
          <div className="mt-3 space-y-2 leading-relaxed">
            <p>1. Regarde entre <strong className="text-white">0</strong> et <strong className="text-white">1</strong> : l'unité est divisée en parts égales.</p>
            <p>2. Le <strong className="text-cyan-400">dénominateur</strong> = nombre de parts entre 0 et 1.</p>
            <p>3. Le <strong className="text-cyan-400">numérateur</strong> = nombre de graduations depuis 0 jusqu'au point.</p>
            <p>Exemple : 4 parts, 3e graduation → <strong className="text-cyan-400">3/4</strong></p>
          </div>
        </details>
      </div>
    </div>
  )
}
