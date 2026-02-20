import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import usePlayer from './hooks/usePlayer'
import PlayerForm from './components/PlayerForm'
import Hub from './pages/Hub'
import FracStrike from './modules/frac-strike/FracStrike'
import PrioCalcul from './modules/prio-calcul/PrioCalcul'
import DiviCheck from './modules/divi-check/DiviCheck'
import PrioRush from './modules/prio-rush/PrioRush'

export default function App5e() {
  const navigate = useNavigate()
  const { player, savePlayer, clearPlayer } = usePlayer()
  const [currentModule, setCurrentModule] = useState(null)

  const goBack = () => setCurrentModule(null)

  if (!player) {
    return (
      <div className="theme-5e min-h-screen">
        <PlayerForm onSave={savePlayer} />
      </div>
    )
  }

  if (currentModule === 'frac-strike') {
    return <div className="theme-5e min-h-screen"><FracStrike onBack={goBack} /></div>
  }
  if (currentModule === 'prio-calcul') {
    return <div className="theme-5e min-h-screen"><PrioCalcul onBack={goBack} /></div>
  }
  if (currentModule === 'divi-check') {
    return <div className="theme-5e min-h-screen"><DiviCheck onBack={goBack} /></div>
  }
  if (currentModule === 'prio-rush') {
    return <div className="theme-5e min-h-screen"><PrioRush onBack={goBack} /></div>
  }
  if (currentModule === 'nombre-mystere') {
    return <div className="theme-5e min-h-screen"><NombreMystere onBack={goBack} /></div>
  }

  return (
    <div className="theme-5e min-h-screen">
      <Hub
        player={player}
        onNavigate={setCurrentModule}
        onLogout={clearPlayer}
        onHome={() => navigate('/')}
      />
    </div>
  )
}
