import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../utils/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { nombre_completo: 'Admin Test' }, logout: vi.fn(), isAuthenticated: true }),
}))

const getSolicitudes = vi.fn()
const getRoles = vi.fn()
const revisarSolicitud = vi.fn()

vi.mock('../../../services/usuariosService', () => ({
  usuariosService: {
    getSolicitudes: (...args: unknown[]) => getSolicitudes(...args),
    getRoles: (...args: unknown[]) => getRoles(...args),
    revisarSolicitud: (...args: unknown[]) => revisarSolicitud(...args),
  },
}))

import SolicitudesPage from './SolicitudesPage'

const SOLICITUDES = [
  {
    id: 's1',
    nombre_completo: 'Ana Pérez',
    correo_electronico: 'ana@ejemplo.com',
    cargo: 'Inspectora',
    institucion: 'MARN',
    estado: 'Pendiente_Aprobacion',
    created_at: '2026-06-10T12:00:00.000Z',
  },
  {
    id: 's2',
    nombre_completo: 'Luis Gómez',
    correo_electronico: 'luis@ejemplo.com',
    cargo: null,
    institucion: null,
    estado: 'Aprobada',
    created_at: '2026-06-08T12:00:00.000Z',
  },
]

const ROLES = [{ id: 'r1', nombre: 'INSPECTOR', descripcion: null }]

function renderPage() {
  return render(<MemoryRouter><SolicitudesPage /></MemoryRouter>)
}

describe('SolicitudesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getSolicitudes.mockResolvedValue(SOLICITUDES)
    getRoles.mockResolvedValue(ROLES)
    revisarSolicitud.mockResolvedValue({})
  })

  it('lists pending requests by default', async () => {
    renderPage()
    expect((await screen.findAllByText('Ana Pérez')).length).toBeGreaterThan(0)
    // Luis está Aprobada → no aparece en la pestaña Pendientes
    expect(screen.queryByText('Luis Gómez')).not.toBeInTheDocument()
  })

  it('approves a request with role and temporary password', async () => {
    renderPage()
    await screen.findAllByText('Ana Pérez')

    fireEvent.click(screen.getAllByTitle('Aprobar')[0])
    fireEvent.change(await screen.findByPlaceholderText('Mínimo 8 caracteres'), { target: { value: 'secret123' } })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'r1' } })
    fireEvent.click(screen.getByText('Aprobar y crear cuenta'))

    await waitFor(() => {
      expect(revisarSolicitud).toHaveBeenCalledWith('s1', expect.objectContaining({
        accion: 'Aprobada',
        rol_id: 'r1',
        contrasena: 'secret123',
      }))
    })
  })

  it('rejects a request', async () => {
    renderPage()
    await screen.findAllByText('Ana Pérez')

    fireEvent.click(screen.getAllByTitle('Rechazar')[0])
    fireEvent.click(await screen.findByText('Sí, rechazar'))

    await waitFor(() => {
      expect(revisarSolicitud).toHaveBeenCalledWith('s1', expect.objectContaining({ accion: 'Rechazada' }))
    })
  })
})
