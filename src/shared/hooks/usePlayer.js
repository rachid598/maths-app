import { useState, useCallback } from 'react'

/**
 * Hook générique pour gérer le profil joueur.
 * @param {string} grade - Le niveau ('6e', '5e', '3e')
 * @returns {object} { player, savePlayer, updatePlayer, resetPlayer }
 */
export function usePlayer(grade) {
  const STORAGE_KEY = `maths${grade}_player`

  const [player, setPlayer] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const savePlayer = useCallback((data) => {
    // Support both object (6e style) and individual params (5e/3e style)
    let profile
    if (typeof data === 'object' && data !== null && 'prenom' in data) {
      // 6e style: { prenom, classe, avatar }
      profile = {
        prenom: data.prenom.trim(),
        classe: data.classe.trim(),
        avatar: data.avatar,
        darkMode: false,
        createdAt: new Date().toISOString(),
      }
    } else if (typeof data === 'string') {
      // 5e/3e style: savePlayer(name, classe) - name is first arg
      const name = data
      const classe = arguments[1] || ''
      profile = {
        name: name.trim(),
        classe: classe.trim(),
        createdAt: Date.now(),
      }
    } else if (data && data.name) {
      // Generic object with name
      profile = {
        name: data.name.trim(),
        classe: data.classe?.trim() || '',
        createdAt: data.createdAt || Date.now(),
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    setPlayer(profile)
  }, [STORAGE_KEY])

  const updatePlayer = useCallback((patch) => {
    setPlayer((prev) => {
      const updated = { ...prev, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [STORAGE_KEY])

  const resetPlayer = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setPlayer(null)
  }, [STORAGE_KEY])

  return { player, savePlayer, updatePlayer, resetPlayer }
}
