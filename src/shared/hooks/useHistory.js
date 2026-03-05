/**
 * Hooks/fonctions génériques pour gérer l'historique des parties.
 * @param {string} grade - Le niveau ('6e', '5e', '3e')
 */

const MAX_ENTRIES = 50

export function loadHistory(grade) {
  const HISTORY_KEY = `maths${grade}_history`
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}

export function addHistory(grade, entry) {
  const HISTORY_KEY = `maths${grade}_history`
  const history = loadHistory(grade)
  history.push({
    ...entry,
    date: new Date().toISOString(),
  })
  if (history.length > MAX_ENTRIES) {
    history.splice(0, history.length - MAX_ENTRIES)
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  return history
}

export function getHistoryForModule(grade, module, limit = 10) {
  return loadHistory(grade)
    .filter((e) => e.module === module)
    .slice(-limit)
}

export function exportResults(grade) {
  const data = {
    player: JSON.parse(localStorage.getItem(`maths${grade}_player`) || '{}'),
    history: loadHistory(grade),
    scores: {
      tableStrike: JSON.parse(localStorage.getItem(`maths${grade}_ts_scores`) || '{}'),
      divisix: JSON.parse(localStorage.getItem(`maths${grade}_dv_scores`) || '{}'),
    },
    badges: JSON.parse(localStorage.getItem(`maths${grade}_badges`) || '[]'),
    exportDate: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `maths-${grade}-resultats-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
