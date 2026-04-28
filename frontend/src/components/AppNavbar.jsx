// components/AppNavbar.jsx
'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import SearchDropdown from './SearchDropdown'
import api from '@/lib/axios'

const DEFAULT_TRENDING_TAGS = ['DBMS', 'MessFood', 'WiFi', 'CampusVibes', 'HostelLife', 'Exams', 'Placements', 'HostelProblems']
const CAT_STYLES = {
  Academic: { bg: 'rgba(176,13,106,0.06)', color: '#b00d6a' },
  Hostel: { bg: 'rgba(154,52,18,0.06)', color: '#9a3412' },
  Rants: { bg: 'rgba(180,19,64,0.06)', color: '#b41340' },
  General: { bg: 'rgba(34,197,94,0.06)', color: '#16a34a' },
  Reviews: { bg: 'rgba(249,115,22,0.06)', color: '#ea6c00' },
}
function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

/* ─── Full-screen mobile search ─── */
function MobileSearch({ onClose, posts, trendingTags }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    setTimeout(() => inputRef.current?.focus(), 80)
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    return posts.filter(p =>
      p.text.toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
      p.anonymousName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [query, posts])

  const matchingTags = useMemo(() => {
    if (!query.trim()) return []
    return trendingTags.filter(t => t.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 5)
  }, [query, trendingTags])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9997,
        background: 'rgba(254,252,249,0.97)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        padding: '0.75rem',
        paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0))',
        display: 'flex', flexDirection: 'column',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem', flexShrink: 0 }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span className="material-symbols-outlined" style={{
            position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            color: query ? '#b00d6a' : '#a09a90', fontSize: 18, pointerEvents: 'none', zIndex: 1,
          }}>search</span>
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search posts, tags, topics..."
            style={{
              width: '100%', height: '2.625rem', background: '#fff',
              border: '1px solid rgba(211,200,185,0.3)', borderRadius: 12,
              padding: '0 2.25rem 0 2.5rem', fontSize: '0.9375rem', color: '#322e28',
              outline: 'none', fontFamily: "'Inter', sans-serif", fontWeight: 500,
            }} />
          {query && (
            <button onClick={() => { setQuery(''); inputRef.current?.focus() }} style={{
              position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
              width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(211,200,185,0.2)', border: 'none', borderRadius: '50%',
              color: '#7b766e', cursor: 'pointer', zIndex: 1,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
            </button>
          )}
        </div>
        <button onClick={onClose} style={{
          padding: '0.5rem', background: 'none', border: 'none',
          fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '0.8125rem',
          color: '#b00d6a', cursor: 'pointer', flexShrink: 0,
        }}>Cancel</button>
      </div>

      <div className="search-dd-scroll" style={{
        flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        borderRadius: 14, background: '#fff',
        border: '1px solid rgba(234,225,213,0.25)',
        boxShadow: '0 2px 12px rgba(50,46,40,0.04)', padding: '0.75rem',
      }}>
        {!query.trim() ? (
          <div>
            <p style={{ fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: '#b3aca3', marginBottom: '0.5rem',
              display: 'flex', alignItems: 'center', gap: '0.375rem',
            }}><span style={{ fontSize: '0.6875rem' }}>🔥</span> Trending on campus</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {trendingTags.map(tag => (
                <button key={tag} onClick={() => setQuery(tag)} style={{
                  padding: '0.4375rem 0.875rem', borderRadius: 8,
                  background: 'rgba(248,240,229,0.55)', border: '1px solid rgba(211,200,185,0.2)',
                  fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: '0.8125rem',
                  color: '#7a5c2e', cursor: 'pointer',
                }}>#{tag}</button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {matchingTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                {matchingTags.map(tag => (
                  <button key={tag} onClick={() => setQuery(tag)} style={{
                    padding: '0.3rem 0.625rem', borderRadius: 999,
                    background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.12)',
                    fontWeight: 600, fontSize: '0.75rem', color: '#b00d6a',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem',
                    fontFamily: "'Inter'",
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 11 }}>tag</span>{tag}
                  </button>
                ))}
              </div>
            )}
            {results.length > 0 && (
              <p style={{ fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: '#b3aca3', marginBottom: '0.5rem',
              }}>{results.length} result{results.length !== 1 ? 's' : ''}</p>
            )}
            {results.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                {results.map(post => {
                  const cs = CAT_STYLES[post.category] || CAT_STYLES.General
                  return (
                    <div key={post._id} onClick={() => { router.push(`/posts/${post._id}`); onClose() }}
                      style={{ padding: '0.75rem', borderRadius: 10, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.875rem' }}>{post.anonymousEmoji}</span>
                        <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '0.75rem',
                          color: '#322e28', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.anonymousName}</span>
                        <span style={{ padding: '1px 5px', borderRadius: 5, background: cs.bg,
                          color: cs.color, fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase' }}>{post.category}</span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: '#4a4239',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', margin: 0 }}>{post.text}</p>
                      <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.375rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem',
                          fontSize: '0.625rem', fontWeight: 600, color: '#9c8b7a' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 11, fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>{fmt(post.score)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem',
                          fontSize: '0.625rem', fontWeight: 600, color: '#9c8b7a' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>chat_bubble</span>{fmt(post.commentCount)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#e0d9cf', display: 'block', marginBottom: '0.5rem' }}>search_off</span>
                <p style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '0.875rem', color: '#7b766e' }}>No results for &ldquo;{query}&rdquo;</p>
                <p style={{ fontSize: '0.75rem', color: '#b3aca3', marginTop: '0.125rem' }}>Try different keywords</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Desktop inline search with dropdown ─── */
function DesktopSearchBar({ posts, trendingTags }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isOpen) { setIsOpen(false); inputRef.current?.blur() }
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  return (
    <div ref={containerRef} className="nav-desktop-search" style={{ position: 'relative', width: '100%', maxWidth: '24rem' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span className="material-symbols-outlined" style={{
          position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
          color: isOpen ? '#b00d6a' : '#a09a90', fontSize: 16, pointerEvents: 'none', zIndex: 1,
          transition: 'color 0.18s',
        }}>search</span>
        <input ref={inputRef} type="text" value={query}
          onChange={e => { setQuery(e.target.value); if (!isOpen) setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search posts, tags..."
          style={{
            width: '100%', height: '2.125rem',
            background: isOpen ? 'rgba(255,255,255,0.95)' : 'rgba(234,225,213,0.35)',
            border: isOpen ? '1px solid rgba(176,13,106,0.18)' : '1px solid rgba(234,225,213,0.3)',
            borderRadius: 9999, padding: '0 2rem 0 2.25rem',
            fontSize: '0.8125rem', color: '#322e28', outline: 'none',
            fontFamily: "'Inter', sans-serif", fontWeight: 500,
            transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: isOpen ? '0 0 0 3px rgba(176,13,106,0.05)' : 'none',
          }} />
        {query && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus() }} style={{
            position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
            width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(211,200,185,0.25)', border: 'none', borderRadius: '50%',
            color: '#7b766e', cursor: 'pointer', zIndex: 1,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>close</span>
          </button>
        )}
      </div>
      <AnimatePresence>
        {isOpen && (
          <SearchDropdown query={query}
            posts={posts}
            trendingTags={trendingTags}
            onTagClick={(tag) => { setQuery(tag); inputRef.current?.focus() }}
            onClose={() => { setIsOpen(false); setQuery(''); inputRef.current?.blur() }} />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Mobile profile dropdown ─── */
function MobileProfileDropdown({ user, onClose, onLogout }) {
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose()
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 10)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <motion.div ref={dropdownRef}
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'absolute', top: '100%', right: 0, marginTop: '0.375rem',
        background: '#fff', borderRadius: '0.875rem', minWidth: 180,
        boxShadow: '0 8px 30px rgba(50,46,40,0.12), 0 2px 8px rgba(50,46,40,0.06)',
        border: '1px solid rgba(234,225,213,0.3)', overflow: 'hidden', zIndex: 100,
      }}>
      {/* User info header */}
      <div style={{ padding: '0.75rem 0.875rem', borderBottom: '1px solid rgba(234,225,213,0.2)',
        display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #ec4899, #fb923c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9375rem',
        }}>{user?.anonymousEmoji || '🎭'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '0.8125rem',
            color: '#322e28', lineHeight: 1.2, margin: 0 }}>{user?.anonymousName || 'Anonymous'}</p>
          <p style={{ fontSize: '0.625rem', color: '#b3aca3', fontWeight: 500, margin: 0, marginTop: 1 }}>
            {user?.branch || 'CSE'} • {user?.year || '1st Year'}
          </p>
        </div>
      </div>

      <Link href="/profile" onClick={onClose}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.625rem 0.875rem', textDecoration: 'none',
          transition: 'background 0.15s', cursor: 'pointer',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,240,229,0.5)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#857f75' }}>person</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#322e28' }}>My Profile</span>
      </Link>

      <div style={{ height: 1, background: 'rgba(234,225,213,0.2)', margin: '0 0.5rem' }} />

      <button onClick={() => { onClose(); onLogout() }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.625rem 0.875rem', background: 'none', border: 'none',
          cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(180,19,64,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#b41340' }}>logout</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#b41340' }}>Log Out</span>
      </button>
    </motion.div>
  )
}

/* ─── Logout confirmation modal ─── */
function LogoutModal({ onCancel, onConfirm, streak }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,12,8,0.5)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}>
      <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        style={{
          background: '#fff', borderRadius: '1.25rem', padding: '1.75rem 1.25rem',
          maxWidth: 340, width: '100%', textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        }}>
        <motion.span initial={{ rotate: 0 }} animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.625rem' }}>👋</motion.span>
        <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: '1.125rem',
          color: '#322e28', marginBottom: '0.25rem' }}>Leaving so soon?</h3>
        <p style={{ fontSize: '0.8125rem', color: '#7b766e', marginBottom: '0.625rem', lineHeight: 1.4 }}>
          Your anonymous identity will be waiting.
        </p>
        {streak > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.375rem 0.75rem', borderRadius: 999, marginBottom: '1rem',
            background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)' }}>
            <span>🔥</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9a3412' }}>
              Don&apos;t lose your {streak}-day streak!
            </span>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '0.8125rem',
            background: 'linear-gradient(135deg, #ec4899, #fb923c)', border: 'none', borderRadius: 999,
            fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '0.8125rem', color: '#fff',
            cursor: 'pointer', boxShadow: '0 3px 12px rgba(236,72,153,0.2)',
          }}>Stay 🎉</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '0.8125rem',
            background: 'rgba(180,19,64,0.06)', border: '1px solid rgba(180,19,64,0.12)', borderRadius: 999,
            fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '0.8125rem', color: '#b41340',
            cursor: 'pointer',
          }}>Log Out</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════
   MAIN NAVBAR
   ═══════════════════════════════════ */
export default function AppNavbar() {
  const { user, logout } = useAuth()
  const [posts, setPosts] = useState([])
  const [logoutStats, setLogoutStats] = useState({ myPosts: 0 })
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const notificationsRef = useRef(null)
  const notifications = [
    { id: 'n1', title: 'Post update', text: 'One of your threads got new replies', href: '/profile', time: '2m' },
    { id: 'n2', title: 'Moderation', text: 'Report review completed', href: '/admin/flagged', time: '10m' },
    { id: 'n3', title: 'Community', text: 'Trending topic: #HostelLife', href: '/feed', time: '25m' },
  ]

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const trendingTags = useMemo(() => {
    const counts = new Map()
    posts.forEach((post) => {
      const tags = Array.isArray(post.tags) ? post.tags : []
      tags.forEach((tag) => {
        const key = String(tag || '').trim()
        if (!key) return
        counts.set(key, (counts.get(key) || 0) + 1)
      })
    })

    const dynamic = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag)

    return dynamic.length > 0 ? dynamic : DEFAULT_TRENDING_TAGS
  }, [posts])

  useEffect(() => {
    if (!showNotifications) return
    const onClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [showNotifications])

  useEffect(() => {
    const fetchNavData = async () => {
      try {
        const [{ data: postsData }, { data: myPostsData }] = await Promise.all([
          api.get('/posts?limit=100'),
          api.get('/users/my-posts'),
        ])
        setPosts(Array.isArray(postsData?.posts) ? postsData.posts : [])
        setLogoutStats({ myPosts: Array.isArray(myPostsData?.posts) ? myPostsData.posts.length : 0 })
      } catch (error) {
        setPosts([])
      }
    }
    fetchNavData()
  }, [])

  const handleLogout = useCallback(() => setShowLogoutModal(true), [])
  const confirmLogout = useCallback(() => { setShowLogoutModal(false); logout() }, [logout])

  return (
    <>
      <style>{`
        .nav-wrap {
          position: sticky; top: 0; z-index: 50; height: 3.5rem;
          background: rgba(255,247,237,0.88);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(176,13,106,0.06);
        }
        .nav-inner {
          width: 100%; max-width: 80rem; height: 100%;
          margin: 0 auto; padding: 0 0.75rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        @media (min-width: 1024px) { .nav-inner { padding: 0 1.5rem; gap: 1rem; } }

        /* Left: logo */
        .nav-left {
          display: flex; align-items: center; gap: 0.375rem;
          flex-shrink: 0; text-decoration: none;
        }
        @media (min-width: 1024px) { .nav-left { gap: 0.5rem; } }

        .nav-logo-icon {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #b00d6a, #f97316);
          border-radius: 0.5rem;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 0.8125rem;
          box-shadow: 0 2px 8px rgba(176,13,106,0.15);
          flex-shrink: 0;
        }
        @media (min-width: 1024px) {
          .nav-logo-icon { width: 32px; height: 32px; border-radius: 0.625rem; font-size: 1rem; }
        }
        .nav-logo-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800; font-size: 1rem; letter-spacing: -0.03em;
          background: linear-gradient(135deg, #b00d6a, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        /* Hide text on very small screens to give room */
        @media (max-width: 359px) { .nav-logo-text { display: none; } }
        @media (min-width: 1024px) { .nav-logo-text { font-size: 1.125rem; } }

        /* Center: search — uses flex, NOT absolute */
        .nav-center {
          flex: 1; min-width: 0;
          display: flex; justify-content: center;
        }

        /* Mobile search trigger bar */
        .nav-mobile-search-trigger {
          display: flex; align-items: center;
          width: 100%; max-width: 28rem; height: 2rem;
          background: rgba(234,225,213,0.35);
          border: 1px solid rgba(234,225,213,0.3);
          border-radius: 9999px; padding: 0 0.75rem;
          gap: 0.375rem; cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: all 0.2s;
        }
        .nav-mobile-search-trigger:active { transform: scale(0.98); background: rgba(234,225,213,0.5); }

        /* Desktop search — hide on mobile, show on desktop */
        .nav-desktop-search { display: none; }
        @media (min-width: 1024px) { .nav-desktop-search { display: block !important; } }
        .nav-mobile-search-trigger-wrap { display: block; }
        @media (min-width: 1024px) { .nav-mobile-search-trigger-wrap { display: none !important; } }

        /* Right side */
        .nav-right {
          display: flex; align-items: center; gap: 0.125rem; flex-shrink: 0;
          position: relative;
        }

        .nav-icon-btn {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; border-radius: 50%;
          cursor: pointer; color: #5f5b53;
          transition: all 0.2s; position: relative;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-icon-btn:hover { background: rgba(234,225,213,0.5); color: #322e28; }
        .nav-icon-btn:active { transform: scale(0.94); }

        .nav-notif-dot {
          position: absolute; top: 6px; right: 6px;
          width: 6px; height: 6px; background: #e11d48;
          border-radius: 50%; border: 1.5px solid rgba(255,247,237,0.9);
        }

        .nav-divider {
          width: 1px; height: 18px; background: rgba(234,225,213,0.5);
          margin: 0 0.25rem; flex-shrink: 0;
        }
        @media (min-width: 1024px) { .nav-divider { height: 20px; margin: 0 0.375rem; } }

        /* Profile button wrapper — relative for dropdown */
        .nav-profile-wrap { position: relative; }

        .nav-profile-btn {
          display: flex; align-items: center; gap: 0.375rem;
          padding: 0.1875rem; border-radius: 9999px; border: none; background: none;
          cursor: pointer; -webkit-tap-highlight-color: transparent;
          transition: all 0.2s;
        }
        .nav-profile-btn:hover { background: rgba(234,225,213,0.45); }
        @media (min-width: 1024px) { .nav-profile-btn { padding-right: 0.75rem; } }

        .nav-profile-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #ec4899, #fb923c);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8125rem; flex-shrink: 0;
        }
        @media (min-width: 1024px) { .nav-profile-avatar { width: 30px; height: 30px; font-size: 0.875rem; } }

        .nav-profile-name {
          display: none; font-size: 0.8125rem; font-weight: 700;
          color: #322e28; font-family: 'Plus Jakarta Sans', sans-serif; white-space: nowrap;
        }
        @media (min-width: 1024px) { .nav-profile-name { display: block; } }

        /* Desktop-only logout button */
        .nav-logout-desktop {
          display: none;
        }
        @media (min-width: 1024px) {
          .nav-logout-desktop {
            display: flex; align-items: center; gap: 0.3rem;
            padding: 0.375rem 0.75rem; border-radius: 9999px;
            background: rgba(180,19,64,0.05); border: 1px solid rgba(180,19,64,0.1);
            font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700;
            font-size: 0.75rem; color: #b41340; cursor: pointer;
            transition: all 0.2s; -webkit-tap-highlight-color: transparent;
          }
          .nav-logout-desktop:hover {
            background: rgba(180,19,64,0.1); border-color: rgba(180,19,64,0.2);
          }
          .nav-logout-desktop:active { transform: scale(0.96); }
        }

        .search-dd-scroll::-webkit-scrollbar { width: 5px; }
        .search-dd-scroll::-webkit-scrollbar-track { background: transparent; }
        .search-dd-scroll::-webkit-scrollbar-thumb { background: rgba(211,200,185,0.25); border-radius: 3px; }
      `}</style>

      <header className="nav-wrap">
        <div className="nav-inner">
          {/* ── LEFT: Logo ── */}
          <Link href="/feed" className="nav-left">
            <div className="nav-logo-icon">☕</div>
            <span className="nav-logo-text">TeaTalks</span>
          </Link>

          {/* ── CENTER: Search ── */}
          <div className="nav-center">
            {/* Mobile: tap to open full-screen search */}
            <div className="nav-mobile-search-trigger-wrap" style={{ width: '100%' }}>
              <div className="nav-mobile-search-trigger" onClick={() => setMobileSearchOpen(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#a09a90' }}>search</span>
                <span style={{ fontSize: '0.75rem', color: '#a09a90', fontWeight: 500,
                  fontFamily: "'Inter', sans-serif", flex: 1 }}>Search...</span>
              </div>
            </div>

            {/* Desktop: inline search with dropdown */}
            <DesktopSearchBar posts={posts} trendingTags={trendingTags} />
          </div>

          {/* ── RIGHT: Actions ── */}
          <div className="nav-right">
            <button className="nav-icon-btn" aria-label="Notifications" onClick={() => setShowNotifications((v) => !v)}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
              <span className="nav-notif-dot" />
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  ref={notificationsRef}
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  style={{
                    position: 'absolute',
                    top: '3.25rem',
                    right: '4.5rem',
                    width: 320,
                    background: '#fff',
                    border: '1px solid rgba(234,225,213,0.35)',
                    borderRadius: 12,
                    boxShadow: '0 12px 30px rgba(50,46,40,0.12)',
                    zIndex: 120,
                    padding: '0.5rem 0.5rem 0.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.5rem 0.5rem' }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: '0.8rem', color: '#322e28' }}>Notifications</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#b00d6a', background: 'rgba(176,13,106,0.08)', padding: '2px 8px', borderRadius: 999 }}>{notifications.length} new</span>
                  </div>
                  {notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setShowNotifications(false)}
                      style={{
                        display: 'block',
                        padding: '0.6rem 0.55rem',
                        textDecoration: 'none',
                        color: '#322e28',
                        borderRadius: 8,
                        marginBottom: '0.2rem',
                        border: '1px solid rgba(234,225,213,0.2)',
                        background: '#fff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>{item.title}</span>
                        <span style={{ fontSize: '0.62rem', color: '#9b958c', fontWeight: 600 }}>{item.time}</span>
                      </div>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: '#6b665e', lineHeight: 1.35 }}>{item.text}</p>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="nav-divider" />

            {/* Desktop: direct profile link */}
            {!isMobile && (
              <Link href="/profile" className="nav-profile-btn" style={{ textDecoration: 'none' }}>
                <div className="nav-profile-avatar">{user?.anonymousEmoji || '🎭'}</div>
                <span className="nav-profile-name">{user?.anonymousName || 'Anonymous'}</span>
              </Link>
            )}

            {/* Mobile: profile button with dropdown */}
            {isMobile && (
              <div className="nav-profile-wrap">
                <button className="nav-profile-btn"
                  onClick={() => setMobileProfileOpen(!mobileProfileOpen)}>
                  <div className="nav-profile-avatar">{user?.anonymousEmoji || '🎭'}</div>
                </button>
                <AnimatePresence>
                  {mobileProfileOpen && (
                    <MobileProfileDropdown
                      user={user}
                      onClose={() => setMobileProfileOpen(false)}
                      onLogout={handleLogout}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Desktop-only logout button */}
            <button className="nav-logout-desktop" onClick={handleLogout}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>logout</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile search */}
      <AnimatePresence>
        {mobileSearchOpen && <MobileSearch posts={posts} trendingTags={trendingTags} onClose={() => setMobileSearchOpen(false)} />}
      </AnimatePresence>

      {/* Logout confirmation modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <LogoutModal
            streak={logoutStats.myPosts}
            onCancel={() => setShowLogoutModal(false)}
            onConfirm={confirmLogout}
          />
        )}
      </AnimatePresence>
    </>
  )
}
