import { Scissors, Triangle, Brain, LogOut, Zap, TrendingUp, Swords } from 'lucide-react'

const GAMES = [
  {
    id: 'automatismes',
    title: 'Automatismes',
    description: 'Entraînement rapide multi-domaines — type Brevet',
    icon: Brain,
    color: 'from-cyan-500 to-teal-600',
    active: true,
  },
  {
    id: 'frac-strike',
    title: 'Frac-Strike',
    description: 'Simplifie les fractions en trouvant le diviseur commun',
    icon: Scissors,
    color: 'from-rose-500 to-pink-600',
    active: true,
  },
  {
    id: 'theoremes',
    title: 'Théorèmes',
    description: 'Pythagore, Thalès et réciproques',
    icon: Triangle,
    color: 'from-purple-500 to-violet-600',
    active: true,
  },
  {
    id: 'brevet-flash',
    title: 'Brevet Flash',
    description: '5 questions type brevet en 5 minutes chrono',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
    active: true,
  },
  {
    id: 'fonctions-interactives',
    title: 'Fonctions Interactives',
    description: 'Images, antécédents, graphiques de fonctions linéaires et affines !',
    icon: TrendingUp,
    color: 'from-indigo-500 to-purple-600',
    active: true,
  },
  {
    id: 'theoreme-arena',
    title: 'Théorème Arena',
    description: 'Pythagore vs Thalès — enchaîne les calculs !',
    icon: Swords,
    color: 'from-red-500 to-orange-600',
    active: true,
  },
]

export default function Hub({ player, onSelectGame, onLogout, onHome }) {
  return (
    <div className="min-h-dvh px-4 pb-8 pt-6">
      {/* Header */}
      <div className="mx-auto mb-6 flex max-w-lg items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Maths <span className="text-accent">3e</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{player.name}</p>
            <p className="text-xs text-slate-300">{player.classe}</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-surface-light hover:text-white"
            title="Déconnexion"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Game Cards */}
      <div className="mx-auto grid max-w-lg gap-4">
        {GAMES.map((game) => {
          const Icon = game.icon
          return (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className="group relative flex items-center gap-4 rounded-2xl border border-slate-700 bg-surface p-4 text-left transition hover:border-accent hover:shadow-lg hover:shadow-accent/10"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${game.color}`}
              >
                <Icon className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-white">{game.title}</h3>
                <p className="text-sm text-slate-300">{game.description}</p>
              </div>
              <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-bold text-accent">
                JOUER
              </span>
            </button>
          )
        })}
      </div>

      {/* Back to portal */}
      {onHome && (
        <button
          onClick={onHome}
          className="mx-auto mt-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Changer de niveau
        </button>
      )}

      <p className="mt-4 text-center text-xs text-slate-400">
        Maths-3e v1.0 — Données stockées localement
      </p>
    </div>
  )
}
