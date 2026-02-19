import { useEffect, useRef, useState } from 'react'

/**
 * Animated countdown bar.
 * Calls onTimeUp when time reaches 0.
 */
export default function TimerBar({ durationMs, running, onTimeUp }) {
  const [remaining, setRemaining] = useState(durationMs)
  const onTimeUpRef = useRef(onTimeUp)

  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  useEffect(() => {
    setRemaining(durationMs)
  }, [durationMs])

  useEffect(() => {
    if (!running) return
    const start = Date.now()
    const end = start + durationMs

    const tick = () => {
      const left = Math.max(0, end - Date.now())
      setRemaining(left)
      if (left <= 0) {
        onTimeUpRef.current?.()
      } else {
        id = requestAnimationFrame(tick)
      }
    }

    let id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [running, durationMs])

  const pct = Math.max(0, (remaining / durationMs) * 100)
  const isLow = pct < 25

  return (
    <div className="mx-auto h-2 max-w-lg overflow-hidden rounded-full bg-surface-light">
      <div
        className={`h-full rounded-full transition-colors ${isLow ? 'bg-red-500' : 'bg-cyan-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
