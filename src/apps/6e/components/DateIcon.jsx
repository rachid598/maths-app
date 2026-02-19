const MOIS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec']

export default function DateIcon({ size = 'normal' }) {
  const now = new Date()
  const jour = now.getDate()
  const mois = MOIS[now.getMonth()]

  if (size === 'small') {
    return (
      <div className="inline-flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-white/30 border border-white/40 leading-none">
        <span className="text-[7px] font-bold uppercase tracking-wide opacity-80">{mois}</span>
        <span className="text-sm font-extrabold -mt-0.5">{jour}</span>
      </div>
    )
  }

  return (
    <div className="inline-flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg border-2 border-accent overflow-hidden leading-none">
      <div className="w-full bg-accent text-white text-[10px] font-bold text-center py-0.5 uppercase tracking-wider">{mois}</div>
      <span className="text-2xl font-extrabold text-gray-800 mt-0.5">{jour}</span>
    </div>
  )
}
