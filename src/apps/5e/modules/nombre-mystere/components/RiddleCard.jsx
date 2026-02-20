export default function RiddleCard({ riddleText }) {
  return (
    <div className="bg-surface rounded-2xl p-5 space-y-2">
      {riddleText.map((line, i) => (
        <p key={i} className={`text-center ${i === 0 ? 'text-lg font-bold text-white' : i === riddleText.length - 1 ? 'text-lg font-bold text-accent' : 'text-base text-slate-300 italic'}`}>
          {line}
        </p>
      ))}
    </div>
  )
}
