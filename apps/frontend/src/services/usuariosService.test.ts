// @ts-nocheck
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { usuariosService } from './usuariosService'

describe('usuariosService', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns all users', async () => {
    const pending = usuariosService.getAll()
    await vi.runAllTimersAsync()
    const users = await pending

    expect(Array.isArray(users)).toBe(true)
    expect(users.length).toBeGreaterThan(0)
  })

  it('creates users with default estado and ultimoAcceso', async () => {
    const pending = usuariosService.create({
      nombres: 'Ana',
      apellidos: 'Perez',
      email: 'ana@example.com',
      rol: 'Analista',
    })
    await vi.runAllTimersAsync()
    const created = await pending

    expect(created.id).toMatch(/^u\d{3}$/)
    expect(created.estado).toBe('Activo')
    expect(created.ultimoAcceso).toBe('Nunca')
  })

  it('updates role and status by id', async () => {
    const allPending = usuariosService.getAll()
    await vi.runAllTimersAsync()
    const users = await allPending
    const target = users[0]

    const rolPending = usuariosService.updateRol(target.id, 'Inspector')
    await vi.runAllTimersAsync()
    const rolUpdated = await rolPending
    expect(rolUpdated.rol).toBe('Inspector')

    const estadoPending = usuariosService.updateEstado(target.id, 'Suspendido')
    await vi.runAllTimersAsync()
    const estadoUpdated = await estadoPending
    expect(estadoUpdated.estado).toBe('Suspendido')
  })

  it('returns and updates perfil data', async () => {
    const perfilPending = usuariosService.getPerfil()
    await vi.runAllTimersAsync()
    const perfil = await perfilPending
    expect(perfil).toHaveProperty('email')

    const updatePending = usuariosService.updatePerfil({ telefono: '809-000-9999' })
    await vi.runAllTimersAsync()
    const updated = await updatePending

    expect(updated.telefono).toBe('809-000-9999')

    const reloadedPending = usuariosService.getPerfil()
    await vi.runAllTimersAsync()
    const reloaded = await reloadedPending
    expect(reloaded.telefono).toBe('809-000-9999')
  })
})
