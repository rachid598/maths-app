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
import Euclide from './modules/Euclide/Euclide'
import GeoNotation from './modules/GeoNotation/GeoNotation'
import VocaCercle from './modules/VocaCercle/VocaCercle'

function App6eContent() {
  const { player, resetPlayer, darkMode, toggleDark, badgeCount, makeBadgeCheck, newBadge, dismissBadge } = useGrade()

  return (
    <>
      <BadgeToast badge={newBadge} onDismiss={dismissBadge} />
      <Routes>
        <Route path="/" element={<Hub player={player} onReset={resetPlayer} darkMode={darkMode} onToggleDark={toggleDark} badgeCount={badgeCount} />} />
        <Route path="/table-strike" element={<TableStrike player={player} onBadgeCheck={makeBadgeCheck('TS')} />} />
        <Route path="/divisix" element={<Divisix player={player} onBadgeCheck={makeBadgeCheck('DV')} />} />
        <Route path="/chrono" element={<ChronoTables player={player} onBadgeCheck={makeBadgeCheck('CT')} />} />
        <Route path="/opera-mix" element={<OperaMix player={player} onBadgeCheck={makeBadgeCheck('OM')} />} />
        <Route path="/daily" element={<DailyChallenge player={player} onBadgeCheck={makeBadgeCheck('DC')} />} />
        <Route path="/duel" element={<Duel onBadgeCheck={makeBadgeCheck('duel')} />} />
        <Route path="/fractions-visuelles" element={<FractionsVisuelles player={player} onBadgeCheck={makeBadgeCheck("FV")} />} />
        <Route path="/geo-builder" element={<GeoBuilder player={player} onBadgeCheck={makeBadgeCheck("GB")} />} />
        <Route path="/euclide" element={<Euclide player={player} onBadgeCheck={makeBadgeCheck("EU")} />} />
        <Route path="/geo-notation" element={<GeoNotation player={player} onBadgeCheck={makeBadgeCheck("GN")} />} />
        <Route path="/voca-cercle" element={<VocaCercle player={player} onBadgeCheck={makeBadgeCheck("VC")} />} />
        <Route path="/badges" element={<BadgesScreen earned={useGrade().earned} />} />
        <Route path="/history" element={<HistoryChart />} />
      </Routes>
    </>
  )
}

export default function App6e() {
  return (
    <GradeLayout grade="6e" theme="theme-6e" OnboardingComponent={Onboarding}>
      <App6eContent />
    </GradeLayout>
  )
}
