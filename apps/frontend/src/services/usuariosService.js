/**
 * Usuarios Service — mock implementation backed by sessionStorage.
 * Replace with fetch/axios when backend is ready.
 */
import { MOCK_USUARIOS } from '../data/mockUsuarios'
import { mockStorage } from '../utils/mockStorage'

const KEY = 'usuarios'
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))

const getStore = () => mockStorage.getOrInit(KEY, MOCK_USUARIOS.map((u) => ({ ...u })))
const saveStore = (data) => { mockStorage.set(KEY, data); return data }

export const usuariosService = {
  /** GET /api/usuarios */
  async getAll() {
    await delay()
    return getStore()
  },

  /** GET /api/usuarios/:id */
  async getById(id) {
    await delay()
    const found = getStore().find((u) => u.id === id)
    if (!found) throw new Error(`Usuario ${id} no encontrado`)
    return { ...found }
  },

  /** PATCH /api/usuarios/:id  { rol } */
  async updateRol(id, nuevoRol) {
    await delay()
    const store = getStore()
    const idx = store.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error(`Usuario ${id} no encontrado`)
    store[idx] = { ...store[idx], rol: nuevoRol }
    saveStore(store)
    return { ...store[idx] }
  },

  /** PATCH /api/usuarios/:id  { estado } */
  async updateEstado(id, nuevoEstado) {
    await delay()
    const store = getStore()
    const idx = store.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error(`Usuario ${id} no encontrado`)
    store[idx] = { ...store[idx], estado: nuevoEstado }
    saveStore(store)
    return { ...store[idx] }
  },

  /** PUT /api/usuarios/:id */
  async update(id, changes) {
    await delay()
    const store = getStore()
    const idx = store.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error(`Usuario ${id} no encontrado`)
    store[idx] = { ...store[idx], ...changes }
    saveStore(store)
    return { ...store[idx] }
  },

  /** DELETE /api/usuarios/:id */
  async remove(id) {
    await delay()
    saveStore(getStore().filter((u) => u.id !== id))
    return { success: true }
  },

  /** POST /api/usuarios */
  async create(data) {
    await delay(600)
    const store = getStore()
    const next = {
      ...data,
      id: `u${String(store.length + 1).padStart(3, '0')}`,
      estado: 'Activo',
      ultimoAcceso: 'Nunca',
    }
    saveStore([...store, next])
    return { ...next }
  },

  /** GET /api/perfil  (current user profile) */
  async getPerfil() {
    await delay(200)
    const stored = mockStorage.get('perfil')
    if (stored) return stored
    const defaultPerfil = {
      id: 'u001',
      nombres: 'Ivis',
      apellidos: 'Veloz',
      email: 'ivisveloz@gmail.com',
      telefono: '809-555-0001',
      departamento: 'Dirección General',
      rol: 'Administrador',
      ultimoAcceso: '6 jun 2026',
    }
    mockStorage.set('perfil', defaultPerfil)
    return defaultPerfil
  },

  /** PUT /api/perfil */
  async updatePerfil(changes) {
    await delay(400)
    const current = await this.getPerfil()
    const updated = { ...current, ...changes }
    mockStorage.set('perfil', updated)
    return updated
  },
}
