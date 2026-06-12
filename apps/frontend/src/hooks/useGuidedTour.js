/**
 * useGuidedTour — manages Intro.js tours with first-time auto-run and manual trigger.
 *
 * Storage keys:
 *   biotrack_intro_landing_seen
 *   biotrack_intro_citizen_seen
 *   biotrack_intro_backoffice_seen
 *
 * To reset a tour during testing: localStorage.removeItem('biotrack_intro_<area>_seen')
 * Or call window.__resetTours() in the dev console (exposed below in DEV mode).
 */
import { useCallback } from 'react'
import introJs from 'intro.js'

const STORAGE_KEYS = {
  landing:        'biotrack_intro_landing_seen',
  citizen:        'biotrack_intro_citizen_seen',
  citizen_search: 'biotrack_intro_citizen_search_seen',
  backoffice:     'biotrack_intro_backoffice_seen',
}

const STORAGE_PREFIX = 'biotrack_intro_'

function getStorageKey(area) {
  return STORAGE_KEYS[area] ?? `biotrack_intro_${area}_seen`
}

const INTRO_OPTIONS = {
  nextLabel:        'Siguiente →',
  prevLabel:        '← Anterior',
  skipLabel:        'Saltar tour',
  doneLabel:        'Finalizar',
  showProgress:     true,
  showBullets:      false,
  showStepNumbers:  false,
  exitOnOverlayClick: true,
  exitOnEsc:        true,
  disableInteraction: false,
  scrollToElement:  true,
  scrollPadding:    80,
}

/** Filter steps whose target element exists in DOM right now */
function resolveSteps(rawSteps) {
  return rawSteps.reduce((acc, step) => {
    if (!step.element) {
      acc.push(step)
      return acc
    }
    const el = typeof step.element === 'string'
      ? document.querySelector(step.element)
      : step.element
    if (el) acc.push({ ...step, element: el })
    return acc
  }, [])
}

export function useGuidedTour(area) {
  const key = getStorageKey(area)

  const hasSeenTour = useCallback(() => {
    return localStorage.getItem(key) === 'true'
  }, [key])

  const markSeen = useCallback(() => {
    localStorage.setItem(key, 'true')
  }, [key])

  /**
   * startTour — always runs the tour regardless of seen state.
   * @param rawSteps  Array of Intro.js step objects with [data-tour="..."] selectors.
   * @param onFinish  Optional callback when tour is done or skipped.
   */
  const startTour = useCallback((rawSteps, onFinish) => {
    const steps = resolveSteps(rawSteps)
    if (steps.length === 0) return

    introJs()
      .setOptions({ ...INTRO_OPTIONS, steps })
      .oncomplete(() => { markSeen(); onFinish?.() })
      .onexit(()     => { markSeen(); onFinish?.() })
      .start()
  }, [markSeen])

  /**
   * startAutoTour — only runs if user has NOT seen this tour before.
   * Adds a small delay so DOM elements are fully rendered.
   */
  const startAutoTour = useCallback((rawSteps, delayMs = 600) => {
    if (hasSeenTour()) return
    const timer = setTimeout(() => startTour(rawSteps), delayMs)
    return () => clearTimeout(timer)   // cleanup for useEffect
  }, [hasSeenTour, startTour])

  return { startTour, startAutoTour, hasSeenTour, markSeen }
}

// Dev helper — call window.__resetTours() in console to restart all tours
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  function clearTourStorage(prefix = STORAGE_PREFIX) {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix) && key.endsWith('_seen'))
      .forEach((key) => localStorage.removeItem(key))
  }

  window.__resetTours = () => {
    clearTourStorage()
    console.info('[BIOTRACK] All intro tours reset. Refresh the page.')
  }
  window.__resetTour = (area) => {
    const key = STORAGE_KEYS[area] ?? `${STORAGE_PREFIX}${area}_seen`
    localStorage.removeItem(key)
    console.info(`[BIOTRACK] Tour "${area}" reset.`)
  }
}
