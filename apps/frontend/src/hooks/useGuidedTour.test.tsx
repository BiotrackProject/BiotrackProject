import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGuidedTour } from './useGuidedTour'

const mockSetOptions = vi.fn()
const mockOnComplete = vi.fn()
const mockOnExit = vi.fn()
const mockStart = vi.fn()

let completeHandler
let exitHandler

vi.mock('intro.js', () => ({
  default: vi.fn(() => ({
    setOptions: (...args) => {
      mockSetOptions(...args)
      return {
        oncomplete: (cb) => {
          completeHandler = cb
          mockOnComplete(cb)
          return {
            onexit: (cb2) => {
              exitHandler = cb2
              mockOnExit(cb2)
              return {
                start: (...startArgs) => {
                  mockStart(...startArgs)
                },
              }
            },
          }
        },
      }
    },
  })),
}))

describe('useGuidedTour', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = '<div data-tour="step-a"></div>'
    vi.clearAllMocks()
    completeHandler = undefined
    exitHandler = undefined
  })

  it('starts a tour and marks area as seen on complete', () => {
    const { result } = renderHook(() => useGuidedTour('dashboard'))

    act(() => {
      result.current.startTour([
        { intro: 'Welcome' },
        { element: '[data-tour="step-a"]', intro: 'Step A' },
      ])
    })

    expect(mockSetOptions).toHaveBeenCalledTimes(1)
    expect(mockStart).toHaveBeenCalledTimes(1)

    act(() => {
      completeHandler?.()
    })

    expect(localStorage.getItem('biotrack_intro_dashboard_seen')).toBe('true')
  })

  it('does not auto-start when tour was already seen', () => {
    localStorage.setItem('biotrack_intro_dashboard_seen', 'true')
    const { result } = renderHook(() => useGuidedTour('dashboard'))

    act(() => {
      result.current.startAutoTour([{ intro: 'x' }], 0)
    })

    expect(mockSetOptions).not.toHaveBeenCalled()
  })

  it('auto-starts when unseen and supports cleanup callback', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useGuidedTour('dashboard'))

    let cleanup
    act(() => {
      cleanup = result.current.startAutoTour([{ intro: 'Auto' }], 50)
    })

    act(() => {
      vi.advanceTimersByTime(50)
    })

    expect(mockSetOptions).toHaveBeenCalledTimes(1)
    expect(mockStart).toHaveBeenCalledTimes(1)

    expect(typeof cleanup).toBe('function')
    cleanup()
    vi.useRealTimers()
  })

  it('marks seen on exit callback as well', () => {
    const { result } = renderHook(() => useGuidedTour('dashboard'))

    act(() => {
      result.current.startTour([{ intro: 'Exit test' }])
    })

    act(() => {
      exitHandler?.()
    })

    expect(result.current.hasSeenTour()).toBe(true)
  })
})
