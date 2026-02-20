const OPS = [
  { sym: '+', fn: (a, b) => a + b, inv: (r, b) => r - b, text: "j'ajoute", invText: 'je retire' },
  { sym: '-', fn: (a, b) => a - b, inv: (r, b) => r + b, text: 'je retire', invText: "j'ajoute" },
  { sym: '×', fn: (a, b) => a * b, inv: (r, b) => r / b, text: 'je multiplie par', invText: 'je divise par' },
  { sym: '÷', fn: (a, b) => a / b, inv: (r, b) => r * b, text: 'je divise par', invText: 'je multiplie par' },
]

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const LEVEL_CONFIG = {
  easy:   { ops: 1, xMin: 1, xMax: 20, opMin: 2, opMax: 10, label: '🟢 Facile', desc: '1 opération' },
  medium: { ops: 2, xMin: 1, xMax: 30, opMin: 2, opMax: 12, label: '🟡 Moyen', desc: '2 opérations' },
  hard:   { ops: 3, xMin: 1, xMax: 50, opMin: 2, opMax: 15, label: '🔴 Expert', desc: '3 opérations' },
}

export function getLevels() {
  return Object.entries(LEVEL_CONFIG).map(([id, c]) => ({ id, name: c.label, description: c.desc }))
}

export function generateRiddle(levelId) {
  const cfg = LEVEL_CONFIG[levelId] || LEVEL_CONFIG.easy
  for (let attempt = 0; attempt < 200; attempt++) {
    const x = rand(cfg.xMin, cfg.xMax)
    const steps = []
    let current = x
    let valid = true

    for (let i = 0; i < cfg.ops; i++) {
      const allowedOps = OPS.filter((op) => {
        if (op.sym === '÷') return current > 1
        return true
      })
      const op = allowedOps[rand(0, allowedOps.length - 1)]
      let operand

      if (op.sym === '÷') {
        const divisors = []
        for (let d = 2; d <= Math.min(current, cfg.opMax); d++) {
          if (current % d === 0 && d >= cfg.opMin) divisors.push(d)
        }
        if (divisors.length === 0) { valid = false; break }
        operand = divisors[rand(0, divisors.length - 1)]
      } else if (op.sym === '-') {
        operand = rand(cfg.opMin, Math.min(cfg.opMax, current - 1))
        if (operand < 1) { valid = false; break }
      } else {
        operand = rand(cfg.opMin, cfg.opMax)
      }

      const next = op.fn(current, operand)
      if (!Number.isInteger(next) || next < 0 || next > 999) { valid = false; break }
      steps.push({ sym: op.sym, operand, text: op.text, invText: op.invText })
      current = next
    }

    if (!valid || steps.length !== cfg.ops) continue

    const result = current
    const riddleText = ['Je pense à un nombre...']
    steps.forEach((s) => riddleText.push(`${s.text} ${s.operand}`))
    riddleText.push(`...et j'obtiens ${result}.`)

    let eq = 'x'
    steps.forEach((s) => { eq = `(${eq} ${s.sym} ${s.operand})` })
    eq = `${eq} = ${result}`

    const hintSteps = []
    let hintCurrent = result
    for (let i = steps.length - 1; i >= 0; i--) {
      const s = steps[i]
      const op = OPS.find((o) => o.sym === s.sym)
      const prev = op.inv(hintCurrent, s.operand)
      hintSteps.push({ text: `${s.invText} ${s.operand}`, from: hintCurrent, to: prev })
      hintCurrent = prev
    }

    return { x, steps, result, riddleText, equation: eq, hintSteps }
  }

  const x = rand(1, 10), operand = rand(2, 8), result = x + operand
  return {
    x, steps: [{ sym: '+', operand, text: "j'ajoute", invText: 'je retire' }],
    result, riddleText: ['Je pense à un nombre...', `j'ajoute ${operand}`, `...et j'obtiens ${result}.`],
    equation: `(x + ${operand}) = ${result}`,
    hintSteps: [{ text: `je retire ${operand}`, from: result, to: x }],
  }
}

export function computeScore(isCorrect, streak, level) {
  if (!isCorrect) return { points: 0, newStreak: 0 }
  const mult = level === 'hard' ? 3 : level === 'medium' ? 2 : 1
  return { points: 10 * mult + Math.min(streak, 5) * 5, newStreak: streak + 1 }
}
