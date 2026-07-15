import { api } from './api'
import { User } from '@tokenforge/types'

export const userService = {
  async getMe(): Promise<User> {
    const response = await api.get('/users/me')
    return response.data.data
  },

  async updateProfile(data: { name?: string; avatar?: string }): Promise<User> {
    const response = await api.patch('/users/me', data)
    return response.data.data
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/users/me')
  },
}
