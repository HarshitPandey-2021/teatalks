'use client'

import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

const AuthContext = createContext(null)

function readStoredUser() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const savedUser = sessionStorage.getItem('teatalks_user')
    const savedToken = sessionStorage.getItem('teatalks_token')

    if (!savedUser || !savedToken) {
      return null
    }

    return JSON.parse(savedUser)
  } catch {
    sessionStorage.removeItem('teatalks_user')
    sessionStorage.removeItem('teatalks_token')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser())
  const [loading] = useState(false)
  const router = useRouter()

  const persistSession = useCallback((token, nextUser) => {
    sessionStorage.setItem('teatalks_token', token)
    sessionStorage.setItem('teatalks_user', JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const refreshUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('teatalks_token') : null
    if (!token) return null
    const res = await api.get('/users/me')
    const nextUser = res.data?.user
    if (nextUser) {
      sessionStorage.setItem('teatalks_user', JSON.stringify(nextUser))
      setUser(nextUser)
    }
    return nextUser || null
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/users/login', { email, password })
    const { token, user } = res.data

    persistSession(token, user)
    router.push(user.role === 'admin' ? '/admin' : '/feed')
    return user
  }, [persistSession, router])

  const signup = useCallback(async (formData, options = {}) => {
    const res = await api.post('/users/register', {
      campusName: formData.college,
      email: formData.email,
      otp: formData.otp,
    })
    const { token, user } = res.data

    persistSession(token, user)
    if (options.redirect !== false) {
      router.push('/feed')
    }
    return user
  }, [persistSession, router])

  const requestSignupOtp = useCallback(async (formData) => {
    const res = await api.post('/users/register/request-otp', {
      campusName: formData.college,
      email: formData.email,
      password: formData.password,
    })
    return res.data
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('teatalks_token')
    sessionStorage.removeItem('teatalks_user')
    setUser(null)
    router.push('/login')
  }, [router])

  const updateProfile = useCallback(async (payload) => {
    const res = await api.patch('/users/me', payload)
    const nextUser = res.data?.user
    if (nextUser) {
      sessionStorage.setItem('teatalks_user', JSON.stringify(nextUser))
      setUser(nextUser)
    }
    return nextUser
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    requestSignupOtp,
    logout,
    updateProfile,
    refreshUser,
  }), [user, loading, login, signup, requestSignupOtp, logout, updateProfile, refreshUser])

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
