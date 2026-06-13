// @ts-nocheck — tests were written for the old mock service; pending rewrite for real API
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { denunciasService } from './denunciasService'

describe('denunciasService', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns all denuncias', async () => {
    const pending = denunciasService.getAll()
    await vi.runAllTimersAsync()
    const items = await pending

    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)
  })

  it('creates a new denuncia with generated id and default estado', async () => {
    const pending = denunciasService.create({
      descripcion: 'Nueva denuncia de prueba',
      provincia: 'Santo Domingo',
      descripcionCompleta: 'Descripcion completa',
    })
    await vi.runAllTimersAsync()
    const created = await pending

    expect(created.id).toMatch(/^\d{3}$/)
    expect(created.estado).toBe('Nueva')
    expect(created.fecha).toBeTruthy()

    const allPending = denunciasService.getAll()
    await vi.runAllTimersAsync()
    const all = await allPending
    expect(all.some((d) => d.id === created.id)).toBe(true)
  })

  it('updates estado by id', async () => {
    const allPending = denunciasService.getAll()
    await vi.runAllTimersAsync()
    const all = await allPending
    const target = all[0]

    const updatePending = denunciasService.updateEstado(target.id, 'En revisión')
    await vi.runAllTimersAsync()
    const updated = await updatePending

    expect(updated.id).toBe(target.id)
    expect(updated.estado).toBe('En revisión')
  })

  it('filters by query and estado', async () => {
    const pending = denunciasService.filter({ query: 'romana', estado: 'Nueva' })
    await vi.runAllTimersAsync()
    const filtered = await pending

    expect(filtered.every((d) => d.estado === 'Nueva')).toBe(true)
    expect(filtered.every((d) => d.provincia.toLowerCase().includes('romana') || d.descripcion.toLowerCase().includes('romana'))).toBe(true)
  })

  it('throws when updating unknown denuncia', async () => {
    vi.useRealTimers()
    await expect(denunciasService.updateEstado('999', 'Declinada')).rejects.toThrow('no encontrada')
  })
})
