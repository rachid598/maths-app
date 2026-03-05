import { createContext, useContext, useEffect, useCallback } from 'react'
import { usePlayer } from '../hooks/usePlayer'
import { useBadges } from '../hooks/useBadges'
import { loadHistory } from '../hooks/useHistory'

const GradeContext = createContext(null)

/**
 * Hook pour accéder au contexte du niveau
 */
export function useGrade() {
  const context = useContext(GradeContext)
  if (!context) {
    throw new Error('useGrade must be used within GradeLayout')
  }
  return context
}

/**
 * Layout générique pour chaque niveau (6e, 5e, 3e)
 * 
 * @param {object} props
 * @param {string} props.grade - Le niveau ('6e', '5e', '3e')
 * @param {string} props.theme - La classe CSS du thème ('theme-6e', 'theme-5e', 'theme-3e')
 * @param {React.Component} props.OnboardingComponent - Composant d'onboarding spécifique au niveau
 * @param {React.ReactNode} props.children - Les routes/composants enfants
 * @param {React.Component} [props.BadgeToastComponent] - Composant optionnel pour afficher les badges débloqués
 */
export default function GradeLayout({ 
  grade, 
  theme, 
  OnboardingComponent, 
  BadgeToastComponent,
  children 
}) {
  const { player, savePlayer, updatePlayer, resetPlayer } = usePlayer(grade)
  const { earned, newBadge, dismissBadge, unlock, checkGameBadges, checkStarBadges } = useBadges(grade)

  // Gestion du dark mode (si supporté par le player)
  useEffect(() => {
    if (player?.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return () => document.documentElement.classList.remove('dark')
  }, [player?.darkMode])

  const toggleDark = useCallback(() => {
    if (player) {
      updatePlayer({ darkMode: !player.darkMode })
    }
  }, [player, updatePlayer])

  // Helper pour créer un callback de vérification des badges après un jeu
  const makeBadgeCheck = useCallback((module) => {
    return (finalScore, extra, maxStreak) => {
      const history = loadHistory(grade)
      const totalGames = history.length
      const perfectCount = history.filter(e => e.score === (e.total || 10)).length
      const modulesPlayed = new Set(history.map(e => e.module)).size
      const chronoBest = parseInt(localStorage.getItem(`maths${grade}_chrono_best`) || '0')
      const dailyData = JSON.parse(localStorage.getItem(`maths${grade}_daily`) || '{}')
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
  }, [grade, unlock, checkStarBadges])

  const contextValue = {
    grade,
    player,
    savePlayer,
    updatePlayer,
    resetPlayer,
    darkMode: player?.darkMode || false,
    toggleDark,
    badges: { earned, newBadge, dismissBadge, unlock, checkGameBadges, checkStarBadges },
    makeBadgeCheck,
  }

  // Si pas de player, afficher l'onboarding
  if (!player) {
    return (
      <div className={theme + ' min-h-screen'}>
        <OnboardingComponent onSave={savePlayer} />
      </div>
    )
  }

  // Player connecté → afficher les enfants dans le contexte
  return (
    <GradeContext.Provider value={contextValue}>
      <div className={`${theme} min-h-screen ${player.darkMode ? 'dark' : ''}`}>
        {BadgeToastComponent && <BadgeToastComponent badge={newBadge} onDismiss={dismissBadge} />}
        {children}
      </div>
    </GradeContext.Provider>
  )
}
