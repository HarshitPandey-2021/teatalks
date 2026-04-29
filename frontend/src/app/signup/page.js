'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { isValidEmail, isValidOtp, isValidPassword, PASSWORD_MESSAGE } from '@/lib/validation'

const POSTS = [
  {
    id: 1,
    tag: 'Confession',
    tagBg: 'rgba(236,72,153,0.1)',
    tagColor: '#be185d',
    avatar: '🦊',
    handle: 'RedFox_492',
    time: '4m ago',
    text: 'I have been faking attendance for two months and my parents think I have 90% record.',
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
    text: 'A prof fell asleep mid-lecture and the entire class just sat there watching in silence.',
    likes: 512,
    replies: 94,
  },
]

const DEFAULT_COLLEGES = [
  'Lucknow University', 'IIT Kanpur', 'IIM Lucknow',
  'Amity University Lucknow', 'BBD University', 'Integral University',
  'SRMU Barabanki', 'AKTU Lucknow', 'City Montessori College',
  'National PG College',
]

export default function SignupPage() {
  const [form, setForm] = useState({ college: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [otpStep, setOtpStep] = useState('otp')
  const [otpValue, setOtpValue] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpMessage, setOtpMessage] = useState('')
  const [collegeQuery, setCollegeQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [colleges, setColleges] = useState(DEFAULT_COLLEGES)
  const [tickerIndex, setTickerIndex] = useState(0)

  const dropdownRef = useRef(null)
  const { signup, requestSignupOtp, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.push('/feed')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  // Mobile ticker — cycles posts
  useEffect(() => {
    const t = setInterval(() => {
      setTickerIndex((i) => (i + 1) % POSTS.length)
    }, 3000)
    return () => clearInterval(t)
  }, [])

  const update = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => { const c = { ...prev }; delete c[name]; return c })
  }

  const selectCollege = (college) => {
    setForm((prev) => ({ ...prev, college }))
    setCollegeQuery(college)
    setShowDropdown(false)
    setFieldErrors((prev) => { const c = { ...prev }; delete c.college; return c })
  }

  const addAndSelectCollege = () => {
    const trimmed = collegeQuery.trim()
    if (!trimmed) return
    setColleges((prev) => [...prev, trimmed])
    selectCollege(trimmed)
  }

  const filteredColleges = colleges.filter((c) =>
    c.toLowerCase().includes(collegeQuery.toLowerCase())
  )

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.college) errs.college = 'Select your campus'
    if (!isValidEmail(form.email.trim()))
      errs.email = 'Enter a valid email'
    if (!isValidPassword(form.password)) errs.password = PASSWORD_MESSAGE
    if (Object.keys(errs).length) return setFieldErrors(errs)

    setLoading(true)
    setError('')
    try {
      await requestSignupOtp({
        email: form.email.trim(),
        college: form.college,
        password: form.password,
      })
      setOtpValue('')
      setOtpMessage('OTP sent to your email. Enter it below to finish signup.')
      setOtpStep('otp')
      setOtpModalOpen(true)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.')
      setLoading(false)
    }
  }

  const handleVerifySignupOtp = async () => {
    if (!isValidOtp(otpValue)) {
      setOtpMessage('Enter the 6-digit OTP from your email.')
      return
    }
    setOtpLoading(true)
    setOtpMessage('')
    try {
      await signup({
        email: form.email.trim(),
        college: form.college,
        otp: otpValue.trim(),
      }, { redirect: false })
      setOtpStep('done')
      setOtpMessage('Your account is ready. Click OK to open your dashboard.')
    } catch (err) {
      setOtpMessage(err?.response?.data?.message || 'OTP verification failed.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleSignupSuccessClose = () => {
    setOtpModalOpen(false)
    router.push('/feed')
  }

  if (authLoading || isAuthenticated) return null

  const currentPost = POSTS[tickerIndex]
  const isBlurred = tickerIndex !== 0 // first post readable, rest blurred

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
          --accent-pink: #d4437a;
          --accent-orange: #e07840;
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

        /* NAV */
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

        /* MAIN */
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
  position: relative; /* changed from absolute */
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.625rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
  margin-bottom: 0.75rem; /* spacing between stacked cards */
  box-shadow: 0 2px 6px rgba(0,0,0,0.05); /* subtle shadow for depth */
  width: 100%; /* full width for responsiveness */
  z-index: 0;
}

/* Top section with avatar, handle, tag, time */
.tt-ticker-top {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
  flex-wrap: wrap; /* allow items to wrap on small screens */
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

/* Main text section */
.tt-ticker-text {
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--medium-brown);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word; /* prevent overflow on mobile */
}

/* Optional blur overlay */
.tt-ticker-blur {
  filter: blur(4px);
   opacity: 0.85;
  user-select: none;
}

.tt-ticker-overlay {
  position: absolute;
  inset: 0; /* top/right/bottom/left all 0 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  font-size: 0.6rem; /* slightly bigger for readability */
  color: rgba(190, 24, 93, 0.55); /* keep subtle pink */
  pointer-events: none;
  margin-top:0.7rem;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .tt-ticker-card {
    padding: 0.5rem 0.625rem;
    border-radius: 10px;
  }

  .tt-ticker-top {
    gap: 0.25rem;
  }

  .tt-ticker-text {
    -webkit-line-clamp: 3; /* allow slightly more text on small screens */
  }
}
        /* HEADLINE */
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

        /* FORM */
        .tt-form {
          display: flex;
          flex-direction: column;
          gap: 0.6875rem;
        }
        .tt-field {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .tt-label {
          font-size: 0.675rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--medium-brown);
          opacity: 0.6;
        }
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

        /* DROPDOWN */
        .tt-dropdown {
          position: absolute;
          top: 100%; left: 0; right: 0;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 10px;
          margin-top: 4px;
          max-height: 160px;
          overflow-y: auto;
          z-index: 20;
          box-shadow: 0 8px 24px rgba(60, 40, 20, 0.1);
          -webkit-overflow-scrolling: touch;
        }
        .tt-dropdown::-webkit-scrollbar { display: none; }
        .tt-dropdown { scrollbar-width: none; }
        .tt-dd-item {
          padding: 9px 12px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: background 0.12s;
          -webkit-tap-highlight-color: transparent;
        }
        .tt-dd-item:hover, .tt-dd-item:active { background: var(--cream-2); }
        .tt-dd-add {
          padding: 9px 12px;
          cursor: pointer;
          border-top: 1px solid var(--border);
          font-weight: 600;
          font-size: 0.85rem;
          color: #be185d;
          -webkit-tap-highlight-color: transparent;
        }
        .tt-dd-add:hover { background: rgba(212, 67, 122, 0.04); }

        /* PASSWORD */
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

        /* CTA */
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
          margin-top: 0.125rem;
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

        /* BOTTOM */
        .tt-bottom {
          margin-top: 0.875rem;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .tt-anon-note {
          display: flex;
          align-items: flex-start;
          gap: 0.35rem;
          font-size: 0.725rem;
          color: var(--soft-brown);
          line-height: 1.35;
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

        /* RIGHT PANEL */
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
          margin-bottom: 0.25rem;
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
        .tt-post:first-child .tt-post-body { filter: none; }
        .tt-post:first-child::after { display: none; }
        .tt-post:not(:first-child) .tt-post-body {
          filter: blur(3.5px);
          user-select: none;
          pointer-events: none;
        }
        .tt-post:not(:first-child)::after {
          content: 'Join to read';
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.675rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(190,24,93,0.7);
        }
        .tt-post:not(:first-child):hover {
          transform: translateY(-3px) scale(1.008);
        }

        .tt-post-tag {
          display: inline-flex;
          font-size: 0.575rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: 999px;
          margin-bottom: 0.5rem;
        }
        .tt-post-meta {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.375rem;
        }
        .tt-post-avatar {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: var(--cream-2);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px;
          border: 1px solid var(--border);
        }
        .tt-post-handle {
          font-size: 0.725rem;
          font-weight: 600;
          color: var(--warm-brown);
        }
        .tt-post-time {
          font-size: 0.65rem;
          color: var(--soft-brown);
          margin-left: auto;
          opacity: 0.55;
        }
        .tt-post-text {
          font-size: 0.8rem;
          line-height: 1.45;
          color: var(--medium-brown);
          margin-bottom: 0.5rem;
        }
        .tt-post-stats {
          display: flex;
          gap: 0.75rem;
          font-size: 0.65rem;
          color: var(--soft-brown);
          opacity: 0.6;
        }
        .tt-post-stat {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .tt-right-hint {
          flex-shrink: 0;
          position: relative; z-index: 1;
          text-align: center;
          padding: 0.625rem 0.75rem;
          background: rgba(255,255,255,0.4);
          border: 1px dashed rgba(190,24,93,0.18);
          border-radius: 10px;
        }
        .tt-right-hint p {
          font-size: 0.75rem;
          color: var(--medium-brown);
          line-height: 1.4;
        }
        .tt-right-hint strong { color: #be185d; }

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
            {/* ── MOBILE TICKER ── */}
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
                    <span
                      className="tt-ticker-tag"
                      style={{ background: currentPost.tagBg, color: currentPost.tagColor }}
                    >
                      {currentPost.tag}
                    </span>
                    <span className="tt-ticker-time">{currentPost.time}</span>
                  </div>
                  <p className={`tt-ticker-text ${isBlurred ? 'tt-ticker-blur' : ''}`}>
                    {currentPost.text}
                  </p>
                  {isBlurred && (
                    <div className="tt-ticker-overlay">Sign up to read</div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── HEADLINE ── */}
            <h1 className="tt-headline">
              Your campus has<br />
              <em>secrets worth reading.</em>
            </h1>
            <p className="tt-subline">
              Anonymous confessions, opinions &amp; campus tea - real, raw, and nobody knows it&apos;s you.
            </p>

            {/* ── FORM ── */}
            <form onSubmit={submit} className="tt-form" noValidate>
              {error && (
                <motion.div
                  className="tt-error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <div className="tt-field">
                <label className="tt-label">Your Campus</label>
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <input
                    type="text"
                    placeholder="Search your college..."
                    value={collegeQuery}
                    onChange={(e) => {
                      setCollegeQuery(e.target.value)
                      setShowDropdown(true)
                      if (form.college) setForm((p) => ({ ...p, college: '' }))
                    }}
                    onFocus={() => setShowDropdown(true)}
                    autoComplete="off"
                    className={`tt-input ${fieldErrors.college ? 'err' : ''}`}
                  />
                  {showDropdown && (
                    <div className="tt-dropdown">
                      {filteredColleges.map((c) => (
                        <div key={c} className="tt-dd-item" onClick={() => selectCollege(c)}>
                          {c}
                        </div>
                      ))}
                      {collegeQuery.trim() &&
                        !filteredColleges.some(
                          (c) => c.toLowerCase() === collegeQuery.trim().toLowerCase()
                        ) && (
                          <div className="tt-dd-add" onClick={addAndSelectCollege}>
                            + Add &ldquo;{collegeQuery.trim()}&rdquo;
                          </div>
                        )}
                    </div>
                  )}
                </div>
                {fieldErrors.college && <span className="tt-field-err">{fieldErrors.college}</span>}
              </div>

              <div className="tt-field">
                <label className="tt-label" htmlFor="su-email">Email</label>
                <input
                  id="su-email" type="email" name="email"
                  value={form.email} onChange={update}
                  placeholder="you@anywhere.com"
                  autoComplete="email"
                  className={`tt-input ${fieldErrors.email ? 'err' : ''}`}
                />
                {fieldErrors.email && <span className="tt-field-err">{fieldErrors.email}</span>}
              </div>

              <div className="tt-field">
                <label className="tt-label" htmlFor="su-pw">Password</label>
                <div className="tt-pw-wrap">
                  <input
                    id="su-pw" name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password} onChange={update}
                    placeholder="Uppercase, lowercase, number, special"
                    autoComplete="new-password"
                    className={`tt-input ${fieldErrors.password ? 'err' : ''}`}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button" tabIndex={-1} className="tt-pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide' : 'Show'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {fieldErrors.password && <span className="tt-field-err">{fieldErrors.password}</span>}
                {!fieldErrors.password && (
                  <span className="tt-field-err" style={{ color: '#9c8270' }}>{PASSWORD_MESSAGE}</span>
                )}
              </div>

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
                <Lock size={11} strokeWidth={2.5}
                  style={{ color: '#be185d', opacity: 0.6, flexShrink: 0, marginTop: 1 }}
                />
                <span>Your identity is never shown. You post behind a random anonymous persona.</span>
              </div>
              <p className="tt-login-link">
                Already have an identity? <Link href="/login">Sign in here</Link>
              </p>
            </div>
          </motion.div>
        </div>

        {/* ══ RIGHT — DESKTOP POSTS ══ */}
        <div className="tt-right">
          <div className="tt-right-header">
            <p className="tt-right-title">What&apos;s happening on campus</p>
            <div className="tt-live-row">
              <div className="tt-live-dot" />
              Live · 1,204 students online now
            </div>
          </div>

          <div className="tt-posts">
            {POSTS.map((post, i) => (
              <motion.div
                key={post.id} className="tt-post"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
              >
                <div className="tt-post-tag"
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

          <div className="tt-right-hint">
            <p><strong>47 more posts</strong> from your campus today. Join to read everything.</p>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {otpModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget && otpStep !== 'done') setOtpModalOpen(false) }}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(20,16,12,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              style={{ width: '100%', maxWidth: 460, background: '#fff8f1', borderRadius: 18, border: '1px solid rgba(120, 90, 60, 0.14)', padding: '1rem' }}
            >
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#3d2f1e', marginBottom: '0.35rem' }}>Verify Your Email</h3>
              <p style={{ fontSize: '0.82rem', color: '#7b6553', marginBottom: '0.9rem' }}>We sent a signup OTP to <strong>{form.email.trim()}</strong>.</p>
              {otpMessage && <div className="tt-error" style={{ marginBottom: '0.75rem' }}>{otpMessage}</div>}

              {otpStep === 'otp' ? (
                <div style={{ display: 'grid', gap: '0.65rem' }}>
                  <input
                    type="text"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="Enter OTP"
                    className="tt-input"
                  />
                  <button type="button" className="tt-cta" onClick={handleVerifySignupOtp} disabled={otpLoading}>
                    {otpLoading ? <><span className="tt-spin" /> Verifying…</> : <>Verify & Create Account <ArrowRight size={15} strokeWidth={2.5} /></>}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.65rem' }}>
                  <div style={{ padding: '0.875rem', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.16)', color: '#166534', fontWeight: 700, textAlign: 'center' }}>
                    Signup successful
                  </div>
                  <button type="button" className="tt-cta" onClick={handleSignupSuccessClose}>
                    Okay
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
