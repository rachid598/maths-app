export default function EquationReveal({ equation, x, visible }) {
  if (!visible) return null
  return (
    <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-5 text-center space-y-2">
      <p className="text-success text-lg font-bold">✅ Bravo !</p>
      <p className="text-white text-2xl font-mono font-bold">x = {x}</p>
      <p className="text-slate-300 text-sm mt-1">{"L'équation correspondante :"}</p>
      <p className="text-indigo-300 font-mono text-base">{equation}</p>
    </div>
  )
}
