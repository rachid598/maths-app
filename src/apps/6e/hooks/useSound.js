import { useCallback, useRef } from 'react'

const audioCtxRef = { current: null }

function getCtx() {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtxRef.current
}

function playTone(frequency, duration, type = 'sine') {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {
    // Audio not supported
  }
}

export function vibrate(pattern = 50) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern)
  } catch {
    // Vibration not supported
  }
}

export function useSound() {
  const lastPlay = useRef(0)

  const playSuccess = useCallback(() => {
    const now = Date.now()
    if (now - lastPlay.current < 100) return
    lastPlay.current = now
    vibrate(30)
    playTone(523, 0.1)
    setTimeout(() => playTone(659, 0.1), 100)
    setTimeout(() => playTone(784, 0.15), 200)
  }, [])

  const playError = useCallback(() => {
    const now = Date.now()
    if (now - lastPlay.current < 100) return
    lastPlay.current = now
    vibrate([50, 30, 50])
    playTone(300, 0.15, 'square')
    setTimeout(() => playTone(220, 0.2, 'square'), 150)
  }, [])

  const playConfetti = useCallback(() => {
    const now = Date.now()
    if (now - lastPlay.current < 100) return
    lastPlay.current = now
    vibrate([30, 50, 30, 50, 100])
    playTone(523, 0.08)
    setTimeout(() => playTone(659, 0.08), 80)
    setTimeout(() => playTone(784, 0.08), 160)
    setTimeout(() => playTone(1047, 0.25), 240)
  }, [])

  const playTick = useCallback(() => {
    playTone(880, 0.03, 'sine')
  }, [])

  return { playSuccess, playError, playConfetti, playTick }
}
