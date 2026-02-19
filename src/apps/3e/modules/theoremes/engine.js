/**
 * Théorèmes engine — Pythagore, Thalès & réciproques.
 *
 * Generates questions with integer-friendly triplets so students
 * work with clean numbers (important for REP pedagogy: avoid
 * discouraging decimals in early levels).
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

// ─── Pythagorean triplets (scaled) ──────────────────────
const BASE_TRIPLETS = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [6, 8, 10],
  [9, 12, 15],
  [12, 16, 20],
  [15, 20, 25],
  [9, 40, 41],
  [20, 21, 29],
]

function getPythagoreanTriplet() {
  const base = pickFrom(BASE_TRIPLETS)
  const scale = pickFrom([1, 2, 3])
  return base.map((v) => v * scale)
}

// ─── Thalès configurations ──────────────────────────────
// Two parallel lines cut by two secants from point A
// Ratios are kept clean (integers or simple fractions)
function getThalesConfig() {
  const ratios = [
    { AB: 3, AC: 5, AM: 6, AN: 10 },
    { AB: 4, AC: 6, AM: 8, AN: 12 },
    { AB: 2, AC: 7, AM: 4, AN: 14 },
    { AB: 3, AC: 9, AM: 5, AN: 15 },
    { AB: 5, AC: 10, AM: 7, AN: 14 },
    { AB: 4, AC: 10, AM: 6, AN: 15 },
    { AB: 6, AC: 9, AM: 10, AN: 15 },
    { AB: 3, AC: 12, AM: 4, AN: 16 },
    { AB: 5, AC: 15, AM: 8, AN: 24 },
    { AB: 2, AC: 8, AM: 3, AN: 12 },
  ]
  return pickFrom(ratios)
}

// ─── Level 1: Pythagore direct ──────────────────────────
function generatePythagore() {
  const [a, b, c] = getPythagoreanTriplet()
  // Randomly choose which side to find
  const variant = rand(0, 2)

  if (variant === 0) {
    // Find hypotenuse
    return {
      type: 'pythagore',
      subtype: 'hypotenuse',
      triangle: { name: 'ABC', rightAngle: 'A' },
      sides: { AB: a, AC: b, BC: '?' },
      known: { a, b },
      answer: c,
      prompt: `Le triangle ABC est rectangle en A.\nAB = ${a} cm et AC = ${b} cm.\nCalcule BC.`,
      hint: `BC² = AB² + AC² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}`,
      unit: 'cm',
    }
  } else if (variant === 1) {
    // Find a cathetus (given hypotenuse and one side)
    return {
      type: 'pythagore',
      subtype: 'cathetus',
      triangle: { name: 'ABC', rightAngle: 'A' },
      sides: { AB: '?', AC: b, BC: c },
      known: { b, c },
      answer: a,
      prompt: `Le triangle ABC est rectangle en A.\nBC = ${c} cm et AC = ${b} cm.\nCalcule AB.`,
      hint: `AB² = BC² − AC² = ${c}² − ${b}² = ${c * c} − ${b * b} = ${a * a}`,
      unit: 'cm',
    }
  } else {
    return {
      type: 'pythagore',
      subtype: 'cathetus',
      triangle: { name: 'ABC', rightAngle: 'A' },
      sides: { AB: a, AC: '?', BC: c },
      known: { a, c },
      answer: b,
      prompt: `Le triangle ABC est rectangle en A.\nBC = ${c} cm et AB = ${a} cm.\nCalcule AC.`,
      hint: `AC² = BC² − AB² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}`,
      unit: 'cm',
    }
  }
}

// ─── Level 2: Thalès direct ─────────────────────────────
function generateThales() {
  const cfg = getThalesConfig()
  // Hide one of: AC, AN, AB, AM
  const options = [
    {
      hidden: 'AN',
      answer: cfg.AN,
      prompt: `Les droites (BM) et (CN) sont parallèles.\nAB = ${cfg.AB} cm, AC = ${cfg.AC} cm, AM = ${cfg.AM} cm.\nCalcule AN.`,
      hint: `AB/AC = AM/AN ⟹ ${cfg.AB}/${cfg.AC} = ${cfg.AM}/AN ⟹ AN = ${cfg.AM} × ${cfg.AC} / ${cfg.AB} = ${cfg.AN}`,
      config: { AB: cfg.AB, AC: cfg.AC, AM: cfg.AM, AN: '?' },
    },
    {
      hidden: 'AM',
      answer: cfg.AM,
      prompt: `Les droites (BM) et (CN) sont parallèles.\nAB = ${cfg.AB} cm, AC = ${cfg.AC} cm, AN = ${cfg.AN} cm.\nCalcule AM.`,
      hint: `AB/AC = AM/AN ⟹ ${cfg.AB}/${cfg.AC} = AM/${cfg.AN} ⟹ AM = ${cfg.AB} × ${cfg.AN} / ${cfg.AC} = ${cfg.AM}`,
      config: { AB: cfg.AB, AC: cfg.AC, AM: '?', AN: cfg.AN },
    },
    {
      hidden: 'AC',
      answer: cfg.AC,
      prompt: `Les droites (BM) et (CN) sont parallèles.\nAB = ${cfg.AB} cm, AM = ${cfg.AM} cm, AN = ${cfg.AN} cm.\nCalcule AC.`,
      hint: `AB/AC = AM/AN ⟹ ${cfg.AB}/AC = ${cfg.AM}/${cfg.AN} ⟹ AC = ${cfg.AB} × ${cfg.AN} / ${cfg.AM} = ${cfg.AC}`,
      config: { AB: cfg.AB, AC: '?', AM: cfg.AM, AN: cfg.AN },
    },
  ]
  const q = pickFrom(options)
  return {
    type: 'thales',
    subtype: 'direct',
    config: q.config,
    answer: q.answer,
    prompt: q.prompt,
    hint: q.hint,
    unit: 'cm',
  }
}

// ─── Level 3: Réciproques ───────────────────────────────
function generateReciproque() {
  const isPythagore = Math.random() < 0.5

  if (isPythagore) {
    // Réciproque de Pythagore: is the triangle right-angled?
    const isRight = Math.random() < 0.5
    let a, b, c

    if (isRight) {
      ;[a, b, c] = getPythagoreanTriplet()
    } else {
      // Generate a non-right triangle
      const triplet = getPythagoreanTriplet()
      a = triplet[0]
      b = triplet[1]
      c = triplet[2] + pickFrom([1, 2, -1]) // Break the triplet
      if (c <= 0) c = triplet[2] + 2
    }

    // Shuffle presentation order but keep track of largest
    const sides = shuffle([
      { label: 'AB', value: a },
      { label: 'AC', value: b },
      { label: 'BC', value: c },
    ])
    const largest = sides.reduce((max, s) => (s.value > max.value ? s : max), sides[0])
    const others = sides.filter((s) => s !== largest)

    const sumSquares = others[0].value ** 2 + others[1].value ** 2
    const largestSquare = largest.value ** 2

    return {
      type: 'reciproque-pythagore',
      subtype: isRight ? 'est-rectangle' : 'pas-rectangle',
      sides,
      answer: isRight ? 'oui' : 'non',
      prompt: `${sides[0].label} = ${sides[0].value} cm, ${sides[1].label} = ${sides[1].value} cm, ${sides[2].label} = ${sides[2].value} cm.\nLe triangle ABC est-il rectangle ?`,
      hint: isRight
        ? `${largest.label}² = ${largestSquare} et ${others[0].label}² + ${others[1].label}² = ${others[0].value ** 2} + ${others[1].value ** 2} = ${sumSquares}\n${largestSquare} = ${sumSquares} ⟹ Rectangle en ${largest.label === 'BC' ? 'A' : largest.label === 'AC' ? 'B' : 'C'}`
        : `${largest.label}² = ${largestSquare} et ${others[0].label}² + ${others[1].label}² = ${others[0].value ** 2} + ${others[1].value ** 2} = ${sumSquares}\n${largestSquare} ≠ ${sumSquares} ⟹ Pas rectangle`,
      unit: null,
    }
  } else {
    // Réciproque de Thalès: are the lines parallel?
    const isParallel = Math.random() < 0.5
    let cfg

    if (isParallel) {
      cfg = getThalesConfig()
    } else {
      cfg = getThalesConfig()
      // Break the ratio slightly
      cfg.AN = cfg.AN + pickFrom([1, 2, 3])
    }

    const ratio1 = `AB/AC = ${cfg.AB}/${cfg.AC}`
    const ratio2 = `AM/AN = ${cfg.AM}/${cfg.AN}`
    const r1 = cfg.AB / cfg.AC
    const r2 = cfg.AM / cfg.AN

    return {
      type: 'reciproque-thales',
      subtype: isParallel ? 'paralleles' : 'pas-paralleles',
      config: cfg,
      answer: isParallel ? 'oui' : 'non',
      prompt: `AB = ${cfg.AB} cm, AC = ${cfg.AC} cm, AM = ${cfg.AM} cm, AN = ${cfg.AN} cm.\nLes droites (BM) et (CN) sont-elles parallèles ?`,
      hint: isParallel
        ? `${ratio1} = ${round(r1, 4)} et ${ratio2} = ${round(r2, 4)}\nLes rapports sont égaux ⟹ Parallèles (Thalès)`
        : `${ratio1} = ${round(r1, 4)} et ${ratio2} = ${round(r2, 4)}\nLes rapports sont différents ⟹ Pas parallèles`,
      unit: null,
    }
  }
}

function round(n, d) {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

// ─── Public API ─────────────────────────────────────────

export function generateQuestion(level) {
  switch (level) {
    case 1:
      return generatePythagore()
    case 2:
      return generateThales()
    case 3:
      return generateReciproque()
    default:
      return generatePythagore()
  }
}

export const LEVEL_LABELS = {
  1: { name: 'Niveau 1', desc: 'Théorème de Pythagore', color: 'text-emerald-400' },
  2: { name: 'Niveau 2', desc: 'Théorème de Thalès', color: 'text-blue-400' },
  3: { name: 'Niveau 3', desc: 'Réciproques', color: 'text-purple-400' },
}
