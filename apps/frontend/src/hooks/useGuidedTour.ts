import { useCallback } from 'react'
import introJs from 'intro.js'

declare global {
  interface Window {
    __resetTours?: () => void
    __resetTour?: (area: string) => void
  }
}

type StorageArea = 'landing' | 'citizen' | 'citizen_search' | 'backoffice' | string

const STORAGE_KEYS: Record<string, string> = {
  landing:        'biotrack_intro_landing_seen',
  citizen:        'biotrack_intro_citizen_seen',
  citizen_search: 'biotrack_intro_citizen_search_seen',
  backoffice:     'biotrack_intro_backoffice_seen',
}

const STORAGE_PREFIX = 'biotrack_intro_'

function getStorageKey(area: StorageArea): string {
  return STORAGE_KEYS[area] ?? `biotrack_intro_${area}_seen`
}

const INTRO_OPTIONS = {
  nextLabel:          'Siguiente →',
  prevLabel:          '← Anterior',
  skipLabel:          'Saltar tour',
  doneLabel:          'Finalizar',
  showProgress:       true,
  showBullets:        false,
  showStepNumbers:    false,
  exitOnOverlayClick: true,
  exitOnEsc:          true,
  disableInteraction: false,
  scrollToElement:    true,
  scrollPadding:      80,
}

function resolveSteps(rawSteps: Record<string, any>[]): Record<string, any>[] {
  return rawSteps.reduce<Record<string, any>[]>((acc, step) => {
    if (!step.element) {
      acc.push(step)
      return acc
    }
    const el = typeof step.element === 'string'
      ? document.querySelector(step.element)
      : step.element
    if (el) acc.push({ ...step, element: el as HTMLElement })
    return acc
  }, [])
}

export function useGuidedTour(area: StorageArea) {
  const key = getStorageKey(area)

  const hasSeenTour = useCallback(() => localStorage.getItem(key) === 'true', [key])
  const markSeen = useCallback(() => localStorage.setItem(key, 'true'), [key])

  const startTour = useCallback((rawSteps: Record<string, any>[], onFinish?: () => void) => {
    const steps = resolveSteps(rawSteps)
    if (steps.length === 0) return
    introJs()
      .setOptions({ ...INTRO_OPTIONS, steps })
      .oncomplete(() => { markSeen(); onFinish?.() })
      .onexit(() => { markSeen(); onFinish?.() })
      .start()
  }, [markSeen])

  const startAutoTour = useCallback((rawSteps: Record<string, any>[], delayMs = 600) => {
    if (hasSeenTour()) return
    const timer = setTimeout(() => startTour(rawSteps), delayMs)
    return () => clearTimeout(timer)
  }, [hasSeenTour, startTour])

  return { startTour, startAutoTour, hasSeenTour, markSeen }
}

if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  function clearTourStorage(prefix = STORAGE_PREFIX) {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix) && k.endsWith('_seen'))
      .forEach((k) => localStorage.removeItem(k))
  }
  window.__resetTours = () => {
    clearTourStorage()
    console.info('[BIOTRACK] All intro tours reset. Refresh the page.')
  }
  window.__resetTour = (area: string) => {
    const k = STORAGE_KEYS[area] ?? `${STORAGE_PREFIX}${area}_seen`
    localStorage.removeItem(k)
    console.info(`[BIOTRACK] Tour "${area}" reset.`)
  }
}
