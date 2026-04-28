'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import PostCard from '@/components/PostCard'
import api from '@/lib/axios'

const DEFAULT_TRENDING_TAGS = ['#DBMS', '#MessFood', '#WiFi', '#CampusVibes', '#HostelLife', '#Exams']

export default function SearchPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [allPosts, setAllPosts] = useState([])
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await api.get('/posts?limit=200')
        setAllPosts(Array.isArray(res.data?.posts) ? res.data.posts : [])
      } catch (error) {
        setAllPosts([])
      }
    }
    if (isAuthenticated) loadPosts()
  }, [isAuthenticated])

  useEffect(() => {
    const q = (searchParams.get('q') || '').trim()
    if (q) {
      setQuery(q)
      setSearched(true)
    }
  }, [searchParams])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    return allPosts.filter((p) =>
      p.text.toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q)) ||
      p.anonymousName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  }, [query, allPosts])

  const trendingTags = useMemo(() => {
    const counts = new Map()
    allPosts.forEach((post) => {
      const tags = Array.isArray(post.tags) ? post.tags : []
      tags.forEach((tag) => {
        const key = String(tag || '').trim()
        if (!key) return
        counts.set(key, (counts.get(key) || 0) + 1)
      })
    })
    const dynamic = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => `#${tag}`)
    return dynamic.length ? dynamic : DEFAULT_TRENDING_TAGS
  }, [allPosts])

  const handleSearch = (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setSearched(true)
    router.replace(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const handleTagClick = (tag) => {
    setQuery(tag.replace('#', ''))
    setSearched(true)
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="app-page" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid #eae1d5', borderTopColor: '#ec4899',
          borderRadius: '50%', animation: 'spin 0.6s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <div className="app-page">
      <main style={{ maxWidth: '42rem', margin: '0 auto', padding: '1.5rem 1rem 6rem' }}>

        {/* Search Heading */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '2rem', textAlign: 'center' }}
        >
          <h1 className="brand-gradient-text" style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight: 800, letterSpacing: '-0.03em',
            marginBottom: '0.5rem',
          }}>Search TeaTalks</h1>
          <p style={{ color: '#7b766e', fontSize: '0.9375rem' }}>
            Find posts, topics, and conversations
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSearch}
          style={{ position: 'relative', marginBottom: '2rem' }}
        >
          <span className="material-symbols-outlined" style={{
            position: 'absolute', left: '1.25rem', top: '50%',
            transform: 'translateY(-50%)', color: '#b3aca3', fontSize: 22,
          }}>search</span>
          <input
            type="text" value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, tags, topics..."
            autoFocus
            style={{
              width: '100%', padding: '1.125rem 3.5rem 1.125rem 3.5rem',
              background: '#fff', border: '2px solid transparent',
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
            <button type="button"
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
        </motion.form>

        {/* Trending Tags (before search) */}
        {!searched && !query.trim() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <p style={{
              fontSize: '0.6875rem', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.15em',
              color: '#b3aca3', marginBottom: '1rem',
            }}>🔥 Trending on Campus</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {trendingTags.map((tag) => (
                <button key={tag} onClick={() => handleTagClick(tag)}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: '#fff', border: '1px solid #eae1d5',
                    borderRadius: '1rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700, fontSize: '0.875rem',
                    color: '#904800', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ffc69f'; e.currentTarget.style.borderColor = '#ffc69f' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#eae1d5' }}
                >{tag}</button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        {(searched || query.trim()) && (
          <div>
            <p style={{
              fontSize: '0.75rem', fontWeight: 700, color: '#7b766e',
              marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </p>

            {results.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {results.map((post, i) => (
                  <motion.div key={post._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.08 }}
                  >
                    <PostCard {...post} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '4rem 2rem',
                background: '#fff', borderRadius: '2rem',
                boxShadow: '0 4px 20px rgba(50,46,40,0.04)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#eae1d5' }}>search_off</span>
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: '1.125rem',
                  color: '#322e28', margin: '1rem 0 0.5rem',
                }}>No posts found</h3>
                <p style={{ color: '#7b766e', fontSize: '0.875rem' }}>Try different keywords or browse the feed</p>
                <Link href="/feed" style={{
                  display: 'inline-block', marginTop: '1.5rem',
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #ec4899, #fb923c)',
                  color: '#fff', borderRadius: 9999, textDecoration: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.875rem',
                }}>Back to Feed</Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}