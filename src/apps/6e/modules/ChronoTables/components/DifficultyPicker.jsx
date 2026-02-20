import { DIFFICULTIES } from '../engine'

export default function DifficultyPicker({ value, onChange }) {
  return (
    <div className="flex gap-2 w-full max-w-sm">
      {Object.entries(DIFFICULTIES).map(([key, cfg]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all
            ${value === key
              ? 'bg-[#6366f1] text-white scale-105 shadow-lg'
              : 'bg-white text-[#1f2937] border border-gray-200 hover:border-[#6366f1]'
            }`}
        >
          <span className="block text-lg">{cfg.emoji}</span>
          {cfg.label}
        </button>
      ))}
    </div>
  )
}
