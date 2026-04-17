// app/feed/page.jsx
"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import PostCard from '@/components/PostCard'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/axios'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATIC DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CATEGORIES = ['All', 'Academic', 'Hostel', 'Rants', 'General', 'Reviews']

const SORTS = [
  { key: 'hot', label: 'Hot', icon: 'local_fire_department' },
  { key: 'new', label: 'New', icon: 'schedule' },
  { key: 'top', label: 'Top', icon: 'trending_up' },
]

const DEFAULT_TRENDING_TAGS = [
  { tag: 'DBMS', posts: 18 },
  { tag: 'LibraryAC', posts: 12 },
  { tag: 'MessHeist', posts: 9 },
  { tag: 'Convocation', posts: 24 },
  { tag: 'WiFiWoes', posts: 7 },
  { tag: 'HostelLife', posts: 31 },
]

const MAX_PULSE_ITEMS = 6

function timeAgo(dateValue) {
  if (!dateValue) return 'just now'
  const diffSeconds = Math.floor((Date.now() - new Date(dateValue).getTime()) / 1000)
  if (diffSeconds < 60) return 'just now'
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`
  return `${Math.floor(diffSeconds / 86400)}d ago`
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIVE PULSE COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function LivePulse({ events, maxVisible = 3, onOpenPost }) {
  const visibleEvents = events.slice(0, maxVisible)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
      <AnimatePresence initial={false}>
        {visibleEvents.map((ev, i) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{
              opacity: i === 0 ? 1 : i === 1 ? 0.7 : 0.45,
              height: 'auto',
              y: 0,
            }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                padding: '0.45rem 0.625rem', borderRadius: '0.5rem',
                transition: 'background 150ms ease', cursor: ev.postId ? 'pointer' : 'default',
                background: ev.isUserPost ? 'rgba(176,13,106,0.04)' : 'transparent',
              }}
              onClick={() => ev.postId && onOpenPost?.(ev.postId)}
              onMouseEnter={e => e.currentTarget.style.background = ev.isUserPost ? 'rgba(176,13,106,0.07)' : 'rgba(248,240,229,0.5)'}
              onMouseLeave={e => e.currentTarget.style.background = ev.isUserPost ? 'rgba(176,13,106,0.04)' : 'transparent'}
            >
              <span style={{ fontSize: '0.85rem', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>{ev.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.75rem', lineHeight: 1.45, color: '#4a4239', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                  {ev.text}
                  {ev.isUserPost && (
                    <span style={{
                      marginLeft: '0.375rem', fontSize: '0.5625rem',
                      fontWeight: 700, color: '#b00d6a',
                      background: 'rgba(176,13,106,0.08)',
                      padding: '1px 5px', borderRadius: 999,
                    }}>You</span>
                  )}
                </p>
                <p style={{ fontSize: '0.5625rem', color: '#b3a898', fontWeight: 500, margin: '2px 0 0' }}>{ev.time}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {visibleEvents.length >= maxVisible && (
        <div style={{
          height: '12px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.9))',
          borderRadius: '0 0 0.5rem 0.5rem',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOBILE LIVE BOTTOM SHEET
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MobileLiveSheet({ isOpen, onClose, pulseEvents, onOpenPost, trendingTags }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="mobile-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(30, 25, 20, 0.45)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />

          <motion.div
            key="mobile-sheet-content"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 380, mass: 0.8 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              zIndex: 9999, background: '#fefcf9',
              borderRadius: '1.25rem 1.25rem 0 0',
              boxShadow: '0 -4px 30px rgba(50,46,40,0.12)',
              maxHeight: '70vh',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0.25rem', flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(200, 193, 184, 0.5)' }} />
            </div>

            <div className="no-sb" style={{ padding: '0.5rem 1rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%', background: '#22c55e',
                    boxShadow: '0 0 6px rgba(34,197,94,0.4)',
                    animation: 'pulseGlow 2s ease-in-out infinite', flexShrink: 0,
                  }} />
                  <span className="scard-title" style={{ margin: 0, fontSize: '0.625rem' }}>Live Pulse</span>
                </div>
                <div style={{
                  background: '#fff', borderRadius: '0.75rem',
                  border: '1px solid rgba(234,225,213,0.3)', padding: '0.5rem 0.25rem',
                }}>
                  <LivePulse events={pulseEvents} maxVisible={5} onOpenPost={(id) => { onClose(); onOpenPost?.(id) }} />
                  {pulseEvents.length === 0 && (
                    <p style={{ fontSize: '0.75rem', color: '#b3a898', textAlign: 'center', padding: '1rem 0', margin: 0 }}>Warming up...</p>
                  )}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.625rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#ea6c00' }}>trending_up</span>
                  <span className="scard-title" style={{ margin: 0, fontSize: '0.625rem' }}>Trending</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {trendingTags.map((t) => (
                    <Link key={t.tag} href={`/search?q=${t.tag}`} onClick={onClose}
                      style={{
                        padding: '0.4rem 0.875rem', borderRadius: '9999px',
                        background: 'rgba(234,225,213,0.45)', color: '#2e2318',
                        fontSize: '0.8125rem', fontWeight: 700,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        textDecoration: 'none', whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                        border: '1px solid rgba(234,225,213,0.3)',
                      }}
                    >#{t.tag}</Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FLOATING LIVE BUTTON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function FloatingLiveButton({ onClick, eventCount }) {
  return (
    <motion.button
      onClick={onClick}
      className="floating-live-btn"
      whileTap={{ scale: 0.92 }}
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.5 }}
      style={{
        position: 'fixed', bottom: '5.5rem', right: '1rem', zIndex: 9990,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.625rem 1rem', borderRadius: '9999px', border: 'none',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
        boxShadow: '0 0 8px rgba(34,197,94,0.5)',
        animation: 'pulseGlow 2s ease-in-out infinite', flexShrink: 0,
      }} />
      Live
      {eventCount > 0 && (
        <span style={{
          background: '#b00d6a', color: '#fff', fontSize: '0.625rem',
          fontWeight: 700, borderRadius: '9999px', padding: '0.1rem 0.375rem',
          minWidth: '1.125rem', textAlign: 'center', lineHeight: 1.4,
        }}>{eventCount > 9 ? '9+' : eventCount}</span>
      )}
    </motion.button>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN FEED PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function FeedPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSort, setActiveSort] = useState('hot')
  const [pulseEvents, setPulseEvents] = useState([])
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const allPostsRef = useRef([])
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [editModalPost, setEditModalPost] = useState(null)
  const [editForm, setEditForm] = useState({ text: '', category: 'General', tags: '' })
  const [editImageFile, setEditImageFile] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState('')
  const [removeEditImage, setRemoveEditImage] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  const fetchPosts = useCallback(async () => {
    try {
      const res = await api.get('/posts')
      setPosts(res.data.posts || [])
    } finally {
      setPostsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchPosts()
  }, [isAuthenticated, fetchPosts])

  const allPosts = useMemo(() => posts, [posts])
  useEffect(() => { allPostsRef.current = allPosts }, [allPosts])

  // ── Live Pulse engine ──
// Live events derived from real posts
  useEffect(() => {
    const toPulse = (post, index) => ({
      id: `${post._id}-${index}`,
      icon: post.anonymousEmoji || '🗨️',
      text: (
        <>
          <strong>{post.anonymousName || 'Anonymous'}</strong> posted in{' '}
          <span style={{ color: '#b00d6a', fontWeight: 700 }}>
            #{(post.tags && post.tags[0]) || post.category || 'General'}
          </span>
        </>
      ),
      time: timeAgo(post.createdAt),
      type: 'post',
      postId: post._id,
      isUserPost: String(post.authorId) === String(user?._id),
    })

    const next = [...allPosts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, MAX_PULSE_ITEMS)
      .map(toPulse)

    setPulseEvents(next)
  }, [allPosts, user?._id])

  // ── Sorting / Filtering ──
  const filteredPosts = useMemo(() => {
    let posts = activeCategory === 'All'
      ? [...allPosts]
      : allPosts.filter(p => p.category === activeCategory)

    if (activeSort === 'new') {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (activeSort === 'top') {
      posts.sort((a, b) => b.score - a.score)
    } else {
      posts.sort((a, b) => {
        const ageA = (Date.now() - new Date(a.createdAt)) / 3600000
        const ageB = (Date.now() - new Date(b.createdAt)) / 3600000
        const scoreA = a.score + a.commentCount * 2 + Math.max(0, 48 - ageA) + (a.isMine ? 500 : 0)
        const scoreB = b.score + b.commentCount * 2 + Math.max(0, 48 - ageB) + (b.isMine ? 500 : 0)
        return scoreB - scoreA
      })
    }
    return posts
  }, [activeCategory, activeSort, allPosts])

  const sidebarPosts = useMemo(() => {
    return [...allPosts]
      .sort((a, b) => {
        const scoreA = (a.commentCount || 0) * 3 + (a.score || 0)
        const scoreB = (b.commentCount || 0) * 3 + (b.score || 0)
        if (scoreB !== scoreA) return scoreB - scoreA
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
      .slice(0, 1)
  }, [allPosts])

  const trendingTags = useMemo(() => {
    const counts = new Map()
    allPosts.forEach((post) => {
      const postTags = Array.isArray(post.tags) ? post.tags : []
      postTags.forEach((tag) => {
        const key = String(tag || '').trim()
        if (!key) return
        counts.set(key, (counts.get(key) || 0) + 1)
      })
    })

    const dynamic = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag, posts]) => ({ tag, posts }))

    return dynamic.length > 0 ? dynamic : DEFAULT_TRENDING_TAGS
  }, [allPosts])

  const uploadImageToCloudinary = useCallback(async (file) => {
    const sigRes = await api.post('/uploads/image-signature')
    const { timestamp, signature, folder, apiKey, cloudName, publicId } = sigRes.data
    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp)
    formData.append('signature', signature)
    formData.append('folder', folder)
    formData.append('public_id', publicId)
    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })
    if (!uploadRes.ok) {
      const details = await uploadRes.json().catch(() => ({}))
      throw new Error(details?.error?.message || 'Image upload failed')
    }
    return uploadRes.json()
  }, [])

  const handleDeletePost = async (postId) => {
    setDeleteLoading(true)
    try {
      await api.delete(`/posts/${postId}`)
      setPosts((prev) => prev.filter((p) => p._id !== postId))
      setDeleteTarget(null)
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete post')
    } finally {
      setDeleteLoading(false)
    }
  }

  const openEditModal = (postId) => {
    const target = posts.find((p) => p._id === postId)
    if (!target) return
    setEditForm({
      text: target.text || '',
      category: target.category || 'General',
      tags: Array.isArray(target.tags) ? target.tags.join(', ') : '',
    })
    setEditImageFile(null)
    setEditImagePreview(target.imageUrl || '')
    setRemoveEditImage(false)
    setEditModalPost(target)
  }

  const closeEditModal = () => {
    if (editImagePreview?.startsWith('blob:')) URL.revokeObjectURL(editImagePreview)
    setEditModalPost(null)
    setEditImageFile(null)
    setEditImagePreview('')
    setRemoveEditImage(false)
  }

  const submitEditPost = async () => {
    if (!editModalPost) return
    setEditLoading(true)
    try {
      const tags = editForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const payload = {
        text: editForm.text,
        category: editForm.category,
        tags,
      }
      if (editImageFile) {
        const uploaded = await uploadImageToCloudinary(editImageFile)
        payload.image = uploaded.secure_url
        payload.imagePublicId = uploaded.public_id
        payload.imageMeta = {
          width: uploaded.width,
          height: uploaded.height,
          format: uploaded.format,
          bytes: uploaded.bytes,
        }
      } else if (removeEditImage) {
        payload.image = ''
        payload.imagePublicId = ''
        payload.imageMeta = null
      }

      const res = await api.patch(`/posts/${editModalPost._id}`, payload)
      const updatedPost = res?.data?.post
      const isVisible = updatedPost?.visibility === 'visible' || updatedPost?.visibility === undefined || updatedPost?.visibility === null

      if (updatedPost && isVisible) {
        setPosts((prev) => prev.map((p) => (p._id === editModalPost._id ? { ...p, ...updatedPost } : p)))
      } else {
        setPosts((prev) => prev.filter((p) => p._id !== editModalPost._id))
        alert('Your post was hidden for review because it was detected as toxic.')
      }
      closeEditModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update post')
    } finally {
      setEditLoading(false)
    }
  }

  // ── Loading state ──
  if (authLoading || !isAuthenticated || postsLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#fefcf9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 36, height: 36, border: '3px solid #eae1d5',
          borderTopColor: '#b00d6a', borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .feed-root {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0.75rem 1rem 5rem;
        }

        @media (min-width: 768px) {
          .feed-root { padding: 1rem 1.5rem 3rem; }
        }

        @media (min-width: 1024px) {
          .feed-root {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 1.75rem;
            padding: 0 2rem;
            height: calc(100vh - 4rem);
            overflow: hidden;
          }
          .feed-main {
            overflow-y: auto;
            padding: 1.25rem 0 2rem;
          }
          .feed-right {
            display: flex !important;
            flex-direction: column;
            gap: 0.75rem;
            position: sticky;
            top: 4rem;
            height: fit-content;
            max-height: calc(100vh - 5rem);
            padding: 1.25rem 0 1.5rem;
            overflow: visible;
          }
          .feed-main::-webkit-scrollbar { display: none; }
          .feed-main {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .floating-live-btn { display: none !important; }
        }

        .feed-right { display: none; }

        @media (max-width: 1023px) {
          .floating-live-btn { display: flex !important; }
        }

        .chip {
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          font-weight: 600; font-size: 0.8125rem;
          white-space: nowrap; cursor: pointer;
          border: none;
          transition: all 0.16s cubic-bezier(0.4,0,0.2,1);
          font-family: 'Inter', sans-serif;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .chip:active { transform: scale(0.95); }
        .chip-on {
          background: #b00d6a; color: #fff;
          box-shadow: 0 2px 10px rgba(176,13,106,0.15);
        }
        .chip-off {
          background: rgba(234,225,213,0.45); color: #6b665e;
        }
        .chip-off:hover {
          background: rgba(234,225,213,0.8); color: #322e28;
        }

        .sbtn {
          display: flex; align-items: center; gap: 0.25rem;
          font-weight: 600; font-size: 0.8125rem;
          padding: 0.375rem 0; background: none; border: none;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.16s; position: relative;
          user-select: none;
        }
        .sbtn::after {
          content: ''; position: absolute;
          bottom: -1px; left: 0; right: 0;
          height: 2px; border-radius: 1px;
          transition: all 0.16s;
        }
        .sbtn:active { transform: scale(0.97); }
        .sbtn-on { color: #b00d6a; font-weight: 700; }
        .sbtn-on::after { background: #b00d6a; }
        .sbtn-off { color: #9b958c; }
        .sbtn-off::after { background: transparent; }
        .sbtn-off:hover { color: #322e28; }
        .sbtn-off:hover::after { background: rgba(50,46,40,0.1); }

        .scard {
          background: #fff;
          border-radius: 0.875rem;
          border: 1px solid rgba(234,225,213,0.3);
          box-shadow: 0 1px 3px rgba(50,46,40,0.025);
        }
        .scard-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800; font-size: 0.5625rem;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: rgba(50,46,40,0.35);
        }

        .sidebar-cta {
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem; padding: 0.6875rem;
          border-radius: 0.75rem; text-decoration: none;
          background: linear-gradient(135deg, #ec4899, #f97316);
          color: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700; font-size: 0.8125rem;
          box-shadow: 0 3px 12px rgba(236,72,153,0.14);
          transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
          border: none; cursor: pointer;
        }
        .sidebar-cta:hover {
          box-shadow: 0 5px 20px rgba(236,72,153,0.2);
          transform: translateY(-1px);
        }
        .sidebar-cta:active { transform: scale(0.98); }

        .no-sb::-webkit-scrollbar { display: none; }
        .no-sb { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="feed-root">
        <main className="feed-main">
          {/* Category row */}
          <div className="no-sb" style={{
            overflowX: 'auto', marginBottom: '0.75rem',
            WebkitOverflowScrolling: 'touch',
          }}>
            <div style={{ display: 'flex', gap: '0.375rem', paddingBottom: 2 }}>
              {CATEGORIES.map(cat => (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`chip ${activeCategory === cat ? 'chip-on' : 'chip-off'}`}
                  whileTap={{ scale: 0.95 }}
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >{cat}</motion.button>
              ))}
            </div>
          </div>

          {/* Sort bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1.25rem',
            marginBottom: '0.875rem',
            borderBottom: '1px solid rgba(234,225,213,0.3)',
            paddingBottom: '0.5rem',
          }}>
            {SORTS.map(s => (
              <button key={s.key} onClick={() => setActiveSort(s.key)}
                className={`sbtn ${activeSort === s.key ? 'sbtn-on' : 'sbtn-off'}`}
              >
                <span className={`material-symbols-outlined ${activeSort === s.key ? 'mat-fill' : ''}`}
                  style={{ fontSize: 15 }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, i) => (
                <motion.div
                  key={`${activeCategory}-${activeSort}-${post._id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{
                    duration: 0.22,
                    delay: i * 0.025,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  layout
                >
                  <PostCard
                    {...post}
                    isMine={String(post.authorId) === String(user?._id)}
                    onEdit={openEditModal}
                    onDelete={(id) => setDeleteTarget(posts.find((p) => p._id === id) || null)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredPosts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  textAlign: 'center', padding: '3rem 2rem',
                  background: 'rgba(248,240,229,0.2)',
                  borderRadius: '1rem',
                  border: '1px dashed rgba(234,225,213,0.45)',
                }}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: 36, opacity: 0.3, color: '#b00d6a',
                }}>emoji_food_beverage</span>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans'", fontWeight: 700,
                  fontSize: '0.9375rem', marginTop: '0.75rem', color: '#7b766e',
                }}>Nothing in {activeCategory} yet</p>
                <p style={{
                  fontSize: '0.8125rem', marginTop: '0.25rem', color: '#9b958c',
                }}>Be the first to spill some tea ☕</p>
              </motion.div>
            )}

            {filteredPosts.length > 0 && (
              <div style={{
                textAlign: 'center', padding: '1.25rem 0 0.5rem',
                color: '#c8c1b8', fontSize: '0.6875rem',
                fontWeight: 600, letterSpacing: '0.04em',
              }}>You're all caught up ✨</div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="feed-right">
          <div className="scard" style={{ padding: '0.875rem 0.75rem 0.625rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: '0.625rem', padding: '0 0.25rem',
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px rgba(34,197,94,0.4)',
                animation: 'pulseGlow 2s ease-in-out infinite',
                flexShrink: 0,
              }} />
              <span className="scard-title" style={{ margin: 0 }}>Live</span>
            </div>

            <LivePulse events={pulseEvents} maxVisible={3} onOpenPost={(id) => router.push(`/posts/${id}`)} />

            {pulseEvents.length === 0 && (
              <p style={{
                fontSize: '0.75rem', color: '#b3a898', textAlign: 'center',
                padding: '1rem 0', margin: 0,
              }}>Warming up...</p>
            )}
          </div>

          <div className="scard" style={{ padding: '0.875rem 0.75rem 0.75rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              marginBottom: '0.5rem', padding: '0 0.125rem',
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 13, color: '#ea6c00',
              }}>trending_up</span>
              <span className="scard-title" style={{ margin: 0 }}>Trending</span>
            </div>

            <div className="no-sb" style={{
              display: 'flex', gap: '0.375rem',
              overflowX: 'auto', paddingBottom: '2px',
              WebkitOverflowScrolling: 'touch',
            }}>
              {trendingTags.map((t) => (
                <Link key={t.tag} href={`/search?q=${t.tag}`}
                  style={{
                    padding: '0.3125rem 0.75rem', borderRadius: '9999px',
                    background: 'rgba(234,225,213,0.45)', color: '#2e2318',
                    fontSize: '0.75rem', fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    border: '1px solid rgba(234,225,213,0.2)',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(234,225,213,0.8)'
                    e.currentTarget.style.color = '#b00d6a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(234,225,213,0.45)'
                    e.currentTarget.style.color = '#2e2318'
                  }}
                >#{t.tag}</Link>
              ))}
            </div>
          </div>

          <div className="scard" style={{ padding: '0.875rem 0.5rem 0.375rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              marginBottom: '0.25rem', padding: '0 0.375rem',
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 13, color: '#b00d6a',
              }}>forum</span>
              <span className="scard-title" style={{ margin: 0 }}>Active Discussion</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sidebarPosts.map((post) => (
                <PostCard key={post._id} {...post} compact isMine={String(post.authorId) === String(user?._id)} />
              ))}
            </div>
          </div>

          <Link href="/create" className="sidebar-cta">
            <span className="material-symbols-outlined mat-fill" style={{ fontSize: 16 }}>
              edit_square
            </span>
            Spill something…
          </Link>

          <p style={{
            fontSize: '0.5rem', color: '#d4cec5', fontWeight: 600,
            textAlign: 'center', padding: '0.125rem 0',
            letterSpacing: '0.04em',
          }}>TeaTalks · Made by students ☕</p>
        </aside>

        <FloatingLiveButton
          onClick={() => setMobileSheetOpen(true)}
          eventCount={pulseEvents.length}
        />
        <MobileLiveSheet
          isOpen={mobileSheetOpen}
          onClose={() => setMobileSheetOpen(false)}
          pulseEvents={pulseEvents}
          trendingTags={trendingTags}
          onOpenPost={(id) => router.push(`/posts/${id}`)}
        />
      </div>

      <AnimatePresence>
        {editModalPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeEditModal() }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(16,12,8,0.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 16, padding: '1rem', border: '1px solid rgba(234,225,213,0.45)' }}
            >
              <h3 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 800, color: '#2e2318' }}>Edit Post</h3>
              <p style={{ margin: '0.35rem 0 0.8rem', color: '#857f75', fontSize: '0.8rem' }}>Update your content, category and tags.</p>
              <textarea
                value={editForm.text}
                onChange={(e) => setEditForm((prev) => ({ ...prev, text: e.target.value }))}
                rows={5}
                style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(211,200,185,0.45)', padding: '0.7rem', marginBottom: '0.65rem', resize: 'vertical' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                  style={{ borderRadius: 10, border: '1px solid rgba(211,200,185,0.45)', padding: '0.6rem' }}
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  value={editForm.tags}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="tags (comma separated)"
                  style={{ borderRadius: 10, border: '1px solid rgba(211,200,185,0.45)', padding: '0.6rem' }}
                />
              </div>
              <div style={{ marginTop: '0.7rem' }}>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#6b665e', display: 'block', marginBottom: '0.35rem' }}>Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (editImagePreview?.startsWith('blob:')) URL.revokeObjectURL(editImagePreview)
                      setEditImageFile(file)
                      setEditImagePreview(URL.createObjectURL(file))
                      setRemoveEditImage(false)
                    }}
                    style={{ fontSize: '0.75rem' }}
                  />
                  {editImagePreview && !removeEditImage && (
                    <button onClick={() => { setRemoveEditImage(true); setEditImageFile(null) }} style={{ borderRadius: 999, border: '1px solid rgba(180,19,64,0.2)', background: 'rgba(180,19,64,0.06)', color: '#b41340', padding: '0.3rem 0.75rem', fontWeight: 700, cursor: 'pointer' }}>Remove image</button>
                  )}
                </div>
                {editImagePreview && !removeEditImage && (
                  <img src={editImagePreview} alt="edit preview" style={{ marginTop: '0.5rem', width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(211,200,185,0.35)' }} />
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.9rem' }}>
                <button onClick={closeEditModal} style={{ borderRadius: 999, border: '1px solid rgba(211,200,185,0.4)', background: '#fff', padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button onClick={submitEditPost} disabled={editLoading} style={{ borderRadius: 999, border: 'none', background: 'linear-gradient(135deg,#b00d6a,#f97316)', color: '#fff', padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer', opacity: editLoading ? 0.7 : 1 }}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null) }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(16,12,8,0.5)', zIndex: 1201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, padding: '1rem' }}
            >
              <h3 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, color: '#2e2318' }}>Delete this post?</h3>
              <p style={{ color: '#7b766e', fontSize: '0.82rem', lineHeight: 1.5 }}>
                This action cannot be undone. Your post and its comments will be removed permanently.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button onClick={() => setDeleteTarget(null)} style={{ borderRadius: 999, border: '1px solid rgba(211,200,185,0.4)', background: '#fff', padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer' }}>Keep</button>
                <button onClick={() => handleDeletePost(deleteTarget._id)} disabled={deleteLoading} style={{ borderRadius: 999, border: 'none', background: '#b41340', color: '#fff', padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer', opacity: deleteLoading ? 0.7 : 1 }}>
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}