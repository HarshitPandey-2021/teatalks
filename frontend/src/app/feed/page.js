// app/feed/page.jsx
"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import PostCard from '@/components/PostCard'
import { useAuth } from '@/context/AuthContext'
import usePosts from '@/store/usePost'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATIC DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CATEGORIES = ['All', 'Academic', 'Hostel', 'Rants', 'General', 'Reviews']

const SORTS = [
  { key: 'hot', label: 'Hot', icon: 'local_fire_department' },
  { key: 'new', label: 'New', icon: 'schedule' },
  { key: 'top', label: 'Top', icon: 'trending_up' },
]

const TRENDING_TAGS = [
  { tag: 'DBMS', posts: 18 },
  { tag: 'LibraryAC', posts: 12 },
  { tag: 'MessHeist', posts: 9 },
  { tag: 'Convocation', posts: 24 },
  { tag: 'WiFiWoes', posts: 7 },
  { tag: 'HostelLife', posts: 31 },
]

const POSTS_DB = [
  { _id: '1', anonymousEmoji: '🦊', anonymousName: 'Silent Fox', category: 'Academic', text: "Does anyone have Sharma sir's DBMS notes? Unit 4 specifically. Exam in 3 days 😭", imageUrl: null, tags: ['DBMS', 'AcademicStress'], score: 342, commentCount: 56, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), userVote: null },
  { _id: '2', anonymousEmoji: '🐼', anonymousName: 'Sleepy Panda', category: 'Hostel', text: 'The mess food today was surprisingly... edible? Like, the paneer actually felt like paneer and not rubber. Did we get a new chef or is it just the sunset mood? 🌅', imageUrl: null, tags: ['MessFood', 'HostelLife'], score: 1200, commentCount: 89, createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), userVote: null },
  { _id: '3', anonymousEmoji: '🦄', anonymousName: 'Glitter Uni', category: 'Reviews', text: 'The new coffee shop near the main gate is a total vibe. ☕️ The cold brew is 10/10 and they play actual good indie music.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC01eKhfFsmA3tGd7JwM1zt4MilRfc7YOZcfrbNpQ-GmcjeQb-o-yIqZrjMnjQef2gOdTw0wCMDqnScxbrKrSpVcsB5swJlAcM8Y1SsJ_hv2-6lgoqlKy8m2tejHWfwaH5PFrxy_Ti5r5pQ-O_FeqoZI6BeFqAWQnnZ-2dWybRXPMU3bFi_vZPblxY-0d_iSg7w8yMCKYyNER_eWXWRiFbynAfi5C3f1bmgwceWzHu_rAc3-SOJ1JPyjjHGKnDKvZSiINv1wXgnjNxT', tags: ['CafeReview', 'CampusVibes'], score: 854, commentCount: 23, createdAt: new Date(Date.now() - 8 * 3600000).toISOString(), userVote: null },
  { _id: '4', anonymousEmoji: '🦉', anonymousName: 'Night Owl', category: 'Rants', text: "Why does the WiFi in Hostel Block C work perfectly at 3 AM but completely dies during online classes? 📡💀 I swear they're throttling us during peak hours.", imageUrl: null, tags: ['WiFi', 'HostelProblems'], score: 567, commentCount: 34, createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), userVote: null },
  { _id: '5', anonymousEmoji: '🐸', anonymousName: 'Chilled Frog', category: 'General', text: 'Unpopular opinion: The campus at 6 AM is genuinely the most beautiful thing ever. Went for a walk today and saw peacocks near the sports complex. 🌄', imageUrl: null, tags: ['CampusLife', 'MorningVibes'], score: 923, commentCount: 41, createdAt: new Date(Date.now() - 18 * 3600000).toISOString(), userVote: null },
  { _id: '6', anonymousEmoji: '🐝', anonymousName: 'Busy Bee', category: 'Academic', text: 'The placement cell just dropped intern opportunities for pre-final years. Check your email ASAP — some close in 48 hours. Grind szn is here.', imageUrl: null, tags: ['Placements', 'Internships'], score: 1456, commentCount: 112, createdAt: new Date(Date.now() - 1 * 3600000).toISOString(), userVote: null },
  { _id: '7', anonymousEmoji: '🐉', anonymousName: 'Dragon Anon', category: 'Rants', text: "Someone in my wing plays guitar at 2 AM every single night. Bro you're not John Mayer, please let us sleep 💀🎸", imageUrl: null, tags: ['HostelLife', 'Rants'], score: 789, commentCount: 67, createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), userVote: null },
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIVE PULSE ENGINE (UPDATED — includes user posts)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PULSE_ACTIONS = ['posted', 'commented', 'upvoted', 'trending']
const EXTRA_EMOJIS = ['🐱', '🦋', '🐙', '🦩', '🐺', '🦎', '🐧', '🦔', '🐳', '🦜']
const EXTRA_NAMES = ['Shadow Cat', 'Midnight Coder', 'Ghost Writer', 'Pixel Punk', 'Quiet Storm', 'Neon Tiger', 'Lazy Lynx', 'Crispy Crow', 'Dusk Walker', 'Cosmic Ant']

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

let pulseIdCounter = 0

function generatePulseEvent(allPostsPool) {
  const pool = allPostsPool && allPostsPool.length > 0 ? allPostsPool : POSTS_DB
  const action = pickRandom(PULSE_ACTIONS)
  const id = ++pulseIdCounter

  const useReal = Math.random() > 0.4
  const post = pickRandom(pool)
  const emoji = useReal ? post.anonymousEmoji : pickRandom(EXTRA_EMOJIS)
  const name = useReal ? post.anonymousName : pickRandom(EXTRA_NAMES)
  const tag = pickRandom(TRENDING_TAGS)

  switch (action) {
    case 'posted':
      return {
        id, icon: emoji,
        text: (<><strong>{name}</strong> posted in{' '}<span style={{ color: '#b00d6a', fontWeight: 700 }}>#{pickRandom(post.tags || []) || post.category}</span></>),
        time: 'just now', type: 'post',
      }
    case 'commented':
      return {
        id, icon: emoji,
        text: (<><strong>{name}</strong> replied to a{' '}<span style={{ color: '#9a3412', fontWeight: 600 }}>{post.category}</span> thread</>),
        time: `${Math.floor(Math.random() * 3) + 1}m ago`, type: 'comment',
      }
    case 'upvoted': {
      const count = Math.floor(Math.random() * 20) + 5
      return {
        id, icon: '🔥',
        text: (<>A post in <strong>#{pickRandom(post.tags || []) || post.category}</strong> just hit{' '}<span style={{ color: '#b00d6a', fontWeight: 700 }}>+{count}</span> votes</>),
        time: 'now', type: 'vote',
      }
    }
    case 'trending':
      return {
        id, icon: '📈',
        text: (<><span style={{ color: '#ea6c00', fontWeight: 700 }}>#{tag.tag}</span> is picking up steam</>),
        time: 'now', type: 'trend',
      }
    default:
      return null
  }
}

function generateUserPostPulse(post) {
  const id = ++pulseIdCounter
  const tag = post.tags && post.tags.length > 0 ? post.tags[0] : post.category
  return {
    id,
    icon: post.anonymousEmoji,
    text: (<><strong>{post.anonymousName}</strong> just posted in{' '}<span style={{ color: '#b00d6a', fontWeight: 700 }}>#{tag}</span></>),
    time: 'just now',
    type: 'post',
    isUserPost: true,
  }
}

const MAX_PULSE_ITEMS = 6

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIVE PULSE COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function LivePulse({ events, maxVisible = 3 }) {
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
                transition: 'background 150ms ease', cursor: 'default',
                background: ev.isUserPost ? 'rgba(176,13,106,0.04)' : 'transparent',
              }}
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

function MobileLiveSheet({ isOpen, onClose, pulseEvents }) {
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
                  <LivePulse events={pulseEvents} maxVisible={5} />
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
                  {TRENDING_TAGS.map((t) => (
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
  const intervalRef = useRef(null)
  const pulseInitialized = useRef(false)
  const seenPostIdsRef = useRef(new Set())

  // Zustand — live posts from store (persisted)
  const livePosts = usePosts((state) => state.posts)

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  // Merge live + static, dedupe, sort newest first
  const allPosts = useMemo(() => {
    const merged = [...livePosts, ...POSTS_DB]
    const seen = new Set()
    return merged.filter(p => {
      if (seen.has(p._id)) return false
      seen.add(p._id)
      return true
    })
  }, [livePosts])

  // ── Live Pulse engine ──
  const addPulseEvent = useCallback((event) => {
    setPulseEvents(prev => {
      const next = [event, ...prev]
      return next.slice(0, MAX_PULSE_ITEMS)
    })
  }, [])

  // Inject user posts into live pulse when new ones appear
  useEffect(() => {
    livePosts.forEach(post => {
      if (post.isMine && !seenPostIdsRef.current.has(post._id)) {
        seenPostIdsRef.current.add(post._id)
        const pulseEv = generateUserPostPulse(post)
        addPulseEvent(pulseEv)
      }
    })
  }, [livePosts, addPulseEvent])

  // Seed + interval for random pulse events
  useEffect(() => {
    if (pulseInitialized.current) return
    pulseInitialized.current = true

    const seeds = []
    for (let i = 0; i < 3; i++) {
      const ev = generatePulseEvent(allPosts)
      if (ev) {
        ev.time = `${(i + 1) * 2}m ago`
        seeds.push(ev)
      }
    }
    setPulseEvents(prev => [...prev, ...seeds])

    const tick = () => {
      const currentPosts = usePosts.getState().posts
      const pool = [...currentPosts, ...POSTS_DB]
      const ev = generatePulseEvent(pool)
      if (ev) addPulseEvent(ev)
      const nextDelay = 3000 + Math.random() * 3000
      intervalRef.current = setTimeout(tick, nextDelay)
    }

    intervalRef.current = setTimeout(tick, 2500)

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current)
    }
  }, [addPulseEvent])

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
    return [...allPosts].sort((a, b) => b.commentCount - a.commentCount).slice(0, 1)
  }, [allPosts])

  // ── Loading state ──
  if (authLoading || !isAuthenticated) {
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
                  <PostCard {...post} />
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

            <LivePulse events={pulseEvents} maxVisible={3} />

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
              {TRENDING_TAGS.map((t) => (
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
                <PostCard key={post._id} {...post} compact />
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
        />
      </div>
    </>
  )
}