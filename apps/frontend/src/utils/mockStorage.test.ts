import { describe, it, expect, beforeEach } from 'vitest'
import { mockStorage } from './mockStorage'

describe('mockStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('sets and gets JSON values using prefixed keys', () => {
    mockStorage.set('demo', { ok: true, n: 1 })

    expect(sessionStorage.getItem('biotrack_demo')).toBeTruthy()
    expect(mockStorage.get('demo')).toEqual({ ok: true, n: 1 })
  })

  it('returns null when value does not exist', () => {
    expect(mockStorage.get('missing')).toBeNull()
  })

  it('initializes values with getOrInit only once', () => {
    const first = mockStorage.getOrInit('counter', { value: 1 })
    const second = mockStorage.getOrInit('counter', { value: 2 })

    expect(first).toEqual({ value: 1 })
    expect(second).toEqual({ value: 1 })
  })

  it('removes stored values', () => {
    mockStorage.set('temp', [1, 2, 3])
    mockStorage.remove('temp')

    expect(mockStorage.get('temp')).toBeNull()
  })
})
