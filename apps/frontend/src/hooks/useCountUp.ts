import { useState, useEffect } from 'react'

// Animates a number from 0 to `target` when `started` becomes true.
// Accepts `decimals` for fractional values (e.g. 3.4h).
export function useCountUp(
  target: number,
  started: boolean,
  { duration = 2000, decimals = 0 }: { duration?: number; decimals?: number } = {},
): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!started) return

    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4) // easeOutQuart
      setValue(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, target, duration, decimals])

  return value
}
