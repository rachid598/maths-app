export const LEVELS = [
  { id: 1, label: 'N1', title: 'Facile (2 chiffres ÷ 1)', digits: 2, color: 'from-violet-400 to-fuchsia-500' },
  { id: 2, label: 'N2', title: 'Moyen (3 chiffres ÷ 1)', digits: 3, color: 'from-fuchsia-500 to-pink-500' },
  { id: 3, label: 'N3', title: 'Difficile (4 chiffres ÷ 1)', digits: 4, color: 'from-pink-500 to-rose-500' },
]

export const QUESTIONS_PER_ROUND = 5

/**
 * Génère une division euclidienne a ÷ b
 * Les chiffres 0 dans le quotient sont autorisés
 */
export function generateDivision(digitCount) {
  const minA = Math.pow(10, digitCount - 1)
  const maxA = Math.pow(10, digitCount) - 1
  const b = Math.floor(Math.random() * 8) + 2 // diviseur entre 2 et 9

  let a
  let attempts = 0
  do {
    a = Math.floor(Math.random() * (maxA - minA + 1)) + minA
    attempts++
  } while (a < b && attempts < 100)

  const q = Math.floor(a / b)
  const r = a % b

  return { a, b, q, r, steps: computeSteps(a, b) }
}

/**
 * Calcule les étapes de la division posée
 * Chaque étape : { digit, partial, product, remainder, bringDown }
 */
export function computeSteps(a, b) {
  const digits = String(a).split('').map(Number)
  const steps = []
  let carry = 0

  for (let i = 0; i < digits.length; i++) {
    const partial = carry * 10 + digits[i]
    const quotientDigit = Math.floor(partial / b)
    const product = quotientDigit * b
    const remainder = partial - product

    steps.push({
      digitIndex: i,
      digit: digits[i],
      partial,
      quotientDigit,
      product,
      remainder,
      bringDown: i < digits.length - 1 ? digits[i + 1] : null,
    })

    carry = remainder
  }

  return steps
}

/**
 * Génère une question de vocabulaire
 */
const VOCAB_TERMS = [
  { key: 'dividende', label: 'le dividende', getAnswer: (d) => d.a },
  { key: 'diviseur', label: 'le diviseur', getAnswer: (d) => d.b },
  { key: 'quotient', label: 'le quotient', getAnswer: (d) => d.q },
  { key: 'reste', label: 'le reste', getAnswer: (d) => d.r },
]

export function generateVocabQuestion(digitCount) {
  const div = generateDivision(digitCount)
  const termIndex = Math.floor(Math.random() * VOCAB_TERMS.length)
  const term = VOCAB_TERMS[termIndex]
  const answer = term.getAnswer(div)

  // Générer 3 distracteurs uniques
  const choices = new Set([answer])
  while (choices.size < 4) {
    const offset = Math.floor(Math.random() * 20) - 10
    const distractor = Math.abs(answer + offset)
    if (distractor !== answer) choices.add(distractor)
  }

  const shuffled = [...choices].sort(() => Math.random() - 0.5)

  return {
    division: div,
    question: `Quel est ${term.label} ?`,
    termKey: term.key,
    answer,
    choices: shuffled,
  }
}
