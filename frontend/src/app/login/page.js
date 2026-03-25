'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')

  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  // If already logged in, bounce to feed
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/feed')
    }
  }, [authLoading, isAuthenticated, router])

  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const c = { ...prev }
        delete c[field]
        return c
      })
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      errs.email = 'Valid email address required'
    if (!password) errs.password = 'Password is required'
    if (Object.keys(errs).length) return setFieldErrors(errs)

    setLoading(true)
    setError('')
    try {
      await login(trimmed, password)
      // AuthContext handles redirect to /feed
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      )
      setLoading(false)
    }
  }

  // Don't render page while checking existing auth
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

        .se-field-err {
          font-size: 0.75rem;
          color: #b41340;
          margin-top: 0.375rem;
          margin-left: 0.25rem;
        }

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

        @keyframes seShake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
        @keyframes seSpin { to { transform: rotate(360deg); } }
        @keyframes sePulse {
          0%,100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }

        .se-hide-scroll::-webkit-scrollbar { display: none; }
        .se-hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        .se-checkbox {
          width: 1.25rem; height: 1.25rem;
          border-radius: 0.25rem;
          accent-color: #b00d6a;
          cursor: pointer;
        }

        @media (min-width: 768px) {
          .se-nav { padding: 1rem 2rem; }
          .se-desktop-nav { display: flex !important; align-items: center; gap: 2rem; }
          .se-main-split { flex-direction: row !important; min-height: 800px; }
          .se-form-section { width: 50% !important; padding: 4rem !important; }
          .se-illust-section { display: flex !important; }
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

          {/* ─── ILLUSTRATION PANEL (Left on desktop) ─── */}
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
              {/* Fox Image */}
              <div style={{ position: 'relative', width: 288, height: 288, marginBottom: '3rem' }}>
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: '#ff6daf', filter: 'blur(48px)',
                  opacity: 0.2,
                  animation: 'sePulse 4s ease-in-out infinite',
                }} />
                <img
                  alt="Fox Identity"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJzjvmHSkV13KFqL10MLabkGX3oOZGbbFBES3tNXmbOArRvb3w4tfggsfrGyCnM2gD3Lfl8NwbAqnUWYb9yAzvJAp3U4bjPLP8d_3CGTScNyi2B_op4T_lVhOJqm3u1MhUSn3ZFq4kvUkVVKjKMOgC6g4u9Zs9TpV-reAI2npuTQHMGRtRN4HZMmvpk7PDfUyRpq1dbpcZ9RzLpgSLJ-ztMH25lNQQOi-P0LGlcKVKjen7DRhIUkB75UhErkL4-mfbBh8Ra834YiDM"
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'contain', position: 'relative', zIndex: 10,
                    borderRadius: '50%',
                  }}
                />
              </div>

              {/* Text */}
              <div style={{ textAlign: 'center', maxWidth: 360 }}>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '1.5rem', fontWeight: 700,
                  color: '#322e28', marginBottom: '1rem',
                }}>
                  Good Evening
                </h2>
                <p style={{ color: '#5f5b53', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  Your tea is still warm. Jump back into the conversations you&apos;ve missed at the Golden Hour Gallery.
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

          {/* ─── FORM PANEL (Right on desktop) ─── */}
          <section
            className="se-form-section se-hide-scroll"
            style={{
              width: '100%', display: 'flex', flexDirection: 'column',
              justifyContent: 'center', padding: '2rem 1.5rem',
              overflowY: 'auto', order: 2,
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{ width: '100%' }}
            >
              {/* Heading */}
              <div style={{ marginBottom: '3rem' }}>
                <h1 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 800, color: '#322e28',
                  letterSpacing: '-0.02em', lineHeight: 1.15,
                  marginBottom: '0.5rem',
                }}>
                  Welcome Back
                </h1>
                <p style={{ color: '#5f5b53', fontSize: '1rem', lineHeight: 1.6 }}>
                  Enter your credentials to rejoin the conversation.
                </p>
              </div>

<form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* General Error */}
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



                {/* Email */}
                <div>
                  <label className="se-label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
                    placeholder="name@college.edu"
                    autoComplete="email"
                    className={`se-input ${fieldErrors.email ? 'has-error' : ''}`}
                  />
                  {fieldErrors.email && <div className="se-field-err">{fieldErrors.email}</div>}
                </div>

                {/* Password */}
                <div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '0.5rem', marginLeft: '0.25rem',
                  }}>
                    <label className="se-label" style={{ marginBottom: 0 }}>Password</label>
                    <Link href="/forgot-password" style={{
                      fontSize: '0.75rem', fontWeight: 700,
                      color: '#b00d6a', textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                      onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={`se-input ${fieldErrors.password ? 'has-error' : ''}`}
                      style={{ paddingRight: '3rem' }}
                    />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowPw(!showPw)}
                      style={{
                        position: 'absolute', right: '1rem', top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', color: '#7b766e',
                        padding: 0, display: 'flex',
                      }}
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.password && <div className="se-field-err">{fieldErrors.password}</div>}
                </div>

                {/* Remember Me */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.25rem 0',
                }}>
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="se-checkbox"
                  />
                  <label htmlFor="remember" style={{
                    fontSize: '0.875rem', color: '#5f5b53',
                    fontWeight: 500, cursor: 'pointer',
                  }}>
                    Keep me logged in on this device
                  </label>
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
                      Authenticating…
                    </span>
                  ) : 'Authenticate'}
                </button>
              </form>

              {/* Toggle */}
              <p style={{
                textAlign: 'center', marginTop: '3rem',
                fontSize: '0.875rem', color: '#5f5b53',
              }}>
                New to TeaTalks?{' '}
                <Link href="/signup" style={{
                  color: '#b00d6a', fontWeight: 700,
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                >
                  Create an identity
                </Link>
              </p>
            </motion.div>
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
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
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