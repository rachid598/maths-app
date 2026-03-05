import { Routes, Route } from 'react-router-dom'
import GradeLayout from '../../shared/components/GradeLayout'
import PlayerForm from './components/PlayerForm'
import Hub from './pages/Hub'
import FracStrike from './modules/frac-strike/FracStrike'
import PrioCalcul from './modules/prio-calcul/PrioCalcul'
import DiviCheck from './modules/divi-check/DiviCheck'
import PrioRush from './modules/prio-rush/PrioRush'
import Proportionnalite from './modules/proportionnalite/Proportionnalite'
import VolumesAires from './modules/volumes-aires/VolumesAires'
import ReperageFractions from './modules/reperage-fractions/ReperageFractions'

function App5eContent() {
  return (
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route path="/frac-strike" element={<FracStrike />} />
      <Route path="/prio-calcul" element={<PrioCalcul />} />
      <Route path="/divi-check" element={<DiviCheck />} />
      <Route path="/prio-rush" element={<PrioRush />} />
      <Route path="/proportionnalite" element={<Proportionnalite />} />
      <Route path="/volumes-aires" element={<VolumesAires />} />
      <Route path="/reperage-fractions" element={<ReperageFractions />} />
    </Routes>
  )
}

export default function App5e() {
  return (
    <GradeLayout grade="5e" theme="theme-5e" OnboardingComponent={PlayerForm}>
      <App5eContent />
    </GradeLayout>
  )
}
