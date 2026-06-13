import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import ForgotPasswordPage from './ForgotPasswordPage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
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

  it('navigates to verification when the email is valid', () => {
    vi.useFakeTimers()

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'user@biotrack.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }))

    act(() => {
      vi.runAllTimers()
    })

    expect(mockNavigate).toHaveBeenCalledWith('/recuperar-cuenta/verificar', {
      state: { email: 'user@biotrack.com' },
    })

    vi.useRealTimers()
  })
})