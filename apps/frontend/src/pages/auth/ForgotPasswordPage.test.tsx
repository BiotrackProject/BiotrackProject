import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ForgotPasswordPage from './ForgotPasswordPage'
import { forgotPassword } from '../../services/authService'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../services/authService', () => ({
  forgotPassword: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ForgotPasswordPage', () => {
  it('renders the first recovery step', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Recuperar Contraseña' })).toBeInTheDocument()
    expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar código' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a inicio de sesión' })).toBeInTheDocument()
  })

  it('navigates to verification when the email is valid', async () => {
    vi.mocked(forgotPassword).mockResolvedValue({ success: true, data: { mensaje: 'ok' } })

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'user@biotrack.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }))

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith('user@biotrack.com')
      expect(mockNavigate).toHaveBeenCalledWith('/recuperar-cuenta/verificar', {
        state: { email: 'user@biotrack.com' },
      })
    })
  })

  it('shows an error when the request fails (e.g. rate limited)', async () => {
    vi.mocked(forgotPassword).mockResolvedValue({
      success: false,
      error: 'Ya enviamos un código recientemente. Espera 120 segundos antes de solicitar otro.',
    })

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'user@biotrack.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }))

    await waitFor(() => {
      expect(screen.getByText(/Espera 120 segundos/)).toBeInTheDocument()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})