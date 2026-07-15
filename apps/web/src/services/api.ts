import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => {
    cb(token)
  })
  refreshSubscribers = []
}

// Request Interceptor: Attach Access Token & Request ID
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config.headers['x-request-id'] = Math.random().toString(36).substring(2, 15)
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle Silent Refresh and Expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshResponse = await api.post('/auth/refresh')
        const { accessToken } = refreshResponse.data.data

        const meResponse = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        useAuthStore.getState().setAuth(meResponse.data.data, accessToken)
        isRefreshing = false
        onRefreshed(accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError: any) {
        isRefreshing = false
        useAuthStore.getState().clearAuth()

        const isReuse =
          error.response?.data?.message?.toLowerCase().includes('reuse') ||
          refreshError.response?.data?.message?.toLowerCase().includes('reuse')

        if (isReuse) {
          window.location.href = '/security-alert'
        } else {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
