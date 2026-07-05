import { useState, useEffect, useRef } from 'react'

/**
 * Animates a number from 0 to `target` over `duration` ms.
 * Returns the current display value.
 */
export function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    if (target == null || target === 0) { setCount(0); return }

    startRef.current = null
    const numericTarget = parseFloat(target)
    const isFloat = String(target).includes('.')

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = numericTarget * eased
      setCount(isFloat ? parseFloat(current.toFixed(2)) : Math.floor(current))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return count
}
