import { useEffect } from 'react'

export default function BadgeToast({ badge, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!badge) return null

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up"
      onClick={onDismiss}
    >
      <div className="bg-white rounded-2xl shadow-xl border-2 border-accent px-5 py-3 flex items-center gap-3">
        <span className="text-3xl animate-pop-in">{badge.emoji}</span>
        <div>
          <p className="font-bold text-primary-dark text-sm">Nouveau badge !</p>
          <p className="text-xs text-gray-500">{badge.label}</p>
        </div>
      </div>
    </div>
  )
}
