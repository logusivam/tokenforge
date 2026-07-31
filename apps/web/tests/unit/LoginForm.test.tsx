import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// Replace framer-motion's motion.button with a plain <button> so jsdom doesn't choke on animations
vi.mock('framer-motion', () => ({
  motion: {
    button: React.forwardRef(({ children, whileHover, whileTap, ...props }: any, ref: any) =>
      React.createElement('button', { ref, ...props }, children)
    ),
  },
}))

// Mock react-router-dom — keep all real exports, only intercept useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

// Mock useAuth so login is fully controllable in each test
const mockLogin = vi.fn()
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

import { LoginForm } from '../../src/components/auth/LoginForm'

const renderForm = () =>
  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  )

describe('LoginForm', () => {
  beforeEach(() => {
    mockLogin.mockReset()
    mockNavigate.mockReset()
  })

  it('renders email and password inputs', () => {
    renderForm()
    expect(screen.getByPlaceholderText('you@example.com')).toBeDefined()
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined()
  })

  it('renders the Sign In submit button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined()
  })

  it('calls login with the entered credentials on submit', async () => {
    mockLogin.mockResolvedValueOnce({ id: '1', email: 'test@example.com' })
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('navigates to / on successful login', async () => {
    mockLogin.mockResolvedValueOnce({ id: '1', email: 'test@example.com' })
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('displays the server error message on login failure', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials.' } },
    })
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByPlaceholderText('you@example.com'), 'bad@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials.')).toBeDefined()
    })
  })

  it('shows a rate-limit message on 429 response', async () => {
    mockLogin.mockRejectedValueOnce({ response: { status: 429 } })
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByPlaceholderText('you@example.com'), 'user@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'somepassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/too many attempts/i)).toBeDefined()
    })
  })
})
