import { Trophy, RotateCcw } from 'lucide-react'

export default function ScoreScreen({ score, total, onReplay, onChangeLevel, onBack }) {
  const perfect = score === total
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-surface rounded-2xl p-8 max-w-sm w-full text-center">
        <Trophy className={`w-16 h-16 mx-auto mb-4 ${perfect ? 'text-accent' : 'text-primary-light'}`} />
        <h2 className="text-2xl font-bold mb-2">{perfect ? 'Parfait !' : 'Bien joué !'}</h2>
        <p className="text-4xl font-bold mb-1">{score}/{total}</p>
        <p className="text-slate-300 mb-2">devinettes résolues</p>
        <div className="space-y-3 mt-6">
          <button onClick={onReplay} className="w-full py-3 rounded-xl font-bold bg-primary hover:bg-primary-dark transition-colors">
            <RotateCcw className="w-4 h-4 inline mr-2" />Rejouer
          </button>
          <button onClick={onChangeLevel} className="w-full py-3 rounded-xl font-bold bg-surface-light hover:bg-surface-light/80 transition-colors">Changer de niveau</button>
          <button onClick={onBack} className="w-full py-3 rounded-xl font-bold text-slate-300 hover:text-white transition-colors">Retour au menu</button>
        </div>
      </div>
    </div>
  )
}
