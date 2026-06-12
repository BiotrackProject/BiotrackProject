/**
 * Mock persistence layer — uses sessionStorage so data resets on tab close.
 * All service methods read/write through here.
 * When the real backend is ready, replace getOrInit/set calls with API calls.
 *
 * To reset all mock data during testing: mockStorage.clearAll()
 * (also exposed as window.__resetMockData in development)
 */

const PREFIX = 'biotrack_'

export const mockStorage = {
  get(key) {
    try {
      const raw = sessionStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  set(key, value) {
    try {
      sessionStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      console.warn('mockStorage: could not write to sessionStorage')
    }
  },

  remove(key) {
    sessionStorage.removeItem(PREFIX + key)
  },

  clearAll() {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => sessionStorage.removeItem(k))
    window.location.reload()
  },

  /** Returns stored value or initialises storage with defaultValue and returns it */
  getOrInit(key, defaultValue) {
    const stored = this.get(key)
    if (stored === null) {
      this.set(key, defaultValue)
      return defaultValue
    }
    return stored
  },
}

// Expose reset helper in dev console for testers
if (import.meta.env.DEV) {
  window.__resetMockData = () => {
    mockStorage.clearAll()
  }
}
