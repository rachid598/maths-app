// ── Vocabulaire du cercle ──

const TERMS = [
  {
    kind: 'centre',
    label: 'Centre',
    desc: 'Le point situé au milieu du cercle, à égale distance de tous les points du cercle',
  },
  {
    kind: 'rayon',
    label: 'Rayon',
    desc: 'Segment qui relie le centre à un point du cercle',
  },
  {
    kind: 'diametre',
    label: 'Diamètre',
    desc: 'Segment qui relie deux points du cercle en passant par le centre',
  },
  {
    kind: 'corde',
    label: 'Corde',
    desc: 'Segment qui relie deux points du cercle (sans passer forcément par le centre)',
  },
  {
    kind: 'arc',
    label: 'Arc de cercle',
    desc: 'Portion du cercle comprise entre deux points',
  },
  {
    kind: 'disque',
    label: 'Disque',
    desc: "Surface intérieure délimitée par le cercle (la partie \"pleine\")",
  },
]

const VRAI_FAUX = [
  { statement: 'Le diamètre est toujours le double du rayon', answer: true },
  { statement: 'Le rayon est la moitié du diamètre', answer: true },
  { statement: 'Une corde passe toujours par le centre', answer: false },
  { statement: 'Le diamètre est la plus grande corde du cercle', answer: true },
  { statement: 'Tous les rayons d\'un même cercle ont la même longueur', answer: true },
  { statement: 'Un arc de cercle est un segment', answer: false },
  { statement: 'Le disque comprend le cercle et son intérieur', answer: true },
  { statement: 'Le centre du cercle est sur le cercle', answer: false },
  { statement: 'Un diamètre est une corde', answer: true },
  { statement: 'Deux rayons bout à bout forment toujours un diamètre', answer: false },
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function termsForLevel(levelId) {
  if (levelId === 1) return TERMS.filter(t => ['centre', 'rayon', 'diametre'].includes(t.kind))
  if (levelId === 2) return TERMS.filter(t => t.kind !== 'disque')
  return TERMS
}

// Type 1 : Figure → Terme
function generateFigureToTerm(terms) {
  const correct = pick(terms)
  const choices = [correct.label]
  for (const t of shuffle(TERMS)) {
    if (choices.length >= 4) break
    if (!choices.includes(t.label)) choices.push(t.label)
  }
  const shuffled = shuffle(choices)
  return {
    type: 'figure_to_term',
    figure: { kind: correct.kind },
    prompt: 'Comment appelle-t-on cet élément ?',
    choices: shuffled,
    correctIndex: shuffled.indexOf(correct.label),
  }
}

// Type 2 : Définition → Terme
function generateDefToTerm(terms) {
  const correct = pick(terms)
  const choices = [correct.label]
  for (const t of shuffle(TERMS)) {
    if (choices.length >= 4) break
    if (!choices.includes(t.label)) choices.push(t.label)
  }
  const shuffled = shuffle(choices)
  return {
    type: 'def_to_term',
    figure: null,
    prompt: correct.desc + ' — de quoi s\'agit-il ?',
    choices: shuffled,
    correctIndex: shuffled.indexOf(correct.label),
  }
}

// Type 3 : Terme → Définition
function generateTermToDef(terms) {
  const correct = pick(terms)
  const choices = [correct.desc]
  for (const t of shuffle(TERMS)) {
    if (choices.length >= 4) break
    if (!choices.includes(t.desc)) choices.push(t.desc)
  }
  const shuffled = shuffle(choices)
  return {
    type: 'term_to_def',
    figure: null,
    prompt: `Qu'est-ce qu'un ${correct.label.toLowerCase()} ?`,
    choices: shuffled,
    correctIndex: shuffled.indexOf(correct.desc),
  }
}

// Type 4 : Vrai / Faux
function generateVraiFaux() {
  const item = pick(VRAI_FAUX)
  const choices = ['Vrai', 'Faux']
  return {
    type: 'vrai_faux',
    figure: null,
    prompt: item.statement,
    choices,
    correctIndex: item.answer ? 0 : 1,
  }
}

// Type 5 : Calcul rayon ↔ diamètre
function generateCalcul() {
  const rayon = randInt(1, 20)
  const diametre = rayon * 2
  if (Math.random() < 0.5) {
    // Rayon → Diamètre
    return {
      type: 'calcul',
      figure: null,
      prompt: `Le rayon d'un cercle mesure ${rayon} cm. Quel est son diamètre ?`,
      inputAnswer: diametre,
      choices: null,
      correctIndex: null,
    }
  }
  // Diamètre → Rayon
  return {
    type: 'calcul',
    figure: null,
    prompt: `Le diamètre d'un cercle mesure ${diametre} cm. Quel est son rayon ?`,
    inputAnswer: rayon,
    choices: null,
    correctIndex: null,
  }
}

export const LEVELS = [
  { id: 1, label: 'N1', title: 'Les bases', color: 'from-teal-400 to-cyan-500' },
  { id: 2, label: 'N2', title: '+ Corde & Arc', color: 'from-cyan-400 to-blue-500' },
  { id: 3, label: 'N3', title: 'Mix complet', color: 'from-blue-500 to-indigo-500' },
]

export const QUESTIONS_PER_ROUND = 10

const GENERATORS_BASIC = [generateFigureToTerm, generateDefToTerm, generateTermToDef]

export function generateQuestion(levelId) {
  const terms = termsForLevel(levelId)
  if (levelId === 3 && Math.random() < 0.3) {
    return Math.random() < 0.5 ? generateVraiFaux() : generateCalcul()
  }
  const gen = pick(GENERATORS_BASIC)
  return gen(terms)
}

export function generateRound(levelId, count = QUESTIONS_PER_ROUND) {
  const questions = []
  let lastKey = ''
  for (let i = 0; i < count; i++) {
    let q, key, attempts = 0
    do {
      q = generateQuestion(levelId)
      key = `${q.type}-${q.prompt}`
      attempts++
    } while (key === lastKey && attempts < 20)
    lastKey = key
    questions.push(q)
  }
  return questions
}
