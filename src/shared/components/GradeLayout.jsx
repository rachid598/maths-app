import { createContext, useContext, useEffect, useCallback } from 'react'
import { usePlayer } from '../hooks/usePlayer'
import { useBadges } from '../hooks/useBadges'
import { useHistory } from '../hooks/useHistory'
import { getStorageKeys } from '../utils/storageKeys'

const GradeContext = createContext(null)

/**
 * Hook pour accéder au contexte grade depuis les composants enfants
 */
export function useGrade() {
  const context = useContext(GradeContext)
  if (!context) {
    throw new Error('useGrade must be used within GradeLayout')
  }
  return context
}

/**
 * Layout générique pour un niveau (6e, 5e, 3e)
 * @param {Object} props
 * @param {string} props.grade - Le niveau (6e, 5e, 3e)
 * @param {string} props.theme - Classe CSS pour le thème (ex: "theme-6e")
 * @param {React.Component} props.OnboardingComponent - Composant d'onboarding
 * @param {React.ReactNode} props.children - Contenu (Routes)
 */
export default function GradeLayout({ grade, theme, OnboardingComponent, children }) {
  const { player, savePlayer, updatePlayer, resetPlayer, clearPlayer, register, logout } = usePlayer(grade)
  const { earned, newBadge, dismissBadge, unlock, checkStarBadges, checkGameBadges, makeBadgeCheck } = useBadges(grade)
  const { loadHistory: loadHistoryFn } = useHistory(grade)

  // Gestion du dark mode
  useEffect(() => {
    const isDark = player?.darkMode
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return () => document.documentElement.classList.remove('dark')
  }, [player?.darkMode])

  const toggleDark = useCallback(() => {
    updatePlayer({ darkMode: !player?.darkMode })
  }, [player?.darkMode, updatePlayer])

  // Fonction de vérification des badges (compatible 6e)
  const makeBadgeCheckFn = useCallback((module) => {
    return (finalScore, extra, maxStreak) => {
      const keys = getStorageKeys(grade)
      const history = loadHistoryFn()
      const totalGames = history.length
      const perfectCount = history.filter(e => e.score === (e.total || 10)).length
      const modulesPlayed = new Set(history.map(e => e.module)).size
      const chronoBest = parseInt(localStorage.getItem(keys.chrono.best) || '0')
      const dailyData = JSON.parse(localStorage.getItem(keys.daily) || '{}')
      const dailyCount = dailyData.totalCompleted || 0

      if (totalGames >= 1) unlock('first_game')
      if (totalGames >= 10) unlock('ten_games')
      if (totalGames >= 50) unlock('fifty_games')
      if (perfectCount >= 1) unlock('perfect_10')
      if (perfectCount >= 3) unlock('three_perfect')
      if (maxStreak >= 10) unlock('streak_10')
      if (maxStreak >= 20) unlock('streak_20')
      if (modulesPlayed >= 4) unlock('all_modules')
      if (chronoBest >= 30) unlock('chrono_30')
      if (dailyCount >= 5) unlock('daily_5')

      if (module === 'TS' && extra) checkStarBadges(extra)
      if (module === 'duel') unlock('duel_win')
    }
  }, [unlock, checkStarBadges, loadHistoryFn, grade])

  // Si pas de player, afficher l'onboarding
  if (!player) {
    return (
      <div className={`${theme} min-h-screen`}>
        <OnboardingComponent onSave={savePlayer} />
      </div>
    )
  }

  // Context value
  const contextValue = {
    player,
    savePlayer,
    updatePlayer,
    resetPlayer,
    clearPlayer,
    register,
    logout,
    earned,
    newBadge,
    dismissBadge,
    unlock,
    checkStarBadges,
    checkGameBadges,
    makeBadgeCheck: makeBadgeCheckFn,
    grade,
    darkMode: player.darkMode,
    toggleDark,
    badgeCount: earned.length,
  }

  return (
    <GradeContext.Provider value={contextValue}>
      <div className={`${theme} min-h-screen ${player.darkMode ? 'dark' : ''}`}>
        {children}
      </div>
    </GradeContext.Provider>
  )
}
