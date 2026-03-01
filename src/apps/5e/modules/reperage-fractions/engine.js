/**
 * Engine — Repérage de fractions sur une demi-droite graduée
 *
 * 3 modes :
 *   - "lire"   : une demi-droite est affichée, un point est placé → l'élève donne la fraction
 *   - "placer" : une fraction est donnée → l'élève clique sur la demi-droite pour placer le point
 *   - "mix"    : alternance des deux
 *
 * 3 niveaux de difficulté :
 *   N1 : dénominateurs simples (2, 3, 4, 5), fractions < 1
 *   N2 : dénominateurs moyens (2–8), fractions < 2
 *   N3 : dénominateurs variés (2–12), fractions < 3, fractions égales à reconnaître
 */

const LEVEL_CONFIG = {
  1: { denoms: [2, 3, 4, 5], maxWhole: 1, label: 'Facile' },
  2: { denoms: [2, 3, 4, 5, 6, 8], maxWhole: 2, label: 'Moyen' },
  3: { denoms: [2, 3, 4, 5, 6, 7, 8, 10, 12], maxWhole: 3, label: 'Difficile' },
}

export function getLevelConfig(level) {
  return LEVEL_CONFIG[level] || LEVEL_CONFIG[1]
}

export function generateQuestion(level = 1) {
  const config = getLevelConfig(level)
  const denom = config.denoms[Math.floor(Math.random() * config.denoms.length)]
  const maxNum = denom * config.maxWhole
  // numérateur entre 1 et maxNum (on évite 0)
  const num = Math.floor(Math.random() * maxNum) + 1

  // Graduation : on affiche la droite de 0 à ceil(num/denom)
  const maxVal = Math.max(Math.ceil(num / denom), 1)

  return {
    num,
    denom,
    maxVal,
    value: num / denom,
  }
}

export function gcd(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) { [a, b] = [b, a % b] }
  return a
}

export function simplify(num, denom) {
  const g = gcd(num, denom)
  return { num: num / g, denom: denom / g }
}

/**
 * Vérifie si la réponse de l'élève correspond à la fraction attendue.
 * Accepte les fractions équivalentes.
 */
export function checkAnswer(expectedNum, expectedDenom, answerNum, answerDenom) {
  if (!answerNum || !answerDenom || answerDenom === 0) return false
  // Comparaison par produit en croix
  return expectedNum * answerDenom === expectedDenom * answerNum
}

/**
 * Vérifie si un clic sur la droite correspond à la bonne position.
 * tolerance = fraction de l'unité (ex: 0.08 = 8% d'erreur accepté)
 */
export function checkPlacement(expectedValue, clickedValue, tolerance = 0.08) {
  return Math.abs(expectedValue - clickedValue) <= tolerance
}
