export function generateProblem(level = 1) {
  const denoms = level === 1 ? [2, 3, 4] : level === 2 ? [2, 3, 4, 5, 6] : [2, 3, 4, 5, 6, 8, 10]
  const denom = denoms[Math.floor(Math.random() * denoms.length)]
  const numer = 1 + Math.floor(Math.random() * (denom - 1))
  const correct = numer + '/' + denom
  const set = new Set([correct])
  while (set.size < 4) { const fn = 1+Math.floor(Math.random()*(denom-1)); set.add(fn+'/'+[2,3,4,5,6,8][Math.floor(Math.random()*6)]) }
  return { numer, denom, choices: [...set].sort(() => Math.random()-0.5), answer: correct }
}
export function fractionToDecimal(n, d) { return Math.round((n/d)*100)/100 }
