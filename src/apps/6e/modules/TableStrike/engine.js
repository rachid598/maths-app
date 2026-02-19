export const LEVELS = [
  { id: 1, label: 'N1', title: 'Tables 2, 5, 10', tables: [2, 5, 10], color: 'from-emerald-400 to-teal-500' },
  { id: 2, label: 'N2', title: 'Tables 3, 4', tables: [3, 4], color: 'from-blue-400 to-indigo-500' },
  { id: 3, label: 'N3', title: 'Tables 6, 7, 8, 9', tables: [6, 7, 8, 9], color: 'from-orange-400 to-red-500' },
  { id: 4, label: 'N4', title: 'Mix total + Inversions', tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], color: 'from-purple-500 to-pink-500' },
]

export const QUESTIONS_PER_ROUND = 10

export function generateQuestion(tables) {
  const a = tables[Math.floor(Math.random() * tables.length)]
  const b = Math.floor(Math.random() * 9) + 2
  const result = a * b
  const isDirect = Math.random() < 0.5

  if (isDirect) {
    return { mode: 'direct', display: `${a} \u00D7 ${b} = ?`, a, b, answer: result }
  }
  return { mode: 'trou', display: `${a} \u00D7 ? = ${result}`, a, b, answer: b }
}

export function generateRound(tables, count = QUESTIONS_PER_ROUND, weakTables = []) {
  const questions = []
  let lastKey = ''

  const boostedTables = [...tables]
  for (const t of weakTables) {
    if (tables.includes(t)) boostedTables.push(t, t)
  }

  for (let i = 0; i < count; i++) {
    let q, key, attempts = 0
    const useTables = weakTables.length > 0 && i % 3 === 0 ? boostedTables : tables
    do {
      q = generateQuestion(useTables)
      key = `${q.a}-${q.b}-${q.mode}`
      attempts++
    } while (key === lastKey && attempts < 20)
    lastKey = key
    questions.push(q)
  }
  return questions
}
