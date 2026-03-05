import { Routes, Route, useNavigate } from 'react-router-dom'
import GradeLayout, { useGrade } from '../../shared/components/GradeLayout'
import PlayerForm from './components/PlayerForm'
import Hub from './pages/Hub'
import FracStrike from './modules/frac-strike/FracStrike'
import PrioCalcul from './modules/prio-calcul/PrioCalcul'
import DiviCheck from './modules/divi-check/DiviCheck'
import PrioRush from './modules/prio-rush/PrioRush'
import Proportionnalite from './modules/proportionnalite/Proportionnalite'
import VolumesAires from './modules/volumes-aires/VolumesAires'
import ReperageFractions from './modules/reperage-fractions/ReperageFractions'

function ModuleRoute({ Component }) {
  const navigate = useNavigate()
  return <Component onBack={() => navigate(-1)} />
}

function App5eContent() {
  const { player, resetPlayer } = useGrade()

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Hub 
            player={player} 
            onLogout={resetPlayer} 
          />
        } 
      />
      <Route path="/frac-strike" element={<ModuleRoute Component={FracStrike} />} />
      <Route path="/prio-calcul" element={<ModuleRoute Component={PrioCalcul} />} />
      <Route path="/divi-check" element={<ModuleRoute Component={DiviCheck} />} />
      <Route path="/prio-rush" element={<ModuleRoute Component={PrioRush} />} />
      <Route path="/proportionnalite" element={<ModuleRoute Component={Proportionnalite} />} />
      <Route path="/volumes-aires" element={<ModuleRoute Component={VolumesAires} />} />
      <Route path="/reperage-fractions" element={<ModuleRoute Component={ReperageFractions} />} />
    </Routes>
  )
}

export default function App5e() {
  return (
    <GradeLayout 
      grade="5e" 
      theme="theme-5e" 
      OnboardingComponent={PlayerForm}
    >
      <App5eContent />
    </GradeLayout>
  )
}
