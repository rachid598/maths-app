import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from './hooks/usePlayer'
import PlayerModal from './components/PlayerModal'
import Hub from './pages/Hub'
import Theoremes from './modules/theoremes/Theoremes'
import Automatismes from './modules/automatismes/Automatismes'
import FracStrike from './modules/frac-strike/FracStrike'
import BrevetFlash from './modules/brevet-flash/BrevetFlash'

export default function App3e() {
  const navigate = useNavigate()
  const { player, register, logout } = usePlayer()
  const [currentGame, setCurrentGame] = useState(null)

  const goBack = () => setCurrentGame(null)

  if (!player) {
    return (
      <div className="theme-3e min-h-screen">
        <PlayerModal onRegister={register} />
      </div>
    )
  }

  if (currentGame === 'theoremes') {
    return <div className="theme-3e min-h-screen"><Theoremes onBack={goBack} /></div>
  }
  if (currentGame === 'automatismes') {
    return <div className="theme-3e min-h-screen"><Automatismes onBack={goBack} /></div>
  }
  if (currentGame === 'frac-strike') {
    return <div className="theme-3e min-h-screen"><FracStrike onBack={goBack} /></div>
  }

  return (
    <div className="theme-3e min-h-screen">
      <Hub
        player={player}
        onSelectGame={setCurrentGame}
        onLogout={logout}
        onHome={() => navigate('/')}
      />
    </div>
  )
}
