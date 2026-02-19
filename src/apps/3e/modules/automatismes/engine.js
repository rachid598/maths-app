/**
 * Automatismes Brevet DNB 2026 — Engine
 *
 * 49 types de questions couvrant les 8 domaines du programme :
 * - Calcul numérique (fractions, puissances, racines, relatifs, conversions)
 * - Calcul littéral (développer, factoriser, résoudre)
 * - Proportionnalité / pourcentages / vitesse
 * - Probabilités / statistiques (moyenne, médiane, étendue)
 * - Géométrie (angles, aires, volumes, conversions, symétries)
 * - Fonctions (image, antécédent, coordonnées, lecture graphique)
 * - Algorithmique (tableur, Scratch)
 *
 * 3 formats: QCM, Vrai/Faux, Réponse directe
 * Source: Liste indicative d'automatismes — Eduscol, octobre 2025
 */

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Utilities ──────────────────────────────────────────

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b)
  while (b) { [a, b] = [b, a % b] }
  return a
}

function superChar(n) {
  const map = { '-': '\u207B', '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3',
    '4': '\u2074', '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079' }
  return String(n).split('').map(c => map[c] || c).join('')
}

/**
 * Déduplique les choix QCM : si un distracteur a le même texte que la
 * bonne réponse ou qu'un autre distracteur, on le remplace par un
 * distracteur de secours. Garantit toujours 4 choix uniques.
 */
function dedup(choices) {
  const correct = choices.find((c) => c.correct)
  const seen = new Set([correct.text])
  const result = [correct]
  for (const c of choices) {
    if (c.correct) continue
    if (!seen.has(c.text)) {
      seen.add(c.text)
      result.push(c)
    }
  }
  // Remplir si des doublons ont été retirés
  let pad = 1
  while (result.length < 4) {
    const fallback = `${correct.text} ?${pad}`
    // Génère un distracteur numérique décalé si possible
    const num = parseFloat(correct.text.replace(',', '.').replace(/[^0-9.\-/]/g, ''))
    let alt
    if (!isNaN(num)) {
      alt = String(num + pad * (Math.random() < 0.5 ? 1 : -1)).replace('.', ',')
    } else {
      alt = fallback
    }
    if (!seen.has(alt)) {
      seen.add(alt)
      result.push({ text: alt, correct: false })
    }
    pad++
    if (pad > 10) break // sécurité
  }
  return shuffle(result)
}

// Table de correspondance fraction/décimal/% (sujets zéro DNB)
const FRAC_DEC_TABLE = [
  { frac: '1/2', dec: '0,5', pct: '50', num: 1, den: 2 },
  { frac: '1/4', dec: '0,25', pct: '25', num: 1, den: 4 },
  { frac: '3/4', dec: '0,75', pct: '75', num: 3, den: 4 },
  { frac: '1/5', dec: '0,2', pct: '20', num: 1, den: 5 },
  { frac: '2/5', dec: '0,4', pct: '40', num: 2, den: 5 },
  { frac: '3/5', dec: '0,6', pct: '60', num: 3, den: 5 },
  { frac: '4/5', dec: '0,8', pct: '80', num: 4, den: 5 },
  { frac: '1/10', dec: '0,1', pct: '10', num: 1, den: 10 },
  { frac: '3/10', dec: '0,3', pct: '30', num: 3, den: 10 },
  { frac: '7/10', dec: '0,7', pct: '70', num: 7, den: 10 },
  { frac: '9/10', dec: '0,9', pct: '90', num: 9, den: 10 },
]

// ─── 1. Calcul numérique (12 générateurs) ───────────────

function calculNumerique() {
  const generators = [
    // 1. Addition de fractions
    () => {
      const a = rand(1, 9), b = rand(2, 9), c = rand(1, 9), d = rand(2, 9)
      const num = a * d + c * b, den = b * d
      const g = gcd(num, den)
      return {
        category: 'Calcul',
        format: 'qcm',
        question: `Combien vaut  ${a}/${b} + ${c}/${d} ?`,
        choices: dedup([
          { text: `${num / g}/${den / g}`, correct: true },
          { text: `${a + c}/${b + d}`, correct: false },
          { text: `${num}/${den}`, correct: false },
          { text: `${a + c}/${b * d}`, correct: false },
        ]),
      }
    },
    // 2. Puissance de 10
    () => {
      const exp = rand(2, 6)
      const val = Math.pow(10, exp)
      return {
        category: 'Calcul',
        format: 'input',
        question: `Combien vaut 10${superChar(exp)} ?`,
        answer: String(val),
        acceptedAnswers: [String(val)],
      }
    },
    // 3. Carré parfait
    () => {
      const n = rand(2, 15)
      const sq = n * n
      return {
        category: 'Calcul',
        format: 'input',
        question: `Combien vaut √${sq} ?`,
        answer: String(n),
        acceptedAnswers: [String(n)],
      }
    },
    // 4. Priorité opérations
    () => {
      const a = rand(2, 8), b = rand(2, 5), c = rand(1, 9)
      const result = a + b * c
      return {
        category: 'Calcul',
        format: 'qcm',
        question: `Combien vaut  ${a} + ${b} × ${c} ?`,
        choices: dedup([
          { text: `${result}`, correct: true },
          { text: `${(a + b) * c}`, correct: false },
          { text: `${a * b + c}`, correct: false },
          { text: `${a + b + c}`, correct: false },
        ]),
      }
    },
    // 5. Opposé / inverse
    () => {
      const n = rand(2, 12)
      const isOppose = Math.random() < 0.5
      if (isOppose) {
        return {
          category: 'Calcul',
          format: 'input',
          question: `Quel est l'opposé de ${n} ?`,
          answer: String(-n),
          acceptedAnswers: [String(-n), `−${n}`],
        }
      }
      return {
        category: 'Calcul',
        format: 'qcm',
        question: `Quel est l'inverse de ${n} ?`,
        choices: dedup([
          { text: `1/${n}`, correct: true },
          { text: `−${n}`, correct: false },
          { text: `${n}/1`, correct: false },
          { text: `−1/${n}`, correct: false },
        ]),
      }
    },
    // 6. Puissance négative
    () => {
      const base = rand(2, 5)
      return {
        category: 'Calcul',
        format: 'qcm',
        question: `Combien vaut  ${base}${superChar(-1)} ?`,
        choices: dedup([
          { text: `1/${base}`, correct: true },
          { text: `−${base}`, correct: false },
          { text: `−1/${base}`, correct: false },
          { text: `${base}`, correct: false },
        ]),
      }
    },
    // 7. Fraction ↔ Décimal ↔ Pourcentage (sujet zéro DNB)
    () => {
      const entry = pickFrom(FRAC_DEC_TABLE)
      const others = FRAC_DEC_TABLE.filter((e) => e.frac !== entry.frac)
      const direction = rand(0, 2)
      if (direction === 0) {
        // fraction → décimal
        const distractors = shuffle(others).slice(0, 3).map((e) => ({ text: e.dec, correct: false }))
        return {
          category: 'Calcul',
          format: 'qcm',
          question: `Quelle est l'écriture décimale de ${entry.frac} ?`,
          choices: dedup([{ text: entry.dec, correct: true }, ...distractors]),
        }
      } else if (direction === 1) {
        // décimal → fraction
        const distractors = shuffle(others).slice(0, 3).map((e) => ({ text: e.frac, correct: false }))
        return {
          category: 'Calcul',
          format: 'qcm',
          question: `Quelle fraction correspond à ${entry.dec} ?`,
          choices: dedup([{ text: entry.frac, correct: true }, ...distractors]),
        }
      } else {
        // fraction → pourcentage
        const distractors = shuffle(others).slice(0, 3).map((e) => ({ text: `${e.pct} %`, correct: false }))
        return {
          category: 'Calcul',
          format: 'qcm',
          question: `À quel pourcentage correspond ${entry.frac} ?`,
          choices: dedup([{ text: `${entry.pct} %`, correct: true }, ...distractors]),
        }
      }
    },
    // 8. Fraction d'une quantité ("le tiers de", "le quart de"…)
    () => {
      const fracs = [
        { label: 'la moitié', den: 2 },
        { label: 'le tiers', den: 3 },
        { label: 'le quart', den: 4 },
        { label: 'le cinquième', den: 5 },
        { label: 'le dixième', den: 10 },
        { label: 'les deux tiers', den: 3, num: 2 },
        { label: 'les trois quarts', den: 4, num: 3 },
      ]
      const f = pickFrom(fracs)
      const multiplier = rand(2, 10)
      const total = f.den * multiplier
      const numerator = f.num || 1
      const answer = numerator * multiplier
      return {
        category: 'Calcul',
        format: 'input',
        question: `Combien vaut ${f.label} de ${total} ?`,
        answer: String(answer),
        acceptedAnswers: [String(answer)],
      }
    },
    // 9. Nombres relatifs : opérations
    () => {
      const a = rand(-12, 12), b = rand(-12, 12)
      const isAdd = Math.random() < 0.5
      if (isAdd) {
        const result = a + b
        const aStr = a < 0 ? `(${a})` : String(a)
        const bStr = b < 0 ? `(${b})` : String(b)
        return {
          category: 'Calcul',
          format: 'input',
          question: `Combien vaut ${aStr} + ${bStr} ?`,
          answer: String(result),
          acceptedAnswers: [String(result)],
        }
      }
      const result = a - b
      const aStr = a < 0 ? `(${a})` : String(a)
      const bStr = b < 0 ? `(${b})` : String(b)
      return {
        category: 'Calcul',
        format: 'input',
        question: `Combien vaut ${aStr} − ${bStr} ?`,
        answer: String(result),
        acceptedAnswers: [String(result)],
      }
    },
    // 9b. Multiplication de relatifs
    () => {
      let a = rand(-9, 9), b = rand(-9, 9)
      while (a === 0 || b === 0 || a === 1 || b === 1) { a = rand(-9, 9); b = rand(-9, 9) }
      const result = a * b
      const aStr = a < 0 ? `(${a})` : String(a)
      const bStr = b < 0 ? `(${b})` : String(b)
      return {
        category: 'Calcul',
        format: 'input',
        question: `Combien vaut ${aStr} \u00d7 ${bStr} ?`,
        answer: String(result),
        acceptedAnswers: [String(result)],
      }
    },
    // 10. Comparer / ordonner des nombres
    () => {
      const pool = [
        ...[-7, -3, -1, 0, 2, 5, 8].map((n) => ({ display: String(n), value: n })),
        { display: '1/2', value: 0.5 },
        { display: '1/4', value: 0.25 },
        { display: '3/4', value: 0.75 },
        { display: '−1/2', value: -0.5 },
        { display: '0,1', value: 0.1 },
        { display: '−0,5', value: -0.5 },
        { display: '1,5', value: 1.5 },
      ]
      const picked = shuffle(pool).slice(0, 4)
      const askMax = Math.random() < 0.5
      const target = askMax
        ? picked.reduce((m, p) => (p.value > m.value ? p : m), picked[0])
        : picked.reduce((m, p) => (p.value < m.value ? p : m), picked[0])
      return {
        category: 'Calcul',
        format: 'qcm',
        question: askMax
          ? `Quel est le plus grand nombre ?\n${picked.map((p) => p.display).join('  ;  ')}`
          : `Quel est le plus petit nombre ?\n${picked.map((p) => p.display).join('  ;  ')}`,
        choices: shuffle(
          picked.map((p) => ({ text: p.display, correct: p === target }))
        ),
      }
    },
    // 11. Simplifier une fraction
    () => {
      const a = rand(2, 10), b = rand(2, 10)
      const k = rand(2, 6)
      const num = a * k, den = b * k
      const g = gcd(num, den)
      return {
        category: 'Calcul',
        format: 'input',
        question: `Simplifier la fraction ${num}/${den}`,
        answer: `${num / g}/${den / g}`,
        acceptedAnswers: [`${num / g}/${den / g}`],
      }
    },
    // 12. Multiplier des fractions
    () => {
      const a = rand(1, 5), b = rand(2, 7), c = rand(1, 5), d = rand(2, 7)
      const num = a * c, den = b * d
      const g = gcd(num, den)
      const correct = `${num / g}/${den / g}`
      return {
        category: 'Calcul',
        format: 'qcm',
        question: `Combien vaut ${a}/${b} × ${c}/${d} ?`,
        choices: dedup([
          { text: correct, correct: true },
          { text: `${a + c}/${b + d}`, correct: false },
          { text: `${a * c}/${b + d}`, correct: false },
          { text: `${a + c}/${b * d}`, correct: false },
        ]),
      }
    },
  ]
  return pickFrom(generators)()
}

// ─── 2. Calcul littéral (4 générateurs) ─────────────────

function calculLitteral() {
  const generators = [
    // 1. Développer
    () => {
      const a = rand(2, 6), b = rand(1, 9)
      return {
        category: 'Algèbre',
        format: 'qcm',
        question: `Développer :  ${a}(x + ${b})`,
        choices: dedup([
          { text: `${a}x + ${a * b}`, correct: true },
          { text: `${a}x + ${b}`, correct: false },
          { text: `${a + b}x`, correct: false },
          { text: `x + ${a * b}`, correct: false },
        ]),
      }
    },
    // 2. Résoudre équation simple
    () => {
      const sol = rand(-8, 8)
      const a = rand(2, 7)
      const b = a * sol
      return {
        category: 'Algèbre',
        format: 'input',
        question: `Résoudre :  ${a}x = ${b}`,
        answer: String(sol),
        acceptedAnswers: [String(sol)],
      }
    },
    // 3. Identité remarquable (a+b)²
    () => {
      const a = rand(1, 5), b = rand(1, 5)
      return {
        category: 'Algèbre',
        format: 'qcm',
        question: `Développer :  (${a}x + ${b})²`,
        choices: dedup([
          { text: `${a * a}x² + ${2 * a * b}x + ${b * b}`, correct: true },
          { text: `${a * a}x² + ${b * b}`, correct: false },
          { text: `${a * a}x² + ${a * b}x + ${b * b}`, correct: false },
          { text: `${a * a}x² − ${2 * a * b}x + ${b * b}`, correct: false },
        ]),
      }
    },
    // 4. Factoriser avec facteur commun
    () => {
      const k = rand(2, 6), a = rand(1, 9), b = rand(1, 9)
      return {
        category: 'Algèbre',
        format: 'qcm',
        question: `Factoriser :  ${k * a}x + ${k * b}`,
        choices: dedup([
          { text: `${k}(${a}x + ${b})`, correct: true },
          { text: `${a}(${k}x + ${b})`, correct: false },
          { text: `${k * a}(x + ${b})`, correct: false },
          { text: `x(${k * a} + ${k * b})`, correct: false },
        ]),
      }
    },
  ]
  return pickFrom(generators)()
}

// ─── 3. Proportionnalité (5 générateurs) ────────────────

function proportionnalite() {
  const generators = [
    // 1. Pourcentage direct
    () => {
      const pct = pickFrom([10, 15, 20, 25, 30, 50])
      const base = pickFrom([40, 60, 80, 100, 120, 200, 300])
      const result = (pct * base) / 100
      return {
        category: 'Proportions',
        format: 'input',
        question: `Combien font ${pct} % de ${base} ?`,
        answer: String(result),
        acceptedAnswers: [String(result)],
      }
    },
    // 2. Vitesse / distance / temps
    () => {
      const v = pickFrom([30, 40, 50, 60, 80, 100])
      const t = pickFrom([2, 3, 4, 5])
      const d = v * t
      const variant = rand(0, 2)
      if (variant === 0) {
        return {
          category: 'Proportions',
          format: 'input',
          question: `Un véhicule roule à ${v} km/h pendant ${t} h.\nQuelle distance parcourt-il (en km) ?`,
          answer: String(d),
          acceptedAnswers: [String(d)],
        }
      } else if (variant === 1) {
        return {
          category: 'Proportions',
          format: 'input',
          question: `Un véhicule parcourt ${d} km en ${t} h.\nQuelle est sa vitesse (en km/h) ?`,
          answer: String(v),
          acceptedAnswers: [String(v)],
        }
      }
      return {
        category: 'Proportions',
        format: 'input',
        question: `Un véhicule roule à ${v} km/h.\nCombien de temps (en h) pour parcourir ${d} km ?`,
        answer: String(t),
        acceptedAnswers: [String(t)],
      }
    },
    // 3. Échelle
    () => {
      const echelle = pickFrom([100, 200, 500, 1000, 2000])
      const plan = rand(2, 15)
      const reel = plan * echelle
      return {
        category: 'Proportions',
        format: 'input',
        question: `Sur un plan à l'échelle 1/${echelle}, un segment mesure ${plan} cm.\nQuelle est la longueur réelle (en cm) ?`,
        answer: String(reel),
        acceptedAnswers: [String(reel)],
      }
    },
    // 4. Augmentation en pourcentage (sujet zéro DNB)
    () => {
      const configs = [
        { base: 80, pct: 25 }, { base: 100, pct: 20 }, { base: 60, pct: 50 },
        { base: 200, pct: 10 }, { base: 150, pct: 20 }, { base: 40, pct: 25 },
        { base: 120, pct: 25 }, { base: 500, pct: 10 }, { base: 300, pct: 30 },
      ]
      const cfg = pickFrom(configs)
      const increase = (cfg.base * cfg.pct) / 100
      const result = cfg.base + increase
      return {
        category: 'Proportions',
        format: 'input',
        question: `Un article coûte ${cfg.base} €.\nSon prix augmente de ${cfg.pct} %.\nQuel est le nouveau prix (en €) ?`,
        answer: String(result),
        acceptedAnswers: [String(result)],
      }
    },
    // 5. Diminution en pourcentage (sujet zéro DNB)
    () => {
      const configs = [
        { base: 120, pct: 25 }, { base: 80, pct: 50 }, { base: 200, pct: 30 },
        { base: 150, pct: 20 }, { base: 100, pct: 10 }, { base: 60, pct: 50 },
        { base: 300, pct: 20 }, { base: 400, pct: 25 }, { base: 500, pct: 10 },
      ]
      const cfg = pickFrom(configs)
      const decrease = (cfg.base * cfg.pct) / 100
      const result = cfg.base - decrease
      return {
        category: 'Proportions',
        format: 'input',
        question: `Un article coûte ${cfg.base} €.\nSon prix diminue de ${cfg.pct} %.\nQuel est le nouveau prix (en €) ?`,
        answer: String(result),
        acceptedAnswers: [String(result)],
      }
    },
  ]
  return pickFrom(generators)()
}

// ─── 4. Probabilités & Statistiques (6 générateurs) ─────

function probabilitesStats() {
  const generators = [
    // 1. Probabilité simple
    () => {
      const total = pickFrom([6, 8, 10, 12, 20])
      const favorable = rand(1, total - 1)
      const g = gcd(favorable, total)
      return {
        category: 'Probas',
        format: 'qcm',
        question: `Un sac contient ${total} boules. ${favorable} sont rouges.\nQuelle est la probabilité de tirer une boule rouge ?`,
        choices: dedup([
          { text: `${favorable / g}/${total / g}`, correct: true },
          { text: `${total - favorable}/${total}`, correct: false },
          { text: `${favorable}/${total + favorable}`, correct: false },
          { text: `1/${total}`, correct: false },
        ]),
      }
    },
    // 2. Moyenne (FIX: construction déterministe, plus de récursion)
    () => {
      const n = rand(3, 5)
      const target = rand(8, 15)
      const values = Array.from({ length: n - 1 }, () => rand(5, 18))
      const partialSum = values.reduce((a, b) => a + b, 0)
      const last = target * n - partialSum
      if (last < 1 || last > 25) {
        // Fallback sur des valeurs propres
        const preset = [10, 12, 14]
        return {
          category: 'Probas',
          format: 'input',
          question: `Quelle est la moyenne de : ${preset.join(' ; ')} ?`,
          answer: '12',
          acceptedAnswers: ['12'],
        }
      }
      values.push(last)
      const displayed = shuffle(values)
      return {
        category: 'Probas',
        format: 'input',
        question: `Quelle est la moyenne de : ${displayed.join(' ; ')} ?`,
        answer: String(target),
        acceptedAnswers: [String(target)],
      }
    },
    // 3. Événement contraire
    () => {
      const pNum = rand(1, 9)
      const pDen = 10
      const g = gcd(pNum, pDen)
      const cNum = pDen - pNum
      const gc = gcd(cNum, pDen)
      return {
        category: 'Probas',
        format: 'qcm',
        question: `La probabilité d'un événement A est ${pNum / g}/${pDen / g}.\nQuelle est la probabilité de l'événement contraire ?`,
        choices: dedup([
          { text: `${cNum / gc}/${pDen / gc}`, correct: true },
          { text: `${pNum / g}/${pDen / g}`, correct: false },
          { text: `1/${pDen / g}`, correct: false },
          { text: `${pDen / g}/${cNum / gc}`, correct: false },
        ]),
      }
    },
    // 4. Médiane (sujet zéro DNB)
    () => {
      const n = pickFrom([5, 7]) // impair → médiane propre
      const values = Array.from({ length: n }, () => rand(2, 25))
      const sorted = [...values].sort((a, b) => a - b)
      const median = sorted[Math.floor(n / 2)]
      return {
        category: 'Probas',
        format: 'input',
        question: `Quelle est la médiane de la série :\n${shuffle(values).join(' ; ')} ?`,
        answer: String(median),
        acceptedAnswers: [String(median)],
      }
    },
    // 5. Étendue (sujet zéro DNB)
    () => {
      const n = rand(4, 7)
      const values = Array.from({ length: n }, () => rand(2, 30))
      const min = Math.min(...values)
      const max = Math.max(...values)
      const etendue = max - min
      return {
        category: 'Probas',
        format: 'input',
        question: `Quelle est l'étendue de la série :\n${values.join(' ; ')} ?`,
        answer: String(etendue),
        acceptedAnswers: [String(etendue)],
      }
    },
    // 6. Équiprobabilité (sujet zéro DNB)
    () => {
      const scenarios = [
        {
          q: 'On lance un dé équilibré à 6 faces.\nQuelle est la probabilité d\'obtenir un nombre pair ?',
          answer: '3/6', simplified: '1/2',
        },
        {
          q: 'On lance un dé équilibré à 6 faces.\nQuelle est la probabilité d\'obtenir un 6 ?',
          answer: '1/6', simplified: '1/6',
        },
        {
          q: 'On lance un dé équilibré à 6 faces.\nQuelle est la probabilité d\'obtenir un nombre supérieur à 4 ?',
          answer: '2/6', simplified: '1/3',
        },
        {
          q: 'On lance une pièce équilibrée.\nQuelle est la probabilité d\'obtenir pile ?',
          answer: '1/2', simplified: '1/2',
        },
        {
          q: 'On lance un dé équilibré à 6 faces.\nQuelle est la probabilité d\'obtenir un nombre impair ?',
          answer: '3/6', simplified: '1/2',
        },
        {
          q: 'Un sac contient 3 boules rouges et 2 boules bleues.\nQuelle est la probabilité de tirer une boule bleue ?',
          answer: '2/5', simplified: '2/5',
        },
      ]
      const s = pickFrom(scenarios)
      const wrongAnswers = ['1/4', '1/3', '2/3', '1/6', '5/6', '1/2', '2/5', '3/5']
        .filter((w) => w !== s.simplified && w !== s.answer)
      return {
        category: 'Probas',
        format: 'qcm',
        question: s.q,
        choices: dedup([
          { text: s.simplified, correct: true },
          ...shuffle(wrongAnswers).slice(0, 3).map((w) => ({ text: w, correct: false })),
        ]),
      }
    },
  ]
  return pickFrom(generators)()
}

// ─── 5. Géométrie (15 générateurs) ──────────────────────

function geometrie() {
  const generators = [
    // 1. Aire rectangle
    () => {
      const l = rand(3, 12), w = rand(2, 10)
      return {
        category: 'Géométrie',
        format: 'input',
        question: `Aire d'un rectangle de longueur ${l} cm et largeur ${w} cm (en cm²) ?`,
        answer: String(l * w),
        acceptedAnswers: [String(l * w)],
      }
    },
    // 2. Périmètre cercle
    () => {
      const r = rand(2, 10)
      const d = 2 * r
      return {
        category: 'Géométrie',
        format: 'qcm',
        question: `Quel est le périmètre d'un cercle de rayon ${r} cm ?`,
        choices: dedup([
          { text: `${d}π cm`, correct: true },
          { text: `${r}π cm`, correct: false },
          { text: `${r * r}π cm`, correct: false },
          { text: `${d + d} cm`, correct: false },
        ]),
      }
    },
    // 3. Volume cube
    () => {
      const c = rand(2, 8)
      return {
        category: 'Géométrie',
        format: 'input',
        question: `Volume d'un cube d'arête ${c} cm (en cm³) ?`,
        answer: String(c ** 3),
        acceptedAnswers: [String(c ** 3)],
      }
    },
    // 4. Angles d'un triangle
    () => {
      const a = rand(30, 80), b = rand(20, 150 - a)
      const c = 180 - a - b
      return {
        category: 'Géométrie',
        format: 'input',
        question: `Un triangle a deux angles de ${a}° et ${b}°.\nQuel est le troisième angle (en °) ?`,
        answer: String(c),
        acceptedAnswers: [String(c)],
      }
    },
    // 5. Aire triangle
    () => {
      const base = pickFrom([4, 6, 8, 10, 12])
      const h = pickFrom([3, 5, 6, 7, 8])
      const aire = (base * h) / 2
      return {
        category: 'Géométrie',
        format: 'input',
        question: `Aire d'un triangle de base ${base} cm et hauteur ${h} cm (en cm²) ?`,
        answer: String(aire),
        acceptedAnswers: [String(aire)],
      }
    },
    // 6. Angles alternes-internes
    () => {
      const angle = rand(30, 150)
      return {
        category: 'Géométrie',
        format: 'vraifaux',
        question: `Deux droites parallèles sont coupées par une sécante.\nSi un angle vaut ${angle}°, l'angle alterne-interne vaut aussi ${angle}°.`,
        answer: true,
      }
    },
    // 7. Aire du disque (sujet zéro DNB)
    () => {
      const r = rand(2, 8)
      const rSquared = r * r
      return {
        category: 'Géométrie',
        format: 'qcm',
        question: `Quelle est l'aire d'un disque de rayon ${r} cm ?`,
        choices: dedup([
          { text: `${rSquared}π cm²`, correct: true },
          { text: `${2 * r}π cm²`, correct: false },
          { text: `${r}π cm²`, correct: false },
          { text: `${rSquared * 2}π cm²`, correct: false },
        ]),
      }
    },
    // 8. Volume pavé droit (sujet zéro DNB)
    () => {
      const l = rand(2, 8), w = rand(2, 6), h = rand(2, 6)
      return {
        category: 'Géométrie',
        format: 'input',
        question: `Volume d'un pavé droit de ${l} cm, ${w} cm et ${h} cm (en cm³) ?`,
        answer: String(l * w * h),
        acceptedAnswers: [String(l * w * h)],
      }
    },
    // 9. Volume cylindre (sujet zéro DNB)
    () => {
      const r = rand(2, 6), h = rand(2, 8)
      const rSquared = r * r
      const coeff = rSquared * h
      return {
        category: 'Géométrie',
        format: 'qcm',
        question: `Volume d'un cylindre de rayon ${r} cm et hauteur ${h} cm ?`,
        choices: dedup([
          { text: `${coeff}π cm³`, correct: true },
          { text: `${2 * r * h}π cm³`, correct: false },
          { text: `${rSquared}π cm³`, correct: false },
          { text: `${r * h}π cm³`, correct: false },
        ]),
      }
    },
    // 10. Angles opposés par le sommet (sujet zéro DNB)
    () => {
      const angle = rand(20, 160)
      const isSame = Math.random() < 0.6
      const stated = isSame ? angle : angle + pickFrom([5, 10, 15, -5, -10])
      return {
        category: 'Géométrie',
        format: 'vraifaux',
        question: `Deux angles sont opposés par le sommet.\nL'un mesure ${angle}°, l'autre mesure ${stated}°.`,
        answer: isSame,
      }
    },
    // 11. Angles supplémentaires (sujet zéro DNB)
    () => {
      const a = rand(20, 160)
      const answer = 180 - a
      return {
        category: 'Géométrie',
        format: 'input',
        question: `Deux angles sont supplémentaires.\nL'un mesure ${a}°. Combien mesure l'autre (en °) ?`,
        answer: String(answer),
        acceptedAnswers: [String(answer)],
      }
    },
    // 12. Angles complémentaires (sujet zéro DNB)
    () => {
      const a = rand(5, 85)
      const answer = 90 - a
      return {
        category: 'Géométrie',
        format: 'input',
        question: `Deux angles sont complémentaires.\nL'un mesure ${a}°. Combien mesure l'autre (en °) ?`,
        answer: String(answer),
        acceptedAnswers: [String(answer)],
      }
    },
    // 13. Conversions d'unités (sujet zéro DNB)
    () => {
      const conversions = [
        { q: (v) => `Convertir ${v} m en cm.`, mult: 100, range: [1, 15] },
        { q: (v) => `Convertir ${v} cm en mm.`, mult: 10, range: [1, 30] },
        { q: (v) => `Convertir ${v} km en m.`, mult: 1000, range: [1, 10] },
        { q: (v) => `Convertir ${v} L en mL.`, mult: 1000, range: [1, 5] },
        { q: (v) => `Convertir ${v} L en cL.`, mult: 100, range: [1, 8] },
        { q: (v) => `Convertir ${v} kg en g.`, mult: 1000, range: [1, 10] },
        { q: (v) => `Convertir ${v} h en min.`, mult: 60, range: [1, 5] },
        { q: (v) => `Un film dure ${v} min. Combien d'heures ?`, mult: 1, range: [60, 300], div: 60 },
      ]
      const conv = pickFrom(conversions)
      const val = rand(conv.range[0], conv.range[1])
      if (conv.div) {
        // Division case — ensure clean result
        const cleanVal = conv.div * rand(1, 5)
        return {
          category: 'Géométrie',
          format: 'input',
          question: conv.q(cleanVal),
          answer: String(cleanVal / conv.div),
          acceptedAnswers: [String(cleanVal / conv.div)],
        }
      }
      const result = val * conv.mult
      return {
        category: 'Géométrie',
        format: 'input',
        question: conv.q(val),
        answer: String(result),
        acceptedAnswers: [String(result)],
      }
    },
    // 13b. Conversions d'aires
    () => {
      const conversions = [
        { q: (v) => `Convertir ${v} m\u00b2 en dm\u00b2.`, mult: 100, range: [1, 5] },
        { q: (v) => `Convertir ${v} dm\u00b2 en cm\u00b2.`, mult: 100, range: [1, 5] },
        { q: (v) => `Convertir ${v} cm\u00b2 en mm\u00b2.`, mult: 100, range: [1, 5] },
        { q: (v) => `${v * 100} dm\u00b2 = ? m\u00b2`, mult: 1, range: [1, 5], isDivision: true, divisor: 100 },
        { q: (v) => `${v * 100} cm\u00b2 = ? dm\u00b2`, mult: 1, range: [1, 5], isDivision: true, divisor: 100 },
      ]
      const conv = pickFrom(conversions)
      const val = rand(conv.range[0], conv.range[1])
      if (conv.isDivision) {
        return {
          category: 'Géométrie',
          format: 'input',
          question: conv.q(val),
          answer: String(val),
          acceptedAnswers: [String(val)],
        }
      }
      return {
        category: 'Géométrie',
        format: 'input',
        question: conv.q(val),
        answer: String(val * conv.mult),
        acceptedAnswers: [String(val * conv.mult)],
      }
    },
    // 13c. Conversions de volumes
    () => {
      const conversions = [
        { q: (v) => `Convertir ${v} m\u00b3 en dm\u00b3.`, mult: 1000, range: [1, 3] },
        { q: (v) => `Convertir ${v} dm\u00b3 en cm\u00b3.`, mult: 1000, range: [1, 3] },
        { q: (v) => `Convertir ${v} dm\u00b3 en L.`, mult: 1, range: [1, 10] },
        { q: (v) => `${v * 1000} cm\u00b3 = ? dm\u00b3`, mult: 1, range: [1, 3], isDivision: true, divisor: 1000 },
        { q: (v) => `${v * 1000} dm\u00b3 = ? m\u00b3`, mult: 1, range: [1, 3], isDivision: true, divisor: 1000 },
      ]
      const conv = pickFrom(conversions)
      const val = rand(conv.range[0], conv.range[1])
      if (conv.isDivision) {
        return {
          category: 'Géométrie',
          format: 'input',
          question: conv.q(val),
          answer: String(val),
          acceptedAnswers: [String(val)],
        }
      }
      return {
        category: 'Géométrie',
        format: 'input',
        question: conv.q(val),
        answer: String(val * conv.mult),
        acceptedAnswers: [String(val * conv.mult)],
      }
    },
    // 14. Symétrie axiale — propriétés (sujet zéro DNB)
    () => {
      const statements = [
        { text: 'La symétrie axiale conserve les longueurs.', answer: true },
        { text: 'La symétrie axiale conserve les angles.', answer: true },
        { text: 'La symétrie axiale conserve les aires.', answer: true },
        { text: 'Un cercle a exactement un axe de symétrie.', answer: false },
        { text: 'Un carré a exactement 4 axes de symétrie.', answer: true },
        { text: 'Un rectangle (non carré) a exactement 2 axes de symétrie.', answer: true },
        { text: 'Un triangle équilatéral a exactement 3 axes de symétrie.', answer: true },
        { text: 'La symétrie axiale transforme une droite en une droite parallèle.', answer: false },
      ]
      const s = pickFrom(statements)
      return {
        category: 'Géométrie',
        format: 'vraifaux',
        question: s.text,
        answer: s.answer,
      }
    },
    // 15. Symétrie centrale — propriétés (sujet zéro DNB)
    () => {
      const statements = [
        { text: 'La symétrie centrale conserve les longueurs.', answer: true },
        { text: 'La symétrie centrale conserve les angles.', answer: true },
        { text: 'Par une symétrie centrale, l\'image d\'un segment est un segment parallèle de même longueur.', answer: true },
        { text: 'Un parallélogramme a un centre de symétrie.', answer: true },
        { text: 'Un triangle équilatéral a un centre de symétrie.', answer: false },
        { text: 'Un cercle a un centre de symétrie : son centre.', answer: true },
        { text: 'La symétrie centrale conserve les aires.', answer: true },
        { text: 'Un rectangle a un centre de symétrie.', answer: true },
      ]
      const s = pickFrom(statements)
      return {
        category: 'Géométrie',
        format: 'vraifaux',
        question: s.text,
        answer: s.answer,
      }
    },
  ]
  return pickFrom(generators)()
}

// ─── 6. Fonctions (5 générateurs) ───────────────────────

function fonctions() {
  const generators = [
    // 1. Image par une fonction
    () => {
      const a = rand(2, 6), b = rand(-8, 8)
      const x = rand(-5, 5)
      const y = a * x + b
      const bSign = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`
      return {
        category: 'Fonctions',
        format: 'input',
        question: `f(x) = ${a}x ${bSign}\nCalculer f(${x}).`,
        answer: String(y),
        acceptedAnswers: [String(y)],
      }
    },
    // 2. Antécédent
    () => {
      const a = rand(2, 5), b = rand(-5, 5)
      const x = rand(-4, 6)
      const y = a * x + b
      const bSign = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`
      return {
        category: 'Fonctions',
        format: 'input',
        question: `f(x) = ${a}x ${bSign}\nTrouver x tel que f(x) = ${y}.`,
        answer: String(x),
        acceptedAnswers: [String(x)],
      }
    },
    // 3. Sens de variation
    () => {
      const a = pickFrom([1, 2, 3, -1, -2, -3])
      const nature = a > 0 ? 'croissante' : 'décroissante'
      return {
        category: 'Fonctions',
        format: 'vraifaux',
        question: `La fonction f(x) = ${a}x + 1 est ${nature}.`,
        answer: true,
      }
    },
    // 4. Coordonnées : lire un point (sujet zéro DNB)
    () => {
      const px = rand(-6, 6), py = rand(-6, 6)
      const askAbscisse = Math.random() < 0.5
      const asked = askAbscisse ? 'abscisse' : 'ordonnée'
      const correct = askAbscisse ? px : py
      const wrong = askAbscisse ? py : px
      return {
        category: 'Fonctions',
        format: 'qcm',
        question: `Le point A a pour coordonnées (${px} ; ${py}).\nQuelle est l'${asked} de A ?`,
        choices: dedup([
          { text: String(correct), correct: true },
          { text: String(wrong), correct: false },
          { text: String(-correct), correct: false },
          { text: String(correct + pickFrom([1, -1, 2])), correct: false },
        ]),
      }
    },
    // 5. Lecture graphique (sujet zéro DNB)
    () => {
      const x0 = rand(-3, 5), y0 = rand(-4, 8)
      const variant = rand(0, 1)
      if (variant === 0) {
        return {
          category: 'Fonctions',
          format: 'qcm',
          question: `Le graphique d'une fonction f passe par le point (${x0} ; ${y0}).\nQuelle est l'image de ${x0} par f ?`,
          choices: dedup([
            { text: String(y0), correct: true },
            { text: String(x0), correct: false },
            { text: String(-y0), correct: false },
            { text: String(y0 + pickFrom([1, 2, -1])), correct: false },
          ]),
        }
      }
      return {
        category: 'Fonctions',
        format: 'qcm',
        question: `Le graphique d'une fonction f passe par le point (${x0} ; ${y0}).\nDonner un antécédent de ${y0} par f.`,
        choices: dedup([
          { text: String(x0), correct: true },
          { text: String(y0), correct: false },
          { text: String(-x0), correct: false },
          { text: String(x0 + pickFrom([1, 2, -1])), correct: false },
        ]),
      }
    },
  ]
  return pickFrom(generators)()
}

// ─── 7. Algorithmique (2 générateurs) ───────────────────

function algorithmique() {
  const generators = [
    // 1. Formule tableur (sujet zéro DNB)
    () => {
      const a1 = rand(2, 10), b1 = rand(2, 10)
      const formulas = [
        { formula: '=A1+B1', result: a1 + b1 },
        { formula: '=A1*B1', result: a1 * b1 },
        { formula: '=A1+B1*2', result: a1 + b1 * 2 },
        { formula: '=A1*2+B1', result: a1 * 2 + b1 },
        { formula: '=(A1+B1)*2', result: (a1 + b1) * 2 },
        { formula: '=A1*B1-A1', result: a1 * b1 - a1 },
      ]
      const op = pickFrom(formulas)
      const wrongs = new Set()
      while (wrongs.size < 3) {
        const w = op.result + pickFrom([-5, -3, -2, -1, 1, 2, 3, 5, 7])
        if (w !== op.result && w > 0) wrongs.add(w)
      }
      return {
        category: 'Algo',
        format: 'qcm',
        question: `Tableur : A1 = ${a1}, B1 = ${b1}.\nQue contient C1 si la formule est ${op.formula} ?`,
        choices: dedup([
          { text: String(op.result), correct: true },
          ...[...wrongs].map((w) => ({ text: String(w), correct: false })),
        ]),
      }
    },
    // 2. Script Scratch (sujet zéro DNB)
    () => {
      const variant = rand(0, 2)
      if (variant === 0) {
        // Addition dans une boucle
        const init = rand(0, 5)
        const step = rand(2, 5)
        const repeats = rand(3, 6)
        const result = init + step * repeats
        return {
          category: 'Algo',
          format: 'input',
          question: `Programme Scratch :\nMettre x à ${init}\nRépéter ${repeats} fois :\n    Ajouter ${step} à x\nQuelle est la valeur de x ?`,
          answer: String(result),
          acceptedAnswers: [String(result)],
        }
      } else if (variant === 1) {
        // Soustraction dans une boucle
        const init = rand(20, 40)
        const step = rand(2, 5)
        const repeats = rand(3, 6)
        const result = init - step * repeats
        return {
          category: 'Algo',
          format: 'input',
          question: `Programme Scratch :\nMettre x à ${init}\nRépéter ${repeats} fois :\n    Retirer ${step} à x\nQuelle est la valeur de x ?`,
          answer: String(result),
          acceptedAnswers: [String(result)],
        }
      }
      // Programme de calcul textuel
      const start = rand(1, 6)
      const mult = rand(2, 4)
      const add = rand(1, 10)
      const result = start * mult + add
      return {
        category: 'Algo',
        format: 'input',
        question: `Programme de calcul :\n• Choisir ${start}\n• Multiplier par ${mult}\n• Ajouter ${add}\nQuel est le résultat ?`,
        answer: String(result),
        acceptedAnswers: [String(result)],
      }
    },
  ]
  return pickFrom(generators)()
}

// ─── Public API ─────────────────────────────────────────

const CATEGORIES = [
  calculNumerique,
  calculLitteral,
  proportionnalite,
  probabilitesStats,
  geometrie,
  fonctions,
  algorithmique,
]

/**
 * Generate a balanced session of N questions.
 * FIX: Round-robin complet + remplissage aléatoire (plus de biais).
 */
export function generateSession(count = 10) {
  const questions = []
  // Phase 1 : un round complet (1 question par catégorie)
  const fullRounds = Math.floor(count / CATEGORIES.length)
  for (let r = 0; r < fullRounds; r++) {
    for (const gen of CATEGORIES) {
      questions.push(gen())
    }
  }
  // Phase 2 : combler le reste avec des catégories tirées au sort
  const remaining = count - questions.length
  const extra = shuffle([...Array(CATEGORIES.length).keys()]).slice(0, remaining)
  for (const idx of extra) {
    questions.push(CATEGORIES[idx]())
  }
  return shuffle(questions)
}

/**
 * Check if a user answer matches the expected answer.
 * FIX: normalise π/pi pour les réponses avec π.
 */
export function checkAnswer(question, userAnswer) {
  const clean = userAnswer.trim().replace(',', '.').replace(/\s/g, '').replace(/π/g, 'pi')

  if (question.format === 'qcm') {
    return question.choices.find((c) => c.correct)?.text === userAnswer
  }

  if (question.format === 'vraifaux') {
    const asBool = clean === 'vrai' || clean === 'true' || clean === 'oui'
    return asBool === question.answer
  }

  // Input format
  if (question.acceptedAnswers) {
    return question.acceptedAnswers.some((a) => {
      const expected = a.replace(',', '.').replace(/\s/g, '').replace(/π/g, 'pi')
      return clean === expected
    })
  }

  return clean === String(question.answer).replace(',', '.').replace(/π/g, 'pi')
}

/**
 * Generate a custom session from a specific set of generators.
 * Used by special modes (e.g., Relatifs & Conversions).
 */
export function generateCustomSession(count, generators) {
  const questions = []
  const fullRounds = Math.floor(count / generators.length)
  for (let r = 0; r < fullRounds; r++) {
    for (const gen of generators) {
      questions.push(gen())
    }
  }
  const remaining = count - questions.length
  const extra = shuffle([...Array(generators.length).keys()]).slice(0, remaining)
  for (const idx of extra) {
    questions.push(generators[idx]())
  }
  return shuffle(questions)
}

// ─── Générateurs standalone pour le mode spécial ─────────

function genRelatifsAddSub() {
  const a = rand(-12, 12), b = rand(-12, 12)
  const isAdd = Math.random() < 0.5
  const result = isAdd ? a + b : a - b
  const aStr = a < 0 ? `(${a})` : String(a)
  const bStr = b < 0 ? `(${b})` : String(b)
  return {
    category: 'Calcul',
    format: 'input',
    question: `Combien vaut ${aStr} ${isAdd ? '+' : '\u2212'} ${bStr} ?`,
    answer: String(result),
    acceptedAnswers: [String(result)],
  }
}

function genRelatifsMult() {
  let a = rand(-9, 9), b = rand(-9, 9)
  while (a === 0 || b === 0 || a === 1 || b === 1) { a = rand(-9, 9); b = rand(-9, 9) }
  const result = a * b
  const aStr = a < 0 ? `(${a})` : String(a)
  const bStr = b < 0 ? `(${b})` : String(b)
  return {
    category: 'Calcul',
    format: 'input',
    question: `Combien vaut ${aStr} \u00d7 ${bStr} ?`,
    answer: String(result),
    acceptedAnswers: [String(result)],
  }
}

function genConversionsLongueur() {
  const conversions = [
    { q: (v) => `Convertir ${v} m en cm.`, mult: 100, range: [1, 15] },
    { q: (v) => `Convertir ${v} cm en mm.`, mult: 10, range: [1, 30] },
    { q: (v) => `Convertir ${v} km en m.`, mult: 1000, range: [1, 10] },
    { q: (v) => `${v * 100} cm = ? m`, mult: 1, range: [1, 10], isDivision: true },
    { q: (v) => `${v * 1000} m = ? km`, mult: 1, range: [1, 10], isDivision: true },
  ]
  const conv = pickFrom(conversions)
  const val = rand(conv.range[0], conv.range[1])
  if (conv.isDivision) {
    return {
      category: 'Géométrie',
      format: 'input',
      question: conv.q(val),
      answer: String(val),
      acceptedAnswers: [String(val)],
    }
  }
  return {
    category: 'Géométrie',
    format: 'input',
    question: conv.q(val),
    answer: String(val * conv.mult),
    acceptedAnswers: [String(val * conv.mult)],
  }
}

function genConversionsAire() {
  const conversions = [
    { q: (v) => `Convertir ${v} m\u00b2 en dm\u00b2.`, mult: 100, range: [1, 5] },
    { q: (v) => `Convertir ${v} dm\u00b2 en cm\u00b2.`, mult: 100, range: [1, 5] },
    { q: (v) => `Convertir ${v} cm\u00b2 en mm\u00b2.`, mult: 100, range: [1, 5] },
    { q: (v) => `${v * 100} dm\u00b2 = ? m\u00b2`, mult: 1, range: [1, 5], isDivision: true },
    { q: (v) => `${v * 100} cm\u00b2 = ? dm\u00b2`, mult: 1, range: [1, 5], isDivision: true },
  ]
  const conv = pickFrom(conversions)
  const val = rand(conv.range[0], conv.range[1])
  if (conv.isDivision) {
    return {
      category: 'Géométrie',
      format: 'input',
      question: conv.q(val),
      answer: String(val),
      acceptedAnswers: [String(val)],
    }
  }
  return {
    category: 'Géométrie',
    format: 'input',
    question: conv.q(val),
    answer: String(val * conv.mult),
    acceptedAnswers: [String(val * conv.mult)],
  }
}

function genConversionsVolume() {
  const conversions = [
    { q: (v) => `Convertir ${v} m\u00b3 en dm\u00b3.`, mult: 1000, range: [1, 3] },
    { q: (v) => `Convertir ${v} dm\u00b3 en cm\u00b3.`, mult: 1000, range: [1, 3] },
    { q: (v) => `${v * 1000} cm\u00b3 = ? dm\u00b3`, mult: 1, range: [1, 3], isDivision: true },
    { q: (v) => `${v * 1000} dm\u00b3 = ? m\u00b3`, mult: 1, range: [1, 3], isDivision: true },
  ]
  const conv = pickFrom(conversions)
  const val = rand(conv.range[0], conv.range[1])
  if (conv.isDivision) {
    return {
      category: 'Géométrie',
      format: 'input',
      question: conv.q(val),
      answer: String(val),
      acceptedAnswers: [String(val)],
    }
  }
  return {
    category: 'Géométrie',
    format: 'input',
    question: conv.q(val),
    answer: String(val * conv.mult),
    acceptedAnswers: [String(val * conv.mult)],
  }
}

function genConversionsContenance() {
  const conversions = [
    { q: (v) => `Convertir ${v} L en mL.`, mult: 1000, range: [1, 5] },
    { q: (v) => `Convertir ${v} L en cL.`, mult: 100, range: [1, 8] },
    { q: (v) => `Convertir ${v} L en dL.`, mult: 10, range: [1, 10] },
    { q: (v) => `Convertir ${v} dm\u00b3 en L.`, mult: 1, range: [1, 10] },
    { q: (v) => `Convertir ${v} m\u00b3 en L.`, mult: 1000, range: [1, 3] },
    { q: (v) => `${v * 1000} mL = ? L`, mult: 1, range: [1, 5], isDivision: true },
    { q: (v) => `${v * 100} cL = ? L`, mult: 1, range: [1, 8], isDivision: true },
    { q: (v) => `${v * 10} dL = ? L`, mult: 1, range: [1, 10], isDivision: true },
    { q: (v) => `${v * 1000} L = ? m\u00b3`, mult: 1, range: [1, 3], isDivision: true },
  ]
  const conv = pickFrom(conversions)
  const val = rand(conv.range[0], conv.range[1])
  if (conv.isDivision) {
    return {
      category: 'Géométrie',
      format: 'input',
      question: conv.q(val),
      answer: String(val),
      acceptedAnswers: [String(val)],
    }
  }
  return {
    category: 'Géométrie',
    format: 'input',
    question: conv.q(val),
    answer: String(val * conv.mult),
    acceptedAnswers: [String(val * conv.mult)],
  }
}

export const SPECIAL_RELATIFS_CONVERSIONS = [
  genRelatifsAddSub,
  genRelatifsMult,
  genConversionsLongueur,
  genConversionsAire,
  genConversionsVolume,
  genConversionsContenance,
]

export const CATEGORY_COLORS = {
  Calcul: 'bg-amber-500/20 text-amber-400',
  Algèbre: 'bg-blue-500/20 text-blue-400',
  Proportions: 'bg-emerald-500/20 text-emerald-400',
  Probas: 'bg-pink-500/20 text-pink-400',
  Géométrie: 'bg-purple-500/20 text-purple-400',
  Fonctions: 'bg-cyan-500/20 text-cyan-400',
  Algo: 'bg-orange-500/20 text-orange-400',
}
