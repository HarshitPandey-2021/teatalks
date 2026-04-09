// components/SearchDropdown.jsx
'use client'

import { useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const ALL_POSTS = [
  { _id: '1', anonymousEmoji: '🦊', anonymousName: 'Silent Fox', category: 'Academic', text: "Does anyone have Sharma sir's DBMS notes? Unit 4 specifically. Exam in 3 days 😭", tags: ['DBMS', 'AcademicStress'], score: 342, commentCount: 56 },
  { _id: '2', anonymousEmoji: '🐼', anonymousName: 'Sleepy Panda', category: 'Hostel', text: 'The mess food today was surprisingly... edible? Like, the paneer actually felt like paneer.', tags: ['MessFood', 'HostelLife'], score: 1200, commentCount: 89 },
  { _id: '3', anonymousEmoji: '🦄', anonymousName: 'Glitter Uni', category: 'Reviews', text: 'The new coffee shop near the main gate is a total vibe. ☕️ Cold brew is 10/10.', tags: ['CafeReview', 'CampusVibes'], score: 854, commentCount: 23 },
  { _id: '4', anonymousEmoji: '🦉', anonymousName: 'Night Owl', category: 'Rants', text: "Why does the WiFi in Hostel Block C work at 3 AM but dies during classes? 📡💀", tags: ['WiFi', 'HostelProblems'], score: 567, commentCount: 34 },
  { _id: '5', anonymousEmoji: '🐸', anonymousName: 'Chilled Frog', category: 'General', text: 'Unpopular opinion: The campus at 6 AM is genuinely beautiful. Saw peacocks near the sports complex. 🌄', tags: ['CampusLife', 'MorningVibes'], score: 923, commentCount: 41 },
  { _id: '6', anonymousEmoji: '🐝', anonymousName: 'Busy Bee', category: 'Academic', text: 'The placement cell just dropped intern opportunities for pre-final years. Check your email ASAP.', tags: ['Placements', 'Internships'], score: 1456, commentCount: 112 },
  { _id: '7', anonymousEmoji: '🐉', anonymousName: 'Dragon Anon', category: 'Rants', text: "Someone in my wing plays guitar at 2 AM every single night. Bro you're not John Mayer 💀🎸", tags: ['HostelLife', 'Rants'], score: 789, commentCount: 67 },
]

const TRENDING_TAGS = ['DBMS', 'MessFood', 'WiFi', 'CampusVibes', 'HostelLife', 'Exams', 'Placements', 'HostelProblems']

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

export default function SearchDropdown({ query, onTagClick, onClose }) {
  const router = useRouter()

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    return ALL_POSTS.filter((p) =>
      p.text.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.anonymousName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [query])

  const matchingTags = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    return TRENDING_TAGS.filter(tag => tag.toLowerCase().includes(q)).slice(0, 5)
  }, [query])

  const handleResultClick = useCallback((postId) => {
    router.push(`/posts/${postId}`)
    onClose()
  }, [router, onClose])

  const hasQuery = query.trim().length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: 0, right: 0,
        zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 14,
        boxShadow: '0 0 0 1px rgba(211,200,185,0.15), 0 4px 12px rgba(50,46,40,0.06), 0 12px 40px rgba(50,46,40,0.1)',
        overflow: 'hidden',
        maxHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        padding: '0.75rem',
      }}
        className="search-dd-scroll"
      >
        {!hasQuery ? (
          /* ── Trending State ── */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.04 }}
          >
            <p style={{
              fontSize: '0.5625rem', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              color: '#b3aca3', marginBottom: '0.5rem',
              padding: '0 0.125rem',
              display: 'flex', alignItems: 'center', gap: '0.375rem',
            }}>
              <span style={{ fontSize: '0.6875rem' }}>🔥</span>
              Trending on campus
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {TRENDING_TAGS.map((tag, i) => (
                <motion.button
                  key={tag}
                  onClick={() => onTagClick(tag)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.14, delay: i * 0.025 }}
                  style={{
                    padding: '0.4rem 0.75rem',
                    background: 'rgba(248,240,229,0.55)',
                    border: '1px solid rgba(211,200,185,0.2)',
                    borderRadius: 8,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600, fontSize: '0.75rem',
                    color: '#7a5c2e', cursor: 'pointer',
                    transition: 'all 0.15s cubic-bezier(0.4,0,0.2,1)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(236,72,153,0.08)'
                    e.currentTarget.style.borderColor = 'rgba(236,72,153,0.15)'
                    e.currentTarget.style.color = '#b00d6a'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(248,240,229,0.55)'
                    e.currentTarget.style.borderColor = 'rgba(211,200,185,0.2)'
                    e.currentTarget.style.color = '#7a5c2e'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >#{tag}</motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ── Results State ── */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12 }}
          >
            {/* Matching tags */}
            {matchingTags.length > 0 && (
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.3rem',
                marginBottom: '0.625rem',
              }}>
                {matchingTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => onTagClick(tag)}
                    style={{
                      padding: '0.3rem 0.625rem', borderRadius: 999,
                      background: 'rgba(236,72,153,0.06)',
                      border: '1px solid rgba(236,72,153,0.12)',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600, fontSize: '0.6875rem',
                      color: '#b00d6a', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.2rem',
                      transition: 'all 0.14s',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(236,72,153,0.12)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(236,72,153,0.06)'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 11 }}>tag</span>
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Results count */}
            {results.length > 0 && (
              <p style={{
                fontSize: '0.5625rem', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#b3aca3', marginBottom: '0.5rem',
                padding: '0 0.125rem',
              }}>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
            )}

            {/* Post results */}
            {results.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {results.map((post, i) => {
                  const cs = CAT_STYLES[post.category] || CAT_STYLES.General
                  return (
                    <motion.div
                      key={post._id}
                      onClick={() => handleResultClick(post._id)}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.14, delay: i * 0.03 }}
                      style={{
                        padding: '0.625rem 0.75rem',
                        borderRadius: 10,
                        cursor: 'pointer',
                        transition: 'all 0.14s cubic-bezier(0.4,0,0.2,1)',
                        WebkitTapHighlightColor: 'transparent',
                        border: '1px solid transparent',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(248,240,229,0.55)'
                        e.currentTarget.style.borderColor = 'rgba(211,200,185,0.2)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.borderColor = 'transparent'
                      }}
                    >
                      {/* Header */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        marginBottom: '0.3rem',
                      }}>
                        <span style={{ fontSize: '0.8125rem', flexShrink: 0 }}>{post.anonymousEmoji}</span>
                        <span style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700, fontSize: '0.6875rem',
                          color: '#322e28', flex: 1, minWidth: 0,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{post.anonymousName}</span>
                        <span style={{
                          padding: '1px 5px', borderRadius: 5,
                          background: cs.bg, color: cs.color,
                          fontSize: '0.5rem', fontWeight: 800,
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          flexShrink: 0,
                        }}>{post.category}</span>
                      </div>
                      {/* Text */}
                      <p style={{
                        fontSize: '0.8125rem', lineHeight: 1.45,
                        color: '#4a4239', margin: 0,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>{post.text}</p>
                      {/* Meta */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        marginTop: '0.375rem',
                      }}>
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: '0.2rem',
                          fontSize: '0.625rem', fontWeight: 600, color: '#9c8b7a',
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 11, fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
                          {fmt(post.score)}
                        </span>
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: '0.2rem',
                          fontSize: '0.625rem', fontWeight: 600, color: '#9c8b7a',
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>chat_bubble</span>
                          {fmt(post.commentCount)}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              /* ── Empty State ── */
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '1.75rem 1rem' }}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: 36, color: '#e0d9cf', display: 'block', marginBottom: '0.5rem',
                }}>search_off</span>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.875rem', color: '#7b766e',
                  marginBottom: '0.125rem',
                }}>No results for "{query}"</p>
                <p style={{ fontSize: '0.75rem', color: '#b3aca3' }}>
                  Try different keywords or tags
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Footer hint */}
      <div style={{
        padding: '0.5rem 0.75rem',
        borderTop: '1px solid rgba(234,225,213,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(248,240,229,0.2)',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: '0.5625rem', fontWeight: 600, color: '#c8c1b8',
          display: 'flex', alignItems: 'center', gap: '0.375rem',
        }}>
          <kbd style={{
            padding: '1px 4px', borderRadius: 3,
            background: 'rgba(234,225,213,0.4)',
            border: '1px solid rgba(211,200,185,0.25)',
            fontSize: '0.5rem', fontWeight: 700, color: '#9b958c',
            fontFamily: 'monospace',
          }}>ESC</kbd>
          to close
        </span>
        <span style={{
          fontSize: '0.5625rem', fontWeight: 600, color: '#c8c1b8',
        }}>
          {hasQuery ? `${results.length} found` : `${TRENDING_TAGS.length} trending`}
        </span>
      </div>
    </motion.div>
  )
}