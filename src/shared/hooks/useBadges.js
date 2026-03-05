import { useState, useCallback } from 'react'

const BADGE_DEFINITIONS = [
  { id: 'first_game', label: 'Premiere partie', emoji: '🌟', description: 'Jouer ta premiere partie' },
  { id: 'ten_games', label: '10 parties', emoji: '🔥', description: 'Jouer 10 parties' },
  { id: 'fifty_games', label: '50 parties', emoji: '🌋', description: 'Jouer 50 parties' },
  { id: 'perfect_10', label: 'Sans faute', emoji: '🏆', description: 'Obtenir 10/10' },
  { id: 'three_perfect', label: 'Triple parfait', emoji: '💎', description: '3 fois 10/10' },
  { id: 'streak_10', label: 'Inarretable', emoji: '⚡', description: '10 bonnes reponses d\'affilee' },
  { id: 'streak_20', label: 'Legende', emoji: '👑', description: '20 bonnes reponses d\'affilee' },
  { id: 'all_stars_n1', label: 'Etoile N1', emoji: '⭐', description: '3 etoiles au Niveau 1' },
  { id: 'all_stars_n2', label: 'Etoile N2', emoji: '⭐', description: '3 etoiles au Niveau 2' },
  { id: 'all_stars_n3', label: 'Etoile N3', emoji: '⭐', description: '3 etoiles au Niveau 3' },
  { id: 'all_stars_n4', label: 'Etoile N4', emoji: '⭐', description: '3 etoiles au Niveau 4' },
  { id: 'all_modules', label: 'Explorateur', emoji: '🚀', description: 'Jouer a tous les modules' },
  { id: 'chrono_30', label: 'Rapide', emoji: '⏱️', description: '30+ en Chrono-Tables' },
  { id: 'daily_5', label: 'Regulier', emoji: '📅', description: '5 defis du jour completes' },
  { id: 'duel_win', label: 'Champion duel', emoji: '🥊', description: 'Gagner un duel' },
]

function loadBadges(grade) {
  const BADGES_KEY = `maths${grade}_badges`
  try {
    return JSON.parse(localStorage.getItem(BADGES_KEY)) || []
  } catch {
    return []
  }
}

function saveBadges(grade, badges) {
  const BADGES_KEY = `maths${grade}_badges`
  localStorage.setItem(BADGES_KEY, JSON.stringify(badges))
}

export { BADGE_DEFINITIONS }

/**
 * Hook générique pour gérer les badges.
 * @param {string} grade - Le niveau ('6e', '5e', '3e')
 */
export function useBadges(grade) {
  const [earned, setEarned] = useState(() => loadBadges(grade))
  const [newBadge, setNewBadge] = useState(null)

  const unlock = useCallback((badgeId) => {
    setEarned((prev) => {
      if (prev.includes(badgeId)) return prev
      const updated = [...prev, badgeId]
      saveBadges(grade, updated)
      const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId)
      if (badge) setNewBadge(badge)
      return updated
    })
  }, [grade])

  const dismissBadge = useCallback(() => setNewBadge(null), [])

  const checkGameBadges = useCallback((stats) => {
    const { totalGames, perfectCount, maxStreak, modulesPlayed, chronoBest, dailyCount, duelWins } = stats
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
    if (duelWins >= 1) unlock('duel_win')
  }, [unlock])

  const checkStarBadges = useCallback((scores) => {
    if (scores[1] === 10) unlock('all_stars_n1')
    if (scores[2] === 10) unlock('all_stars_n2')
    if (scores[3] === 10) unlock('all_stars_n3')
    if (scores[4] === 10) unlock('all_stars_n4')
  }, [unlock])

  return { 
    earned, 
    newBadge, 
    dismissBadge, 
    unlock, 
    checkGameBadges, 
    checkStarBadges, 
    allBadges: BADGE_DEFINITIONS 
  }
}
