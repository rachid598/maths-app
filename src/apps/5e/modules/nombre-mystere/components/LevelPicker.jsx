import { Star, Zap, Trophy } from 'lucide-react'
import { getLevels } from '../engine'

const ICONS = { easy: Star, medium: Zap, hard: Trophy }

export default function LevelPicker({ onSelect }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-center mb-4">Choisis ton niveau</h3>
      {getLevels().map((l) => {
        const Icon = ICONS[l.id] || Star
        return (
          <button key={l.id} onClick={() => onSelect(l.id)} className="w-full p-4 rounded-2xl bg-surface hover:bg-surface-light transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">{l.name}</p>
                <p className="text-sm text-slate-300">{l.description}</p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
