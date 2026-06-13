import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import RegisterPage from './RegisterPage'

describe('RegisterPage', () => {
  it('renders the register form', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Registro de Usuario' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombres *')).toBeInTheDocument()
    expect(screen.getByLabelText('Apellidos *')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo Electrónico *')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Registrarse' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toBeInTheDocument()
  })
})