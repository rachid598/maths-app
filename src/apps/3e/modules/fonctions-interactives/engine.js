export function generateLinear() {
  const a = [-3,-2,-1,1,2,3,4][Math.floor(Math.random()*7)]
  const b = Math.floor(Math.random()*11) - 5
  const fn = (x) => a * x + b
  const label = `f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}x${b > 0 ? ' + ' + b : b < 0 ? ' - ' + Math.abs(b) : ''}`
  return { a, b, fn, label }
}
export function generateProblem() {
  const func = generateLinear()
  const x = Math.floor(Math.random()*11) - 5
  if (Math.random() > 0.5) {
    return { type:'image', question:`Calcule f(${x})`, answer:func.fn(x), explanation:`f(${x}) = ${func.a}×(${x})${func.b>=0?'+':''}${func.b} = ${func.fn(x)}`, func }
  }
  const y = func.fn(Math.floor(Math.random()*7) - 3)
  const xAns = func.a !== 0 ? (y - func.b) / func.a : null
  if (xAns === null || !Number.isInteger(xAns)) return { type:'image', question:`Calcule f(${x})`, answer:func.fn(x), explanation:`f(${x}) = ${func.a}×(${x})${func.b>=0?'+':''}${func.b} = ${func.fn(x)}`, func }
  return { type:'antecedent', question:`Trouve x tel que f(x) = ${y}`, answer:xAns, explanation:`${func.a}x + ${func.b} = ${y} → x = ${xAns}`, func }
}
