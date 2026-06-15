import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, setToken, getToken, ApiError } from '@/lib/api'
import {
  getMockSessionUser,
  mockLogin,
  mockLogout,
  seedMockUsers,
} from '@/lib/mockAuth'

const AuthContext = createContext(null)

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true'

const ROLE_ACCESS = {
  admin: ['dashboard', 'content', 'submissions', 'tenders', 'donations', 'users', 'settings'],
  editor: ['dashboard', 'content', 'submissions'],
  procurement: ['dashboard', 'tenders'],
  finance: ['dashboard', 'donations'],
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (USE_MOCK) {
      seedMockUsers()
      const sessionUser = getMockSessionUser()
      setUser(sessionUser)
      setLoading(false)
      return sessionUser
    }

    const token = getToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return null
    }

    try {
      const res = await api.getMe()
      setUser(res.user)
      return res.user
    } catch {
      setToken(null)
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (email, password) => {
    if (USE_MOCK) {
      const res = mockLogin(email, password)
      setUser(res.user)
      return res.user
    }

    const res = await api.login(email, password)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }

  const logout = async () => {
    if (USE_MOCK) {
      mockLogout()
      setUser(null)
      return
    }

    try {
      await api.logout()
    } catch {
      // Clear local session even if the server call fails.
    }
    setToken(null)
    setUser(null)
  }

  const canAccess = useCallback(
    (section) => {
      if (!user) return false
      const allowed = ROLE_ACCESS[user.role] || []
      return allowed.includes(section)
    },
    [user],
  )

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshUser, canAccess }),
    [user, loading, refreshUser, canAccess],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { ApiError }
