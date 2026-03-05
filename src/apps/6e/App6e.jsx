import { Routes, Route } from 'react-router-dom'
import GradeLayout, { useGrade } from '../../shared/components/GradeLayout'
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

function App6eContent() {
  const { player, resetPlayer, darkMode, toggleDark, badges, makeBadgeCheck } = useGrade()

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Hub 
            player={player} 
            onReset={resetPlayer} 
            darkMode={darkMode} 
            onToggleDark={toggleDark} 
            badgeCount={badges.earned.length} 
          />
        } 
      />
      <Route path="/table-strike" element={<TableStrike player={player} onBadgeCheck={makeBadgeCheck('TS')} />} />
      <Route path="/divisix" element={<Divisix player={player} onBadgeCheck={makeBadgeCheck('DV')} />} />
      <Route path="/chrono" element={<ChronoTables player={player} onBadgeCheck={makeBadgeCheck('CT')} />} />
      <Route path="/opera-mix" element={<OperaMix player={player} onBadgeCheck={makeBadgeCheck('OM')} />} />
      <Route path="/daily" element={<DailyChallenge player={player} onBadgeCheck={makeBadgeCheck('DC')} />} />
      <Route path="/duel" element={<Duel onBadgeCheck={makeBadgeCheck('duel')} />} />
      <Route path="/fractions-visuelles" element={<FractionsVisuelles player={player} onBadgeCheck={makeBadgeCheck('FV')} />} />
      <Route path="/geo-builder" element={<GeoBuilder player={player} onBadgeCheck={makeBadgeCheck('GB')} />} />
      <Route path="/badges" element={<BadgesScreen earned={badges.earned} />} />
      <Route path="/history" element={<HistoryChart />} />
    </Routes>
  )
}

export default function App6e() {
  return (
    <GradeLayout 
      grade="6e" 
      theme="theme-6e" 
      OnboardingComponent={Onboarding}
      BadgeToastComponent={BadgeToast}
    >
      <App6eContent />
    </GradeLayout>
  )
}
