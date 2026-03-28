'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

/* ─────────────────────────────────────────
   FAKE POSTS — exactly 3, blurred previews
───────────────────────────────────────── */
const POSTS = [
  {
    id: 1,
    tag: 'Confession',
    tagBg: 'rgba(236,72,153,0.1)',
    tagColor: '#be185d',
    avatar: '🦊',
    handle: 'RedFox_492',
    time: '4m ago',
    text: 'I have been faking attendance for two months. My parents genuinely think I have a 90% record.',
    likes: 247,
    replies: 38,
  },
  {
    id: 2,
    tag: 'Unpopular Opinion',
    tagBg: 'rgba(251,146,60,0.12)',
    tagColor: '#c2410c',
    avatar: '🐼',
    handle: 'NightPanda_77',
    time: '19m ago',
    text: 'Everyone in the library is performing productivity. Nobody is actually studying.',
    likes: 389,
    replies: 61,
  },
  {
    id: 3,
    tag: 'Campus Drama',
    tagBg: 'rgba(168,85,247,0.1)',
    tagColor: '#7e22ce',
    avatar: '🦋',
    handle: 'BluWing_203',
    time: '42m ago',
    text: 'A prof fell asleep mid-lecture. The entire class just sat there in silence watching.',
    likes: 512,
    replies: 94,
  },
]



export default function SignupPage() {
  const [form, setForm] = useState({ college: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
const [collegeQuery, setCollegeQuery] = useState('')
const [showDropdown, setShowDropdown] = useState(false)
  const { signup, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [colleges, setColleges] = useState([
  "Lucknow University",
  "IIT Kanpur",
  "IIM Lucknow",
  "Amity University Lucknow",
  "BBD University",
  "Integral University",
  "SRMU Barabanki",
  "AKTU Lucknow",
  "City Montessori College",
  "National PG College"
])

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.push('/feed')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
  const close = () => setShowDropdown(false)
  window.addEventListener("click", close)
  return () => window.removeEventListener("click", close)
}, [])

  const update = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => { const c = { ...prev }; delete c[name]; return c })
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.college) errs.college = 'Select your campus'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = 'Enter a valid email'
    if (form.password.length < 6) errs.password = 'Minimum 6 characters'
    if (Object.keys(errs).length) return setFieldErrors(errs)

    setLoading(true)
    setError('')
    try {
      await signup({
        email: form.email.trim(),
        college: form.college,
        password: form.password,
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.')
      setLoading(false)
    }
  }
const filteredColleges = colleges.filter(c =>
  c.toLowerCase().includes(collegeQuery.toLowerCase())
)
  if (authLoading || isAuthenticated) return null

  return (
    <div className="tt-root">
      <style>{`
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream: #fdf6ec;
          --cream-2: #f8eeda;
          --cream-3: #f2e4c8;
          --warm-brown: #3d2f1e;
          --medium-brown: #6b5240;
          --soft-brown: #9c8270;
          --accent-pink: #d4437a;
          --accent-orange: #e07840;
          --border: rgba(120, 90, 60, 0.14);
          --border-hover: rgba(120, 90, 60, 0.28);
        }

        html, body { height: 100%; overflow: hidden; }

        .tt-root {
          height: 100vh;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          background: var(--cream);
          font-family: 'Inter', sans-serif;
          color: var(--warm-brown);
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* ── NAV ── */
        .tt-nav {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          padding: 0 2.5rem;
          height: 54px;
          border-bottom: 1px solid var(--border);
          background: rgba(253, 246, 236, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 10;
        }
        .tt-logo {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.35rem;
          font-style: italic;
          text-decoration: none;
          letter-spacing: -0.01em;
          background: linear-gradient(135deg, #be185d, #c2410c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* ── MAIN SPLIT ── */
        .tt-main {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 0;
        }

        /* ── LEFT PANEL ── */
        .tt-left {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 3rem;
          overflow: hidden;
        }
        .tt-form-inner {
          width: 100%;
          max-width: 370px;
        }

        .tt-headline {
     font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(1.75rem, 2.8vw, 2.625rem);
          font-weight: 400;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--warm-brown);
          margin-bottom: 0.5rem;
        }
        .tt-headline em {
          font-style: italic;
          background: linear-gradient(135deg, #be185d 20%, #e07840 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .tt-subline {
          font-size: 0.9rem;
          color: var(--soft-brown);
          line-height: 1.55;
          margin-bottom: 1.875rem;
        }

        /* ── FORM ── */
        .tt-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .tt-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .tt-label {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--medium-brown);
          opacity: 0.65;
        }
        .tt-input, .tt-select {
          width: 100%;
          padding: 0.78125rem 1rem;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--warm-brown);
          
          font-family: 'Inter', sans-serif;
          font-size: 0.9375rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .tt-input::placeholder { color: var(--soft-brown); opacity: 0.5; }
        .tt-input:focus, .tt-select:focus {
          border-color: rgba(212, 67, 122, 0.4);
          box-shadow: 0 0 0 3px rgba(212, 67, 122, 0.07);
          background: #fffbf8;
        }
        .tt-input.err { border-color: rgba(220,38,38,0.4); animation: ttShake 0.3s ease; }
        .tt-select {
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239c8270' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.875rem center;
          padding-right: 2.25rem;
        }
        .tt-select.err { border-color: rgba(220,38,38,0.4); }
        .tt-field-err {
          font-size: 0.7rem;
          color: #dc2626;
          margin-left: 0.125rem;
        }
        .tt-pw-wrap { position: relative; }
        .tt-pw-toggle {
          position: absolute;
          right: 0.875rem; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer;
          color: var(--soft-brown);
          opacity: 0.55;
          padding: 0;
          display: flex; align-items: center;
          transition: opacity 0.2s;
        }
        .tt-pw-toggle:hover { opacity: 1; }

        /* ── CTA ── */
        .tt-cta {
          width: 100%;
          padding: 0.84375rem 1.25rem;
          background: linear-gradient(135deg, #d4437a 0%, #e07840 100%);
          color: #fff;
          border: none;
          border-radius: 999px;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 0.9375rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 16px rgba(212, 67, 122, 0.2);
          margin-top: 0.125rem;
        }
        .tt-cta:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(212, 67, 122, 0.28); }
        .tt-cta:active:not(:disabled) { transform: scale(0.97); }
        .tt-cta:disabled { opacity: 0.48; cursor: not-allowed; }

        .tt-error {
          padding: 0.6rem 0.875rem;
          background: rgba(220,38,38,0.07);
          border: 1px solid rgba(220,38,38,0.16);
          border-radius: 8px;
          color: #b91c1c;
          font-size: 0.8125rem;
          text-align: center;
        }

        /* ── Bottom microcopy ── */
        .tt-bottom {
          margin-top: 1.125rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .tt-anon-note {
          display: flex;
          align-items: flex-start;
          gap: 0.375rem;
          font-size: 0.76rem;
          color: var(--soft-brown);
          line-height: 1.4;
        }
        .tt-login-link {
          font-size: 0.8rem;
          color: var(--soft-brown);
        }
        .tt-login-link a {
          color: #be185d;
          font-weight: 600;
          text-decoration: none;
        }
        .tt-login-link a:hover { text-decoration: underline; }

        /* ── RIGHT PANEL ── */
        .tt-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 1.75rem 2.25rem;
          background: linear-gradient(155deg, #fdf0e0 0%, #f8e7ce 55%, #fce8d8 100%);
          border-left: 1px solid var(--border);
          position: relative;
          overflow: hidden;
          gap: 0.875rem;
        }
        .tt-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 18% 18%, rgba(212,67,122,0.07) 0%, transparent 50%),
            radial-gradient(circle at 82% 82%, rgba(224,120,64,0.07) 0%, transparent 48%);
          pointer-events: none;
        }

        .tt-right-header {
          position: relative; z-index: 1; flex-shrink: 0;
        }
        .tt-right-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.05rem;
          font-style: italic;
          color: var(--medium-brown);
          margin-bottom: 0.3rem;
        }
        .tt-live-row {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--soft-brown);
          opacity: 0.8;
        }
        .tt-live-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #22c55e;
          animation: ttPulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        /* ── POSTS ── */
        .tt-posts {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: relative; z-index: 1;
          flex: 1;
          justify-content: center;
        }
        .tt-post {
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(180,140,100,0.14);
          border-radius: 14px;
          padding: 0.9375rem 1.0625rem;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 2px 10px rgba(100,70,30,0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .tt-post:hover { transform: translateY(-2px); box-shadow: 0 5px 18px rgba(100,70,30,0.1); }

        /* First post readable */
        .tt-post:first-child .tt-post-body { filter: none; }
        .tt-post:first-child::after { display: none; }

        /* 2nd & 3rd blurred */
        .tt-post:not(:first-child) .tt-post-body {
          filter: blur(5px);
          user-select: none;
          pointer-events: none;
        }
        .tt-post:not(:first-child)::after {
          content: 'Join to read';
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(190,24,93,0.5);
        }

        .tt-post-tag {
          display: inline-flex;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 999px;
          margin-bottom: 0.5625rem;
        }
        .tt-post-meta {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          margin-bottom: 0.4375rem;
        }
        .tt-post-avatar {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: var(--cream-2);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
          border: 1px solid var(--border);
        }
        .tt-post-handle {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--warm-brown);
        }
        .tt-post-time {
          font-size: 0.68rem;
          color: var(--soft-brown);
          margin-left: auto;
          opacity: 0.6;
        }
        .tt-post-text {
          font-size: 0.8125rem;
          line-height: 1.5;
          color: var(--medium-brown);
          margin-bottom: 0.5625rem;
        }
        .tt-post-stats {
          display: flex;
          gap: 0.875rem;
          font-size: 0.68rem;
          color: var(--soft-brown);
          opacity: 0.65;
        }
        .tt-post-stat {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        /* ── Right bottom hint ── */
        .tt-right-hint {
          flex-shrink: 0;
          position: relative; z-index: 1;
          text-align: center;
          padding: 0.6875rem 0.875rem;
          background: rgba(255,255,255,0.45);
          border: 1px dashed rgba(190,24,93,0.2);
          border-radius: 10px;
        }
        .tt-right-hint p {
          font-size: 0.775rem;
          color: var(--medium-brown);
          line-height: 1.45;
        }
        .tt-right-hint strong { color: #be185d; }

        /* ── SPINNER ── */
        .tt-spin {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: ttRotate 0.6s linear infinite;
          flex-shrink: 0;
        }

        /* ── ANIMATIONS ── */
        @keyframes ttShake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes ttPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.6); }
        }
        @keyframes ttRotate { to { transform: rotate(360deg); } }

        /* ═══════════════════════
           MOBILE
        ═══════════════════════ */
        @media (max-width: 767px) {
          html, body { overflow: auto; }
          .tt-root { height: auto; min-height: 100vh; overflow: auto; }
          .tt-nav { padding: 0 1.25rem; }
          .tt-main { grid-template-columns: 1fr; }
          .tt-left { padding: 1.75rem 1.25rem 1.25rem; align-items: flex-start; }
          .tt-form-inner { max-width: 100%; }
          .tt-headline { font-size: 1.75rem; }
          .tt-subline { font-size: 0.875rem; margin-bottom: 1.375rem; }
          .tt-right {
            padding: 1.375rem 1.25rem 2rem;
            border-left: none;
            border-top: 1px solid var(--border);
            gap: 0.75rem;
          }
          .tt-posts { gap: 0.625rem; }
          .tt-post { padding: 0.8125rem 0.9375rem; }
          .tt-right-hint { display: none; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="tt-nav">
        <Link href="/" className="tt-logo">TeaTalks</Link>
      </nav>

      {/* ── MAIN ── */}
      <main className="tt-main">

        {/* ════════════ LEFT — FORM ════════════ */}
        <div className="tt-left">
          <motion.div
            className="tt-form-inner"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="tt-headline">
              Your campus has<br />
              <em>secrets worth reading.</em>
            </h1>
            <p className="tt-subline">
              Anonymous confessions, unpopular opinions &amp; campus drama — real, raw, and nobody knows it's you.
            </p>

            <form onSubmit={submit} className="tt-form" noValidate>
              {error && <div className="tt-error">{error}</div>}

              {/* College */}
              <div className="tt-field">
  <label className="tt-label">Your Campus</label>

  <div style={{ position: "relative" }}>
    <input
      type="text"
      placeholder="Search your college..."
      value={collegeQuery}
      onChange={(e) => {
        setCollegeQuery(e.target.value)
        setShowDropdown(true)
      }}
      onFocus={() => setShowDropdown(true)}
      className={`tt-input ${fieldErrors.college ? 'err' : ''}`}
    />

    {showDropdown && (
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          marginTop: "4px",
          maxHeight: "180px",
          overflowY: "auto",
          zIndex: 20
        }}
      >
        {filteredColleges.map((college) => (
          <div
            key={college}
            onClick={() => {
              setForm(prev => ({ ...prev, college }))
              setCollegeQuery(college)
              setShowDropdown(false)
            }}
            style={{ padding: "10px 12px", cursor: "pointer" }}
          >
            {college}
          </div>
        ))}

        {/* Add new college option */}
        {collegeQuery && !filteredColleges.includes(collegeQuery) && (
          <div
            onClick={() => {
              setColleges(prev => [...prev, collegeQuery])
              setForm(prev => ({ ...prev, college: collegeQuery }))
              setShowDropdown(false)
            }}
            style={{
              padding: "10px 12px",
              cursor: "pointer",
              borderTop: "1px solid var(--border)",
              fontWeight: 600
            }}
          >
            + Add "{collegeQuery}"
          </div>
        )}
      </div>
    )}
  </div>

  {fieldErrors.college && (
    <span className="tt-field-err">{fieldErrors.college}</span>
  )}
</div>


              {/* Email */}
              <div className="tt-field">
                <label className="tt-label" htmlFor="email">Email</label>
                <input
                  id="email" type="email" name="email"
                  value={form.email} onChange={update}
                  placeholder="you@anywhere.com"
                  autoComplete="email"
                  className={`tt-input ${fieldErrors.email ? 'err' : ''}`}
                />
                {fieldErrors.email && <span className="tt-field-err">{fieldErrors.email}</span>}
              </div>

              {/* Password */}
              <div className="tt-field">
                <label className="tt-label" htmlFor="password">Password</label>
                <div className="tt-pw-wrap">
                  <input
                    id="password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password} onChange={update}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className={`tt-input ${fieldErrors.password ? 'err' : ''}`}
                    style={{ paddingRight: '2.625rem' }}
                  />
                  <button
                    type="button" tabIndex={-1}
                    className="tt-pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {fieldErrors.password && <span className="tt-field-err">{fieldErrors.password}</span>}
              </div>

              {/* CTA */}
              <button type="submit" className="tt-cta" disabled={loading}>
                {loading ? (
                  <><span className="tt-spin" /> Creating your identity…</>
                ) : (
                  <>Join anonymously <ArrowRight size={15} strokeWidth={2.5} /></>
                )}
              </button>
            </form>

            <div className="tt-bottom">
              <div className="tt-anon-note">
                <Lock size={11} strokeWidth={2.5} style={{ color: '#be185d', opacity: 0.65, flexShrink: 0, marginTop: 2 }} />
                <span>Your real name is never shown. You post behind a random animal persona.</span>
              </div>
              <p className="tt-login-link">
                Already have an identity?{' '}
                <Link href="/login">Sign in here</Link>
              </p>
            </div>
          </motion.div>
        </div>

        {/* ════════════ RIGHT — PREVIEW ════════════ */}
        <div className="tt-right">
          <div className="tt-right-header">
            <p className="tt-right-title">What's happening on campus</p>
            <div className="tt-live-row">
              <div className="tt-live-dot" />
              Live · 1,204 students online now
            </div>
          </div>

          <div className="tt-posts">
            {POSTS.map((post, i) => (
              <motion.div
                key={post.id}
                className="tt-post"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1, ease: [0.4, 0, 0.2, 1] }}
              >
                <div
                  className="tt-post-tag"
                  style={{ background: post.tagBg, color: post.tagColor, border: `1px solid ${post.tagColor}20` }}
                >
                  {post.tag}
                </div>
                <div className="tt-post-body">
                  <div className="tt-post-meta">
                    <div className="tt-post-avatar">{post.avatar}</div>
                    <span className="tt-post-handle">{post.handle}</span>
                    <span className="tt-post-time">{post.time}</span>
                  </div>
                  <p className="tt-post-text">{post.text}</p>
                  <div className="tt-post-stats">
                    <span className="tt-post-stat">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {post.likes.toLocaleString()}
                    </span>
                    <span className="tt-post-stat">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {post.replies}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="tt-right-hint">
            <p><strong>47 more posts</strong> from your campus today. Sign up to read everything — free, forever.</p>
          </div>
        </div>

      </main>
    </div>
  )
}