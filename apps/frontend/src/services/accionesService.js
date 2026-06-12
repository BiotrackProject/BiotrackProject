/**
 * Acciones Correctivas Service — mock implementation backed by sessionStorage.
 * Replace with fetch/axios when backend is ready.
 */
import { MOCK_ACCIONES } from '../data/mockAcciones'
import { mockStorage } from '../utils/mockStorage'

const KEY = 'acciones'
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))

const getStore = () => mockStorage.getOrInit(KEY, MOCK_ACCIONES.map((a) => ({ ...a })))
const saveStore = (data) => { mockStorage.set(KEY, data); return data }

export const accionesService = {
  /** GET /api/acciones */
  async getAll() {
    await delay()
    return getStore()
  },

  /** GET /api/acciones/:id */
  async getById(id) {
    await delay()
    const found = getStore().find((a) => a.id === id)
    if (!found) throw new Error(`Acción ${id} no encontrada`)
    return { ...found }
  },

  /** PATCH /api/acciones/:id  { estado } */
  async updateEstado(id, nuevoEstado) {
    await delay()
    const store = getStore()
    const idx = store.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error(`Acción ${id} no encontrada`)
    store[idx] = {
      ...store[idx],
      estado: nuevoEstado,
      fechaAccion: nuevoEstado === 'Corregido'
        ? new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })
        : store[idx].fechaAccion,
    }
    saveStore(store)
    return { ...store[idx] }
  },

  /** PUT /api/acciones/:id */
  async update(id, changes) {
    await delay()
    const store = getStore()
    const idx = store.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error(`Acción ${id} no encontrada`)
    store[idx] = { ...store[idx], ...changes }
    saveStore(store)
    return { ...store[idx] }
  },

  /** DELETE /api/acciones/:id */
  async remove(id) {
    await delay()
    const store = getStore().filter((a) => a.id !== id)
    saveStore(store)
    return { success: true }
  },

  /** POST /api/acciones */
  async create(data) {
    await delay(600)
    const store = getStore()
    const next = {
      ...data,
      id: String(store.length + 1).padStart(3, '0'),
      estado: 'Pendiente',
      fechaAccion: null,
      seguimiento: data.seguimiento ?? 'Pendiente de revisión.',
    }
    saveStore([...store, next])
    return { ...next }
  },

  /** GET /api/acciones?q=&estado= */
  async filter({ query = '', estado = '' } = {}) {
    await delay(150)
    const q = query.toLowerCase()
    return getStore().filter((a) => {
      const matchQ = !q || a.id.includes(q) || a.descripcion.toLowerCase().includes(q) || a.provincia.toLowerCase().includes(q)
      return matchQ && (!estado || a.estado === estado)
    })
  },
}
