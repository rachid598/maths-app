import { useState, useCallback } from 'react'

/**
 * Hook générique pour gérer le profil joueur (6e, 5e, 3e)
 * @param {string} grade - Le niveau (6e, 5e, 3e)
 */
export function usePlayer(grade) {
  const STORAGE_KEY = `maths${grade}_player`

  const loadPlayer = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        // Support différents formats de données
        if (data.prenom || data.name) return data
      }
    } catch {
      // corrupted data — ignore
    }
    return null
  }, [STORAGE_KEY])

  const [player, setPlayer] = useState(loadPlayer)

  // Support pour 6e: savePlayer(data) avec objet complet
  // Support pour 5e/3e: savePlayer(name, classe) ou register(name, classe)
  const savePlayer = useCallback((nameOrData, classe) => {
    let profile
    
    if (typeof nameOrData === 'object') {
      // Format 6e: objet complet avec prenom, classe, avatar, etc.
      profile = {
        prenom: nameOrData.prenom?.trim(),
        classe: nameOrData.classe?.trim(),
        avatar: nameOrData.avatar,
        darkMode: nameOrData.darkMode || false,
        createdAt: nameOrData.createdAt || new Date().toISOString(),
      }
    } else {
      // Format 5e/3e: deux paramètres séparés (name, classe)
      profile = {
        name: nameOrData.trim(),
        classe: classe.trim(),
        createdAt: new Date().toISOString(),
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    setPlayer(profile)
  }, [STORAGE_KEY])

  // Alias pour 3e
  const register = savePlayer

  // Support pour 6e: updatePlayer(patch)
  const updatePlayer = useCallback((patch) => {
    setPlayer((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [STORAGE_KEY])

  // Support pour 6e: resetPlayer()
  // Support pour 5e: clearPlayer()
  // Support pour 3e: logout()
  const resetPlayer = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setPlayer(null)
  }, [STORAGE_KEY])

  const clearPlayer = resetPlayer
  const logout = resetPlayer

  return { 
    player, 
    savePlayer, 
    updatePlayer, 
    resetPlayer,
    clearPlayer, // alias pour 5e
    register,    // alias pour 3e
    logout,      // alias pour 3e
  }
}
