const POINT_PAIRS = [
  ['A', 'B'], ['C', 'D'], ['E', 'F'], ['M', 'N'],
  ['P', 'Q'], ['R', 'S'], ['G', 'H'], ['I', 'J'],
]

const OBJECTS = [
  { kind: 'droite',     notation: (a, b) => `(${a}${b})`,  label: 'Droite',      desc: (a, b) => `La droite passant par ${a} et ${b}` },
  { kind: 'segment',    notation: (a, b) => `[${a}${b}]`,  label: 'Segment',     desc: (a, b) => `Le segment d'extremites ${a} et ${b}` },
  { kind: 'demi-droite', notation: (a, b) => `[${a}${b})`, label: 'Demi-droite', desc: (a, b) => `La demi-droite d'origine ${a} passant par ${b}` },
  { kind: 'longueur',   notation: (a, b) => `${a}${b}`,    label: 'Longueur',    desc: (a, b) => `La longueur ${a}${b} (la distance)` },
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

function objectsForLevel(levelId) {
  if (levelId === 1) return OBJECTS.filter(o => o.kind === 'droite' || o.kind === 'segment')
  if (levelId === 2) return OBJECTS.filter(o => o.kind !== 'longueur')
  return OBJECTS
}

function generateFigureToNotation(objects) {
  const pair = pick(POINT_PAIRS)
  const correct = pick(objects)
  const notation = correct.notation(pair[0], pair[1])

  // Build 4 distinct choices using all notations for the same pair
  const allNotations = OBJECTS.map(o => o.notation(pair[0], pair[1]))
  const choices = [notation]
  for (const n of shuffle(allNotations)) {
    if (choices.length >= 4) break
    if (!choices.includes(n)) choices.push(n)
  }

  return {
    type: 'figure_to_notation',
    figure: { kind: correct.kind, points: pair },
    prompt: 'Quelle est la notation de cette figure ?',
    choices: shuffle(choices),
    correctIndex: null, // set below
    answer: notation,
  }
}

function generateNotationToDescription(objects) {
  const pair = pick(POINT_PAIRS)
  const correct = pick(objects)
  const notation = correct.notation(pair[0], pair[1])

  const descriptions = OBJECTS.map(o => o.desc(pair[0], pair[1]))
  const correctDesc = correct.desc(pair[0], pair[1])
  const choices = [correctDesc]
  for (const d of shuffle(descriptions)) {
    if (choices.length >= 4) break
    if (!choices.includes(d)) choices.push(d)
  }

  return {
    type: 'notation_to_description',
    figure: null,
    prompt: `Que designe ${notation} ?`,
    choices: shuffle(choices),
    correctIndex: null,
    answer: correctDesc,
  }
}

function generateDescriptionToNotation(objects) {
  const pair = pick(POINT_PAIRS)
  const correct = pick(objects)
  const desc = correct.desc(pair[0], pair[1])

  const allNotations = OBJECTS.map(o => o.notation(pair[0], pair[1]))
  const notation = correct.notation(pair[0], pair[1])
  const choices = [notation]
  for (const n of shuffle(allNotations)) {
    if (choices.length >= 4) break
    if (!choices.includes(n)) choices.push(n)
  }

  return {
    type: 'description_to_notation',
    figure: null,
    prompt: desc + ' — quelle notation ?',
    choices: shuffle(choices),
    correctIndex: null,
    answer: notation,
  }
}

export const LEVELS = [
  { id: 1, label: 'N1', title: 'Segment & Droite', color: 'from-sky-400 to-blue-500' },
  { id: 2, label: 'N2', title: '+ Demi-droite', color: 'from-blue-400 to-indigo-500' },
  { id: 3, label: 'N3', title: 'Mix complet', color: 'from-indigo-500 to-purple-500' },
]

export const QUESTIONS_PER_ROUND = 10

const GENERATORS = [generateFigureToNotation, generateNotationToDescription, generateDescriptionToNotation]

export function generateQuestion(levelId) {
  const objects = objectsForLevel(levelId)
  const gen = pick(GENERATORS)
  const q = gen(objects)
  q.correctIndex = q.choices.indexOf(q.answer)
  return q
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
