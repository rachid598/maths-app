import { useEffect, useRef, useState } from 'react'
import { TIME_LIMIT } from '../engine'

export default function RushTimer({ running, onTimeUp }) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!running) return
    startRef.current = Date.now()

    function tick() {
      const sec = (Date.now() - startRef.current) / 1000
      setElapsed(sec)
      if (sec >= TIME_LIMIT) { onTimeUp(); return }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running, onTimeUp])

  const remaining = Math.max(0, TIME_LIMIT - elapsed)
  const pct = (remaining / TIME_LIMIT) * 100
  const urgent = remaining < 10

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className={`font-bold tabular-nums ${urgent ? 'text-red-400' : 'text-slate-300'}`}>
          {Math.ceil(remaining)}s
        </span>
        <span className="text-slate-400">{TIME_LIMIT}s</span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-200 ${urgent ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-amber-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
