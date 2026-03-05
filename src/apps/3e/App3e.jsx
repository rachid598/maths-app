import { Routes, Route, useNavigate } from 'react-router-dom'
import GradeLayout, { useGrade } from '../../shared/components/GradeLayout'
import PlayerModal from './components/PlayerModal'
import Hub from './pages/Hub'
import Theoremes from './modules/theoremes/Theoremes'
import Automatismes from './modules/automatismes/Automatismes'
import FracStrike from './modules/frac-strike/FracStrike'
import BrevetFlash from './modules/brevet-flash/BrevetFlash'
import FonctionsInteractives from './modules/fonctions-interactives/FonctionsInteractives'
import TheoremeArena from './modules/theoreme-arena/TheoremeArena'

function ModuleRoute({ Component }) {
  const navigate = useNavigate()
  return <Component onBack={() => navigate(-1)} />
}

function App3eContent() {
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
      <Route path="/theoremes" element={<ModuleRoute Component={Theoremes} />} />
      <Route path="/automatismes" element={<ModuleRoute Component={Automatismes} />} />
      <Route path="/frac-strike" element={<ModuleRoute Component={FracStrike} />} />
      <Route path="/brevet-flash" element={<ModuleRoute Component={BrevetFlash} />} />
      <Route path="/fonctions-interactives" element={<ModuleRoute Component={FonctionsInteractives} />} />
      <Route path="/theoreme-arena" element={<ModuleRoute Component={TheoremeArena} />} />
    </Routes>
  )
}

export default function App3e() {
  return (
    <GradeLayout 
      grade="3e" 
      theme="theme-3e" 
      OnboardingComponent={PlayerModal}
    >
      <App3eContent />
    </GradeLayout>
  )
}
