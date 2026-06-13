/**
 * Monitoreo Service — mock implementation backed by sessionStorage.
 * Replace with fetch/axios when backend is ready.
 */
import { MOCK_MONITOREO_DENUNCIAS, MOCK_MONITOREOS } from '../data/mockMonitoreos'
import { mockStorage } from '../utils/mockStorage'

const KEY_D = 'monitoreo_denuncias'
const KEY_P = 'monitoreo_planes'
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))

const getDenStore = () => mockStorage.getOrInit(KEY_D, MOCK_MONITOREO_DENUNCIAS.map((d) => ({ ...d })))
const saveDenStore = (data) => { mockStorage.set(KEY_D, data); return data }

const getPlanStore = () => mockStorage.getOrInit(KEY_P, MOCK_MONITOREOS.map((m) => ({ ...m })))
const savePlanStore = (data) => { mockStorage.set(KEY_P, data); return data }

export const monitoreoService = {
  /** GET /api/monitoreo/denuncias */
  async getDenuncias() {
    await delay()
    return getDenStore()
  },

  /** GET /api/monitoreo/denuncias/:id */
  async getDenunciaById(id) {
    await delay()
    const found = getDenStore().find((d) => d.id === id)
    if (!found) throw new Error(`Denuncia de monitoreo ${id} no encontrada`)
    return { ...found }
  },

  /** PATCH /api/monitoreo/denuncias/:id  { estado } */
  async updateEstado(id, nuevoEstado) {
    await delay()
    const store = getDenStore()
    const idx = store.findIndex((d) => d.id === id)
    if (idx === -1) throw new Error(`Denuncia ${id} no encontrada`)
    store[idx] = { ...store[idx], estado: nuevoEstado }
    saveDenStore(store)
    return { ...store[idx] }
  },

  /** GET /api/monitoreo/planes?denunciaId=X */
  async getPlanesByDenuncia(denunciaId) {
    await delay(200)
    return getPlanStore().filter((m) => m.denunciaId === denunciaId)
  },

  /** POST /api/monitoreo/planes */
  async createPlan(data) {
    await delay(600)
    const store = getPlanStore()
    const next = {
      ...data,
      id: `m${String(store.length + 1).padStart(3, '0')}`,
    }
    savePlanStore([...store, next])
    return { ...next }
  },

  /** DELETE /api/monitoreo/planes/:id */
  async removePlan(id) {
    await delay()
    savePlanStore(getPlanStore().filter((m) => m.id !== id))
    return { success: true }
  },

  /** GET /api/monitoreo/denuncias?q=&estado= */
  async filter({ query = '', estado = '' } = {}) {
    await delay(150)
    const q = query.toLowerCase()
    return getDenStore().filter((d) => {
      const matchQ = !q || d.id.includes(q) || d.descripcion.toLowerCase().includes(q) || d.provincia.toLowerCase().includes(q)
      return matchQ && (!estado || d.estado === estado)
    })
  },
}
