/**
 * Prio-Calcul engine
 * Generates arithmetic expressions and manages priority-based simplification.
 */

let opCounter = 0
function nextOpId() {
  return 'op' + (++opCounter)
}

function tok(type, value, id) {
  const t = { type, value }
  if (id) t.id = id
  return t
}
function num(v) { return tok('number', v) }
function op(v) { return tok('operator', v, nextOpId()) }
function paren(v) { return tok('paren', v) }

// --- Levels ---
const LEVELS = [
  {
    id: 1,
    name: 'Facile',
    description: '2 opérations, sans parenthèses',
  },
  {
    id: 2,
    name: 'Moyen',
    description: 'Avec parenthèses',
  },
  {
    id: 3,
    name: 'Difficile',
    description: 'Parenthèses et priorités multiples',
  },
]

export function getLevels() {
  return LEVELS
}

// --- Helpers ---
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function compute(a, operator, b) {
  switch (operator) {
    case '+': return a + b
    case '-': return a - b
    case '×': return a * b
    default: return 0
  }
}

// --- Expression generation ---

function generateLevel1() {
  // 2 operations, no parentheses, at least one ×
  // Pattern: a op1 b op2 c where one op is ×
  for (let attempt = 0; attempt < 50; attempt++) {
    const mulPos = Math.random() < 0.5 ? 0 : 1
    let a, b, c, op1v, op2v

    if (mulPos === 0) {
      // a × b op2 c
      a = randInt(2, 9)
      b = randInt(2, 5)
      c = randInt(1, 9)
      op1v = '×'
      op2v = pick(['+', '-'])
    } else {
      // a op1 b × c
      a = randInt(1, 9)
      b = randInt(2, 5)
      c = randInt(2, 5)
      op1v = pick(['+', '-'])
      op2v = '×'
    }

    // Compute respecting priority
    let result
    if (mulPos === 0) {
      result = compute(compute(a, '×', b), op2v, c)
    } else {
      result = compute(a, op1v, compute(b, '×', c))
    }

    if (result >= 0 && result <= 100) {
      return {
        tokens: [num(a), op(op1v), num(b), op(op2v), num(c)],
        answer: result,
      }
    }
  }
  // Fallback
  return {
    tokens: [num(3), op('+'), num(4), op('×'), num(2)],
    answer: 11,
  }
}

function generateLevel2() {
  // Parentheses: (a op1 b) op2 c  OR  c op2 (a op1 b)
  for (let attempt = 0; attempt < 50; attempt++) {
    const side = Math.random() < 0.5 ? 'left' : 'right'
    const a = randInt(1, 9)
    const b = randInt(1, 9)
    const c = randInt(2, 5)
    const innerOp = pick(['+', '-'])
    const outerOp = '×'

    const innerResult = compute(a, innerOp, b)
    if (innerResult <= 0) continue

    let result, tokens
    if (side === 'left') {
      result = compute(innerResult, outerOp, c)
      tokens = [paren('('), num(a), op(innerOp), num(b), paren(')'), op(outerOp), num(c)]
    } else {
      result = compute(c, outerOp, innerResult)
      tokens = [num(c), op(outerOp), paren('('), num(a), op(innerOp), num(b), paren(')')]
    }

    if (result >= 0 && result <= 100) {
      return { tokens, answer: result }
    }
  }
  return {
    tokens: [paren('('), num(3), op('+'), num(4), paren(')'), op('×'), num(2)],
    answer: 14,
  }
}

function generateLevel3() {
  const strategy = pick(['double-paren', 'nested', 'mixed'])

  for (let attempt = 0; attempt < 50; attempt++) {
    if (strategy === 'double-paren') {
      // (a op1 b) op2 (c op3 d)
      const a = randInt(1, 8)
      const b = randInt(1, 8)
      const c = randInt(1, 8)
      const d = randInt(1, 8)
      const op1v = pick(['+', '-'])
      const op3v = pick(['+', '-'])
      const op2v = '×'

      const left = compute(a, op1v, b)
      const right = compute(c, op3v, d)
      if (left <= 0 || right <= 0) continue
      const result = compute(left, op2v, right)

      if (result >= 0 && result <= 150) {
        return {
          tokens: [
            paren('('), num(a), op(op1v), num(b), paren(')'),
            op(op2v),
            paren('('), num(c), op(op3v), num(d), paren(')'),
          ],
          answer: result,
        }
      }
    } else if (strategy === 'nested') {
      // a × (b + c × d) — nested priority inside parens
      const a = randInt(2, 4)
      const b = randInt(1, 6)
      const c = randInt(2, 4)
      const d = randInt(2, 4)
      const op1v = '×'
      const op2v = pick(['+', '-'])
      const op3v = '×'

      const inner = compute(c, op3v, d)
      const parenResult = compute(b, op2v, inner)
      if (parenResult <= 0) continue
      const result = compute(a, op1v, parenResult)

      if (result >= 0 && result <= 150) {
        return {
          tokens: [
            num(a), op(op1v),
            paren('('), num(b), op(op2v), num(c), op(op3v), num(d), paren(')'),
          ],
          answer: result,
        }
      }
    } else {
      // (a + b) × c - d
      const a = randInt(1, 8)
      const b = randInt(1, 8)
      const c = randInt(2, 5)
      const d = randInt(1, 9)
      const op1v = pick(['+', '-'])
      const op2v = '×'
      const op3v = pick(['+', '-'])

      const parenResult = compute(a, op1v, b)
      if (parenResult <= 0) continue
      const mid = compute(parenResult, op2v, c)
      const result = compute(mid, op3v, d)

      if (result >= 0 && result <= 150) {
        return {
          tokens: [
            paren('('), num(a), op(op1v), num(b), paren(')'),
            op(op2v), num(c), op(op3v), num(d),
          ],
          answer: result,
        }
      }
    }
  }
  // Fallback
  return {
    tokens: [
      paren('('), num(3), op('+'), num(2), paren(')'),
      op('×'),
      paren('('), num(4), op('-'), num(1), paren(')'),
    ],
    answer: 15,
  }
}

// Deck system for anti-repeat
const generators = { 1: generateLevel1, 2: generateLevel2, 3: generateLevel3 }

export function generateExpression(levelId) {
  const gen = generators[levelId] || generateLevel1
  return gen()
}

// --- Priority detection ---

function getOpPriority(v) {
  if (v === '×' || v === '÷') return 2
  return 1
}

export function findSelectableOps(tokens) {
  // 1. Find max paren depth among operators
  let maxDepth = 0
  let depth = 0
  for (const t of tokens) {
    if (t.type === 'paren' && t.value === '(') depth++
    if (t.type === 'paren' && t.value === ')') depth--
    if (t.type === 'operator' && depth > maxDepth) maxDepth = depth
  }

  // If no operator is inside parens, maxDepth stays 0 — that's fine,
  // we look at operators at depth 0

  // 2. Among operators at maxDepth, find highest priority
  depth = 0
  let bestPriority = -1
  for (const t of tokens) {
    if (t.type === 'paren' && t.value === '(') depth++
    if (t.type === 'paren' && t.value === ')') depth--
    if (t.type === 'operator' && depth === maxDepth) {
      const p = getOpPriority(t.value)
      if (p > bestPriority) bestPriority = p
    }
  }

  // 3. Collect all operator ids at maxDepth with bestPriority
  depth = 0
  const ids = []
  for (const t of tokens) {
    if (t.type === 'paren' && t.value === '(') depth++
    if (t.type === 'paren' && t.value === ')') depth--
    if (t.type === 'operator' && depth === maxDepth && getOpPriority(t.value) === bestPriority) {
      ids.push(t.id)
    }
  }

  return ids
}

// --- Compute a step ---

export function computeStep(tokens, opId) {
  const idx = tokens.findIndex((t) => t.id === opId)
  if (idx < 0) return null

  // Find left and right number neighbors
  let leftIdx = idx - 1
  while (leftIdx >= 0 && tokens[leftIdx].type !== 'number') leftIdx--
  let rightIdx = idx + 1
  while (rightIdx < tokens.length && tokens[rightIdx].type !== 'number') rightIdx++

  if (leftIdx < 0 || rightIdx >= tokens.length) return null

  return compute(tokens[leftIdx].value, tokens[idx].value, tokens[rightIdx].value)
}

// --- Rebuild tokens after a step ---

export function rebuildTokens(tokens, opId, result) {
  const idx = tokens.findIndex((t) => t.id === opId)
  if (idx < 0) return tokens

  // Find left number and right number (skip parens between)
  let leftIdx = idx - 1
  while (leftIdx >= 0 && tokens[leftIdx].type !== 'number') leftIdx--
  let rightIdx = idx + 1
  while (rightIdx < tokens.length && tokens[rightIdx].type !== 'number') rightIdx++

  if (leftIdx < 0 || rightIdx >= tokens.length) return tokens

  // Replace from leftIdx to rightIdx with a single number
  const newTokens = [
    ...tokens.slice(0, leftIdx),
    num(result),
    ...tokens.slice(rightIdx + 1),
  ]

  // Remove empty parentheses: ( number ) → number
  return stripEmptyParens(newTokens)
}

function stripEmptyParens(tokens) {
  // Repeat until no more empty parens
  let changed = true
  let result = tokens
  while (changed) {
    changed = false
    for (let i = 0; i < result.length - 2; i++) {
      if (
        result[i].type === 'paren' && result[i].value === '(' &&
        result[i + 1].type === 'number' &&
        result[i + 2].type === 'paren' && result[i + 2].value === ')'
      ) {
        result = [...result.slice(0, i), result[i + 1], ...result.slice(i + 3)]
        changed = true
        break
      }
    }
  }
  return result
}

// --- Completion check ---

export function isComplete(tokens) {
  const numbers = tokens.filter((t) => t.type === 'number')
  const ops = tokens.filter((t) => t.type === 'operator')
  return numbers.length === 1 && ops.length === 0
}

// --- Render tokens to string (for display) ---

export function tokensToString(tokens) {
  return tokens.map((t) => t.value).join(' ')
}
