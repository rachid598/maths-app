import { useNavigate } from 'react-router-dom'
import { Swords, Calculator, Grid3X3, LogOut, Zap, Scale, Box, Ruler } from 'lucide-react'

const modules = [
  {
    id: 'frac-strike',
    title: 'Frac-Strike',
    description: 'Simplifie les fractions en trouvant les diviseurs communs !',
    icon: Swords,
    color: 'from-indigo-500 to-purple-600',
    active: true,
  },
  {
    id: 'prio-calcul',
    title: 'Prio-Calcul',
    description: 'Maîtrise la priorité des opérations !',
    icon: Calculator,
    color: 'from-cyan-500 to-blue-600',
    active: true,
  },
  {
    id: 'divi-check',
    title: 'Divi-Check',
    description: 'Maîtrise les critères de divisibilité !',
    icon: Grid3X3,
    color: 'from-emerald-500 to-teal-600',
    active: true,
  },
  {
    id: 'prio-rush',
    title: 'Prio-Rush',
    description: '10 expressions, 60 secondes, combo × points !',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    active: true,
  },
  {
    id: 'proportionnalite',
    title: 'Proportionnalité',
    description: 'Résous des situations proportionnelles (recettes, prix, distances) !',
    icon: Scale,
    color: 'from-cyan-500 to-blue-600',
    active: true,
  },
  {
    id: 'volumes-aires',
    title: 'Volumes & Aires',
    description: 'Calcule aires et volumes de figures 2D et 3D !',
    icon: Box,
    color: 'from-pink-500 to-rose-600',
    active: true,
  },
  {
    id: 'reperage-fractions',
    title: 'Repérage Fractions',
    description: 'Lis et place des fractions sur une demi-droite graduée !',
    icon: Ruler,
    color: 'from-violet-500 to-indigo-600',
    active: true,
  },
]

export default function Hub({ player, onLogout }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen p-4 pb-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pt-2">
        <div>
          <h1 className="text-2xl font-bold">
            Maths-5<span className="text-primary-light">e</span>
          </h1>
          <p className="text-sm text-slate-300">
            Salut <span className="text-white font-medium">{player.name}</span> — {player.classe}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="p-2 rounded-xl bg-surface hover:bg-surface-light transition-colors"
          title="Se déconnecter"
        >
          <LogOut className="w-5 h-5 text-slate-300" />
        </button>
      </header>

      {/* Module grid */}
      <div className="grid gap-4">
        {modules.map((mod) => {
          const Icon = mod.icon
          return (
            <button
              key={mod.id}
              onClick={() => mod.active && navigate(`/${mod.id}`)}
              disabled={!mod.active}
              className={`relative overflow-hidden rounded-2xl p-5 text-left transition-transform active:scale-[0.98] ${
                mod.active
                  ? 'bg-surface hover:bg-surface-light cursor-pointer'
                  : 'bg-surface/50 cursor-not-allowed opacity-60'
              }`}
            >
              {/* Gradient accent bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${mod.color}`}
              />

              <div className="flex items-start gap-4 pl-3">
                <div
                  className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{mod.title}</h3>
                    {!mod.active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-600 text-slate-200">
                        Bientôt disponible
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 mt-1">
                    {mod.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Back to portal */}
      <button
        onClick={() => navigate('/')}
        className="mx-auto mt-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        ← Retour au portail
      </button>

      {/* RGPD notice */}
      <p className="text-xs text-slate-400 text-center mt-4">
        Aucune donnée ne quitte ton appareil. Conforme RGPD.
      </p>
    </div>
  )
}
