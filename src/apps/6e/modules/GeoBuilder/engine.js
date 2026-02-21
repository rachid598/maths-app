export const SHAPES = [
  { name: 'Carré', sides: 4, formula: (s) => ({ perimetre: 4 * s, aire: s * s }), prompt: (s) => `Un carré de côté ${s} cm`, params: () => ({ s: 2 + Math.floor(Math.random() * 8) }) },
  { name: 'Rectangle', sides: 4, formula: (l, w) => ({ perimetre: 2 * (l + w), aire: l * w }), prompt: (l, w) => `Un rectangle de ${l} cm × ${w} cm`, params: () => { const l = 3 + Math.floor(Math.random() * 7); return { l, w: 2 + Math.floor(Math.random() * (l - 1)) } } },
  { name: 'Triangle rectangle', sides: 3, formula: (a, b) => ({ perimetre: a + b + Math.round(Math.sqrt(a*a+b*b)*10)/10, aire: (a * b) / 2 }), prompt: (a, b) => `Un triangle rectangle de côtés ${a} cm et ${b} cm`, params: () => ({ a: 3 + Math.floor(Math.random() * 5), b: 3 + Math.floor(Math.random() * 5) }) },
]

export function generateProblem(level = 1) {
  const shapeIdx = level === 1 ? 0 : Math.floor(Math.random() * Math.min(level, SHAPES.length))
  const shape = SHAPES[shapeIdx]
  const p = shape.params()
  const vals = Object.values(p)
  const result = shape.formula(...vals)
  const askPerimetre = Math.random() > 0.5
  return {
    shapeName: shape.name,
    prompt: shape.prompt(...vals),
    question: askPerimetre ? 'Calcule le périmètre (en cm)' : 'Calcule l\'aire (en cm²)',
    answer: askPerimetre ? result.perimetre : result.aire,
    type: askPerimetre ? 'périmètre' : 'aire',
    params: p,
  }
}
