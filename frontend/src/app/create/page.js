'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
/* ─────────────────── DATA ─────────────────── */

const CATEGORIES = [
  { key: 'academic', label: 'Academic', icon: 'school' },
  { key: 'professor-review', label: 'Professor Review', icon: 'rate_review' },
  { key: 'hostel-life', label: 'Hostel Life', icon: 'apartment' },
  { key: 'rants', label: 'Rants & Opinions', icon: 'forum' },
  { key: 'questions', label: 'Questions', icon: 'quiz' },
  { key: 'lost-found', label: 'Lost & Found', icon: 'search_check' },
  { key: 'polls', label: 'Polls', icon: 'poll' },
  { key: 'memes', label: 'Memes & Fun', icon: 'celebration' },
  { key: 'general', label: 'General', icon: 'grid_view' },
  { key: 'campus-news', label: 'Campus News', icon: 'newspaper' },
]

const DURATIONS = ['6h', '12h', '24h', '48h']

const MAX_CHARS = 1000

const MOBILE_NAV = [
  { icon: 'home', label: 'Home', href: '/feed', active: false },
  { icon: 'explore', label: 'Explore', href: '#', active: false },
  { icon: 'add_circle', label: 'Create', href: '/create', active: true },
  { icon: 'poll', label: 'Polls', href: '#', active: false },
  { icon: 'person', label: 'Profile', href: '#', active: false },
]

/* ─────────────────── COMPONENT ─────────────────── */

export default function CreatePostPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const [activeCategory, setActiveCategory] = useState('academic')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState(['DBMS', 'Hostel3'])
  const [tagInput, setTagInput] = useState('')
  const [images, setImages] = useState([
    {
      id: 'demo',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBJ9UN81ncgvcr_EpGcQL7F7rAX7xcb1X2hT6gizOfXrD1OlEi_eSh-9tKdfvupsM4Jw3xgXDOPO6q_lGXLGgJIKZJ1PrbDYU-1Rd9DP7enUxjrT3UaWhUOzxSuNxufes0TR4Dgw3_CS7yLmaD_lW9WkiOC_Jqr8fLfjPgU5urShshftLT-ht1quXCiuqZrtCJK3N-6WYWfJwlJkwd2ttXCOw-5Ra9OGlOJ2u51e-_FglSIle2O-D1XQdIC6rIHJbLdSWWkwqMnlum',
    },
  ])
  const [pollEnabled, setPollEnabled] = useState(true)
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [pollDuration, setPollDuration] = useState('24h')
  const [textareaFocused, setTextareaFocused] = useState(false)
  const fileInputRef = useRef(null)

  /* ── Handlers ── */

  const handleTagKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && tagInput.trim()) {
        e.preventDefault()
        const cleaned = tagInput.trim().replace(/^#/, '')
        if (cleaned && !tags.includes(cleaned)) {
          setTags((prev) => [...prev, cleaned])
        }
        setTagInput('')
      }
    },
    [tagInput, tags],
  )

  const removeTag = useCallback((tag) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const removeImage = useCallback((id) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImages((prev) => [...prev, { id: Date.now().toString(), url }])
    e.target.value = ''
  }, [])

  const addPollOption = useCallback(() => {
    setPollOptions((prev) => [...prev, ''])
  }, [])

  const updatePollOption = useCallback((idx, value) => {
    setPollOptions((prev) => {
      const copy = [...prev]
      copy[idx] = value
      return copy
    })
  }, [])
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = useCallback(async () => {
    // ── Validation ──
    if (!body.trim() || body.trim().length < 10) {
      setSubmitError('Write at least 10 characters')
      return
    }
    if (pollEnabled) {
      const filledOptions = pollOptions.filter((o) => o.trim())
      if (filledOptions.length < 2) {
        setSubmitError('Polls need at least 2 filled options')
        return
      }
    }

    setSubmitError('')
    setSubmitLoading(true)

    /*
    ┌─────────────────────────────────────────────────┐
    │  REAL API — uncomment when backend is ready     │
    │                                                 │
    │  import api from '@/lib/axios'                  │
    │                                                 │
    │  const res = await api.post('/posts', {         │
    │    category: activeCategory,                    │
    │    text: body,                                  │
    │    tags,                                        │
    │    isPoll: pollEnabled,                         │
    │    pollOptions: pollEnabled                     │
    │      ? pollOptions.filter(o => o.trim())        │
    │          .map(text => ({ text, votes: [] }))    │
    │      : undefined,                               │
    │    pollEndTime: pollEnabled                     │
    │      ? new Date(Date.now() +                   │
    │          parseInt(pollDuration) * 3600000)      │
    │      : undefined,                               │
    │  })                                             │
    │  router.push('/feed')                           │
    └─────────────────────────────────────────────────┘
    */

    // ── FAKE — simulate post creation ──
    await new Promise((r) => setTimeout(r, 800))
    console.log('Post created:', {
      category: activeCategory,
      body,
      tags,
      images: images.map((i) => i.url),
      poll: pollEnabled
        ? { options: pollOptions, duration: pollDuration }
        : null,
    })
    setSubmitLoading(false)
    router.push('/feed')
  }, [activeCategory, body, tags, images, pollEnabled, pollOptions, pollDuration, router])


  if (authLoading || !isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh', background: '#fff7ed',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid #eae1d5',
          borderTopColor: '#ec4899',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }
  
  return (
    <div className="se-create">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .se-create {
          min-height: 100vh;
          min-height: 100dvh;
          background: #fff7ed;
          font-family: 'Inter', sans-serif;
          color: #322e28;
          -webkit-font-smoothing: antialiased;
          padding-bottom: 8rem;
        }

        ::selection { background: #ff6daf; color: #4b002a; }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .mat-fill {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .sunset-text {
          background: linear-gradient(135deg, #ec4899 0%, #fb923c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4dccf; border-radius: 10px; }

        .se-textarea {
          width: 100%;
          min-height: 220px;
          background: #f8f0e5;
          border: none;
          border-radius: 1rem;
          padding: 1.5rem;
          font-family: 'Manrope', sans-serif;
          font-size: 1.125rem;
          color: #322e28;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          resize: none;
        }
        .se-textarea::placeholder { color: #7b766e; }
        .se-textarea:focus {
          box-shadow: 0 0 0 2px rgba(176, 13, 106, 0.2);
        }

        .se-tag-input {
          width: 100%;
          background: #f8f0e5;
          border: none;
          border-radius: 0.75rem;
          padding: 0.75rem 2.5rem 0.75rem 1rem;
          font-size: 0.875rem;
          color: #322e28;
          outline: none;
          transition: all 0.3s;
        }
        .se-tag-input:focus {
          box-shadow: 0 0 0 2px rgba(176, 13, 106, 0.2);
        }
        .se-tag-input::placeholder { color: #7b766e; }

        .se-poll-input {
          width: 100%;
          background: #ffffff;
          border: none;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #322e28;
          outline: none;
          transition: all 0.3s;
        }
        .se-poll-input:focus {
          box-shadow: 0 0 0 2px rgba(176, 13, 106, 0.2);
        }

        .ping-anim {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }

        .mob-nav-create {
          position: fixed; bottom: 0; left: 0; right: 0;
          z-index: 50;
          display: flex; justify-content: space-around; align-items: flex-end;
          padding: 0.75rem 1.5rem 1.5rem;
          background: rgba(253, 245, 235, 0.8);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-top-left-radius: 1.5rem;
          border-top-right-radius: 1.5rem;
          box-shadow: 0 -20px 40px rgba(50, 46, 40, 0.06);
        }

        @media (min-width: 768px) {
          .md-hide { display: none !important; }
          .md-show { display: flex !important; }
          .md-grid-2 { grid-template-columns: 1fr 1fr !important; }
          .md-row { flex-direction: row !important; }
          .md-w-auto { width: auto !important; }
          .md-px { padding-left: 2rem !important; padding-right: 2rem !important; }
          .md-p-10 { padding: 2.5rem !important; }
          .md-text-left { text-align: left !important; }
          .md-text-5xl { font-size: 3rem !important; }
        }

        @media (max-width: 767px) {
          .md-show { display: none !important; }
        }

        @media (min-width: 640px) {
          .sm-grid-3 { grid-template-columns: repeat(3, 1fr) !important; }
        }

        @media (min-width: 1024px) {
          .lg-grid-5 { grid-template-columns: repeat(5, 1fr) !important; }
        }

        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .mob-nav-create { padding-bottom: calc(1.5rem + env(safe-area-inset-bottom)); }
        }
      `}</style>

      {/* ═══════════ TOP NAV ═══════════ */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        background: 'rgba(253, 245, 235, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 2rem',
          maxWidth: '80rem', margin: '0 auto',
        }}>
          <Link href="/feed" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900, fontSize: '1.5rem',
              background: 'linear-gradient(to right, #b00d6a, #904800)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              TeaTalks
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#322e28', opacity: 0.7, display: 'flex',
              transition: 'opacity 0.2s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#322e28', opacity: 0.7, display: 'flex',
              transition: 'opacity 0.2s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
            >
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main style={{
        paddingTop: '6rem',
        paddingLeft: '1rem', paddingRight: '1rem',
        maxWidth: '56rem', margin: '0 auto',
      }} className="md-px">

        <div className="md-p-10" style={{
          background: '#ffffff',
          borderRadius: '1.5rem',
          boxShadow: '0 20px 40px rgba(50, 46, 40, 0.06)',
          padding: '1.5rem',
        }}>

          {/* ── Header ── */}
          <header className="md-text-left" style={{
            marginBottom: '2.5rem',
            textAlign: 'center',
          }}>
            <h1 className="md-text-5xl" style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '2.25rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              background: 'linear-gradient(to right, #ec4899, #b00d6a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.5rem',
            }}>
              Share a Thought
            </h1>
            <p style={{
              color: '#5f5b53',
              fontWeight: 500,
              opacity: 0.8,
            }}>
              What's the buzz on campus today?
            </p>
          </header>

          {/* ── Category Grid ── */}
          <section style={{ marginBottom: '2.5rem' }}>
            <label style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#b00d6a',
              marginBottom: '1rem',
              display: 'block',
            }}>
              Select Category
            </label>
            <div className="sm-grid-3 lg-grid-5" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
            }}>
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.key
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1rem',
                      borderRadius: '1rem',
                      border: isActive ? '2px solid #b00d6a' : '2px solid transparent',
                      background: isActive ? 'rgba(176, 13, 106, 0.05)' : '#f8f0e5',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = '#e4dccf'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = '#f8f0e5'
                    }}
                  >
                    <span
                      className={`material-symbols-outlined ${isActive ? 'mat-fill' : ''}`}
                      style={{
                        fontSize: '1.875rem',
                        marginBottom: '0.5rem',
                        color: isActive ? '#b00d6a' : '#904800',
                      }}
                    >
                      {cat.icon}
                    </span>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: isActive ? 700 : 600,
                      textTransform: 'uppercase',
                      letterSpacing: '-0.01em',
                      color: isActive ? '#b00d6a' : '#5f5b53',
                    }}>
                      {cat.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ── Content Textarea ── */}
          <section style={{ marginBottom: '2rem', position: 'relative' }}>
            <textarea
              className="se-textarea custom-scrollbar"
              placeholder="Spill the tea..."
              value={body}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) setBody(e.target.value)
              }}
              onFocus={() => setTextareaFocused(true)}
              onBlur={() => setTextareaFocused(false)}
            />
            <div style={{
              position: 'absolute',
              bottom: '1rem', right: '1.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#7b766e',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              {body.length} / {MAX_CHARS}
            </div>
          </section>

          {/* ── Media & Tags ── */}
          <div className="md-grid-2" style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}>
            {/* Tags */}
            <div>
              <label style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#b00d6a',
                marginBottom: '0.75rem',
                display: 'block',
              }}>
                Add Tags
              </label>

              {/* Current Tags */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
                marginBottom: '0.75rem',
              }}>
                {tags.map((tag) => (
                  <span key={tag} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'rgba(176, 13, 106, 0.1)',
                    color: '#b00d6a',
                    padding: '0.375rem 0.75rem',
                    borderRadius: 9999,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid rgba(176, 13, 106, 0.2)',
                  }}>
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#b00d6a', display: 'flex', padding: 0,
                        fontSize: '0.75rem',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>close</span>
                    </button>
                  </span>
                ))}
              </div>

              {/* Tag Input */}
              <div style={{ position: 'relative' }}>
                <input
                  className="se-tag-input"
                  type="text"
                  placeholder="Type and hit enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                <span className="material-symbols-outlined" style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#7b766e',
                  fontSize: '1.25rem',
                  transition: 'color 0.2s',
                  pointerEvents: 'none',
                }}>
                  tag
                </span>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#b00d6a',
                marginBottom: '0.75rem',
                display: 'block',
              }}>
                Attachments
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={onFileChange}
              />

              <div style={{ display: 'flex', gap: '1rem' }}>
                {/* Upload Button */}
                <button
                  onClick={handleImageUpload}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #b3aca3',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8f0e5'
                    e.currentTarget.style.borderColor = '#b00d6a'
                    e.currentTarget.querySelectorAll('.upload-icon').forEach((el) => {
                      el.style.color = '#b00d6a'
                    })
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = '#b3aca3'
                    e.currentTarget.querySelectorAll('.upload-icon').forEach((el) => {
                      el.style.color = '#7b766e'
                    })
                  }}
                >
                  <span
                    className="material-symbols-outlined upload-icon"
                    style={{ fontSize: '1.875rem', color: '#7b766e', marginBottom: '0.25rem', transition: 'color 0.2s' }}
                  >
                    add_a_photo
                  </span>
                  <span
                    className="upload-icon"
                    style={{
                      fontSize: '0.6875rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '-0.01em',
                      color: '#7b766e', transition: 'color 0.2s',
                    }}
                  >
                    Add Image 📷
                  </span>
                </button>

                {/* Image Previews */}
                {images.map((img) => (
                  <div key={img.id} style={{
                    width: '8rem', height: '7rem',
                    borderRadius: '1rem',
                    background: '#eae1d5',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid #e4dccf',
                    flexShrink: 0,
                  }}>
                    <img
                      src={img.url}
                      alt="Upload preview"
                      style={{
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        opacity: 0.6,
                      }}
                    />
                    <button
                      onClick={() => removeImage(img.id)}
                      style={{
                        position: 'absolute',
                        top: '0.25rem', right: '0.25rem',
                        background: 'rgba(16, 14, 9, 0.5)',
                        color: '#ffffff',
                        borderRadius: '50%',
                        border: 'none',
                        padding: '0.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        lineHeight: 1,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '0.75rem' }}>close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Poll Builder ── */}
          <section style={{
            marginBottom: '2.5rem',
            padding: '1.5rem',
            background: '#f8f0e5',
            borderRadius: '1rem',
          }}>
            {/* Poll Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#a02d70' }}>ballot</span>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  color: '#322e28',
                }}>
                  Create a Poll
                </span>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => setPollEnabled((v) => !v)}
                style={{
                  position: 'relative',
                  width: '2.75rem', height: '1.5rem',
                  borderRadius: 9999,
                  border: 'none',
                  cursor: 'pointer',
                  background: pollEnabled ? '#b00d6a' : '#e4dccf',
                  transition: 'background 0.3s',
                  padding: 0,
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: pollEnabled ? 'calc(100% - 1.25rem - 2px)' : '2px',
                  width: '1.25rem', height: '1.25rem',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #d1d5db',
                  transition: 'left 0.3s',
                }} />
              </button>
            </div>

            {/* Poll Content */}
            {pollEnabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pollOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    className="se-poll-input"
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => updatePollOption(idx, e.target.value)}
                  />
                ))}

                <button
                  onClick={addPollOption}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    marginTop: '0.5rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#b00d6a',
                    fontSize: '0.75rem', fontWeight: 700,
                    transition: 'opacity 0.2s',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>add_circle</span>
                  ADD OPTION
                </button>

                {/* Duration */}
                <div style={{
                  paddingTop: '1rem',
                  marginTop: '1rem',
                  borderTop: '1px solid rgba(179, 172, 163, 0.2)',
                }}>
                  <label style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    color: '#7b766e',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '0.5rem',
                    display: 'block',
                  }}>
                    Duration
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {DURATIONS.map((d) => {
                      const isActive = pollDuration === d
                      return (
                        <button
                          key={d}
                          onClick={() => setPollDuration(d)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            ...(isActive
                              ? {
                                  background: '#b00d6a',
                                  color: '#ffffff',
                                  boxShadow: '0 4px 12px rgba(176, 13, 106, 0.2)',
                                }
                              : {
                                  background: '#ffffff',
                                  color: '#5f5b53',
                                }),
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'rgba(176, 13, 106, 0.1)'
                              e.currentTarget.style.color = '#b00d6a'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = '#ffffff'
                              e.currentTarget.style.color = '#5f5b53'
                            }
                          }}
                        >
                          {d}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── Footer ── */}
          <footer className="md-row" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e4dccf',
          }}>
            {/* Anonymous Identity */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: '#f8f0e5',
              padding: '0.5rem 1rem',
              borderRadius: 9999,
            }}>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ color: '#904800', fontSize: '1.5rem' }}>
                  pest_control_rodent
                </span>
                <div className="ping-anim" style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(144, 72, 0, 0.2)',
                  borderRadius: '50%',
                }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: '#7b766e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  lineHeight: 1,
                }}>
                  Posting as
                </span>
                                <span style={{
                  fontWeight: 700,
                  color: '#322e28',
                  fontSize: '0.875rem',
                }}>
                  {user?.anonymousEmoji} {user?.anonymousName}
                </span>
              </div>
            </div>

            {/* Submit Button */}
                       {submitError && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(180, 19, 64, 0.08)',
                borderRadius: '0.75rem',
                color: '#b41340',
                fontSize: '0.875rem',
                textAlign: 'center',
                fontWeight: 600,
                width: '100%',
              }}>
                {submitError}
              </div>
            )}

            <button
              className="md-w-auto"
              onClick={handleSubmit}
              disabled={submitLoading}
              style={{
                width: '100%',
                padding: '1rem 2.5rem',
                background: 'linear-gradient(45deg, #b00d6a, #904800)',
                color: '#ffffff',
                borderRadius: 9999,
                border: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '1.125rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(176, 13, 106, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(176, 13, 106, 0.3)'
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(176, 13, 106, 0.2)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            >
                        {submitLoading ? (
                <>
                  <span style={{
                    width: 20, height: 20,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  Posting…
                </>
              ) : (
                'Post Anonymously 🚀'
              )}
            </button>
          </footer>
        </div>
      </main>

      {/* ═══════════ DESKTOP SIDEBAR ═══════════ */}
      <aside className="md-show" style={{
        display: 'none',
        position: 'fixed',
        left: '2rem',
        top: '50%',
        transform: 'translateY(-50%)',
        flexDirection: 'column',
        gap: '2rem',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#b00d6a',
        }}>
          <Link href="/create" style={{
            width: '3rem', height: '3rem',
            borderRadius: '50%',
            background: '#b00d6a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(176, 13, 106, 0.2)',
            textDecoration: 'none',
          }}>
            <span className="material-symbols-outlined">edit_square</span>
          </Link>
          <div style={{
            height: '5rem',
            width: 1,
            background: 'linear-gradient(to bottom, #b00d6a, transparent)',
          }} />
        </div>
      </aside>

      {/* ═══════════ MOBILE BOTTOM NAV ═══════════ */}
      <nav className="mob-nav-create md-hide">
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: item.active ? '0.75rem' : '0.5rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              WebkitTapHighlightColor: 'transparent',
              ...(item.active
                ? {
                    background: 'linear-gradient(135deg, #b00d6a, #904800)',
                    color: '#ffffff',
                    borderRadius: '50%',
                    boxShadow: '0 8px 24px rgba(176, 13, 106, 0.3)',
                    transform: 'translateY(-0.5rem)',
                  }
                : {
                    color: '#322e28',
                    opacity: 0.6,
                  }),
            }}
          >
            <span
              className={`material-symbols-outlined ${item.active ? 'mat-fill' : ''}`}
              style={{ fontSize: '1.5rem' }}
            >
              {item.icon}
            </span>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.625rem',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}