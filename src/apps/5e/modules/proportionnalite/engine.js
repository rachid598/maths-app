const CONTEXTS = [
  { theme: '🍰 Recette', unit: 'g', items: ['farine', 'sucre', 'beurre', 'lait (mL)'] },
  { theme: '💰 Prix', unit: '€', items: ['pommes (kg)', 'cahiers', 'stylos', 'croissants'] },
  { theme: '🚗 Distance', unit: 'km', items: ['trajet A', 'trajet B', 'course', 'randonnée'] },
]
export function generateProblem(level = 1) {
  const ctx = CONTEXTS[Math.floor(Math.random() * CONTEXTS.length)]
  const item = ctx.items[Math.floor(Math.random() * ctx.items.length)]
  const baseQty = level === 1 ? [2, 3, 4, 5][Math.floor(Math.random() * 4)] : [2, 3, 4, 5, 6, 8][Math.floor(Math.random() * 6)]
  const baseVal = (2 + Math.floor(Math.random() * 8)) * baseQty
  const targetQty = level <= 2 ? baseQty * (2 + Math.floor(Math.random() * 3)) : Math.round((baseQty * (1.5 + Math.random() * 2.5)) * 10) / 10
  const answer = Math.round((baseVal / baseQty) * targetQty * 100) / 100
  return { theme: ctx.theme, unit: ctx.unit, item, baseQty, baseVal, targetQty, answer, explanation: `${baseVal} ÷ ${baseQty} = ${Math.round((baseVal/baseQty)*100)/100} ${ctx.unit}/unité → × ${targetQty} = ${answer} ${ctx.unit}` }
}
