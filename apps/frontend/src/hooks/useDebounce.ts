import { useState, useEffect } from 'react'

// Returns a debounced copy of `value` that only updates after `delay` ms
// without changes. Useful to avoid firing a request on every keystroke.
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
