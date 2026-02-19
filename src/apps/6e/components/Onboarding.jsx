import { useState } from 'react'

const AVATARS = [
  { id: 'fox', emoji: '\uD83E\uDD8A', label: 'Renard' },
  { id: 'cat', emoji: '\uD83D\uDC31', label: 'Chat' },
  { id: 'dog', emoji: '\uD83D\uDC36', label: 'Chien' },
  { id: 'rabbit', emoji: '\uD83D\uDC30', label: 'Lapin' },
  { id: 'owl', emoji: '\uD83E\uDD89', label: 'Hibou' },
  { id: 'robot', emoji: '\uD83E\uDD16', label: 'Robot' },
  { id: 'alien', emoji: '\uD83D\uDC7E', label: 'Alien' },
  { id: 'unicorn', emoji: '\uD83E\uDD84', label: 'Licorne' },
]

export default function Onboarding({ onSave }) {
  const [step, setStep] = useState(1)
  const [prenom, setPrenom] = useState('')
  const [classe, setClasse] = useState('')
  const [avatar, setAvatar] = useState(null)

  const handleSubmitName = (e) => {
    e.preventDefault()
    if (prenom.trim().length >= 2) setStep(2)
  }

  const handleSelectAvatar = (av) => {
    setAvatar(av)
    onSave({ prenom, classe, avatar: av })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface px-4">
      <div className="animate-pop-in w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">{'\uD83C\uDFB2'}</div>
          <h1 className="text-3xl font-extrabold text-primary-dark">
            Maths 6e
          </h1>
          <p className="text-gray-500 mt-1">Bienvenue !</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmitName} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Ton prénom
              </label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Ex : Amine"
                maxLength={20}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border-2 border-primary-light
                  focus:border-primary focus:outline-none text-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Ta classe
              </label>
              <input
                type="text"
                value={classe}
                onChange={(e) => setClasse(e.target.value)}
                placeholder="Ex : 6eB"
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl border-2 border-primary-light
                  focus:border-primary focus:outline-none text-lg bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={prenom.trim().length < 2}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold text-lg
                disabled:opacity-40 active:scale-95 transition-transform"
            >
              Suivant
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="animate-slide-up">
            <p className="text-center font-semibold text-gray-700 mb-4">
              Choisis ton avatar
            </p>
            <div className="grid grid-cols-4 gap-3">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => handleSelectAvatar(av)}
                  className="flex flex-col items-center gap-1 p-3 rounded-2xl
                    bg-white border-2 border-transparent hover:border-primary
                    active:scale-90 transition-all shadow-sm"
                >
                  <span className="text-4xl">{av.emoji}</span>
                  <span className="text-xs text-gray-500">{av.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
