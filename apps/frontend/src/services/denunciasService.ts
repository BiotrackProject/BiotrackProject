/**
 * Denuncias Service — mock implementation backed by sessionStorage.
 * Replace the body of each method with real fetch/axios calls when backend is ready.
 * Endpoint map: see comments on each method.
 */
import { MOCK_DENUNCIAS } from '../data/mockDenuncias'
import { mockStorage } from '../utils/mockStorage'

const KEY = 'denuncias'
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))

const getStore = () => mockStorage.getOrInit(KEY, MOCK_DENUNCIAS.map((d) => ({ ...d })))
const saveStore = (data) => { mockStorage.set(KEY, data); return data }

export const denunciasService = {
  /** GET /api/denuncias */
  async getAll() {
    await delay()
    return getStore()
  },

  /** GET /api/denuncias/:id */
  async getById(id) {
    await delay()
    const found = getStore().find((d) => d.id === id)
    if (!found) throw new Error(`Denuncia ${id} no encontrada`)
    return { ...found }
  },

  /** PATCH /api/denuncias/:id  { estado } */
  async updateEstado(id, nuevoEstado) {
    await delay()
    const store = getStore()
    const idx = store.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error(`Denuncia ${id} no encontrada`)
    store[idx] = { ...store[idx], estado: nuevoEstado }
    saveStore(store)
    return { ...store[idx] }
  },

  /** POST /api/denuncias */
  async create(data) {
    await delay(600)
    const store = getStore()
    const next = {
      ...data,
      id: String(store.length + 1).padStart(3, '0'),
      estado: 'Nueva',
      fecha: new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' }),
    }
    saveStore([...store, next])
    return { ...next }
  },

  /** GET /api/denuncias?q=&estado= */
  async filter({ query = '', estado = '' } = {}) {
    await delay(150)
    const q = query.toLowerCase()
    return getStore().filter((d) => {
      const matchQ = !q || d.id.includes(q) || d.descripcion.toLowerCase().includes(q) || d.provincia.toLowerCase().includes(q)
      return matchQ && (!estado || d.estado === estado)
    })
  },
}
