import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import VerifyCodePage from './VerifyCodePage'

describe('VerifyCodePage', () => {
  it('renders the verification step', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/recuperar-cuenta/verificar', state: { email: 'user@biotrack.com' } }]}>
        <VerifyCodePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Ingresar Código' })).toBeInTheDocument()
    expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Validar código' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reenviar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })
})