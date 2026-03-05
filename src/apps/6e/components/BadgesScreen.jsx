import { useNavigate } from 'react-router-dom'
import { BADGE_DEFINITIONS } from '../../../shared/hooks/useBadges'

export default function BadgesScreen({ earned }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
      <header className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
        <button onClick={() => navigate('/6e')} className="text-2xl">{'\u2190'}</button>
        <h1 className="font-extrabold text-primary-dark dark:text-primary-light text-lg">
          {'\uD83C\uDFC5'} Mes Badges
        </h1>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">
        <p className="text-sm text-gray-400 mb-4">
          {earned.length} / {BADGE_DEFINITIONS.length} badges debloques
        </p>
        <div className="grid grid-cols-3 gap-3">
          {BADGE_DEFINITIONS.map((badge) => {
            const unlocked = earned.includes(badge.id)
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl text-center
                  ${unlocked
                    ? 'bg-white dark:bg-gray-800 shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800/50 opacity-40'
                  }`}
              >
                <span className="text-3xl">{unlocked ? badge.emoji : '\uD83D\uDD12'}</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-tight">
                  {badge.label}
                </span>
                <span className="text-[10px] text-gray-400 leading-tight">{badge.description}</span>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
