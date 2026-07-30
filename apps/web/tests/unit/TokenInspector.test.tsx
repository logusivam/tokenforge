import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Control accessToken via this mutable reference
let mockStoreState: { accessToken: string | null } = { accessToken: null }

vi.mock('../../src/store/authStore', () => ({
  useAuthStore: () => mockStoreState,
}))

// Mock jwt.utils so we can control what decodeJwt returns per-test
vi.mock('../../src/utils/jwt.utils', () => ({
  decodeJwt: vi.fn(() => null),
}))

// Provide a simple formatExpiry so the time display doesn't throw
vi.mock('../../src/utils/time.utils', () => ({
  formatExpiry: vi.fn((s: number) => `${s}s`),
}))

import { TokenInspector } from '../../src/components/dashboard/TokenInspector'
import { decodeJwt } from '../../src/utils/jwt.utils'

const mockDecodeJwt = vi.mocked(decodeJwt)

describe('TokenInspector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDecodeJwt.mockReturnValue(null)
  })

  it('shows the component heading', () => {
    mockStoreState = { accessToken: null }
    render(<TokenInspector />)
    expect(screen.getByText(/live access token inspector/i)).toBeDefined()
  })

  it('shows placeholder text when no access token is present', () => {
    mockStoreState = { accessToken: null }
    render(<TokenInspector />)
    expect(screen.getByText('No token active')).toBeDefined()
    expect(screen.getByText('No payload claims loaded')).toBeDefined()
  })

  it('displays the raw access token when one is set', () => {
    const fakeToken = 'header.eyJzdWIiOiIxMjMifQ.signature'
    mockStoreState = { accessToken: fakeToken }
    const now = Math.floor(Date.now() / 1000)
    mockDecodeJwt.mockReturnValue({ sub: '123', exp: now + 900, iat: now } as any)

    render(<TokenInspector />)
    expect(screen.getByText(fakeToken)).toBeDefined()
  })

  it('shows the decoded payload when a valid token is present', () => {
    const fakeToken = 'a.b.c'
    mockStoreState = { accessToken: fakeToken }
    const now = Math.floor(Date.now() / 1000)
    mockDecodeJwt.mockReturnValue({ sub: 'user-42', exp: now + 900, iat: now } as any)

    render(<TokenInspector />)
    // Payload is rendered as JSON inside a <pre> — check a key from it
    expect(screen.getByText(/user-42/)).toBeDefined()
  })
})
