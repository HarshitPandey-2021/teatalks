'use client'

import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

const AuthContext = createContext(null)

function readStoredUser() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const savedUser = localStorage.getItem('teatalks_user')
    const savedToken = localStorage.getItem('teatalks_token')

    if (!savedUser || !savedToken) {
      return null
    }

    return JSON.parse(savedUser)
  } catch {
    localStorage.removeItem('teatalks_user')
    localStorage.removeItem('teatalks_token')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setUser(readStoredUser())
    setLoading(false)
  }, [])

  const persistSession = useCallback((token, nextUser) => {
    localStorage.setItem('teatalks_token', token)
    localStorage.setItem('teatalks_user', JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/users/login', { email, password })
    const { token, user } = res.data

    persistSession(token, user)
    router.push(user.role === 'admin' ? '/admin' : '/feed')
    return user
  }, [persistSession, router])

  const signup = useCallback(async (formData) => {
    const res = await api.post('/users/register', {
      campusName: formData.college,
      email: formData.email,
      password: formData.password,
    })
    const { token, user } = res.data

    persistSession(token, user)
    router.push('/feed')
    return user
  }, [persistSession, router])

  const logout = useCallback(() => {
    localStorage.removeItem('teatalks_token')
    localStorage.removeItem('teatalks_user')
    setUser(null)
    router.push('/login')
  }, [router])

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  }), [user, loading, login, signup, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
