import { useState, useCallback } from 'react'

const STORAGE_KEY = 'maths5e_player'

function readPlayer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (data.name && data.classe) return data
    }
  } catch {
    // corrupted data — ignore
  }
  return null
}

function writePlayer(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export default function usePlayer() {
  const [player, setPlayerState] = useState(readPlayer)

  const savePlayer = useCallback((name, classe) => {
    const data = { name: name.trim(), classe: classe.trim() }
    writePlayer(data)
    setPlayerState(data)
  }, [])

  const clearPlayer = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setPlayerState(null)
  }, [])

  return { player, savePlayer, clearPlayer }
}
