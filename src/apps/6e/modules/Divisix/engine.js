export const LEVELS = [
  { id: 1, label: 'N1', title: 'Diviser par 2, 5, 10', divisors: [2, 5, 10], color: 'from-emerald-400 to-teal-500' },
  { id: 2, label: 'N2', title: 'Diviser par 3, 4', divisors: [3, 4], color: 'from-blue-400 to-indigo-500' },
  { id: 3, label: 'N3', title: 'Diviser par 6, 7, 8, 9', divisors: [6, 7, 8, 9], color: 'from-orange-400 to-red-500' },
  { id: 4, label: 'N4', title: 'Mix total', divisors: [2, 3, 4, 5, 6, 7, 8, 9, 10], color: 'from-purple-500 to-pink-500' },
]

export const QUESTIONS_PER_ROUND = 10

export function generateQuestion(divisors) {
  const b = divisors[Math.floor(Math.random() * divisors.length)]
  const quotient = Math.floor(Math.random() * 9) + 2
  const a = b * quotient
  const isDirect = Math.random() < 0.5

  if (isDirect) {
    return { mode: 'direct', display: `${a} \u00F7 ${b} = ?`, a, b, answer: quotient }
  }
  return { mode: 'trou', display: `? \u00F7 ${b} = ${quotient}`, a, b, answer: a }
}

export function generateRound(divisors, count = QUESTIONS_PER_ROUND) {
  const questions = []
  let lastKey = ''
  for (let i = 0; i < count; i++) {
    let q, key, attempts = 0
    do {
      q = generateQuestion(divisors)
      key = `${q.a}-${q.b}-${q.mode}`
      attempts++
    } while (key === lastKey && attempts < 20)
    lastKey = key
    questions.push(q)
  }
  return questions
}
