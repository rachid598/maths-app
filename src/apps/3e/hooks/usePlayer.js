import { useState, useCallback } from 'react'

const STORAGE_KEY = 'maths3e_player'

function loadPlayer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* corrupted data */ }
  return null
}

function savePlayer(player) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(player))
}

export function usePlayer() {
  const [player, setPlayer] = useState(loadPlayer)

  const register = useCallback((name, classe) => {
    const p = { name: name.trim(), classe: classe.trim(), createdAt: Date.now() }
    savePlayer(p)
    setPlayer(p)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setPlayer(null)
  }, [])

  return { player, register, logout }
}
