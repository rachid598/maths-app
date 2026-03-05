import { useNavigate } from 'react-router-dom'
import { useHistory } from '../../../shared/hooks/useHistory'
import DateIcon from './DateIcon'

const GAMES = [
  { id: 'table-strike', title: 'Table-Strike', description: 'Tables de multiplication', emoji: '\u26A1', color: 'from-indigo-500 to-purple-500', path: '/6e/table-strike' },
  { id: 'divisix', title: 'Divisix', description: 'Division euclidienne', emoji: '\u2797', color: 'from-emerald-500 to-teal-500', path: '/6e/divisix' },
  { id: 'chrono', title: 'Chrono-Tables', description: '60s, maximum de bonnes reponses', emoji: '\u23F1\uFE0F', color: 'from-red-500 to-orange-500', path: '/6e/chrono' },
  { id: 'opera', title: 'Opera-Mix', description: '+, -, x melanges !', emoji: '\uD83C\uDFB0', color: 'from-pink-500 to-rose-500', path: '/6e/opera-mix' },
  { id: 'daily', title: 'Defi du jour', description: 'Les memes questions pour toute la classe', emoji: '\uD83D\uDCC5', color: 'from-amber-500 to-yellow-500', path: '/6e/daily' },
  { id: 'duel', title: 'Duel Local', description: '2 joueurs, 1 telephone !', emoji: '\uD83E\uDD4A', color: 'from-cyan-500 to-blue-500', path: '/6e/duel' },
  { id: 'fractions-visuelles', title: 'Fractions Visuelles', description: 'Pizza interactive et conversions', emoji: '🍕', color: 'from-orange-500 to-amber-500', path: '/6e/fractions-visuelles' },
  { id: 'geo-builder', title: 'Géo-Builder', description: 'Grille, points et périmètres', emoji: '📐', color: 'from-teal-500 to-green-500', path: '/6e/geo-builder' },
]

export default function Hub({ player, onReset, darkMode, onToggleDark, badgeCount }) {
  const navigate = useNavigate()
  const { exportResults } = useHistory('6e')

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-primary/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{player.avatar?.emoji || '\uD83C\uDFB2'}</span>
            <div>
              <p className="font-bold text-primary-dark dark:text-primary-light leading-tight">{player.prenom}</p>
              <p className="text-xs text-gray-400">{player.classe}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onToggleDark} className="text-lg px-2 py-1 rounded" title="Mode sombre">
              {darkMode ? '\u2600\uFE0F' : '\uD83C\uDF19'}
            </button>
            <button onClick={onReset} className="text-xs text-gray-400 hover:text-danger px-2 py-1 rounded">Changer</button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-extrabold text-primary-dark dark:text-primary-light mb-1">{'\uD83C\uDFAF'} Mes Jeux</h1>
          <p className="text-gray-400 text-sm mb-5">Choisis un module et entraine-toi !</p>

          <div className="space-y-3 mb-6">
            {GAMES.map((game, i) => (
              <button
                key={game.id}
                onClick={() => navigate(game.path)}
                className={`animate-slide-up w-full text-left p-4 rounded-2xl shadow-md bg-gradient-to-r ${game.color} text-white active:scale-[0.98] transition-transform`}
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-4">
                  {game.id === 'daily'
                    ? <DateIcon size="small" />
                    : <span className="text-3xl">{game.emoji}</span>
                  }
                  <div>
                    <h2 className="text-base font-bold">{game.title}</h2>
                    <p className="text-xs opacity-80">{game.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <button onClick={() => navigate('/6e/badges')}
              className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow text-center active:scale-95 transition-transform">
              <span className="text-2xl">{'\uD83C\uDFC5'}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Badges</p>
              {badgeCount > 0 && <p className="text-xs font-bold text-primary">{badgeCount}</p>}
            </button>
            <button onClick={() => navigate('/6e/history')}
              className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow text-center active:scale-95 transition-transform">
              <span className="text-2xl">{'\uD83D\uDCC8'}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Historique</p>
            </button>
            <button onClick={exportResults}
              className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow text-center active:scale-95 transition-transform">
              <span className="text-2xl">{'\uD83D\uDCE4'}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Exporter</p>
            </button>
          </div>
        </div>
      </main>

      <footer className="text-center py-3">
        <button onClick={() => navigate('/')} className="text-xs text-gray-400 hover:text-primary mb-1">
          ← Changer de niveau
        </button>
        <p className="text-xs text-gray-300 dark:text-gray-600">Maths 6e &mdash; PWA v2.0</p>
      </footer>
    </div>
  )
}
