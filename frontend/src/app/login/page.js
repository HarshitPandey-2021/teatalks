'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/axios'
import { isValidEmail, isValidOtp, isValidPassword, PASSWORD_MESSAGE } from '@/lib/validation'

const ACTIVITY = [
  {
    id: 1,
    tag: 'Confession',
    tagBg: 'rgba(236,72,153,0.1)',
    tagColor: '#be185d',
    avatar: '🦊',
    handle: 'RedFox_492',
    time: '2m ago',
    text: 'I got the internship but I am too scared to tell anyone in case it falls through.',
    likes: 312,
    replies: 44,
    isNew: true,
  },
  {
    id: 2,
    tag: 'Hot Take',
    tagBg: 'rgba(251,146,60,0.12)',
    tagColor: '#c2410c',
    avatar: '🐺',
    handle: 'GrayWolf_11',
    time: '7m ago',
    text: 'The canteen coffee is genuinely better than the cafe everyone keeps recommending.',
    likes: 198,
    replies: 57,
    isNew: true,
  },
  {
    id: 3,
    tag: 'Campus Drama',
    tagBg: 'rgba(168,85,247,0.1)',
    tagColor: '#7e22ce',
    avatar: '🦋',
    handle: 'BluWing_203',
    time: '23m ago',
    text: "Someone left a full tiffin on the HOD's desk with a note. Nobody knows who.",
    likes: 741,
    replies: 118,
    isNew: false,
  },
]

const STATS = [
  { value: '47', label: 'new posts' },
  { value: '1,204', label: 'online now' },
  { value: '3.2k', label: 'reactions today' },
]

function sanitizeRedirectPath(path) {
  if (!path || typeof path !== 'string') return null
  const trimmed = path.trim()
  if (!trimmed.startsWith('/admin')) return null
  if (trimmed.startsWith('//') || trimmed.includes('://')) return null
  return trimmed
}

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [newCount, setNewCount] = useState(47)
  const [tickerIndex, setTickerIndex] = useState(0)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState('email')
  const [forgotForm, setForgotForm] = useState({ email: '', otp: '', resetToken: '', newPassword: '', confirmPassword: '' })
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMessage, setForgotMessage] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const { login, user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = sanitizeRedirectPath(searchParams.get('redirect'))

  useEffect(() => {
    document.title = "Login | TeaTalks"
  }, [])

  // --- UPDATED: if already logged in, honor redirect for admin ---
  // OLD:
  // useEffect(() => {
  //   if (!authLoading && isAuthenticated) {
  //     router.push(user?.role === 'admin' ? '/admin' : '/feed')
  //   }
  // }, [authLoading, isAuthenticated, user, router])
  //
  // NEW:
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user?.role === 'admin' && redirectPath) {
        router.push(redirectPath)
      } else {
        router.push(user?.role === 'admin' ? '/admin' : '/feed')
      }
    }
  }, [authLoading, isAuthenticated, user, router, redirectPath])

  useEffect(() => {
    const t = setInterval(() => setNewCount((n) => n + 1), 8000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setTickerIndex((i) => (i + 1) % ACTIVITY.length)
    }, 3000)
    return () => clearInterval(t)
  }, [])

  const clearFieldError = (f) => {
    if (fieldErrors[f]) setFieldErrors((p) => { const c = { ...p }; delete c[f]; return c })
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    const trimmed = email.trim()
    if (!isValidEmail(trimmed))
      errs.email = 'Valid email address required'
    if (!password) errs.password = 'Password is required'
    if (Object.keys(errs).length) return setFieldErrors(errs)

    setLoading(true)
    setError('')
    try {
      await login(trimmed, password, { redirect: redirectPath })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  const closeForgotModal = () => {
    setForgotOpen(false)
    setForgotStep('email')
    setForgotLoading(false)
    setForgotMessage('')
    setForgotForm({ email: '', otp: '', resetToken: '', newPassword: '', confirmPassword: '' })
  }

  const handleForgotSendOtp = async () => {
    if (!isValidEmail(forgotForm.email.trim())) {
      setForgotMessage('Enter a valid registered email.')
      return
    }
    setForgotLoading(true)
    setForgotMessage('')
    try {
      await api.post('/users/forgot-password', { email: forgotForm.email.trim() })
      setForgotStep('otp')
      setForgotMessage('OTP sent to your email. It may take a minute to arrive.')
    } catch (err) {
      setForgotMessage(err?.response?.data?.message || 'Could not send OTP')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleForgotVerifyOtp = async () => {
    if (!isValidOtp(forgotForm.otp)) {
      setForgotMessage('Enter the 6-digit OTP sent to your email.')
      return
    }
    setForgotLoading(true)
    setForgotMessage('')
    try {
      const res = await api.post('/users/forgot-password/verify-otp', {
        email: forgotForm.email.trim(),
        otp: forgotForm.otp.trim(),
      })
      setForgotForm((prev) => ({ ...prev, resetToken: res.data?.resetToken || '' }))
      setForgotStep('reset')
      setForgotMessage('OTP verified. Set your new password.')
    } catch (err) {
      setForgotMessage(err?.response?.data?.message || 'Invalid or expired OTP')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleForgotResetPassword = async () => {
    const newPassword = forgotForm.newPassword
    const confirmPassword = forgotForm.confirmPassword
    if (!isValidPassword(newPassword)) {
      setForgotMessage(PASSWORD_MESSAGE)
      return
    }
    if (newPassword !== confirmPassword) {
      setForgotMessage('Passwords do not match.')
      return
    }
    setForgotLoading(true)
    setForgotMessage('')
    try {
      await api.post('/users/forgot-password/reset', {
        email: forgotForm.email.trim(),
        resetToken: forgotForm.resetToken,
        newPassword,
      })
      setForgotStep('done')
      setForgotMessage('Your password has been changed successfully.')
    } catch (err) {
      setForgotMessage(err?.response?.data?.message || 'Could not reset password')
    } finally {
      setForgotLoading(false)
    }
  }

  if (authLoading || isAuthenticated) return null

  const currentPost = ACTIVITY[tickerIndex]
  const isBlurred = tickerIndex !== 0

  return (
    <div className="tt-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600;1,700;1,800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream: #fdf6ec;
          --cream-2: #f8eeda;
          --cream-3: #f2e4c8;
          --warm-brown: #3d2f1e;
          --medium-brown: #6b5240;
          --soft-brown: #9c8270;
          --border: rgba(120, 90, 60, 0.14);
        }

        html, body { height: 100%; overflow: hidden; }

        .tt-root {
          height: 100vh;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          background: var(--cream);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--warm-brown);
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .tt-nav {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          padding: 0 1.25rem;
          height: 50px;
          border-bottom: 1px solid var(--border);
          background: rgba(253, 246, 236, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 10;
        }
        @media (min-width: 768px) {
          .tt-nav { padding: 0 2.5rem; height: 54px; }
        }
        .tt-logo {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.25rem;
          font-style: italic;
          font-weight: 700;
          text-decoration: none;
          background: linear-gradient(135deg, #be185d, #c2410c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tt-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .tt-main {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }

.tt-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.25rem;
  overflow-y: auto;
  flex: 1;
}
@media (min-width: 768px) {
  .tt-left {
    padding: 2.5rem 3rem;
  }
}
  
.tt-form-inner {
  width: 100%;
  max-width: 370px;
}
 /* MOBILE TICKER */
.tt-ticker {
  flex-shrink: 0;
  position: relative;
  width: 100%;
  height: 72px;
  overflow: hidden;
  border-radius: 12px;
}
@media (min-width: 768px) {
  .tt-ticker {
    display: none;
  }
}
       .tt-ticker-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.625rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  width: 100%;
  z-index: 0;
}

.tt-ticker-top {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.tt-ticker-avatar {
  font-size: 0.875rem;
  line-height: 1;
}

.tt-ticker-handle {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--warm-brown);
}

.tt-ticker-tag {
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 999px;
}

.tt-ticker-time {
  font-size: 0.625rem;
  color: var(--soft-brown);
  margin-left: auto;
  opacity: 0.6;
  flex-shrink: 0;
}

.tt-ticker-text {
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--medium-brown);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.tt-ticker-blur {
  filter: blur(4px);
   opacity: 0.85;
  user-select: none;
}

.tt-ticker-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  font-size: 0.6rem;
  color: rgba(190, 24, 93, 0.55);
  pointer-events: none;
  margin-top:0.7rem;
}

@media (max-width: 480px) {
  .tt-ticker-card {
    padding: 0.5rem 0.625rem;
    border-radius: 10px;
  }

  .tt-ticker-top {
    gap: 0.25rem;
  }

  .tt-ticker-text {
    -webkit-line-clamp: 3;
  }
}
        .tt-headline {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.5rem;
          font-weight: 400;
          line-height: 1.18;
          letter-spacing: -0.02em;
          color: var(--warm-brown);
          margin-bottom: 0.375rem;
          margin-top: 2.7rem;
        }
        @media (min-width: 768px) {
          .tt-headline { font-size: clamp(1.625rem, 2.6vw, 2.375rem); }
        }
        .tt-headline em {
          font-style: italic;
          font-weight: 700;
          background: linear-gradient(135deg, #be185d 20%, #e07840 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      .tt-subline {
  font-size: 0.85rem;
  color: var(--soft-brown);
  line-height: 1.5;
  margin-bottom: 1.375rem;
}
@media (min-width: 768px) {
  .tt-subline { font-size: 0.9rem; margin-bottom: 1.625rem; }
}

        .tt-form {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .tt-field {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .tt-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tt-label {
          font-size: 0.675rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--medium-brown);
          opacity: 0.6;
        }
        .tt-forgot {
          font-size: 0.7rem;
          font-weight: 600;
          color: #be185d;
          text-decoration: none;
          opacity: 0.8;
        }
        .tt-forgot:hover { opacity: 1; text-decoration: underline; }

        .tt-input {
          width: 100%;
          padding: 0.75rem 0.875rem;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--warm-brown);
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .tt-input::placeholder { color: var(--soft-brown); opacity: 0.45; }
        .tt-input:focus {
          border-color: rgba(212, 67, 122, 0.35);
          box-shadow: 0 0 0 3px rgba(212, 67, 122, 0.06);
          background: #fffbf8;
        }
        .tt-input.err {
          border-color: rgba(220,38,38,0.4);
          animation: ttShake 0.3s ease;
        }
        .tt-field-err {
          font-size: 0.675rem;
          color: #dc2626;
          margin-left: 2px;
        }

        .tt-pw-wrap { position: relative; }
        .tt-pw-toggle {
          position: absolute;
          right: 0.75rem; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: var(--soft-brown);
          opacity: 0.5; padding: 0;
          display: flex; align-items: center;
          -webkit-tap-highlight-color: transparent;
        }

        .tt-cta {
          width: 100%;
          padding: 0.8125rem 1.25rem;
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
          gap: 0.4rem;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(212, 67, 122, 0.2);
          margin-top: 0.25rem;
          -webkit-tap-highlight-color: transparent;
        }
        .tt-cta:active:not(:disabled) { transform: scale(0.97); }
        .tt-cta:disabled { opacity: 0.45; cursor: not-allowed; }
        @media (min-width: 768px) {
          .tt-cta:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 22px rgba(212, 67, 122, 0.28);
          }
        }

        .tt-error {
          padding: 0.5625rem 0.75rem;
          background: rgba(220,38,38,0.06);
          border: 1px solid rgba(220,38,38,0.14);
          border-radius: 8px;
          color: #b91c1c;
          font-size: 0.8rem;
          text-align: center;
        }

        .tt-bottom {
          margin-top: 1.25rem;
          font-size: 0.8rem;
          color: var(--soft-brown);
          text-align: center;
        }
        .tt-bottom a {
          color: #be185d;
          font-weight: 600;
          text-decoration: none;
        }
        .tt-bottom a:hover { text-decoration: underline; }

        .tt-right {
          display: none;
          flex-direction: column;
          justify-content: center;
          padding: 1.5rem 2rem;
          background: linear-gradient(155deg, #fdf0e0 0%, #f8e7ce 55%, #fce8d8 100%);
          border-left: 1px solid var(--border);
          position: relative;
          overflow: hidden;
          gap: 0.75rem;
        }
        @media (min-width: 768px) {
          .tt-right { display: flex; }
        }
        .tt-right::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            radial-gradient(circle at 18% 18%, rgba(212,67,122,0.06) 0%, transparent 50%),
            radial-gradient(circle at 82% 82%, rgba(224,120,64,0.06) 0%, transparent 48%);
          pointer-events: none;
        }

        .tt-right-header { position: relative; z-index: 1; flex-shrink: 0; }
        .tt-right-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1rem;
          font-style: italic;
          font-weight: 600;
          color: var(--medium-brown);
          margin-bottom: 0.625rem;
        }

        .tt-stats-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .tt-stat-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.4375rem 0.625rem;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(180,140,100,0.12);
          border-radius: 9px;
          backdrop-filter: blur(8px);
          flex: 1;
        }
        .tt-stat-val {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--warm-brown);
          line-height: 1.1;
        }
        .tt-stat-label {
          font-size: 0.6rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--soft-brown);
          margin-top: 1px;
        }

        .tt-live-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.675rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--soft-brown);
          opacity: 0.75;
          margin-top: 0.5rem;
        }
        .tt-live-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #22c55e;
          animation: ttPulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        .tt-posts {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          position: relative; z-index: 1;
          flex: 1;
          justify-content: center;
        }
        .tt-post {
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(180,140,100,0.12);
          border-radius: 13px;
          padding: 0.875rem 1rem;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 8px rgba(100,70,30,0.05);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .tt-post:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 16px rgba(100,70,30,0.1);
        }
        .tt-post:not(:first-child) .tt-post-body {
          filter: blur(5px);
          user-select: none;
          pointer-events: none;
        }
        .tt-post:not(:first-child)::after {
          content: 'Log in to read';
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.675rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(190,24,93,0.4);
        }
        .tt-post:not(:first-child):hover {
          transform: translateY(-3px) scale(1.008);
        }

        .tt-new-badge {
          position: absolute;
          top: 0.7rem; right: 0.8rem;
          font-size: 0.55rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #be185d;
          background: rgba(212,67,122,0.1);
          border: 1px solid rgba(212,67,122,0.18);
          border-radius: 999px;
          padding: 2px 6px;
        }
        .tt-post-tag {
          display: inline-flex;
          font-size: 0.575rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 2px 7px; border-radius: 999px;
          margin-bottom: 0.5rem;
        }
        .tt-post-meta {
          display: flex; align-items: center;
          gap: 0.35rem; margin-bottom: 0.375rem;
        }
        .tt-post-avatar {
          width: 20px; height: 20px; border-radius: 50%;
          background: var(--cream-2);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; border: 1px solid var(--border);
        }
        .tt-post-handle { font-size: 0.725rem; font-weight: 600; color: var(--warm-brown); }
        .tt-post-time { font-size: 0.65rem; color: var(--soft-brown); margin-left: auto; opacity: 0.55; }
        .tt-post-text { font-size: 0.8rem; line-height: 1.45; color: var(--medium-brown); margin-bottom: 0.5rem; }
        .tt-post-stats { display: flex; gap: 0.75rem; font-size: 0.65rem; color: var(--soft-brown); opacity: 0.6; }
        .tt-post-stat { display: flex; align-items: center; gap: 3px; }

        .tt-spin {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: ttRotate 0.6s linear infinite;
          flex-shrink: 0;
        }

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
      `}</style>

      <nav className="tt-nav">
        <Link href="/" className="tt-logo">TeaTalks</Link>
      </nav>

      <main className="tt-main">
        <div className="tt-left">
          <motion.div
            className="tt-form-inner"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="tt-ticker">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tickerIndex}
                  className="tt-ticker-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="tt-ticker-top">
                    <span className="tt-ticker-avatar">{currentPost.avatar}</span>
                    <span className="tt-ticker-handle">{currentPost.handle}</span>
                    <span className="tt-ticker-tag"
                      style={{ background: currentPost.tagBg, color: currentPost.tagColor }}>
                      {currentPost.tag}
                    </span>
                    <span className="tt-ticker-time">{currentPost.time}</span>
                  </div>
                  <p className={`tt-ticker-text ${isBlurred ? 'tt-ticker-blur' : ''}`}>
                    {currentPost.text}
                  </p>
                  {isBlurred && <div className="tt-ticker-overlay">Log in to read</div>}
                </motion.div>
              </AnimatePresence>
            </div>

            <h1 className="tt-headline">
              Welcome back.<br />
              <em>Your campus didn&apos;t<br />stop talking.</em>
            </h1>
            <p className="tt-subline">
              {newCount} new posts since you last logged in.
            </p>

            <form onSubmit={submit} className="tt-form" noValidate>
              {error && (
                <motion.div className="tt-error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}>
                  {error}
                </motion.div>
              )}

              <div className="tt-field">
                <label className="tt-label" htmlFor="li-email">Email</label>
                <input
                  id="li-email" type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
                  placeholder="you@anywhere.com"
                  autoComplete="email"
                  className={`tt-input ${fieldErrors.email ? 'err' : ''}`}
                />
                {fieldErrors.email && <span className="tt-field-err">{fieldErrors.email}</span>}
              </div>

              <div className="tt-field">
                <div className="tt-label-row">
                  <label className="tt-label" htmlFor="li-pw">Password</label>
                  <button type="button" className="tt-forgot" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setForgotOpen(true)}>Forgot?</button>
                </div>
                <div className="tt-pw-wrap">
                  <input
                    id="li-pw"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`tt-input ${fieldErrors.password ? 'err' : ''}`}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" tabIndex={-1} className="tt-pw-toggle"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'Hide' : 'Show'}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {fieldErrors.password && <span className="tt-field-err">{fieldErrors.password}</span>}
              </div>

              <button type="submit" className="tt-cta" disabled={loading}>
                {loading ? (
                  <><span className="tt-spin" /> Jumping back in…</>
                ) : (
                  <>Jump back in <ArrowRight size={15} strokeWidth={2.5} /></>
                )}
              </button>
            </form>

            <p className="tt-bottom">
              New to TeaTalks? <Link href="/signup">Create an identity</Link>
            </p>
          </motion.div>
        </div>

        <div className="tt-right">
          <div className="tt-right-header">
            <p className="tt-right-title">While you were away…</p>
            <div className="tt-stats-row">
              {STATS.map((s) => (
                <div key={s.label} className="tt-stat-pill">
                  <span className="tt-stat-val">{s.value}</span>
                  <span className="tt-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="tt-live-row">
              <div className="tt-live-dot" />
              Live · 1,204 students online now
            </div>
          </div>

          <div className="tt-posts">
            {ACTIVITY.map((post, i) => (
              <motion.div key={post.id} className="tt-post"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}>
                {post.isNew && <span className="tt-new-badge">New</span>}
                <div className="tt-post-tag"
                  style={{ background: post.tagBg, color: post.tagColor, border: `1px solid ${post.tagColor}20` }}>
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
                      {post.likes}
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
        </div>
      </main>

      <AnimatePresence>
        {forgotOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeForgotModal() }}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(20,16,12,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              style={{ width: '100%', maxWidth: 520, borderRadius: 18, background: '#fff8f1', border: '1px solid rgba(180,140,100,0.18)', padding: '1rem' }}
            >
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#3d2f1e', marginBottom: '0.35rem' }}>Reset Password</h3>
              <p style={{ fontSize: '0.82rem', color: '#7b6553', marginBottom: '0.9rem' }}>Secure OTP reset powered by your registered email.</p>
              {forgotMessage && <div className="tt-error" style={{ marginBottom: '0.75rem' }}>{forgotMessage}</div>}

              {forgotStep === 'email' && (
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  <input className="tt-input" type="email" placeholder="Enter registered email" value={forgotForm.email} onChange={(e) => setForgotForm((p) => ({ ...p, email: e.target.value }))} />
                  <button className="tt-cta" type="button" onClick={handleForgotSendOtp} disabled={forgotLoading}>{forgotLoading ? 'Sending OTP...' : 'Send OTP'}</button>
                </div>
              )}

              {forgotStep === 'otp' && (
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  <input className="tt-input" type="text" placeholder="Enter OTP" value={forgotForm.otp} onChange={(e) => setForgotForm((p) => ({ ...p, otp: e.target.value }))} />
                  <button className="tt-cta" type="button" onClick={handleForgotVerifyOtp} disabled={forgotLoading}>{forgotLoading ? 'Verifying...' : 'Verify OTP'}</button>
                </div>
              )}

              {forgotStep === 'reset' && (
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  <div className="tt-pw-wrap">
                    <input className="tt-input" type={showNewPw ? 'text' : 'password'} placeholder="New password" value={forgotForm.newPassword} onChange={(e) => setForgotForm((p) => ({ ...p, newPassword: e.target.value }))} style={{ paddingRight: '2.5rem' }} />
                    <button type="button" className="tt-pw-toggle" onClick={() => setShowNewPw((v) => !v)}>{showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  </div>
                  <div className="tt-pw-wrap">
                    <input className="tt-input" type={showConfirmPw ? 'text' : 'password'} placeholder="Confirm password" value={forgotForm.confirmPassword} onChange={(e) => setForgotForm((p) => ({ ...p, confirmPassword: e.target.value }))} style={{ paddingRight: '2.5rem' }} />
                    <button type="button" className="tt-pw-toggle" onClick={() => setShowConfirmPw((v) => !v)}>{showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  </div>
                  <button className="tt-cta" type="button" onClick={handleForgotResetPassword} disabled={forgotLoading}>{forgotLoading ? 'Updating...' : 'Update Password'}</button>
                </div>
              )}

              {forgotStep === 'done' && (
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  <button className="tt-cta" type="button" onClick={closeForgotModal}>OK, Login Now</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}