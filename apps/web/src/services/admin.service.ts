import { api } from './api'
import { User, AuditLog } from '@tokenforge/types'

export const adminService = {
  async getUsers(page = 1, limit = 10): Promise<{ users: User[]; total: number }> {
    const response = await api.get('/admin/users', { params: { page, limit } })
    return response.data.data
  },

  async changeRole(userId: string, role: string): Promise<User> {
    const response = await api.patch(`/admin/users/${userId}/role`, { role })
    return response.data.data
  },

  async revokeSession(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}/sessions`)
  },

  async getStats(): Promise<{
    totalUsers: number
    activeSessions: number
    oauthUsers: number
    adminUsers: number
  }> {
    const response = await api.get('/admin/stats')
    return response.data.data
  },

  async getAuditLogs(page = 1, limit = 20): Promise<{ logs: AuditLog[]; total: number }> {
    const response = await api.get('/admin/audit', { params: { page, limit } })
    return response.data.data
  },
}
