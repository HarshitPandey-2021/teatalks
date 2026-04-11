'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext(null)

// ── Anonymous Identity Generator ──
const ADJECTIVES = [
  'Silent', 'Curious', 'Shadow', 'Midnight', 'Cool',
  'Lone', 'Blue', 'Brave', 'Wise', 'Swift',
  'Chill', 'Mystic', 'Cosmic', 'Neon', 'Zen',
]
const ANIMALS = [
  'Fox', 'Panda', 'Owl', 'Wolf', 'Cat',
  'Penguin', 'Tiger', 'Eagle', 'Dolphin', 'Koala',
  'Raccoon', 'Falcon', 'Otter', 'Lynx', 'Raven',
]
const EMOJIS = [
  '🦊', '🐼', '🦉', '🐺', '🐱',
  '🐧', '🐯', '🦅', '🐬', '🐨',
  '🦝', '🦅', '🦦', '🐱', '🐦‍⬛',
]

function generateIdentity() {
  const i = Math.floor(Math.random() * ADJECTIVES.length)
  const j = Math.floor(Math.random() * ANIMALS.length)
  return {
    anonymousName: `${ADJECTIVES[i]} ${ANIMALS[j]}`,
    anonymousEmoji: EMOJIS[j],
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // ── Restore session on mount ──
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('teatalks_user')
      const savedToken = localStorage.getItem('teatalks_token')
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser))
      }
    } catch {
      localStorage.removeItem('teatalks_user')
      localStorage.removeItem('teatalks_token')
    }
    setLoading(false)
  }, [])

  // ── LOGIN ──
  const login = useCallback(async (email, password) => {
    /*
    ┌─────────────────────────────────────────────────┐
    │  REAL API — uncomment when Somesh's backend is  │
    │  running on localhost:5000                       │
    │                                                 │
    │  import api from '@/lib/axios'                  │
    │                                                 │
    │  const res = await api.post('/auth/login', {    │
    │    email, password                              │
    │  })                                             │
    │  const { token, user } = res.data               │
    │  localStorage.setItem('teatalks_token', token)  │
    │  localStorage.setItem('teatalks_user',          │
    │    JSON.stringify(user))                         │
    │  setUser(user)                                  │
    │  router.push('/feed')                           │
    │  return user                                    │
    └─────────────────────────────────────────────────┘
    */

    // ── FAKE AUTH (remove when backend is ready) ──
    await new Promise((r) => setTimeout(r, 1000))

    // Simulate: any email/password works
    const identity = generateIdentity()
       const fakeUser = {
      _id: 'user_' + Date.now(),
      email,
      ...identity,
      role: email.includes('admin') ? 'admin' : 'user',
      branch: 'CSE',
      year: '3rd Year',
    }
    const fakeToken = 'jwt_' + Date.now()

    localStorage.setItem('teatalks_token', fakeToken)
    localStorage.setItem('teatalks_user', JSON.stringify(fakeUser))
    setUser(fakeUser)
    router.push('/feed')
    return fakeUser
  }, [router])

  // ── SIGNUP ──
  const signup = useCallback(async (formData) => {
    /*
    ┌─────────────────────────────────────────────────┐
    │  REAL API — uncomment when backend is ready     │
    │                                                 │
    │  const res = await api.post('/auth/signup', {   │
    │    name: formData.name,                         │
    │    email: formData.email,                       │
    │    password: formData.password,                 │
    │    branch: formData.branch,                     │
    │    year: formData.year,                         │
    │  })                                             │
    │  const { token, user } = res.data               │
    │  ... same as login ...                          │
    └─────────────────────────────────────────────────┘
    */

    // ── FAKE AUTH ──
    await new Promise((r) => setTimeout(r, 1200))

    const identity = generateIdentity()
    const fakeUser = {
      _id: 'user_' + Date.now(),
      email: formData.email,
      ...identity,
      role: 'user',
      branch: formData.branch || '',
      year: formData.year || '',
    }
    const fakeToken = 'jwt_' + Date.now()

    localStorage.setItem('teatalks_token', fakeToken)
    localStorage.setItem('teatalks_user', JSON.stringify(fakeUser))
    setUser(fakeUser)
    router.push('/feed')
    return fakeUser
  }, [router])

  // ── LOGOUT ──
  const logout = useCallback(() => {
    localStorage.removeItem('teatalks_token')
    localStorage.removeItem('teatalks_user')
    setUser(null)
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
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