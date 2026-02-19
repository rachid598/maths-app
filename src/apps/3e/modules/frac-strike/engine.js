/**
 * Frac-Strike — Engine
 *
 * Simplification de fractions avec chaîne d'égalité.
 * 4 niveaux de difficulté, support des relatifs (niveaux 2-4).
 * Système de deck anti-répétition (Fisher-Yates).
 */

// ─── Utilities ──────────────────────────────────────────

export function gcd(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Plus petit facteur premier de n (pour les indices).
 */
export function smallestPrimeFactor(n) {
  n = Math.abs(n)
  if (n <= 1) return n
  if (n % 2 === 0) return 2
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return i
  }
  return n
}

// ─── Levels ─────────────────────────────────────────────

export const LEVELS = {
  1: {
    name: 'Facile',
    desc: 'Diviseurs simples',
    color: 'text-emerald-400',
    factors: [2, 3, 4, 5],
    numRange: [1, 11],
    denRange: [2, 15],
    negativePct: 0,
  },
  2: {
    name: 'Moyen',
    desc: 'Tous les diviseurs + relatifs',
    color: 'text-blue-400',
    factors: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    numRange: [1, 14],
    denRange: [2, 18],
    negativePct: 0.3,
  },
  3: {
    name: 'Difficile',
    desc: 'Grands diviseurs + relatifs',
    color: 'text-purple-400',
    factors: [12, 15, 25, 50],
    numRange: [1, 10],
    denRange: [2, 12],
    negativePct: 0.5,
  },
  4: {
    name: 'Expert',
    desc: 'Complète la décomposition',
    color: 'text-red-400',
    factors: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    numRange: [1, 14],
    denRange: [2, 18],
    negativePct: 0.5,
  },
}

// ─── Pool & Deck ────────────────────────────────────────

/**
 * Build all valid (num, den, factor) triplets for a level.
 * num and den are coprime, factor multiplies both to create the fraction.
 */
export function buildPool(level) {
  const cfg = LEVELS[level]
  const pool = []
  const [minN, maxN] = cfg.numRange
  const [minD, maxD] = cfg.denRange

  for (let n = minN; n <= maxN; n++) {
    for (let d = minD; d <= maxD; d++) {
      if (n === d) continue
      if (gcd(n, d) !== 1) continue // must be coprime
      for (const f of cfg.factors) {
        const num = n * f
        const den = d * f
        // Keep reasonable sizes
        if (num <= 500 && den <= 500) {
          pool.push({ num: n, den: d, factor: f })
        }
      }
    }
  }
  return pool
}

/**
 * Apply random sign to a fraction based on level's negativePct.
 * Returns { num, den } where num may be negative (sign convention).
 */
function applySign(num, den, negativePct) {
  if (negativePct === 0 || Math.random() > negativePct) {
    return { num, den }
  }
  // Pick a sign pattern: -/+, +/-, or -/-
  const pattern = Math.random()
  if (pattern < 0.4) return { num: -num, den } // −num / den
  if (pattern < 0.8) return { num, den: -den } // num / −den
  return { num: -num, den: -den } // −num / −den (simplifies to positive)
}

/**
 * Create a shuffled deck from a pool.
 */
export function createDeck(pool) {
  return { cards: shuffle(pool), index: 0 }
}

/**
 * Draw the next fraction from the deck. Reshuffles when exhausted.
 * Returns { num, den, factor, simpNum, simpDen } with signs applied.
 */
export function drawFromDeck(deck, level) {
  if (deck.index >= deck.cards.length) {
    deck.cards = shuffle(deck.cards)
    deck.index = 0
  }
  const card = deck.cards[deck.index++]
  const cfg = LEVELS[level]

  // Apply signs to the coprime pair
  const signed = applySign(card.num, card.den, cfg.negativePct)

  return {
    num: signed.num * card.factor, // displayed numerator (e.g. -12)
    den: signed.den * card.factor, // displayed denominator (e.g. 18)
    factor: card.factor, // common divisor (always positive, e.g. 6)
    simpNum: signed.num, // simplified numerator (e.g. -2)
    simpDen: signed.den, // simplified denominator (e.g. 3)
  }
}
