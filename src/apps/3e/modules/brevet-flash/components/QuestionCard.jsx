import { useState } from 'react'
import { CheckCircle, XCircle, Send } from 'lucide-react'
import { THEME_COLORS } from '../engine'

export default function QuestionCard({ question, index, total, onAnswer, feedback }) {
  const [input, setInput] = useState('')
  const handleSubmit = (e) => { e.preventDefault(); if (!input.trim() || feedback) return; onAnswer(input.trim()) }
  const themeColor = THEME_COLORS[question.theme] || '#6366f1'
  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: themeColor }}>{question.theme}</span>
        <span className="text-sm text-slate-400">Question {index + 1}/{total}</span>
      </div>
      <div className="rounded-2xl border border-slate-700 bg-surface p-6">
        <p className="mb-6 text-lg font-medium leading-relaxed text-white">{question.text}</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ta réponse…" disabled={!!feedback} autoFocus className="flex-1 rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50" />
          <button type="submit" disabled={!input.trim() || !!feedback} className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-white transition hover:bg-accent/80 disabled:opacity-40"><Send className="h-4 w-4" /> Valider</button>
        </form>
      </div>
      {feedback && (
        <div className={`mt-4 rounded-2xl border p-4 ${feedback.correct ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
          <div className="flex items-center gap-2 mb-2">
            {feedback.correct ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-red-400" />}
            <span className={`font-bold ${feedback.correct ? 'text-emerald-400' : 'text-red-400'}`}>{feedback.correct ? 'Correct !' : 'Incorrect'}</span>
          </div>
          {!feedback.correct && <p className="text-sm text-slate-300">Réponse attendue : <strong className="text-white">{question.answer}</strong></p>}
          <p className="mt-1 text-sm text-slate-400">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
