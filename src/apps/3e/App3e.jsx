import { Routes, Route } from 'react-router-dom'
import GradeLayout from '../../shared/components/GradeLayout'
import PlayerModal from './components/PlayerModal'
import Hub from './pages/Hub'
import Theoremes from './modules/theoremes/Theoremes'
import Automatismes from './modules/automatismes/Automatismes'
import FracStrike from './modules/frac-strike/FracStrike'
import BrevetFlash from './modules/brevet-flash/BrevetFlash'
import FonctionsInteractives from './modules/fonctions-interactives/FonctionsInteractives'
import TheoremeArena from './modules/theoreme-arena/TheoremeArena'

function App3eContent() {
  return (
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route path="/theoremes" element={<Theoremes />} />
      <Route path="/automatismes" element={<Automatismes />} />
      <Route path="/frac-strike" element={<FracStrike />} />
      <Route path="/brevet-flash" element={<BrevetFlash />} />
      <Route path="/fonctions-interactives" element={<FonctionsInteractives />} />
      <Route path="/theoreme-arena" element={<TheoremeArena />} />
    </Routes>
  )
}

export default function App3e() {
  return (
    <GradeLayout grade="3e" theme="theme-3e" OnboardingComponent={PlayerModal}>
      <App3eContent />
    </GradeLayout>
  )
}
