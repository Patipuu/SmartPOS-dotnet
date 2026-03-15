import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { apiClient } from '../api/client'

const AuthContext = createContext(null)

const STORAGE_TOKEN = 'token'
const STORAGE_USER = 'user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USER)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN))
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (username, password) => {
    setLoading(true)
    try {
      const { data } = await apiClient.post('/api/Auth/login', { username, password })
      localStorage.setItem(STORAGE_TOKEN, data.token)
      localStorage.setItem(STORAGE_USER, JSON.stringify({
        username: data.username,
        role: data.role,
        expiresAt: data.expiresAt,
      }))
      setToken(data.token)
      setUser({ username: data.username, role: data.role, expiresAt: data.expiresAt })
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại'
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN)
    localStorage.removeItem(STORAGE_USER)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const onLogout = () => logout()
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [logout])

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
