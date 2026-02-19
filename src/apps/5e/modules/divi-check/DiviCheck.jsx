import { useState, useCallback, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Trophy, RotateCcw, Star, Zap, HelpCircle } from 'lucide-react'
import confetti from 'canvas-confetti'
import { DIVISORS, getLevels, generateGrid, checkGrid } from './engine'
import DivisibilityGrid from './components/DivisibilityGrid'
import HelpModal from './components/HelpModal'

const GRIDS_PER_LEVEL = 3
const ROWS = 5

function emptyChecked() {
  return Array.from({ length: ROWS }, () => Array(DIVISORS.length).fill(false))
}

function LevelSelector({ onSelect }) {
  const levels = getLevels()
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-center mb-4">Choisis ton niveau</h3>
      {levels.map((level) => (
        <button
          key={level.id}
          onClick={() => onSelect(level.id)}
          className="w-full p-4 rounded-2xl bg-surface hover:bg-surface-light transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              {level.id === 1 && <Star className="w-5 h-5 text-white" />}
              {level.id === 2 && <Zap className="w-5 h-5 text-white" />}
              {level.id === 3 && <Trophy className="w-5 h-5 text-white" />}
            </div>
            <div>
              <p className="font-semibold">{level.name}</p>
              <p className="text-sm text-slate-300">{level.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

export default function DiviCheck({ onBack }) {
  const [levelId, setLevelId] = useState(null)
  const [grid, setGrid] = useState(null)
  const [checked, setChecked] = useState(emptyChecked)
  const [results, setResults] = useState(null)
  const [validated, setValidated] = useState(false)
  const [score, setScore] = useState(0)
  const [gridIndex, setGridIndex] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const startGrid = useCallback(
    (lvl) => {
      const g = generateGrid(lvl || levelId)
      setGrid(g)
      setChecked(emptyChecked())
      setResults(null)
      setValidated(false)
    },
    [levelId],
  )

  function selectLevel(id) {
    setLevelId(id)
    setScore(0)
    setGridIndex(0)
    setShowResult(false)
    startGrid(id)
  }

  function handleToggle(row, col) {
    if (validated) return
    setChecked((prev) => {
      const next = prev.map((r) => [...r])
      next[row][col] = !next[row][col]
      return next
    })
  }

  function handleValidate() {
    if (!grid) return
    const { results: res, perfectLines } = checkGrid(checked, grid.solutions)
    setResults(res)
    setValidated(true)
    setScore((s) => s + perfectLines)

    if (perfectLines === ROWS) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#14b8a6', '#f59e0b', '#6366f1'],
      })
    }
  }

  function handleNext() {
    const nextIndex = gridIndex + 1
    if (nextIndex >= GRIDS_PER_LEVEL) {
      setShowResult(true)
    } else {
      setGridIndex(nextIndex)
      startGrid(levelId)
    }
  }

  const totalPossible = GRIDS_PER_LEVEL * ROWS

  // Confetti on perfect score
  const perfect = showResult && score === totalPossible
  useEffect(() => {
    if (perfect) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#10b981', '#14b8a6', '#f59e0b', '#6366f1', '#ec4899'],
      })
    }
  }, [perfect])

  // Result screen
  if (showResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-surface rounded-2xl p-8 max-w-sm w-full text-center">
          <Trophy
            className={`w-16 h-16 mx-auto mb-4 ${perfect ? 'text-accent' : 'text-primary-light'}`}
          />
          <h2 className="text-2xl font-bold mb-2">
            {perfect ? 'Parfait !' : 'Bien joué !'}
          </h2>
          <p className="text-4xl font-bold mb-1">
            {score}/{totalPossible}
          </p>
          <p className="text-slate-300 mb-6">lignes parfaites</p>

          <div className="space-y-3">
            <button
              onClick={() => selectLevel(levelId)}
              className="w-full py-3 rounded-xl font-bold bg-primary hover:bg-primary-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Rejouer ce niveau
            </button>
            <button
              onClick={() => setLevelId(null)}
              className="w-full py-3 rounded-xl font-bold bg-surface-light hover:bg-surface-light/80 transition-colors"
            >
              Changer de niveau
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 rounded-xl font-bold text-slate-300 hover:text-white transition-colors"
            >
              Retour au menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Level selection
  if (!levelId || !grid) {
    return (
      <div className="min-h-screen p-4">
        <header className="flex items-center gap-3 mb-6 pt-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-surface hover:bg-surface-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Divi-Check</h2>
        </header>
        <LevelSelector onSelect={selectLevel} />
      </div>
    )
  }

  // Main game UI
  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-4 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-surface hover:bg-surface-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold">Divi-Check</h2>
            <p className="text-xs text-slate-300">
              {getLevels().find((l) => l.id === levelId)?.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-xl bg-surface hover:bg-surface-light transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-slate-300" />
          </button>
          <div className="text-right">
            <p className="text-sm text-slate-300">
              {gridIndex + 1}/{GRIDS_PER_LEVEL}
            </p>
            <p className="text-lg font-bold text-accent">
              {score} <Star className="w-4 h-4 inline text-accent" />
            </p>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1.5 bg-surface rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
          style={{
            width: `${((gridIndex + (validated ? 1 : 0)) / GRIDS_PER_LEVEL) * 100}%`,
          }}
        />
      </div>

      {/* Instruction */}
      <p className="text-xs text-slate-400 text-center mb-3">
        {validated
          ? 'Correction — vert = juste, rouge = erreur'
          : 'Coche les cases quand le nombre est divisible'}
      </p>

      {/* Grid */}
      <DivisibilityGrid
        numbers={grid.numbers}
        divisors={DIVISORS}
        checked={checked}
        onToggle={handleToggle}
        results={results}
        disabled={validated}
      />

      {/* Result feedback per grid */}
      {validated && (
        <div className="mt-4 text-center">
          <p className="text-sm font-semibold">
            {results &&
              (() => {
                const perfect = results.every((row) =>
                  row.every((r) => r === 'correct' || r === 'neutral'),
                )
                const perfCount = results.filter((row) =>
                  row.every((r) => r === 'correct' || r === 'neutral'),
                ).length
                if (perfect) return '🎯 Tableau parfait !'
                return `${perfCount}/5 lignes parfaites`
              })()}
          </p>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action buttons */}
      {!validated ? (
        <button
          onClick={handleValidate}
          className="mx-auto mb-4 px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.97] transition-all text-white"
        >
          Valider
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="mx-auto mb-4 px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.97] transition-all text-white flex items-center gap-2"
        >
          Suivant
          <ArrowRight className="w-5 h-5" />
        </button>
      )}

      {/* Bottom padding */}
      <div className="h-4" />

      {/* Help modal */}
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  )
}
