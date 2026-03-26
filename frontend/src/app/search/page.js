'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import PostCard from '@/components/PostCard'

/* ── All posts (same fake data) ── */
const ALL_POSTS = [
  {
    _id: '1', anonymousEmoji: '🦊', anonymousName: 'Silent Fox',
    category: 'Academic',
    text: "Does anyone have Sharma sir's DBMS notes? Unit 4 specifically. Exam in 3 days 😭",
    imageUrl: null, tags: ['DBMS', 'AcademicStress'],
    score: 342, commentCount: 56,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), userVote: null,
  },
  {
    _id: '2', anonymousEmoji: '🐼', anonymousName: 'Sleepy Panda',
    category: 'Hostel',
    text: 'The mess food today was surprisingly... edible? Like, the paneer actually felt like paneer and not rubber.',
    imageUrl: null, tags: ['MessFood', 'HostelLife'],
    score: 1200, commentCount: 89,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), userVote: null,
  },
  {
    _id: '3', anonymousEmoji: '🦄', anonymousName: 'Glitter Uni',
    category: 'Reviews',
    text: 'The new coffee shop near the main gate is a total vibe. ☕️ The cold brew is 10/10 and they play actual good indie music.',
    imageUrl: null, tags: ['CafeReview', 'CampusVibes'],
    score: 854, commentCount: 23,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(), userVote: null,
  },
  {
    _id: '4', anonymousEmoji: '🦉', anonymousName: 'Night Owl',
    category: 'Rants',
    text: "Why does the WiFi in Hostel Block C work perfectly at 3 AM but completely dies during online classes? 📡💀",
    imageUrl: null, tags: ['WiFi', 'HostelProblems'],
    score: 567, commentCount: 34,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), userVote: null,
  },
  {
    _id: '5', anonymousEmoji: '🐸', anonymousName: 'Chilled Frog',
    category: 'General',
    text: 'Unpopular opinion: The campus at 6 AM is genuinely the most beautiful thing ever. Went for a walk today and saw peacocks near the sports complex. 🌄',
    imageUrl: null, tags: ['CampusLife', 'MorningVibes'],
    score: 923, commentCount: 41,
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(), userVote: null,
  },
]

const TRENDING_TAGS = ['#DBMS', '#MessFood', '#WiFi', '#CampusVibes', '#HostelLife', '#Exams']

export default function SearchPage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    return ALL_POSTS.filter((p) =>
      p.text.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.anonymousName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  }, [query])

  const handleSearch = (e) => {
    e?.preventDefault()
    if (query.trim()) setSearched(true)
  }

  const handleTagClick = (tag) => {
    setQuery(tag.replace('#', ''))
    setSearched(true)
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh', background: '#fff7ed',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid #eae1d5', borderTopColor: '#ec4899',
          borderRadius: '50%', animation: 'spin 0.6s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#fff7ed',
      fontFamily: "'Inter', sans-serif", color: '#322e28',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .mat-fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        ::selection { background: #ff6daf; color: #4b002a; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(253,245,235,0.85)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem',
      }}>
        <Link href="/feed" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900, fontSize: '1.5rem',
            background: 'linear-gradient(135deg, #ec4899, #fb923c)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>TeaTalks</span>
        </Link>
        <button onClick={logout} style={{
          padding: '0.5rem 1rem', background: 'none',
          border: '1px solid #eae1d5', cursor: 'pointer',
          borderRadius: 9999, display: 'flex', alignItems: 'center',
          gap: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600, fontSize: '0.8125rem', color: '#322e28',
        }}>
          <span>{user?.anonymousEmoji}</span>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#b3aca3' }}>logout</span>
        </button>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: '42rem', margin: '0 auto', padding: '2rem 1rem', paddingBottom: '7rem' }}>

        {/* Search heading */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight: 800, letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #ec4899, #fb923c)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
          }}>
            Search TeaTalks
          </h1>
          <p style={{ color: '#7b766e', fontSize: '0.9375rem' }}>
            Find posts, topics, and conversations
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{
          position: 'relative', marginBottom: '2rem',
        }}>
          <span className="material-symbols-outlined" style={{
            position: 'absolute', left: '1.25rem', top: '50%',
            transform: 'translateY(-50%)', color: '#b3aca3', fontSize: 22,
          }}>search</span>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (searched) setSearched(true)
            }}
            placeholder="Search posts, tags, topics..."
            autoFocus
            style={{
              width: '100%', padding: '1.125rem 1.25rem 1.125rem 3.5rem',
              background: '#ffffff', border: '2px solid transparent',
              borderRadius: '1.25rem',
              fontFamily: "'Inter', sans-serif", fontSize: '1rem',
              color: '#322e28', outline: 'none',
              boxShadow: '0 8px 30px rgba(50,46,40,0.06)',
              transition: 'all 0.3s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(236,72,153,0.3)')}
            onBlur={(e) => (e.target.style.borderColor = 'transparent')}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSearched(false) }}
              style={{
                position: 'absolute', right: '1rem', top: '50%',
                transform: 'translateY(-50%)', background: '#f8f0e5',
                border: 'none', borderRadius: '50%',
                width: 28, height: 28, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#7b766e',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
            </button>
          )}
        </form>

        {/* Before search — trending tags */}
        {!searched && !query.trim() && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <p style={{
              fontSize: '0.6875rem', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.15em',
              color: '#b3aca3', marginBottom: '1rem',
            }}>
              🔥 Trending on Campus
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {TRENDING_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: '#ffffff',
                    border: '1px solid #eae1d5',
                    borderRadius: '1rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700, fontSize: '0.875rem',
                    color: '#904800', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ffc69f'
                    e.currentTarget.style.borderColor = '#ffc69f'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff'
                    e.currentTarget.style.borderColor = '#eae1d5'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search results */}
        {(searched || query.trim()) && (
          <div>
            <p style={{
              fontSize: '0.75rem', fontWeight: 700,
              color: '#7b766e', marginBottom: '1.5rem',
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </p>

            {results.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {results.map((post) => (
                  <PostCard key={post._id} {...post} />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '4rem 2rem',
                background: '#ffffff', borderRadius: '2rem',
                boxShadow: '0 4px 20px rgba(50,46,40,0.04)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#eae1d5' }}>
                  search_off
                </span>
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: '1.125rem',
                  color: '#322e28', margin: '1rem 0 0.5rem',
                }}>
                  No posts found
                </h3>
                <p style={{ color: '#7b766e', fontSize: '0.875rem' }}>
                  Try different keywords or browse the feed
                </p>
                <Link href="/feed" style={{
                  display: 'inline-block', marginTop: '1.5rem',
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #ec4899, #fb923c)',
                  color: '#ffffff', borderRadius: 9999,
                  textDecoration: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.875rem',
                }}>
                  Back to Feed
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Mobile nav ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0.75rem 1.5rem 1.5rem',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.05)',
      }}>
        {[
          { icon: 'home', label: 'Home', href: '/feed' },
          { icon: 'search', label: 'Search', href: '/search', active: true },
          { icon: 'add_circle', label: 'Post', href: '/create' },
          { icon: 'person', label: 'Profile', href: '/profile' },
        ].map((item) => (
          <Link key={item.label} href={item.href} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', textDecoration: 'none',
            color: item.active ? '#ec4899' : '#9ca3af',
            transition: 'color 0.2s',
          }}>
            <span className={`material-symbols-outlined ${item.active ? 'mat-fill' : ''}`} style={{ fontSize: 24 }}>
              {item.icon}
            </span>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, marginTop: '0.125rem' }}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}