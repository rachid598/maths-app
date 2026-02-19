/**
 * Divi-Check engine
 * Generates divisibility grids and checks student answers.
 */

export const DIVISORS = [2, 3, 4, 5, 6, 9, 10]

const LEVELS = [
  {
    id: 1,
    name: 'Facile',
    description: 'Nombres à 2 chiffres (12–99)',
    min: 12,
    max: 99,
  },
  {
    id: 2,
    name: 'Moyen',
    description: 'Nombres à 3 chiffres (100–499)',
    min: 100,
    max: 499,
  },
  {
    id: 3,
    name: 'Difficile',
    description: 'Grands nombres (100–999)',
    min: 100,
    max: 999,
  },
]

export function getLevels() {
  return LEVELS
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Count how many divisors divide n.
 */
function countDivisible(n) {
  return DIVISORS.filter((d) => n % d === 0).length
}

/**
 * Generate 5 numbers for a grid, ensuring each has at least 1 and at most 6
 * divisors that divide it (so no boring all-false or all-true rows).
 */
function generateNumbers(levelId) {
  const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0]
  const numbers = []
  const used = new Set()

  while (numbers.length < 5) {
    const n = randInt(level.min, level.max)
    if (used.has(n)) continue

    const hits = countDivisible(n)
    if (hits >= 1 && hits <= 6) {
      numbers.push(n)
      used.add(n)
    }
  }

  return numbers
}

/**
 * Compute the solution matrix for given numbers.
 * Returns boolean[5][7] — solutions[row][col] = true if numbers[row] % DIVISORS[col] === 0
 */
function computeSolutions(numbers) {
  return numbers.map((n) => DIVISORS.map((d) => n % d === 0))
}

/**
 * Generate a full grid for a level.
 */
export function generateGrid(levelId) {
  const numbers = generateNumbers(levelId)
  const solutions = computeSolutions(numbers)
  return { numbers, solutions }
}

/**
 * Check the student's answers against the solutions.
 * Returns a result matrix and a count of perfect lines.
 *
 * Result values per cell:
 * - 'correct'  : student checked, and it's divisible
 * - 'missed'   : student didn't check, but it was divisible
 * - 'wrong'    : student checked, but it's not divisible
 * - 'neutral'  : student didn't check, and it's not divisible (correct)
 */
export function checkGrid(checked, solutions) {
  let perfectLines = 0

  const results = solutions.map((row, r) => {
    let rowPerfect = true
    const rowResults = row.map((expected, c) => {
      const studentChecked = checked[r][c]
      if (expected && studentChecked) return 'correct'
      if (expected && !studentChecked) {
        rowPerfect = false
        return 'missed'
      }
      if (!expected && studentChecked) {
        rowPerfect = false
        return 'wrong'
      }
      return 'neutral'
    })
    if (rowPerfect) perfectLines++
    return rowResults
  })

  return { results, perfectLines }
}
