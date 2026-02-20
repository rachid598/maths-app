/**
 * Prio-Rush engine
 * Reuses prio-calcul expression generation, adds combo scoring and leaderboard.
 */

import { generateExpression, tokensToString } from '../prio-calcul/engine'

const TOTAL_QUESTIONS = 10
const TIME_LIMIT = 60

export function generateRushBatch(count = TOTAL_QUESTIONS) {
  const expressions = []
  for (let i = 0; i < count; i++) {
    const level = i < 5 ? 1 : 2
    const expr = generateExpression(level)
    expressions.push({
      tokens: expr.tokens,
      answer: expr.answer,
      display: tokensToString(expr.tokens),
    })
  }
  return expressions
}

export function getComboMultiplier(streak) {
  if (streak >= 5) return 3
  if (streak >= 3) return 2
  return 1
}

export function computePoints(streak) {
  return 10 * getComboMultiplier(streak)
}

const LB_KEY = 'prio-rush-leaderboard'

export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(LB_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveToLeaderboard(entry) {
  const lb = getLeaderboard()
  lb.push(entry)
  lb.sort((a, b) => b.score - a.score)
  const top5 = lb.slice(0, 5)
  localStorage.setItem(LB_KEY, JSON.stringify(top5))
  return top5
}

export { TOTAL_QUESTIONS, TIME_LIMIT }
