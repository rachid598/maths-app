/**
 * Frac-Strike game engine
 * Generates fraction simplification challenges at 3 difficulty levels (REP pedagogy).
 */

// GCD via Euclidean algorithm
export function gcd(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a
}

// Level definitions (REP pedagogy: progressive difficulty)
const LEVELS = [
  {
    id: 1,
    name: 'Facile',
    description: 'Diviseurs simples (2, 3, 4, 5)',
    factors: [2, 3, 4, 5],
    numRange: [1, 11],
    denRange: [2, 12],
  },
  {
    id: 2,
    name: 'Moyen',
    description: 'Tous les diviseurs (2 à 10)',
    factors: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    numRange: [1, 14],
    denRange: [2, 18],
  },
  {
    id: 3,
    name: 'Difficile',
    description: 'Multiples complexes (12, 15, 25, 50)',
    factors: [12, 15, 25, 50],
    numRange: [1, 10],
    denRange: [2, 12],
  },
  {
    id: 4,
    name: 'Expert',
    description: 'Complète la décomposition toi-même !',
    factors: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    numRange: [1, 14],
    denRange: [2, 18],
    expert: true,
  },
]

export function getLevels() {
  return LEVELS
}

/**
 * Build all valid coprime pairs (num < den, gcd=1) for a level's range.
 * This gives us a large pool to pick from without repetition.
 */
function buildPairsPool(level) {
  const [numMin, numMax] = level.numRange
  const [denMin, denMax] = level.denRange
  const pairs = []
  for (let n = numMin; n <= numMax; n++) {
    for (let d = Math.max(denMin, n + 1); d <= denMax; d++) {
      if (gcd(n, d) === 1) {
        pairs.push([n, d])
      }
    }
  }
  return pairs
}

// Pre-compute pools per level
const pairsPoolCache = new Map()
function getPairsPool(level) {
  if (!pairsPoolCache.has(level.id)) {
    pairsPoolCache.set(level.id, buildPairsPool(level))
  }
  return pairsPoolCache.get(level.id)
}

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Per-level shuffled deck to avoid repeats within a session
const decks = new Map()

function drawPair(level) {
  if (!decks.has(level.id) || decks.get(level.id).length === 0) {
    decks.set(level.id, shuffle(getPairsPool(level)))
  }
  return decks.get(level.id).pop()
}

/**
 * Generate a fraction that can be simplified.
 * Uses a shuffled deck so fractions never repeat until the pool is exhausted.
 * Returns { numerator, denominator, simplifiedNum, simplifiedDen, commonFactor }
 */
export function generateFraction(levelId) {
  const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0]

  // Pick a coprime pair from the shuffled deck
  const [simplifiedNum, simplifiedDen] = drawPair(level)

  // Pick a random common factor from the level's factor pool
  const factor = level.factors[Math.floor(Math.random() * level.factors.length)]

  return {
    numerator: simplifiedNum * factor,
    denominator: simplifiedDen * factor,
    simplifiedNum,
    simplifiedDen,
    commonFactor: factor,
  }
}

/** Reset the deck for a level (e.g. when restarting) */
export function resetDeck(levelId) {
  decks.delete(levelId)
}

/**
 * Factorize a number into display factors for the chain.
 * E.g., 12 with commonFactor 6 => { base: 2, factor: 6 }
 */
export function factorize(value, divisor) {
  if (value % divisor !== 0) return null
  return { base: value / divisor, factor: divisor }
}

/**
 * Check if a divisor is valid for both numerator and denominator.
 */
export function isValidDivisor(numerator, denominator, divisor) {
  return (
    divisor > 1 &&
    Number.isInteger(divisor) &&
    numerator % divisor === 0 &&
    denominator % divisor === 0
  )
}

/**
 * Apply a simplification step.
 * Returns the new numerator and denominator.
 */
export function simplify(numerator, denominator, divisor) {
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  }
}

/**
 * Check if a fraction is fully simplified.
 */
export function isFullySimplified(numerator, denominator) {
  return gcd(numerator, denominator) === 1
}
