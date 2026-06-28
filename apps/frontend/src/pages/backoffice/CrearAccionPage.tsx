import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Upload, X, FileText, Search, Link2 } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import {
  accionesService,
  filtrarEvidenciasAccion,
  EVIDENCIA_ACCION_MAX_FILES,
  EVIDENCIA_ACCION_MAX_SIZE_MB,
} from '../../services/accionesService'
import { denunciasService, ESTADO_LABEL, ESTADO_STYLES, TIPO_LABEL } from '../../services/denunciasService'
import type { Denuncia } from '../../services/denunciasService'
import { toast } from '../../utils/toast'

const MAX_DENUNCIAS_VINCULADAS = 20

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20'

export default function CrearAccionPage() {
  const navigate = useNavigate()

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaPlan, setFechaPlan] = useState('')
  const [fechaImpl, setFechaImpl] = useState('')
  const [resumenPublico, setResumenPublico] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [evidencias, setEvidencias] = useState<File[]>([])
  const [saving, setSaving] = useState(false)

  const [denuncias, setDenuncias] = useState<Denuncia[]>([])
  const [denunciaSel, setDenunciaSel] = useState<number[]>([])
  const [denunciaQuery, setDenunciaQuery] = useState('')
  const [loadingDenuncias, setLoadingDenuncias] = useState(true)

  useEffect(() => {
    denunciasService.getAll({ por_pagina: 100 })
      .then((res) => setDenuncias(res.data))
      .catch(() => {/* selector opcional: si falla, se deja vacío */})
      .finally(() => setLoadingDenuncias(false))
  }, [])

  const denunciasFiltradas = useMemo(() => {
    const q = denunciaQuery.trim().toLowerCase()
    if (!q) return denuncias
    return denuncias.filter((d) =>
      d.codigo_seguimiento.toLowerCase().includes(q) ||
      (TIPO_LABEL[d.tipo_actividad] ?? d.tipo_actividad).toLowerCase().includes(q) ||
      (d.detalle_ubicacion ?? '').toLowerCase().includes(q)
    )
  }, [denuncias, denunciaQuery])

  const denunciasSeleccionadas = useMemo(
    () => denunciaSel.map((id) => denuncias.find((d) => d.IDDenuncia === id)).filter(Boolean) as Denuncia[],
    [denunciaSel, denuncias],
  )

  function handleFiles(files: FileList | null) {
    if (!files) return
    const { aceptados, errores } = filtrarEvidenciasAccion(evidencias, Array.from(files))
    if (errores.length) errores.forEach((e) => toast.error(e))
    if (aceptados.length) setEvidencias((prev) => [...prev, ...aceptados])
  }

  function toggleDenuncia(id: number) {
    setDenunciaSel((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_DENUNCIAS_VINCULADAS) {
        toast.error(`Máximo ${MAX_DENUNCIAS_VINCULADAS} denuncias vinculadas.`)
        return prev
      }
      return [...prev, id]
    })
  }

  function validar(): string | null {
    if (titulo.trim().length < 5) return 'El título debe tener al menos 5 caracteres.'
    if (titulo.length > 200) return 'El título no puede superar 200 caracteres.'
    if (descripcion && (descripcion.length < 10 || descripcion.length > 3000))
      return 'La descripción debe tener entre 10 y 3000 caracteres.'
    if (resumenPublico && resumenPublico.length > 500)
      return 'El resumen público no puede superar 500 caracteres.'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const error = validar()
    if (error) { toast.error(error); return }

    setSaving(true)
    try {
      const accion = await accionesService.crear({
        titulo: titulo.trim(),
        descripcion_accion: descripcion.trim() || undefined,
        FechaPlanificacion: fechaPlan || undefined,
        FechaImplementacion: fechaImpl || undefined,
        resumen_publico: resumenPublico.trim() || undefined,
        Presupuesto: presupuesto ? Number(presupuesto) : undefined,
        denunciaIds: denunciaSel.length ? denunciaSel : undefined,
        evidencias,
      })
      toast.success('Acción correctiva registrada')
      navigate(`/admin/acciones/${accion.IDAccion}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar la acción')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <BackofficeTopbar title="Nueva Acción Correctiva" backTo="/admin/acciones" />

      <main className="p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl flex-col gap-5">

          {/* Datos generales */}
          <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-primary">Datos Generales</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Título *</label>
              <input className={inputClass} value={titulo} maxLength={200}
                onChange={(e) => setTitulo(e.target.value)} placeholder="Título de la acción correctiva" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Descripción</label>
              <textarea className={`${inputClass} min-h-[110px]`} value={descripcion} maxLength={3000}
                onChange={(e) => setDescripcion(e.target.value)} placeholder="Mín. 30 caracteres recomendados" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">Fecha de planificación</label>
                <input type="date" className={inputClass} value={fechaPlan} onChange={(e) => setFechaPlan(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">Fecha de implementación</label>
                <input type="date" className={inputClass} value={fechaImpl} onChange={(e) => setFechaImpl(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Presupuesto (RD$)</label>
              <input type="number" min="0" step="0.01" className={inputClass} value={presupuesto}
                onChange={(e) => setPresupuesto(e.target.value)} placeholder="0.00" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Resumen público (máx. 500)</label>
              <textarea className={`${inputClass} min-h-[70px]`} value={resumenPublico} maxLength={500}
                onChange={(e) => setResumenPublico(e.target.value)} placeholder="Versión simplificada para el público (opcional)" />
            </div>
          </section>

          {/* Vínculos */}
          <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-primary">Denuncias vinculadas</h3>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Vincula las denuncias que originan esta acción correctiva.</p>
                <span className={`text-xs font-semibold ${denunciaSel.length >= MAX_DENUNCIAS_VINCULADAS ? 'text-amber-600' : 'text-gray-400'}`}>
                  {denunciaSel.length}/{MAX_DENUNCIAS_VINCULADAS}
                </span>
              </div>

              {/* Chips de denuncias seleccionadas */}
              {denunciasSeleccionadas.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {denunciasSeleccionadas.map((d) => (
                    <span key={d.IDDenuncia} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 py-1 pl-2.5 pr-1.5 text-xs font-semibold text-primary">
                      {d.codigo_seguimiento}
                      <button type="button" onClick={() => toggleDenuncia(d.IDDenuncia)}
                        className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20" aria-label={`Quitar ${d.codigo_seguimiento}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Buscador */}
              <div className="relative">
                <input
                  type="text"
                  value={denunciaQuery}
                  onChange={(e) => setDenunciaQuery(e.target.value)}
                  placeholder="Buscar por código, tipo o ubicación..."
                  className={`${inputClass} pr-9`}
                />
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>

              {/* Lista de denuncias */}
              {loadingDenuncias ? (
                <p className="px-1 py-3 text-xs text-gray-400">Cargando denuncias...</p>
              ) : denuncias.length === 0 ? (
                <p className="px-1 py-3 text-xs text-gray-400">No hay denuncias disponibles para vincular.</p>
              ) : denunciasFiltradas.length === 0 ? (
                <p className="px-1 py-3 text-xs text-gray-400">Sin resultados para "{denunciaQuery}".</p>
              ) : (
                <div className="max-h-64 divide-y divide-gray-50 overflow-y-auto rounded-lg border border-gray-100">
                  {denunciasFiltradas.map((d) => {
                    const checked = denunciaSel.includes(d.IDDenuncia)
                    const bloqueado = !checked && denunciaSel.length >= MAX_DENUNCIAS_VINCULADAS
                    return (
                      <label
                        key={d.IDDenuncia}
                        className={`flex items-start gap-3 px-3 py-2.5 transition-colors ${
                          bloqueado ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'
                        } ${checked ? 'bg-primary/5' : ''}`}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 accent-primary"
                          checked={checked}
                          disabled={bloqueado}
                          onChange={() => toggleDenuncia(d.IDDenuncia)}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold text-primary">{d.codigo_seguimiento}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ESTADO_STYLES[d.Estado]}`}>
                              {ESTADO_LABEL[d.Estado]}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {TIPO_LABEL[d.tipo_actividad] ?? d.tipo_actividad}
                            {d.detalle_ubicacion ? ` · ${d.detalle_ubicacion}` : ''}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Zonas vinculadas — oculto temporalmente (módulo de zonas pendiente) */}
          </section>

          {/* Evidencias */}
          <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-primary">Evidencias</h3>
            <p className="text-xs text-gray-400">
              Máx. {EVIDENCIA_ACCION_MAX_FILES} archivos · {EVIDENCIA_ACCION_MAX_SIZE_MB} MB c/u · PDF, JPG, PNG, DOCX
            </p>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-6 text-sm text-gray-500 hover:border-primary hover:text-primary">
              <Upload className="h-4 w-4" />
              Seleccionar archivos
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.docx" className="hidden"
                onChange={(e) => handleFiles(e.target.files)} />
            </label>
            {evidencias.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {evidencias.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 truncate text-gray-600">
                      <FileText className="h-4 w-4 shrink-0 text-gray-400" /> {f.name}
                    </span>
                    <button type="button" onClick={() => setEvidencias((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-gray-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => navigate('/admin/acciones')}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
              <Save className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Registrar acción'}
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
