const HISTORY_KEY = 'maths6e_history'
const MAX_ENTRIES = 50

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}

export function addHistory(entry) {
  const history = loadHistory()
  history.push({
    ...entry,
    date: new Date().toISOString(),
  })
  if (history.length > MAX_ENTRIES) history.splice(0, history.length - MAX_ENTRIES)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  return history
}

export function getHistoryForModule(module, limit = 10) {
  return loadHistory()
    .filter((e) => e.module === module)
    .slice(-limit)
}

export function exportResults() {
  const data = {
    player: JSON.parse(localStorage.getItem('maths6e_player') || '{}'),
    history: loadHistory(),
    scores: {
      tableStrike: JSON.parse(localStorage.getItem('maths6e_ts_scores') || '{}'),
      divisix: JSON.parse(localStorage.getItem('maths6e_dv_scores') || '{}'),
    },
    badges: JSON.parse(localStorage.getItem('maths6e_badges') || '[]'),
    exportDate: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `maths-6e-resultats-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
