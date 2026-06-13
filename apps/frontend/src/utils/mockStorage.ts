declare global {
  interface Window { __resetMockData?: () => void }
}

const PREFIX = 'biotrack_'

export const mockStorage = {
  get<T = unknown>(key: string): T | null {
    try {
      const raw = sessionStorage.getItem(PREFIX + key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  },

  set(key: string, value: unknown): void {
    try {
      sessionStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      console.warn('mockStorage: could not write to sessionStorage')
    }
  },

  remove(key: string): void {
    sessionStorage.removeItem(PREFIX + key)
  },

  clearAll(): void {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => sessionStorage.removeItem(k))
    window.location.reload()
  },

  getOrInit<T>(key: string, defaultValue: T): T {
    const raw = sessionStorage.getItem(PREFIX + key)
    const stored: T | null = raw ? (JSON.parse(raw) as T) : null
    if (stored === null) {
      this.set(key, defaultValue)
      return defaultValue
    }
    return stored
  },
}

if (import.meta.env.DEV) {
  window.__resetMockData = () => { mockStorage.clearAll() }
}
