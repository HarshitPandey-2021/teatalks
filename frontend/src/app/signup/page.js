'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    college: '',
    year: '',
    branch: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')

  const { signup, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/feed')
    }
  }, [authLoading, isAuthenticated, router])

  const colleges = ["St. Xavier's", 'LSR College', 'IIT Delhi']
  const years = ['1st Year', '2nd Year', '3rd Year', 'Final Year']

  const update = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const c = { ...prev }
        delete c[name]
        return c
      })
    }
  }
  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    else if (form.name.trim().length < 2) errs.name = 'At least 2 characters'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = 'Valid email required'
    if (form.password.length < 6) errs.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match'
    if (Object.keys(errs).length) return setFieldErrors(errs)

    setLoading(true)
    setError('')
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        college: form.college,
        year: form.year,
        branch: form.branch,
        password: form.password,
      })
    } catch (err) {
      setError(
        err.response?.data?.message || 'Signup failed. Please try again.'
      )
      setLoading(false)
    }
  }

  if (authLoading) return null
  if (isAuthenticated) return null

  return (
    <div className="se-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .se-root {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: #fdf5eb;
          font-family: 'Inter', sans-serif;
          color: #322e28;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        ::selection {
          background: #ff6daf;
          color: #4b002a;
        }

        /* ── Nav ── */
        .se-nav {
          position: fixed;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 80rem;
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem 2rem;
          background: rgba(253, 245, 235, 0.8);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          z-index: 50;
        }

        /* ── Inputs ── */
        .se-input {
          width: 100%;
          padding: 1rem 1.5rem;
          background: #f8f0e5;
          border: none;
          border-radius: 0.75rem;
          color: #322e28;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .se-input::placeholder { color: #7b766e; }
        .se-input:focus {
          background: #ffffff;
          box-shadow: 0 0 0 2px rgba(176, 13, 106, 0.2);
        }
        .se-input.has-error {
          box-shadow: 0 0 0 2px rgba(180, 19, 64, 0.3);
          animation: seShake 0.4s ease;
        }

        .se-select {
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          padding: 1rem 1.5rem;
          padding-right: 2.5rem;
          background: #f8f0e5;
          border: none;
          border-radius: 0.75rem;
          color: #322e28;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          outline: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%237b766e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
        }
        .se-select:focus {
          background-color: #ffffff;
          box-shadow: 0 0 0 2px rgba(176, 13, 106, 0.2);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%237b766e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
        }

        /* ── Label ── */
        .se-label {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #5f5b53;
          margin-bottom: 0.5rem;
          margin-left: 0.25rem;
        }

        /* ── Field error ── */
        .se-field-err {
          font-size: 0.75rem;
          color: #b41340;
          margin-top: 0.375rem;
          margin-left: 0.25rem;
        }

        /* ── Primary button ── */
        .se-btn-primary {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(to right, #ec4899, #fb923c);
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px rgba(236, 72, 153, 0.2);
          -webkit-tap-highlight-color: transparent;
        }
        .se-btn-primary:hover:not(:disabled) { transform: scale(1.02); }
        .se-btn-primary:active:not(:disabled) { transform: scale(0.95); }
        .se-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* ── OAuth button ── */
        .se-btn-oauth {
          width: 100%;
          padding: 1rem;
          background: transparent;
          color: #322e28;
          border: none;
          border-radius: 9999px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-tap-highlight-color: transparent;
          box-shadow: inset 0 0 0 1px rgba(179, 172, 163, 0.3);
        }
        .se-btn-oauth:hover { background: #f8f0e5; }

        /* ── Animations ── */
        @keyframes seShake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
        @keyframes seSpin { to { transform: rotate(360deg); } }
        @keyframes sePulse {
          0%,100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }

        /* ── Scrollbar ── */
        .se-hide-scroll::-webkit-scrollbar { display: none; }
        .se-hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        /* ── Responsive ── */
        @media (min-width: 768px) {
          .se-nav { padding: 1rem 2rem; }
          .se-desktop-nav { display: flex !important; align-items: center; gap: 2rem; }
          .se-main-split { flex-direction: row !important; min-height: 800px; }
          .se-form-section { width: 50% !important; padding: 4rem !important; }
          .se-illust-section { display: flex !important; }
          .se-col-grid { grid-template-columns: 1fr 1fr !important; }
          .se-footer-inner { flex-direction: row !important; justify-content: space-between !important; }
        }

        @media (max-width: 767px) {
          .se-form-section { padding: 1.5rem 1.25rem !important; }
          .se-nav { padding: 1rem 1.25rem; }
        }

        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .se-footer { padding-bottom: calc(3rem + env(safe-area-inset-bottom)); }
        }
      `}</style>

      {/* ═══════ NAV ═══════ */}
      <nav className="se-nav">
        <Link href="/" style={{
          textDecoration: 'none',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800, fontSize: '1.5rem',
          letterSpacing: '-0.04em',
          background: 'linear-gradient(to right, #b00d6a, #904800)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          TeaTalks
        </Link>

        <div style={{ display: 'none' }} className="se-desktop-nav">
          {['About', 'Safety', 'Community'].map((item) => (
            <a key={item} href="#" style={{
              color: '#322e28', textDecoration: 'none',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.875rem', fontWeight: 500,
              letterSpacing: '0.02em', opacity: 0.8,
              transition: 'all 0.3s',
            }}
              onMouseEnter={(e) => { e.target.style.opacity = '1'; e.target.style.color = '#b00d6a' }}
              onMouseLeave={(e) => { e.target.style.opacity = '0.8'; e.target.style.color = '#322e28' }}
            >
              {item}
            </a>
          ))}
          <button style={{
            background: 'linear-gradient(to right, #b00d6a, #904800)',
            color: '#ffeff2', padding: '0.5rem 1.5rem',
            borderRadius: '9999px', border: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 600, fontSize: '0.875rem',
            cursor: 'pointer', transition: 'transform 0.15s',
          }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          >
            Support
          </button>
        </div>
      </nav>

      {/* ═══════ MAIN ═══════ */}
      <main style={{
        flexGrow: 1, paddingTop: '5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '6rem 1rem 2rem',
      }}>
        <div className="se-main-split" style={{
          width: '100%', maxWidth: '72rem',
          background: '#ffffff',
          borderRadius: '2.5rem',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(50, 46, 40, 0.06)',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* ─── FORM PANEL (Left on desktop) ─── */}
          <section
            className="se-form-section se-hide-scroll"
            style={{
              width: '100%', display: 'flex', flexDirection: 'column',
              justifyContent: 'center', padding: '2rem 1.5rem',
              overflowY: 'auto', order: 2,
            }}
          >
            <style>{`
              @media (min-width: 768px) {
                .se-form-section { order: 1 !important; }
              }
            `}</style>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{ width: '100%' }}
            >
              {/* Heading */}
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 800, color: '#322e28',
                  letterSpacing: '-0.02em', lineHeight: 1.15,
                  marginBottom: '0.5rem',
                }}>
                  Create Identity
                </h1>
                <p style={{ color: '#5f5b53', fontSize: '1rem', lineHeight: 1.6 }}>
                  Join the sunset circle anonymously.
                </p>
              </div>

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {error && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(180, 19, 64, 0.08)',
                    borderRadius: '0.75rem',
                    color: '#b41340',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    fontWeight: 500,
                  }}>
                    {error}
                  </div>
                )}
                {/* Full Name */}
                <div>
                  <label className="se-label">Full Name</label>
                  <input
                    type="text" name="name"
                    value={form.name} onChange={update}
                    placeholder="Your real name (Will never be shown publicly)"
                    autoComplete="name"
                    className={`se-input ${fieldErrors.name ? 'has-error' : ''}`}
                  />
                  {fieldErrors.name && <div className="se-field-err">{fieldErrors.name}</div>}
                </div>

                {/* College + Year */}
                <div className="se-col-grid" style={{
                  display: 'grid', gridTemplateColumns: '1fr', gap: '1rem',
                }}>
                  <div>
                    <label className="se-label">College</label>
                    <select name="college" value={form.college} onChange={update} className="se-select">
                      <option value="">Select Campus</option>
                      {colleges.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="se-label">Year</label>
                    <select name="year" value={form.year} onChange={update} className="se-select">
                      <option value="">Select Year</option>
                      {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {/* Branch */}
                <div>
                  <label className="se-label">Branch</label>
                  <input
                    type="text" name="branch"
                    value={form.branch} onChange={update}
                    placeholder="e.g. Computer Science"
                    autoComplete="off"
                    className="se-input"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="se-label">Email Address</label>
                  <input
                    type="email" name="email"
                    value={form.email} onChange={update}
                    placeholder="name@college.edu"
                    autoComplete="email"
                    className={`se-input ${fieldErrors.email ? 'has-error' : ''}`}
                  />
                  {fieldErrors.email && <div className="se-field-err">{fieldErrors.email}</div>}
                </div>

                {/* Password + Confirm */}
                <div className="se-col-grid" style={{
                  display: 'grid', gridTemplateColumns: '1fr', gap: '1rem',
                }}>
                  <div>
                    <label className="se-label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password} onChange={update}
                        autoComplete="new-password"
                        className={`se-input ${fieldErrors.password ? 'has-error' : ''}`}
                        style={{ paddingRight: '3rem' }}
                      />
                      <button type="button" tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute', right: '1rem', top: '50%',
                          transform: 'translateY(-50%)', background: 'none',
                          border: 'none', cursor: 'pointer', color: '#7b766e',
                          padding: 0, display: 'flex',
                        }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {fieldErrors.password && <div className="se-field-err">{fieldErrors.password}</div>}
                  </div>
                  <div>
                    <label className="se-label">Confirm</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={form.confirmPassword} onChange={update}
                        autoComplete="new-password"
                        className={`se-input ${fieldErrors.confirmPassword ? 'has-error' : ''}`}
                        style={{ paddingRight: '3rem' }}
                      />
                      <button type="button" tabIndex={-1}
                        onClick={() => setShowConfirm(!showConfirm)}
                        style={{
                          position: 'absolute', right: '1rem', top: '50%',
                          transform: 'translateY(-50%)', background: 'none',
                          border: 'none', cursor: 'pointer', color: '#7b766e',
                          padding: 0, display: 'flex',
                        }}
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && <div className="se-field-err">{fieldErrors.confirmPassword}</div>}
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" className="se-btn-primary" disabled={loading}
                  style={{ marginTop: '0.5rem' }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                      <span style={{
                        width: 20, height: 20,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#ffffff',
                        borderRadius: '50%', display: 'inline-block',
                        animation: 'seSpin 0.6s linear infinite',
                      }} />
                      Creating Identity…
                    </span>
                  ) : 'Create Identity'}
                </button>
              </form>

              {/* Divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                margin: '2rem 0',
              }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(179, 172, 163, 0.2)' }} />
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.75rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                  color: '#5f5b53',
                }}>Or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(179, 172, 163, 0.2)' }} />
              </div>

              {/* Google OAuth */}
              <button type="button" className="se-btn-oauth">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* Toggle */}
              <p style={{
                textAlign: 'center', marginTop: '2rem',
                fontSize: '0.875rem', color: '#5f5b53',
              }}>
                Already have an identity?{' '}
                <Link href="/login" style={{
                  color: '#b00d6a', fontWeight: 700,
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                >
                  Authenticate here
                </Link>
              </p>
            </motion.div>
          </section>

          {/* ─── ILLUSTRATION PANEL (Right on desktop) ─── */}
          <section
            className="se-illust-section"
            style={{
              display: 'none', width: '50%',
              position: 'relative', overflow: 'hidden',
              flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '3rem',
              background: 'linear-gradient(to bottom right, #fdf5eb, #f8f0e5)',
              order: 1,
            }}
          >
            <style>{`
              @media (min-width: 768px) {
                .se-illust-section { order: 2 !important; }
              }
            `}</style>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 10,
              }}
            >
              {/* Panda Image */}
              <div style={{ position: 'relative', width: 288, height: 288, marginBottom: '3rem' }}>
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: '#ffc69f', filter: 'blur(48px)',
                  animation: 'sePulse 4s ease-in-out infinite',
                }} />
                <img
                  alt="Panda Identity"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp41HIKdEZ7WqsNi-ABB_tR2xSN8zm5IEGoZUSbw1CYGUrSTaGo-OTlTZv0PJiQSZ63rORb41EFQEr4nkc5KMWz0kDrd2QiHTgEJ60ortuOY988lx10ER66SH0hnYelQLBbjzoDTZtE09TlXgsvSHMDO01iM9sFtZ6hZpTJjpyJI3Hq4H0tLpAK0LO4jMBH8GuOCuuSIY5ateEPz_wUoeuNhGwqen3yaepYFblfuncS_aTdBVAWc5EsdrdSGgb2TmjjxeVopHyZOsY"
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'contain', position: 'relative', zIndex: 10,
                    borderRadius: '50%',
                    filter: 'grayscale(100%)',
                    transition: 'filter 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={(e) => (e.target.style.filter = 'grayscale(0%)')}
                  onMouseLeave={(e) => (e.target.style.filter = 'grayscale(100%)')}
                />
              </div>

              {/* Text */}
              <div style={{ textAlign: 'center', maxWidth: 360 }}>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '1.5rem', fontWeight: 700,
                  color: '#322e28', marginBottom: '1rem',
                }}>
                  Choose Your Mask
                </h2>
                <p style={{ color: '#5f5b53', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  In our gallery, your thoughts matter more than your face. Express yourself freely behind one of our fun animal personas.
                </p>
              </div>
            </motion.div>

            {/* Decorative Circles */}
            <div style={{
              position: 'absolute', bottom: -80, right: -80,
              width: 256, height: 256, borderRadius: '50%',
              background: 'rgba(144, 72, 0, 0.1)', filter: 'blur(48px)',
            }} />
            <div style={{
              position: 'absolute', top: '25%', left: -40,
              width: 128, height: 128, borderRadius: '50%',
              background: 'rgba(176, 13, 106, 0.1)', filter: 'blur(32px)',
            }} />
          </section>
        </div>
      </main>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="se-footer" style={{
        width: '100%', padding: '3rem 2rem',
        background: '#f8f0e5', marginTop: '3rem',
      }}>
        <div className="se-footer-inner" style={{
          width: '100%', maxWidth: '80rem', margin: '0 auto',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '2rem',
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem', letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(50, 46, 40, 0.6)',
          }}>
            © 2026 TeaTalks. Anonymous. Secure. Verified.
          </p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a key={item} href="#" style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem', letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(50, 46, 40, 0.6)',
                textDecoration: 'none', transition: 'color 0.3s',
              }}
                onMouseEnter={(e) => (e.target.style.color = '#b00d6a')}
                onMouseLeave={(e) => (e.target.style.color = 'rgba(50, 46, 40, 0.6)')}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}