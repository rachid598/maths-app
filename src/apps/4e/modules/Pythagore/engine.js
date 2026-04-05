/**
 * Pythagore engine — Écrire l'égalité de Pythagore
 *
 * L'élève voit un triangle rectangle dessiné avec des lettres
 * et doit choisir la bonne égalité parmi 4 propositions.
 *
 * Convention française :
 *   Dans le triangle ABC rectangle en C :
 *   AB² = AC² + BC²   (hypoténuse² = somme des carrés des deux autres côtés)
 */

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

// Triplets de lettres pour les sommets
const VERTEX_SETS = [
  ['A', 'B', 'C'],
  ['D', 'E', 'F'],
  ['M', 'N', 'P'],
  ['R', 'S', 'T'],
  ['I', 'J', 'K'],
  ['L', 'M', 'N'],
  ['X', 'Y', 'Z'],
  ['G', 'H', 'I'],
]

/**
 * Retourne le nom du côté opposé au sommet donné
 * Ex: sommets = ['A','B','C'], sommet = 'C' → 'AB'
 */
function sideOpposite(vertices, vertex) {
  const others = vertices.filter(v => v !== vertex)
  return others[0] + others[1]
}

/**
 * Retourne les deux côtés adjacents au sommet donné
 * Ex: sommets = ['A','B','C'], sommet = 'C' → ['CA', 'CB'] ou ['AC', 'BC']
 */
function sidesAdjacent(vertices, vertex) {
  const others = vertices.filter(v => v !== vertex)
  return [vertex + others[0], vertex + others[1]]
}

/**
 * Fabrique l'égalité correcte sous forme de string
 * "AB² = AC² + BC²"
 */
function makeEquality(hypotenuse, side1, side2) {
  return `${hypotenuse}² = ${side1}² + ${side2}²`
}

/**
 * Génère des distracteurs crédibles
 */
function generateDistractors(vertices, rightAngle, correctEquality) {
  const distractors = new Set()
  const hyp = sideOpposite(vertices, rightAngle)
  const [s1, s2] = sidesAdjacent(vertices, rightAngle)

  // Erreur classique 1 : un côté de l'angle droit = somme des deux autres
  distractors.add(makeEquality(s1, hyp, s2))
  distractors.add(makeEquality(s2, hyp, s1))

  // Erreur classique 2 : inverser hypoténuse et un côté
  const otherVertices = vertices.filter(v => v !== rightAngle)
  for (const v of otherVertices) {
    const wrongHyp = sideOpposite(vertices, v)
    const [ws1, ws2] = sidesAdjacent(vertices, v)
    distractors.add(makeEquality(wrongHyp, ws1, ws2))
  }

  // Retirer la bonne réponse si elle s'y est glissée
  distractors.delete(correctEquality)

  return [...distractors]
}

// ─── Type 1 : Identifier la bonne égalité (QCM) ────────
function generateEqualityQuestion(vertices) {
  const shuffledVertices = shuffle([...vertices])
  const rightAngle = pick(shuffledVertices)
  const hyp = sideOpposite(shuffledVertices, rightAngle)
  const [s1, s2] = sidesAdjacent(shuffledVertices, rightAngle)
  const correct = makeEquality(hyp, s1, s2)

  const wrongs = generateDistractors(shuffledVertices, rightAngle, correct)
  const choices = [correct, ...shuffle(wrongs).slice(0, 3)]
  // S'assurer d'avoir 4 choix
  while (choices.length < 4) {
    // Fallback : ajouter une mauvaise égalité avec un autre format
    const fake = makeEquality(s1, s2, hyp)
    if (!choices.includes(fake)) choices.push(fake)
    else break
  }
  const shuffled = shuffle(choices)

  return {
    type: 'equality',
    vertices: shuffledVertices,
    rightAngle,
    prompt: `Le triangle ${shuffledVertices.join('')} est rectangle en ${rightAngle}.\nÉcris l'égalité de Pythagore.`,
    choices: shuffled,
    correctIndex: shuffled.indexOf(correct),
    answer: correct,
  }
}

// ─── Type 2 : Identifier l'hypoténuse ──────────────────
function generateHypotenuseQuestion(vertices) {
  const shuffledVertices = shuffle([...vertices])
  const rightAngle = pick(shuffledVertices)
  const hyp = sideOpposite(shuffledVertices, rightAngle)

  // Tous les côtés possibles
  const allSides = [
    shuffledVertices[0] + shuffledVertices[1],
    shuffledVertices[0] + shuffledVertices[2],
    shuffledVertices[1] + shuffledVertices[2],
  ]
  const shuffled = shuffle(allSides)

  return {
    type: 'hypotenuse',
    vertices: shuffledVertices,
    rightAngle,
    prompt: `Le triangle ${shuffledVertices.join('')} est rectangle en ${rightAngle}.\nQuel est le côté le plus long (l'hypoténuse) ?`,
    choices: shuffled,
    correctIndex: shuffled.indexOf(hyp),
    answer: hyp,
  }
}

// ─── Type 3 : Identifier le sommet de l'angle droit ────
function generateRightAngleQuestion(vertices) {
  const shuffledVertices = shuffle([...vertices])
  const rightAngle = pick(shuffledVertices)
  const hyp = sideOpposite(shuffledVertices, rightAngle)
  const [s1, s2] = sidesAdjacent(shuffledVertices, rightAngle)
  const equality = makeEquality(hyp, s1, s2)

  const shuffled = shuffle([...shuffledVertices])

  return {
    type: 'right_angle',
    vertices: shuffledVertices,
    rightAngle,
    showEquality: equality,
    prompt: `On sait que ${equality}.\nEn quel sommet est l'angle droit ?`,
    choices: shuffled,
    correctIndex: shuffled.indexOf(rightAngle),
    answer: rightAngle,
  }
}

// ─── Triplets pythagoriciens (pour le calcul) ──────────

const BASE_TRIPLETS = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [6, 8, 10],
  [9, 12, 15],
  [12, 16, 20],
  [15, 20, 25],
  [7, 24, 25],
  [9, 40, 41],
  [20, 21, 29],
]

function getPythagoreanTriplet() {
  const base = pick(BASE_TRIPLETS)
  const scale = pick([1, 2])
  return base.map(v => v * scale)
}

// ─── Type 4 : Calculer un côté (saisie numérique) ──────

function generateCalculQuestion(vertices) {
  const shuffledVertices = shuffle([...vertices])
  const rightAngle = pick(shuffledVertices)
  const hyp = sideOpposite(shuffledVertices, rightAngle)
  const [s1, s2] = sidesAdjacent(shuffledVertices, rightAngle)
  const [a, b, c] = getPythagoreanTriplet() // a, b = cathètes, c = hypoténuse

  const variant = Math.random()

  if (variant < 0.5) {
    // Trouver l'hypoténuse
    return {
      type: 'calcul',
      vertices: shuffledVertices,
      rightAngle,
      sides: { [s1]: a, [s2]: b, [hyp]: '?' },
      answer: c,
      prompt: `Le triangle ${shuffledVertices.join('')} est rectangle en ${rightAngle}.\n${s1} = ${a} cm et ${s2} = ${b} cm.\nCalcule ${hyp}.`,
      hint: `${hyp}² = ${s1}² + ${s2}² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}\n${hyp} = √${c * c} = ${c} cm`,
      choices: null,
      correctIndex: null,
    }
  } else {
    // Trouver un cathète
    const findFirst = Math.random() < 0.5
    if (findFirst) {
      return {
        type: 'calcul',
        vertices: shuffledVertices,
        rightAngle,
        sides: { [s1]: '?', [s2]: b, [hyp]: c },
        answer: a,
        prompt: `Le triangle ${shuffledVertices.join('')} est rectangle en ${rightAngle}.\n${hyp} = ${c} cm et ${s2} = ${b} cm.\nCalcule ${s1}.`,
        hint: `${s1}² = ${hyp}² − ${s2}² = ${c}² − ${b}² = ${c * c} − ${b * b} = ${a * a}\n${s1} = √${a * a} = ${a} cm`,
        choices: null,
        correctIndex: null,
      }
    }
    return {
      type: 'calcul',
      vertices: shuffledVertices,
      rightAngle,
      sides: { [s1]: a, [s2]: '?', [hyp]: c },
      answer: b,
      prompt: `Le triangle ${shuffledVertices.join('')} est rectangle en ${rightAngle}.\n${hyp} = ${c} cm et ${s1} = ${a} cm.\nCalcule ${s2}.`,
      hint: `${s2}² = ${hyp}² − ${s1}² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}\n${s2} = √${b * b} = ${b} cm`,
      choices: null,
      correctIndex: null,
    }
  }
}

// ─── Niveaux ────────────────────────────────────────────

export const LEVELS = [
  { id: 1, label: 'N1', title: "L'hypoténuse", color: 'from-emerald-400 to-teal-500', desc: 'Identifier le côté le plus long' },
  { id: 2, label: 'N2', title: "L'égalité", color: 'from-teal-400 to-cyan-500', desc: "Écrire l'égalité de Pythagore" },
  { id: 3, label: 'N3', title: 'Calculer un côté', color: 'from-cyan-400 to-blue-500', desc: 'Appliquer Pythagore avec des valeurs' },
  { id: 4, label: 'N4', title: 'Mix complet', color: 'from-blue-500 to-indigo-500', desc: 'Tout mélangé !' },
]

export const QUESTIONS_PER_ROUND = 10

const GENERATORS = {
  1: [generateHypotenuseQuestion],
  2: [generateEqualityQuestion],
  3: [generateCalculQuestion],
  4: [generateHypotenuseQuestion, generateEqualityQuestion, generateRightAngleQuestion, generateCalculQuestion],
}

export function generateQuestion(levelId) {
  const vertices = pick(VERTEX_SETS)
  const gen = pick(GENERATORS[levelId])
  return gen(vertices)
}

export function generateRound(levelId, count = QUESTIONS_PER_ROUND) {
  const questions = []
  let lastKey = ''
  for (let i = 0; i < count; i++) {
    let q, key, attempts = 0
    do {
      q = generateQuestion(levelId)
      key = `${q.type}-${q.answer}`
      attempts++
    } while (key === lastKey && attempts < 20)
    lastKey = key
    questions.push(q)
  }
  return questions
}
