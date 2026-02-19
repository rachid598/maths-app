import { useState } from 'react'
import { UserCircle } from 'lucide-react'

export default function PlayerModal({ onRegister }) {
  const [name, setName] = useState('')
  const [classe, setClasse] = useState('3G1')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim().length >= 2) onRegister(name, classe)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center gap-3">
          <UserCircle className="h-8 w-8 text-accent" />
          <h2 className="text-xl font-bold">Bienvenue !</h2>
        </div>
        <p className="mb-4 text-sm text-slate-400">
          Entre ton prénom pour sauvegarder ta progression.
        </p>
        <label className="mb-1 block text-sm font-medium text-slate-300">Prénom</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ton prénom…"
          autoFocus
          className="mb-3 w-full rounded-lg border border-slate-600 bg-surface-light px-3 py-2 text-white outline-none focus:border-accent"
          maxLength={30}
        />
        <label className="mb-1 block text-sm font-medium text-slate-300">Classe</label>
        <select
          value={classe}
          onChange={(e) => setClasse(e.target.value)}
          className="mb-5 w-full rounded-lg border border-slate-600 bg-surface-light px-3 py-2 text-white outline-none focus:border-accent"
        >
          <option value="3G1">3G1</option>
          <option value="3G2">3G2</option>
          <option value="3G3">3G3</option>
          <option value="3G4">3G4</option>
          <option value="3G5">3G5</option>
          <option value="3G6">3G6</option>
          <option value="3G7">3G7</option>
          <option value="3G8">3G8</option>
        </select>
        <button
          type="submit"
          disabled={name.trim().length < 2}
          className="w-full rounded-lg bg-accent py-2.5 font-bold text-black transition hover:bg-accent-light disabled:opacity-40"
        >
          C'est parti !
        </button>
        <p className="mt-3 text-center text-xs text-slate-500">
          Données stockées uniquement sur ton appareil (RGPD).
        </p>
      </form>
    </div>
  )
}
