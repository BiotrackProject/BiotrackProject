import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../../components/map/BioTrackMap', () => ({
  default: ({ locations = [] }) => (
    <div data-testid="mock-map">Mapa mock ({locations.length})</div>
  ),
}))

vi.mock('recharts', () => {
  const Box = ({ children }) => <div>{children}</div>
  return {
    PieChart: Box,
    Pie: Box,
    Cell: Box,
    Tooltip: Box,
    ResponsiveContainer: Box,
    AreaChart: Box,
    Area: Box,
    XAxis: Box,
    YAxis: Box,
    CartesianGrid: Box,
    BarChart: Box,
    Bar: Box,
    LabelList: Box,
  }
})

vi.mock('../../services/dashboardService', () => ({
  dashboardService: {
    getStats: vi.fn().mockResolvedValue({
      totalDenuncias: 12,
      denunciasActivas: 8,
      enRevision: 4,
      zonasMonitoreadas: 3,
      accionesCorregidas: 5,
      accionesEnCorreccion: 2,
    }),
  },
}))

vi.mock('../../services/monitoreoService', () => ({
  monitoreoService: {
    getDenuncias: vi.fn().mockResolvedValue([
      {
        id: 'm001',
        descripcion: 'Extraccion en rio',
        provincia: 'Santo Domingo',
        fecha: '05/06/2026',
        estado: 'En Monitoreo',
      },
    ]),
  },
}))

vi.mock('../../services/accionesService', () => ({
  accionesService: {
    getAll: vi.fn().mockResolvedValue([
      {
        id: '001',
        denunciaId: 'd001',
        descripcion: 'Cierre temporal de operacion',
        descripcionCompleta: 'Cierre temporal de operacion en zona',
        provincia: 'La Vega',
        fechaIncidente: '04/06/2026',
        fechaAccion: null,
        estado: 'En Correccion',
        responsable: 'Equipo Norte',
        accionTomada: 'Inspeccion inicial',
      },
    ]),
    updateEstado: vi.fn().mockResolvedValue({ id: '001', estado: 'Corregido' }),
  },
}))

vi.mock('../../services/usuariosService', () => ({
  usuariosService: {
    getPerfil: vi.fn().mockResolvedValue({
      id: 'u001',
      nombres: 'Ivis',
      apellidos: 'Veloz',
      email: 'ivisveloz@gmail.com',
      telefono: '809-555-0001',
      departamento: 'Direccion General',
      rol: 'Administrador',
      ultimoAcceso: '6 jun 2026',
    }),
    updatePerfil: vi.fn().mockImplementation(async (data) => data),
  },
}))

vi.mock('../../services/locationService', () => ({
  locationService: {
    getAllLocations: vi.fn().mockResolvedValue([
      {
        id: 'loc-1',
        markerType: 'report',
        lat: 18.47,
        lng: -69.9,
        provincia: 'Santo Domingo',
        municipio: 'Distrito Nacional',
        sector: 'Centro',
        denunciaId: 'd001',
        descripcion: 'Actividad reportada',
        estado: 'En revision',
        nivelRiesgo: 'Medio',
      },
    ]),
    getCurrentUserLocation: vi.fn().mockResolvedValue({ lat: 18.5, lng: -69.95 }),
  },
}))

vi.mock('../../utils/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

import DashboardPage from './DashboardPage'
import DenunciasPage from './DenunciasPage'
import MonitoreoPage from './MonitoreoPage'
import AccionesCorrectivasPage from './AccionesCorrectivasPage'
import PerfilPage from './PerfilPage'
import MapaDenunciasPage from './MapaDenunciasPage'

function renderPage(ui) {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>,
  )
}

describe('Backoffice pages', () => {
  it('renders Dashboard page core sections', async () => {
    renderPage(<DashboardPage />)

    expect(await screen.findByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Mapa de Denuncias')).toBeInTheDocument()
    expect(screen.getByText('Zonas Monitoreadas')).toBeInTheDocument()
  })

  it('renders Denuncias page table controls', () => {
    renderPage(<DenunciasPage />)

    expect(screen.getByText('Denuncias')).toBeInTheDocument()
    expect(screen.getByLabelText('Buscar denuncia')).toBeInTheDocument()
    expect(screen.getByText('Realizar Denuncia')).toBeInTheDocument()
  })

  it('renders Monitoreo page records', async () => {
    renderPage(<MonitoreoPage />)

    expect(await screen.findByText('Monitoreo de Zonas')).toBeInTheDocument()
    expect(screen.getByLabelText('Buscar monitoreo')).toBeInTheDocument()
    expect(screen.getAllByText('En Monitoreo').length).toBeGreaterThan(0)
  })

  it('renders Acciones Correctivas page records', async () => {
    renderPage(<AccionesCorrectivasPage />)

    expect(await screen.findByText('Acciones Correctivas')).toBeInTheDocument()
    expect(screen.getByLabelText('Buscar acción correctiva')).toBeInTheDocument()
    expect(screen.getAllByText('En Correccion').length).toBeGreaterThan(0)
  })

  it('renders Perfil page with user info', async () => {
    renderPage(<PerfilPage />)

    expect(await screen.findByText('Mi Perfil')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Ivis')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Veloz')).toBeInTheDocument()
  })

  it('renders Mapa page with filters and map placeholder', async () => {
    renderPage(<MapaDenunciasPage />)

    expect(await screen.findByText('Mapa de Denuncias')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar provincia, municipio...')).toBeInTheDocument()
    expect(screen.getByTestId('mock-map')).toBeInTheDocument()
  })
})