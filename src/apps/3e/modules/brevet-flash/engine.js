export const QUESTIONS = [
  { id: 1, theme: 'Calcul numérique', text: 'Calculer : 3/4 + 5/4', answer: '2', explanation: '3/4 + 5/4 = 8/4 = 2', difficulty: 1 },
  { id: 2, theme: 'Calcul numérique', text: 'Calculer : 2³ × 2²', answer: '32', explanation: '2³ × 2² = 2⁵ = 32', difficulty: 1 },
  { id: 3, theme: 'Calcul numérique', text: 'Calculer : √144', answer: '12', explanation: '√144 = 12 car 12² = 144', difficulty: 1 },
  { id: 4, theme: 'Calcul numérique', text: 'Calculer : 7/3 − 1/3', answer: '2', explanation: '7/3 − 1/3 = 6/3 = 2', difficulty: 1 },
  { id: 5, theme: 'Pythagore', text: 'Triangle rectangle : côtés 3 cm et 4 cm. Hypoténuse ?', answer: '5', explanation: 'c² = 3² + 4² = 9 + 16 = 25, c = 5 cm', difficulty: 2 },
  { id: 6, theme: 'Pythagore', text: 'Triangle rectangle : hypoténuse 13 cm, un côté 5 cm. Autre côté ?', answer: '12', explanation: 'b² = 13² − 5² = 169 − 25 = 144, b = 12 cm', difficulty: 2 },
  { id: 7, theme: 'Pythagore', text: 'Triangle rectangle : côtés 6 cm et 8 cm. Hypoténuse ?', answer: '10', explanation: 'c² = 6² + 8² = 36 + 64 = 100, c = 10 cm', difficulty: 2 },
  { id: 8, theme: 'Thalès', text: 'Droites parallèles coupant deux sécantes. AB = 4, AC = 6, DE = 3. Calculer DF.', answer: '4.5', explanation: 'AB/AC = DE/DF → 4/6 = 3/DF → DF = 3×6/4 = 4.5', difficulty: 2 },
  { id: 9, theme: 'Thalès', text: 'Thalès : AB = 5, AC = 10, DE = 3. Calculer DF.', answer: '6', explanation: 'AB/AC = DE/DF → 5/10 = 3/DF → DF = 6', difficulty: 2 },
  { id: 10, theme: 'Thalès', text: 'Thalès : AB = 8, AC = 12, DE = 6. Calculer DF.', answer: '9', explanation: 'AB/AC = DE/DF → 8/12 = 6/DF → DF = 9', difficulty: 2 },
  { id: 11, theme: 'Fonctions', text: 'f(x) = 2x + 3. Calculer f(4).', answer: '11', explanation: 'f(4) = 2×4 + 3 = 8 + 3 = 11', difficulty: 1 },
  { id: 12, theme: 'Fonctions', text: "f(x) = 3x − 1. Quel est l'antécédent de 8 ?", answer: '3', explanation: '3x − 1 = 8 → 3x = 9 → x = 3', difficulty: 2 },
  { id: 13, theme: 'Fonctions', text: 'f(x) = x² − 1. Calculer f(5).', answer: '24', explanation: 'f(5) = 25 − 1 = 24', difficulty: 2 },
  { id: 14, theme: 'Fonctions', text: 'f(x) = −2x + 10. Calculer f(3).', answer: '4', explanation: 'f(3) = −6 + 10 = 4', difficulty: 1 },
  { id: 15, theme: 'Probabilités', text: "On lance un dé équilibré. Probabilité d'obtenir un nombre pair ? (fraction)", answer: '1/2', explanation: 'Nombres pairs : 2, 4, 6 → 3/6 = 1/2', difficulty: 1 },
  { id: 16, theme: 'Probabilités', text: 'Urne : 3 boules rouges, 7 bleues. Probabilité de tirer une rouge ? (fraction)', answer: '3/10', explanation: '3 rouges sur 10 boules = 3/10', difficulty: 1 },
  { id: 17, theme: 'Probabilités', text: "On lance un dé. Probabilité d'obtenir un multiple de 3 ? (fraction)", answer: '1/3', explanation: 'Multiples de 3 : 3, 6 → 2/6 = 1/3', difficulty: 1 },
  { id: 18, theme: 'Probabilités', text: "Jeu de 32 cartes. Probabilité de tirer un as ? (fraction)", answer: '1/8', explanation: '4 as sur 32 cartes = 4/32 = 1/8', difficulty: 2 },
  { id: 19, theme: 'Calcul littéral', text: 'Développer : 3(x + 2)', answer: '3x+6', explanation: '3(x + 2) = 3x + 6', difficulty: 1 },
  { id: 20, theme: 'Calcul littéral', text: 'Factoriser : 4x + 12', answer: '4(x+3)', explanation: '4x + 12 = 4(x + 3)', difficulty: 1 },
  { id: 21, theme: 'Calcul littéral', text: 'Développer : (x + 3)(x − 2)', answer: 'x²+x-6', explanation: '(x+3)(x−2) = x² − 2x + 3x − 6 = x² + x − 6', difficulty: 2 },
  { id: 22, theme: 'Calcul littéral', text: 'Développer : (2x − 1)²', answer: '4x²-4x+1', explanation: '(2x−1)² = 4x² − 4x + 1', difficulty: 3 },
  { id: 23, theme: 'Calcul numérique', text: 'Calculer : 5⁰', answer: '1', explanation: 'Tout nombre non nul élevé à la puissance 0 vaut 1', difficulty: 1 },
  { id: 24, theme: 'Calcul numérique', text: 'Calculer : √50 sous la forme a√2 (donner a)', answer: '5', explanation: '√50 = √(25×2) = 5√2, donc a = 5', difficulty: 2 },
]

export const TOTAL_TIME = 300
export const NUM_QUESTIONS = 5

export function pickQuestions(n = NUM_QUESTIONS) {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5)
  const themes = [...new Set(QUESTIONS.map(q => q.theme))]
  const picked = []
  for (const theme of themes.sort(() => Math.random() - 0.5)) {
    if (picked.length >= n) break
    const q = shuffled.find(q => q.theme === theme && !picked.includes(q))
    if (q) picked.push(q)
  }
  for (const q of shuffled) {
    if (picked.length >= n) break
    if (!picked.includes(q)) picked.push(q)
  }
  return picked.slice(0, n)
}

function normalize(s) { return String(s).replace(/\s+/g, '').toLowerCase() }
export function checkAnswer(userAnswer, correctAnswer) { return normalize(userAnswer) === normalize(correctAnswer) }

export function computeGrade(correct, total) {
  const pct = correct / total
  if (pct >= 1) return 'A+'
  if (pct >= 0.8) return 'A'
  if (pct >= 0.6) return 'B+'
  if (pct >= 0.4) return 'B'
  return 'C'
}

export const GRADE_COLORS = { 'A+': '#10b981', 'A': '#10b981', 'B+': '#fbbf24', 'B': '#fbbf24', 'C': '#ef4444' }
export const THEME_COLORS = { 'Calcul numérique': '#6366f1', 'Pythagore': '#10b981', 'Thalès': '#f59e0b', 'Fonctions': '#ec4899', 'Probabilités': '#8b5cf6', 'Calcul littéral': '#06b6d4' }
