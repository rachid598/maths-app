import { useNavigate } from 'react-router-dom'
import { loadHistory } from '../../../shared/hooks/useHistory'

export default function HistoryChart() {
  const navigate = useNavigate()
  const history = loadHistory('6e').slice(-20)

  const maxScore = Math.max(10, ...history.map((h) => h.total || 10))

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-gray-900">
      <header className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-b border-primary/10">
        <button onClick={() => navigate('/6e')} className="text-2xl">{'\u2190'}</button>
        <h1 className="font-extrabold text-primary-dark dark:text-primary-light text-lg">
          {'\uD83D\uDCC8'} Mon Historique
        </h1>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">
        {history.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">Aucune partie jouee pour l'instant.</p>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">
              {history.length} dernieres parties
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
              <div className="flex items-end gap-1 h-40">
                {history.map((entry, i) => {
                  const pct = (entry.score / maxScore) * 100
                  const color = entry.score === (entry.total || 10)
                    ? 'bg-accent'
                    : entry.score >= 7
                      ? 'bg-success'
                      : entry.score >= 5
                        ? 'bg-primary'
                        : 'bg-danger'
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <span className="text-[9px] text-gray-400 mb-1">{entry.score}</span>
                      <div
                        className={`w-full rounded-t-md ${color} min-h-[4px] transition-all`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-1 mt-2">
                {history.map((entry, i) => (
                  <div key={i} className="flex-1 text-center">
                    <span className="text-[8px] text-gray-300">
                      {entry.module?.slice(0, 2) || '?'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow">
                <p className="text-2xl font-bold text-primary">{history.length}</p>
                <p className="text-xs text-gray-400">Parties</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow">
                <p className="text-2xl font-bold text-success">
                  {Math.round(history.reduce((s, e) => s + e.score, 0) / history.length * 10) / 10}
                </p>
                <p className="text-xs text-gray-400">Moyenne</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow">
                <p className="text-2xl font-bold text-accent">
                  {history.filter((e) => e.score === (e.total || 10)).length}
                </p>
                <p className="text-xs text-gray-400">Parfaits</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
