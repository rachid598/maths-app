export function generateProblem(level = 1) {
  const denoms = level === 1 ? [2, 3, 4] : level === 2 ? [2, 3, 4, 5, 6] : [2, 3, 4, 5, 6, 8, 10]
  const denom = denoms[Math.floor(Math.random() * denoms.length)]
  const numer = 1 + Math.floor(Math.random() * (denom - 1))
  const choices = generateChoices(numer, denom)
  return { numer, denom, choices, answer: `${numer}/${denom}` }
}

function generateChoices(n, d) {
  const correct = `${n}/${d}`
  const set = new Set([correct])
  while (set.size < 4) {
    const fn = 1 + Math.floor(Math.random() * (d - 1))
    const fd = [2, 3, 4, 5, 6, 8][Math.floor(Math.random() * 6)]
    set.add(`${fn}/${fd}`)
  }
  return [...set].sort(() => Math.random() - 0.5)
}

export function fractionToDecimal(n, d) {
  return Math.round((n / d) * 100) / 100
}
