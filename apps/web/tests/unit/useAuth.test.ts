import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// vi.hoisted() runs before vi.mock factories are called, guaranteeing these
// references exist at the time each factory closes over them.
const {
  mockSetAuth,
  mockClearAuth,
  mockSetLoading,
  mockAuthLogin,
  mockAuthLogout,
  mockAuthRefresh,
  mockGetMe,
} = vi.hoisted(() => ({
  mockSetAuth: vi.fn(),
  mockClearAuth: vi.fn(),
  mockSetLoading: vi.fn(),
  mockAuthLogin: vi.fn(),
  mockAuthLogout: vi.fn(),
  mockAuthRefresh: vi.fn(),
  mockGetMe: vi.fn(),
}))

// ── Store mock ────────────────────────────────────────────────────────────────
vi.mock('../../src/store/authStore', () => ({
  useAuthStore: () => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    setAuth: mockSetAuth,
    clearAuth: mockClearAuth,
    setLoading: mockSetLoading,
  }),
}))

// ── Auth service mock ─────────────────────────────────────────────────────────
vi.mock('../../src/services/auth.service', () => ({
  authService: {
    login: mockAuthLogin,
    logout: mockAuthLogout,
    refresh: mockAuthRefresh,
  },
}))

// ── User service mock ─────────────────────────────────────────────────────────
vi.mock('../../src/services/user.service', () => ({
  userService: {
    getMe: mockGetMe,
  },
}))

import { useAuth } from '../../src/hooks/useAuth'

// ─────────────────────────────────────────────────────────────────────────────

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login()', () => {
    it('calls authService.login with the provided credentials', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test' }
      mockAuthLogin.mockResolvedValueOnce({ user: mockUser, accessToken: 'tok123' })

      const { result } = renderHook(() => useAuth())
      await act(async () => {
        await result.current.login('test@example.com', 'pass123')
      })

      expect(mockAuthLogin).toHaveBeenCalledWith('test@example.com', 'pass123')
    })

    it('stores the user and token in auth state on success', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test' }
      mockAuthLogin.mockResolvedValueOnce({ user: mockUser, accessToken: 'tok123' })

      const { result } = renderHook(() => useAuth())
      await act(async () => {
        await result.current.login('test@example.com', 'pass123')
      })

      expect(mockSetAuth).toHaveBeenCalledWith(mockUser, 'tok123')
    })

    it('propagates errors to the caller on failure', async () => {
      mockAuthLogin.mockRejectedValueOnce(new Error('Bad credentials'))

      const { result } = renderHook(() => useAuth())
      await expect(
        act(async () => {
          await result.current.login('bad@example.com', 'wrong')
        })
      ).rejects.toThrow('Bad credentials')
    })
  })

  describe('logout()', () => {
    it('calls authService.logout', async () => {
      mockAuthLogout.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useAuth())
      await act(async () => {
        await result.current.logout()
      })

      expect(mockAuthLogout).toHaveBeenCalled()
    })

    it('clears auth state after logout', async () => {
      mockAuthLogout.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useAuth())
      await act(async () => {
        await result.current.logout()
      })

      expect(mockClearAuth).toHaveBeenCalled()
    })
  })

  describe('checkSession()', () => {
    it('refreshes the token and fetches the user on success', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test' }
      mockAuthRefresh.mockResolvedValueOnce({ accessToken: 'newTok' })
      mockGetMe.mockResolvedValueOnce(mockUser)

      const { result } = renderHook(() => useAuth())
      await act(async () => {
        await result.current.checkSession()
      })

      expect(mockAuthRefresh).toHaveBeenCalled()
      expect(mockGetMe).toHaveBeenCalled()
      expect(mockSetAuth).toHaveBeenCalledWith(mockUser, 'newTok')
    })

    it('clears auth state when refresh fails', async () => {
      mockAuthRefresh.mockRejectedValueOnce(new Error('Token expired'))

      const { result } = renderHook(() => useAuth())
      await act(async () => {
        await result.current.checkSession()
      })

      expect(mockClearAuth).toHaveBeenCalled()
      expect(mockSetAuth).not.toHaveBeenCalled()
    })
  })
})
