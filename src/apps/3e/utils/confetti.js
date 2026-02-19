import confetti from 'canvas-confetti'

export function fireSuccess() {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
  })
}

export function fireSpeedBonus() {
  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
    colors: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
  })
}

export function fireBigWin() {
  const end = Date.now() + 800
  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#f59e0b', '#10b981'],
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#3b82f6', '#8b5cf6'],
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}
