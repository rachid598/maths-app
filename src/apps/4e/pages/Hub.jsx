import { useNavigate } from 'react-router-dom'
import { Triangle, LogOut } from 'lucide-react'
import { useGrade } from '../../../shared/components/GradeLayout'

const modules = [
  {
    id: 'pythagore',
    title: 'Pythagore',
    description: "Écris l'égalité de Pythagore à partir d'un triangle rectangle !",
    icon: Triangle,
    color: 'from-emerald-500 to-teal-600',
    active: true,
  },
]

export default function Hub() {
  const navigate = useNavigate()
  const { player, clearPlayer } = useGrade()

  return (
    <div className="min-h-screen p-4 pb-8">
      <header className="flex items-center justify-between mb-8 pt-2">
        <div>
          <h1 className="text-2xl font-bold">
            Maths-4<span className="text-primary-light">e</span>
          </h1>
          <p className="text-sm text-slate-300">
            Salut <span className="text-white font-medium">{player.name}</span> — {player.classe}
          </p>
        </div>
        <button
          onClick={clearPlayer}
          className="p-2 rounded-xl bg-surface hover:bg-surface-light transition-colors"
          title="Se déconnecter"
        >
          <LogOut className="w-5 h-5 text-slate-300" />
        </button>
      </header>

      <div className="grid gap-4">
        {modules.map((mod) => {
          const Icon = mod.icon
          return (
            <button
              key={mod.id}
              onClick={() => mod.active && navigate(`/4e/${mod.id}`)}
              disabled={!mod.active}
              className={`relative overflow-hidden rounded-2xl p-5 text-left transition-transform active:scale-[0.98] ${
                mod.active
                  ? 'bg-surface hover:bg-surface-light cursor-pointer'
                  : 'bg-surface/50 cursor-not-allowed opacity-60'
              }`}
            >
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
                  <h3 className="text-lg font-bold text-white">{mod.title}</h3>
                  <p className="text-sm text-slate-300 mt-1">{mod.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={() => navigate('/')}
        className="mx-auto mt-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        ← Changer de niveau
      </button>

      <p className="text-xs text-slate-400 text-center mt-4">
        Aucune donnée ne quitte ton appareil. Conforme RGPD.
      </p>
    </div>
  )
}
