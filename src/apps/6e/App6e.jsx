import { useEffect, useCallback } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Hub from './components/Hub'
import Onboarding from './components/Onboarding'
import BadgesScreen from './components/BadgesScreen'
import HistoryChart from './components/HistoryChart'
import BadgeToast from './components/BadgeToast'
import TableStrike from './modules/TableStrike/TableStrike'
import Divisix from './modules/Divisix/Divisix'
import ChronoTables from './modules/ChronoTables/ChronoTables'
import OperaMix from './modules/OperaMix/OperaMix'
import DailyChallenge from './modules/DailyChallenge/DailyChallenge'
import Duel from './modules/Duel/Duel'
import FractionsVisuelles from './modules/FractionsVisuelles/FractionsVisuelles'
import GeoBuilder from './modules/GeoBuilder/GeoBuilder'
import { usePlayer } from './hooks/usePlayer'
import { useBadges } from './hooks/useBadges'
import { loadHistory } from './hooks/useHistory'

export default function App6e() {
  const { player, savePlayer, updatePlayer, resetPlayer } = usePlayer()
  const { earned, newBadge, dismissBadge, unlock, checkStarBadges } = useBadges()

  useEffect(() => {
    if (player?.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return () => document.documentElement.classList.remove('dark')
  }, [player?.darkMode])

  const toggleDark = useCallback(() => {
    updatePlayer({ darkMode: !player?.darkMode })
  }, [player?.darkMode, updatePlayer])

  const makeBadgeCheck = useCallback((module) => {
    return (finalScore, extra, maxStreak) => {
      const history = loadHistory()
      const totalGames = history.length
      const perfectCount = history.filter(e => e.score === (e.total || 10)).length
      const modulesPlayed = new Set(history.map(e => e.module)).size
      const chronoBest = parseInt(localStorage.getItem('maths6e_chrono_best') || '0')
      const dailyData = JSON.parse(localStorage.getItem('maths6e_daily') || '{}')
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
  }, [unlock, checkStarBadges])

  if (!player) {
    return (
      <div className="theme-6e min-h-screen">
        <Onboarding onSave={savePlayer} />
      </div>
    )
  }

  return (
    <div className={`theme-6e min-h-screen ${player.darkMode ? 'dark' : ''}`}>
      <BadgeToast badge={newBadge} onDismiss={dismissBadge} />
      <Routes>
        <Route path="/" element={<Hub player={player} onReset={resetPlayer} darkMode={player.darkMode} onToggleDark={toggleDark} badgeCount={earned.length} />} />
        <Route path="/table-strike" element={<TableStrike player={player} onBadgeCheck={makeBadgeCheck('TS')} />} />
        <Route path="/divisix" element={<Divisix player={player} onBadgeCheck={makeBadgeCheck('DV')} />} />
        <Route path="/chrono" element={<ChronoTables player={player} onBadgeCheck={makeBadgeCheck('CT')} />} />
        <Route path="/opera-mix" element={<OperaMix player={player} onBadgeCheck={makeBadgeCheck('OM')} />} />
        <Route path="/daily" element={<DailyChallenge player={player} onBadgeCheck={makeBadgeCheck('DC')} />} />
        <Route path="/duel" element={<Duel onBadgeCheck={makeBadgeCheck('duel')} />} />
        <Route path="/fractions-visuelles" element={<FractionsVisuelles player={player} onBadgeCheck={makeBadgeCheck("FV")} />} />
        <Route path="/geo-builder" element={<GeoBuilder player={player} onBadgeCheck={makeBadgeCheck("GB")} />} />
        <Route path="/badges" element={<BadgesScreen earned={earned} />} />
        <Route path="/history" element={<HistoryChart />} />
      </Routes>
    </div>
  )
}
