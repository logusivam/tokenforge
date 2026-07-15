import { api } from './api'
import { User } from '@tokenforge/types'

export const authService = {
  async register(email: string, name: string, password: string): Promise<User> {
    const response = await api.post('/auth/register', { email, name, password })
    return response.data.data
  },

  async login(email: string, password: string): Promise<{ accessToken: string; user: User }> {
    const response = await api.post('/auth/login', { email, password })
    return response.data.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async refresh(): Promise<{ accessToken: string }> {
    const response = await api.post('/auth/refresh')
    return response.data.data
  },
}
