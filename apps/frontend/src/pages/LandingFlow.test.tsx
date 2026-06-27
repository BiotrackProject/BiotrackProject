// @ts-nocheck
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = MockIntersectionObserver
}

vi.mock('../hooks/useGuidedTour', () => ({
  useGuidedTour: () => ({
    startTour: vi.fn(),
    startAutoTour: vi.fn(() => undefined),
  }),
}))

// La búsqueda y el detalle de reportes consultan el backend por código de
// seguimiento; mockeamos sólo ese método y conservamos el resto del servicio.
vi.mock('../services/denunciasService', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    denunciasService: {
      ...actual.denunciasService,
      getSeguimiento: vi.fn(),
    },
  }
})

import { denunciasService } from '../services/denunciasService'
import LandingPage from './LandingPage'
import ReportPage from './ReportPage'
import SearchReportsPage from './SearchReportsPage'
import ReportDetailPage from './ReportDetailPage'

const SAMPLE_REPORTE = {
  IDDenuncia: 1,
  codigo_seguimiento: 'AB53525',
  Descripcion: 'Extracción de arena detectada cerca del cauce.',
  tipo_actividad: 'Extraccion_Rio',
  Estado: 'Pendiente',
  Fecha_denuncia: '2026-03-12T10:00:00.000Z',
  fecha_incidente: null,
  hora_aproximada: null,
  detalle_ubicacion: 'Río Nigua',
  tipo_extraccion: null,
  numero_personas: null,
  cantidad_arena: null,
  nivel_urgencia: 'Alta',
  IDZona: null,
  gps: null,
  historial_estado_denuncia: [],
}

function renderWithRouter(ui, initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>,
  )
}

describe('Landing flow pages', () => {
  it('renders Landing page navigation actions', () => {
    renderWithRouter(<LandingPage />)

    expect(screen.getByRole('link', { name: 'Reportar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Consultar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Iniciar Sesion' })).toBeInTheDocument()
  })

  it('renders Report page form for citizen reporting', () => {
    renderWithRouter(<ReportPage />)

    expect(screen.getByRole('heading', { name: 'Actividad sospechosa de extracción de arena' })).toBeInTheDocument()
    expect(screen.getByText('Información del reporte')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ej. Río Ozama, tramo cercano a...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar reporte' })).toBeInTheDocument()
  })

  it('busca un reporte por código de seguimiento desde la URL', async () => {
    denunciasService.getSeguimiento.mockResolvedValueOnce(SAMPLE_REPORTE)
    renderWithRouter(<SearchReportsPage />, ['/reportes?codigo=AB53525'])

    expect(screen.getByRole('heading', { name: 'Búsqueda de Reportes' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Código de seguimiento' })).toBeInTheDocument()
    expect(denunciasService.getSeguimiento).toHaveBeenCalledWith('AB53525')
    expect(await screen.findByText('Río Nigua')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Ver detalle completo' })).toBeInTheDocument()
  })

  it('renders Report detail page for a valid report id', async () => {
    denunciasService.getSeguimiento.mockResolvedValueOnce(SAMPLE_REPORTE)
    render(
      <MemoryRouter initialEntries={['/reportes/AB53525']}>
        <Routes>
          <Route path="/reportes/:id" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Resumen del caso' })).toBeInTheDocument()
    expect(screen.getByText('Estado actual')).toBeInTheDocument()
    expect(denunciasService.getSeguimiento).toHaveBeenCalledWith('AB53525')
  })

  it('renders not-found state for an invalid report id', async () => {
    denunciasService.getSeguimiento.mockRejectedValueOnce(new Error('Denuncia no encontrada'))
    render(
      <MemoryRouter initialEntries={['/reportes/NO-EXISTE']}>
        <Routes>
          <Route path="/reportes/:id" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Reporte no encontrado' })).toBeInTheDocument()
    expect(screen.getByText('El código consultado no existe o no está disponible.')).toBeInTheDocument()
  })
})
