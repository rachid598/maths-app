import { Routes, Route } from 'react-router-dom'
import GradeLayout from '../../shared/components/GradeLayout'
import PlayerForm from './components/PlayerForm'
import Hub from './pages/Hub'
import Pythagore from './modules/Pythagore/Pythagore'

function App4eContent() {
  return (
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route path="/pythagore" element={<Pythagore />} />
    </Routes>
  )
}

export default function App4e() {
  return (
    <GradeLayout grade="4e" theme="theme-4e" OnboardingComponent={PlayerForm}>
      <App4eContent />
    </GradeLayout>
  )
}
