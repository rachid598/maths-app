import { useNavigate } from 'react-router-dom'

const LEVELS = [
  {
    id: '6e',
    title: '6ème',
    subtitle: 'Tables de multiplication',
    description: 'Table-Strike, Divisix, Chrono-Tables, Opéra-Mix, Défi du jour, Duel',
    emoji: '⚡',
    gradient: 'from-indigo-500 to-purple-600',
    path: '/6e',
  },
  {
    id: '5e',
    title: '5ème',
    subtitle: 'Fractions & priorités',
    description: 'Frac-Strike, Prio-Calcul, Divi-Check',
    emoji: '⚔️',
    gradient: 'from-cyan-500 to-blue-600',
    path: '/5e',
  },
  {
    id: '3e',
    title: '3ème',
    subtitle: 'Préparation Brevet',
    description: 'Automatismes, Frac-Strike, Théorèmes (Pythagore & Thalès)',
    emoji: '🧠',
    gradient: 'from-amber-500 to-orange-600',
    path: '/3e',
  },
]

export default function Portal() {
  const navigate = useNavigate()

  return (
    <div className="theme-portal min-h-screen flex flex-col">
      {/* Hero */}
      <header className="pt-12 pb-6 px-4 text-center">
        <div className="animate-pop-in">
          <div className="text-6xl mb-3">📐</div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Maths App
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-xs mx-auto">
            Choisis ton niveau et entraîne-toi !
          </p>
        </div>
      </header>

      {/* Level cards */}
      <main className="flex-1 px-4 pb-8">
        <div className="max-w-md mx-auto space-y-4">
          {LEVELS.map((level, i) => (
            <button
              key={level.id}
              onClick={() => navigate(level.path)}
              className="animate-slide-up w-full text-left rounded-2xl overflow-hidden shadow-lg active:scale-[0.98] transition-transform"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <div className={`bg-gradient-to-r ${level.gradient} p-5`}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{level.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-extrabold text-white">{level.title}</h2>
                    </div>
                    <p className="text-white/80 text-sm font-medium">{level.subtitle}</p>
                    <p className="text-white/60 text-xs mt-1">{level.description}</p>
                  </div>
                  <span className="text-white/60 text-2xl">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 py-4">
        <p>Aucune donnée ne quitte ton appareil — Conforme RGPD</p>
        <p className="mt-1">Maths App v1.0</p>
      </footer>
    </div>
  )
}
