// Engine for ChronoTables: question generation, scoring, combo

const DIFFICULTIES = {
  easy:   { label: 'Facile', tables: [2, 3, 4, 5], divisions: false, emoji: '🟢', timePerQ: 8 },
  medium: { label: 'Moyen',  tables: [2, 3, 4, 5, 6, 7, 8, 9], divisions: false, emoji: '🟡', timePerQ: 6 },
  expert: { label: 'Expert', tables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], divisions: true, emoji: '🔴', timePerQ: 5 },
}

const TOTAL_QUESTIONS = 20

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateQuestion(difficulty = 'medium') {
  const cfg = DIFFICULTIES[difficulty] || DIFFICULTIES.medium
  const table = cfg.tables[randInt(0, cfg.tables.length - 1)]
  const factor = randInt(2, 10)

  if (cfg.divisions && Math.random() < 0.3) {
    const product = table * factor
    return { display: `${product} ÷ ${table} = ?`, answer: factor, type: 'division' }
  }

  return { display: `${table} × ${factor} = ?`, answer: table * factor, type: 'multiplication' }
}

export function getComboMultiplier(streak) {
  if (streak >= 5) return 3
  if (streak >= 3) return 2
  return 1
}

export function getStars(score, maxScore) {
  const pct = score / maxScore
  if (pct >= 0.9) return 3
  if (pct >= 0.7) return 2
  if (pct >= 0.4) return 1
  return 0
}

export function getTimerDuration(difficulty = 'medium') {
  const cfg = DIFFICULTIES[difficulty] || DIFFICULTIES.medium
  return cfg.timePerQ * TOTAL_QUESTIONS
}

export { DIFFICULTIES, TOTAL_QUESTIONS }
