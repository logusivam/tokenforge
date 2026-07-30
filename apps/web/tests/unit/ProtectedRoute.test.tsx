import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

// Replace framer-motion to avoid animation issues in jsdom
vi.mock('framer-motion', () => ({
  motion: {
    button: React.forwardRef(({ children, whileHover, whileTap, ...props }: any, ref: any) =>
      React.createElement('button', { ref, ...props }, children)
    ),
  },
}))

// Mock useAuth — checkSession is used inside ProtectedRoute's useEffect
const mockCheckSession = vi.fn()
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ checkSession: mockCheckSession }),
}))

// Mutable state object — reassign before each test to control component behaviour
let mockStoreState = {
  isAuthenticated: false,
  isLoading: false,
  setLoading: vi.fn(),
}

vi.mock('../../src/store/authStore', () => ({
  useAuthStore: () => mockStoreState,
}))

import { ProtectedRoute } from '../../src/router/ProtectedRoute'

/** Helper: renders ProtectedRoute inside a real memory router with a protected page and /login fallback */
const renderWithRouter = (storeOverrides: Partial<typeof mockStoreState> = {}) => {
  mockStoreState = { ...mockStoreState, ...storeOverrides }
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: checkSession resolves immediately so the effect doesn't hang
    mockCheckSession.mockResolvedValue(undefined)
  })

  it('renders a loading spinner while isLoading is true', () => {
    renderWithRouter({ isLoading: true, isAuthenticated: false })
    // The spinner element has the animate-spin class applied in the component
    expect(document.querySelector('.animate-spin')).not.toBeNull()
  })

  it('redirects to /login when not authenticated and not loading', () => {
    renderWithRouter({ isLoading: false, isAuthenticated: false })
    expect(screen.getByText('Login Page')).toBeDefined()
    expect(screen.queryByText('Dashboard Content')).toBeNull()
  })

  it('renders the Outlet (protected page) when authenticated', () => {
    renderWithRouter({ isLoading: false, isAuthenticated: true })
    expect(screen.getByText('Dashboard Content')).toBeDefined()
    expect(screen.queryByText('Login Page')).toBeNull()
  })
})
