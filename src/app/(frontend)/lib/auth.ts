import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface User {
  id: string
  name: string
  email: string
  role: 'attendee' | 'organizer' | 'admin'
  tenant: string
}

export interface AuthResponse {
  user: User
  token: string
  exp: number
}

class AuthService {
  private token: string | null = null
  private user: User | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      if (userData) {
        this.user = JSON.parse(userData)
      }
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE}/api/users/login`, {
        email,
        password,
      })

      const { user, token, exp } = response.data
      
      this.token = token
      this.user = user
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }

      return { user, token, exp }
    } catch (error) {
      throw new Error('Login failed')
    }
  }

  async logout() {
    try {
      await axios.post(`${API_BASE}/api/users/logout`, {}, {
        headers: this.getAuthHeaders(),
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.token = null
      this.user = null
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }

  getAuthHeaders() {
    return this.token ? { Authorization: `JWT ${this.token}` } : {}
  }

  getUser(): User | null {
    return this.user
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user
  }

  isOrganizer(): boolean {
    return this.user?.role === 'organizer' || this.user?.role === 'admin'
  }
}

export const authService = new AuthService()

// Axios interceptor to add auth headers
axios.interceptors.request.use((config) => {
  const headers = authService.getAuthHeaders()
  config.headers = { ...config.headers, ...headers }
  return config
})

// Handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)