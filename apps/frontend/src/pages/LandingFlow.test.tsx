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

import LandingPage from './LandingPage'
import ReportPage from './ReportPage'
import SearchReportsPage from './SearchReportsPage'
import ReportDetailPage from './ReportDetailPage'

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
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toBeInTheDocument()
  })

  it('renders Report page form for citizen reporting', () => {
    renderWithRouter(<ReportPage />)

    expect(screen.getByRole('heading', { name: 'Actividad sospechosa de extracción de arena' })).toBeInTheDocument()
    expect(screen.getByText('Información del reporte')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ej. Río Ozama, tramo cercano a...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar reporte' })).toBeInTheDocument()
  })

  it('renders Search reports page and query-based result heading', () => {
    renderWithRouter(<SearchReportsPage />, ['/reportes?q=AB53525'])

    expect(screen.getByRole('heading', { name: 'Búsqueda de Reportes' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reporte AB53525' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Buscar por ID o ubicación' })).toBeInTheDocument()
  })

  it('renders Report detail page for a valid report id', () => {
    render(
      <MemoryRouter initialEntries={['/reportes/AB53525']}>
        <Routes>
          <Route path="/reportes/:id" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Resumen del caso' })).toBeInTheDocument()
    expect(screen.getByText('Estado actual')).toBeInTheDocument()
  })

  it('renders not-found state for an invalid report id', () => {
    render(
      <MemoryRouter initialEntries={['/reportes/NO-EXISTE']}>
        <Routes>
          <Route path="/reportes/:id" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Reporte no encontrado' })).toBeInTheDocument()
    expect(screen.getByText('El identificador consultado no existe o no está disponible.')).toBeInTheDocument()
  })
})
