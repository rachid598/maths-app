import { useState } from 'react'
import { UserCircle } from 'lucide-react'

const CLASSES = ['5G1', '5G2', '5G3', '5G4', '5G5', '5G6', '5G7', '5G8']

export default function PlayerForm({ onSave }) {
  const [name, setName] = useState('')
  const [classe, setClasse] = useState('')

  const canSubmit = name.trim().length >= 2 && classe

  function handleSubmit(e) {
    e.preventDefault()
    if (canSubmit) onSave(name, classe)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-2xl p-8 w-full max-w-sm shadow-xl text-slate-900"
      >
        <div className="flex justify-center mb-6">
          <UserCircle className="w-16 h-16 text-primary-light" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Bienvenue !</h2>
        <p className="text-sm text-slate-600 text-center mb-6">
          Tes données restent sur ton appareil.
        </p>

        <label className="block mb-1 text-sm font-medium text-slate-600">
          Ton prénom
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ton prénom"
          maxLength={30}
          autoComplete="given-name"
          className="w-full mb-4 px-4 py-3 rounded-xl bg-surface-light text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-primary"
        />

        <label className="block mb-2 text-sm font-medium text-slate-600">
          Ta classe
        </label>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {CLASSES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setClasse(c)}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${
                classe === c
                  ? 'bg-primary text-white'
                  : 'bg-surface-light text-white hover:bg-surface-light/80'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 rounded-xl font-bold text-lg transition-colors bg-primary hover:bg-primary-dark text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          C'est parti !
        </button>
      </form>
    </div>
  )
}
