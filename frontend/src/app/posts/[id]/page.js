'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import CommentCard from '@/components/CommentCard'
import CommentForm from '@/components/CommentForm'
import ReportModal from '@/components/ReportModal'

/* ─────────────── FAKE DATA ─────────────── */

const POSTS_DB = {
  '1': {
    _id: '1',
    anonymousEmoji: '🦊',
    anonymousName: 'Silent Fox',
    category: 'Academic',
    text: "Does anyone have Sharma sir's DBMS notes? Unit 4 specifically. Exam is in 3 days and I'm honestly starting to panic. The library copies are all checked out and my own notes are... let's just say 'incomplete' is an understatement. I've been sitting in the library attic for 6 hours straight. BCNF and 4NF are starting to look like ancient hieroglyphics. If I see one more functional dependency diagram, I might actually lose it. The hostel wifi being down isn't helping either—had to walk all the way here just to download the lecture slides. Is anyone else feeling the heat or is it just my department? 😭",
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBOjBQnBbgGBCpnOuHhWbOqdCMGcjluDvfu5_MwvjK8hVa_39GIksUJ-q0MUtVVE2NIBdXqB-TSGvt2Nkjv5YEt8uaj72FotBCA60s-YI3zUj_QQoUO_8Ql5AwJ8jCGoGViKMEfiTryWVYh5EUCYk_f5r5PD7phYNlxLLty4lc6VL6HvqE7yS8aH8fhOF4Q_7B_RRD1sU9Rgz-8YaKx6ZLBtoSGctnVr37MuCK_YwlMxcVzopz6Wad5hvGseHBzU4dDPt4Y43wepd4c',
    tags: ['DBMS', 'AcademicStress', 'HostelLife'],
    score: 342,
    commentCount: 6,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  '2': {
    _id: '2',
    anonymousEmoji: '🐼',
    anonymousName: 'Sleepy Panda',
    category: 'Hostel',
    text: 'The mess food today was surprisingly... edible? Like, the paneer actually felt like paneer and not rubber. Did we get a new chef or is it just the sunset mood? The dal was actually seasoned for once, and they had proper salad instead of those sad cucumber slices. I think I even saw someone going for seconds, which is basically a five-star review in mess food terms. 🌅',
    imageUrl: null,
    tags: ['MessFood', 'HostelLife'],
    score: 1200,
    commentCount: 89,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  '3': {
    _id: '3',
    anonymousEmoji: '🦄',
    anonymousName: 'Glitter Uni',
    category: 'Reviews',
    text: 'The new coffee shop near the main gate is a total vibe. ☕️ The cold brew is 10/10 and they play actual good indie music. Perfect for those who hate the library quiet. Prices are student-friendly too — iced coffee is just ₹80. Only downside: it gets packed after 4 PM so get there early.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC01eKhfFsmA3tGd7JwM1zt4MilRfc7YOZcfrbNpQ-GmcjeQb-o-yIqZrjMnjQef2gOdTw0wCMDqnScxbrKrSpVcsB5swJlAcM8Y1SsJ_hv2-6lgoqlKy8m2tejHWfwaH5PFrxy_Ti5r5pQ-O_FeqoZI6BeFqAWQnnZ-2dWybRXPMU3bFi_vZPblxY-0d_iSg7w8yMCKYyNER_eWXWRiFbynAfi5C3f1bmgwceWzHu_rAc3-SOJ1JPyjjHGKnDKvZSiINv1wXgnjNxT',
    tags: ['CafeReview', 'CampusVibes'],
    score: 854,
    commentCount: 23,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  '4': {
    _id: '4',
    anonymousEmoji: '🦉',
    anonymousName: 'Night Owl',
    category: 'Rants',
    text: "Why does the WiFi in Hostel Block C work perfectly at 3 AM but completely dies during online classes? It's like the router has a personal vendetta against academics. I've tried everything — switching DNS, using a LAN cable, even standing on one leg near the window. Nothing works during peak hours. Admin said they'll 'look into it' three months ago. 📡💀",
    imageUrl: null,
    tags: ['WiFi', 'HostelProblems'],
    score: 567,
    commentCount: 34,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  '5': {
    _id: '5',
    anonymousEmoji: '🐸',
    anonymousName: 'Chilled Frog',
    category: 'General',
    text: 'Unpopular opinion: The campus at 6 AM is genuinely the most beautiful thing ever. Went for a walk today and saw peacocks near the sports complex. The mist over the football ground, the empty roads, the chai wala just setting up — this place hits different when nobody is around. Try it once before you graduate, seriously. 🌄',
    imageUrl: null,
    tags: ['CampusLife', 'MorningVibes', 'Peaceful'],
    score: 923,
    commentCount: 41,
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
}

const COMMENTS_DB = {
  '1': [
    {
      _id: 'c1',
      anonymousEmoji: '🐼',
      anonymousName: 'Sleepy Panda',
      text: "I have them! Check the Block C Telegram group, I uploaded the scanned PDF there yesterday. Good luck with the exam — Sharma sir's papers are usually a bit tricky but he repeats questions from 2021.",
      score: 15,
      createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
      userVote: null,
      replies: [
        {
          _id: 'r1',
          anonymousEmoji: '🦊',
          anonymousName: 'Silent Fox',
          text: 'You are a lifesaver! Just found it. Thank you so much! 🙏',
          score: 8,
          createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
          userVote: 'up',
          replies: [],
        },
      ],
    },
    {
      _id: 'c2',
      anonymousEmoji: '🦉',
      anonymousName: 'Night Owl',
      text: "Wait, there's a Unit 4? I thought we only had 3 units for this midterm... 💀",
      score: 45,
      createdAt: new Date(Date.now() - 80 * 60000).toISOString(),
      userVote: 'up',
      replies: [],
    },
    {
      _id: 'c3',
      anonymousEmoji: '🐧',
      anonymousName: 'Cool Penguin',
      text: "Honestly, the marking for DBMS is so random. I wrote almost 5 pages for a 5-mark question last time and still got a 3. Just focus on the diagrams, that's what he likes.",
      score: 8,
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      userVote: null,
      replies: [],
    },
  ],
  '2': [
    {
      _id: 'c4',
      anonymousEmoji: '🐸',
      anonymousName: 'Chilled Frog',
      text: "It's the new chef. Heard they replaced the old one last week. Enjoy it while it lasts — give it two weeks and we'll be back to rubber paneer 😂",
      score: 22,
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      userVote: null,
      replies: [],
    },
    {
      _id: 'c5',
      anonymousEmoji: '🦄',
      anonymousName: 'Glitter Uni',
      text: "The dal had ACTUAL spices?? Which hostel is this, I'm transferring.",
      score: 31,
      createdAt: new Date(Date.now() - 2.5 * 3600000).toISOString(),
      userVote: null,
      replies: [],
    },
  ],
}

const CATEGORY_STYLES = {
  Academic: { bg: '#fdf2f8', color: '#ec4899' },
  Hostel: { bg: '#fff7ed', color: '#fb923c' },
  Rants: { bg: '#fef2f2', color: '#b41340' },
  General: { bg: '#f0fdf4', color: '#22c55e' },
  Reviews: { bg: '#fffaf0', color: '#9a3412' },
}

const MOBILE_NAV = [
  { icon: 'home', label: 'Home', href: '/feed', active: false },
  { icon: 'search', label: 'Search', href: '/search', active: false },
  { icon: 'bolt', label: 'Pulse', href: '/feed', active: false },
  { icon: 'person', label: 'Profile', href: '/profile', active: false },
]

/* ─────────────── HELPERS ─────────────── */

function timeAgo(dateStr) {
  if (!dateStr) return 'just now'
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return `${Math.floor(diff / 604800)}w ago`
}

function formatScore(n) {
  if (n >= 10000) return (n / 1000).toFixed(0) + 'k'
  if (n >= 1000)
    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toString()
}

/* ─────────────── COMPONENT ─────────────── */

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()

  const post = POSTS_DB[params.id]
  const initialComments = COMMENTS_DB[params.id] || []

  const [comments, setComments] = useState(initialComments)
  const [commentCount, setCommentCount] = useState(post?.commentCount || 0)
  const [postVote, setPostVote] = useState(null)
  const [postScore, setPostScore] = useState(post?.score || 0)
  const [copied, setCopied] = useState(false)
    const [reportOpen, setReportOpen] = useState(false)

  /* ── Auth protection ── */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  /* ── Vote handler ── */
  const handlePostVote = useCallback((dir) => {
    const prev = postVote
    let newVote, delta = 0

    if (prev === dir) {
      newVote = null
      delta = dir === 'up' ? -1 : 1
    } else {
      newVote = dir
      delta = prev === null
        ? (dir === 'up' ? 1 : -1)
        : (dir === 'up' ? 2 : -2)
    }

    setPostVote(newVote)
    setPostScore((s) => s + delta)
  }, [postVote])

  /* ── New comment ── */
  const handleNewComment = useCallback(
    async (text) => {
      await new Promise((r) => setTimeout(r, 300))
      const newComment = {
        _id: 'c_' + Date.now(),
        anonymousEmoji: user.anonymousEmoji,
        anonymousName: user.anonymousName,
        text,
        score: 0,
        createdAt: new Date().toISOString(),
        userVote: null,
        replies: [],
      }
      setComments((prev) => [newComment, ...prev])
      setCommentCount((c) => c + 1)
    },
    [user],
  )

  /* ── Reply ── */
  const handleReply = useCallback(
    (parentId, text) => {
      const newReply = {
        _id: 'r_' + Date.now(),
        anonymousEmoji: user.anonymousEmoji,
        anonymousName: user.anonymousName,
        text,
        score: 0,
        createdAt: new Date().toISOString(),
        userVote: null,
        replies: [],
      }
      setComments((prev) =>
        prev.map((c) =>
          c._id === parentId
            ? { ...c, replies: [...(c.replies || []), newReply] }
            : c,
        ),
      )
      setCommentCount((c) => c + 1)
    },
    [user],
  )

  /* ── Share ── */
  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = window.location.href
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  /* ── Loading / Auth guard ── */
  if (authLoading || !isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#fff7ed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid #eae1d5',
            borderTopColor: '#ec4899',
            borderRadius: '50%',
            animation: 'pdSpin 0.6s linear infinite',
          }}
        />
        <style>{`@keyframes pdSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  /* ── Post not found ── */
  if (!post) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#fff7ed',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 64, color: '#e4dccf' }}
        >
          search_off
        </span>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#322e28',
          }}
        >
          Post not found
        </h1>
        <p style={{ color: '#7b766e', textAlign: 'center' }}>
          This tea may have gone cold ☕
        </p>
        <Link
          href="/feed"
          style={{
            marginTop: '1rem',
            background: 'linear-gradient(135deg, #ec4899, #fb923c)',
            color: '#ffffff',
            padding: '0.75rem 2rem',
            borderRadius: 9999,
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
          }}
        >
          Back to Feed
        </Link>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        `}</style>
      </div>
    )
  }

  const catStyle = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.General

  /* ─────────────── RENDER ─────────────── */
  return (
    <div className="pd-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pd-root {
          min-height: 100vh;
          min-height: 100dvh;
          background: #fff7ed;
          font-family: 'Inter', sans-serif;
          color: #322e28;
          -webkit-font-smoothing: antialiased;
        }

        ::selection { background: #ff6daf; color: #4b002a; }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .pd-glass-nav {
          background: rgba(253, 245, 235, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .pd-gradient-text {
          background: linear-gradient(135deg, #ec4899, #fb923c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .pd-mob-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          z-index: 50;
          display: flex; justify-content: space-around; align-items: center;
          padding: 0.75rem 1.5rem 1.5rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-top-left-radius: 1.5rem;
          border-top-right-radius: 1.5rem;
          box-shadow: 0 -10px 30px rgba(0,0,0,0.05);
        }

        @keyframes pdSpin { to { transform: rotate(360deg); } }
        @keyframes pdFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pdToast {
          0% { opacity: 0; transform: translate(-50%, 10px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          85% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -10px); }
        }

        .pd-animate-in {
          animation: pdFadeUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        @media (min-width: 1024px) {
          .pd-lg-show { display: flex !important; }
          .pd-lg-hide { display: none !important; }
        }
        @media (max-width: 1023px) {
          .pd-lg-show { display: none !important; }
        }

        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .pd-mob-nav { padding-bottom: calc(1.5rem + env(safe-area-inset-bottom)); }
        }
      `}</style>

      {/* ═══════════ HEADER ═══════════ */}
      <header
        className="pd-glass-nav"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '1rem 1.5rem',
        }}
      >
        <Link href="/feed" style={{ textDecoration: 'none' }}>
          <span
            className="pd-gradient-text"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900,
              fontSize: '1.5rem',
              letterSpacing: '-0.03em',
            }}
          >
            TeaTalks
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              background: 'none',
              border: '1px solid #eae1d5',
              cursor: 'pointer',
              color: '#322e28',
              borderRadius: 9999,
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: '0.8125rem',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = '#f8f0e5')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
          >
            <span style={{ fontSize: '1.125rem' }}>
              {user?.anonymousEmoji}
            </span>
            <span className="pd-lg-show" style={{ display: 'none' }}>
              {user?.anonymousName}
            </span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, color: '#b3aca3' }}
            >
              logout
            </span>
          </button>
        </div>
      </header>

      {/* ═══════════ MAIN ═══════════ */}
      <main
        style={{
          maxWidth: '48rem',
          margin: '0 auto',
          padding: '1.5rem 1rem',
          paddingBottom: '7rem',
        }}
      >
        {/* ── Back Button ── */}
        <button
          onClick={() => router.back()}
          className="pd-animate-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#7b766e',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: '0.8125rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1.5rem',
            padding: '0.5rem 0',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ec4899')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#7b766e')}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 18 }}
          >
            arrow_back
          </span>
          Back to Feed
        </button>

        {/* ═══════════ POST CARD (EXPANDED) ═══════════ */}
        <article
          className="pd-animate-in"
          style={{
            background: '#ffffff',
            borderRadius: '2rem',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(50, 46, 40, 0.06)',
            marginBottom: '2.5rem',
            animationDelay: '0.05s',
          }}
        >
          {/* Post Header */}
          <div
            style={{
              padding: '1.5rem 1.5rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ec4899, #fb923c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0,
                }}
              >
                {post.anonymousEmoji}
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.125rem',
                    color: '#1f2937',
                    lineHeight: 1.2,
                  }}
                >
                  {post.anonymousName}
                </h3>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 500,
                  }}
                >
                  <span>{timeAgo(post.createdAt)}</span>
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      background: '#d1d5db',
                      borderRadius: '50%',
                      display: 'inline-block',
                    }}
                  />
                  <span
                    style={{
                      fontWeight: 700,
                      color: catStyle.color,
                    }}
                  >
                    {post.category}
                  </span>
                </p>
              </div>
            </div>

            {/* Category pill */}
            <div
              style={{
                background: catStyle.bg,
                padding: '0.375rem 0.875rem',
                borderRadius: 9999,
              }}
            >
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: catStyle.color,
                }}
              >
                #{post.category}
              </span>
            </div>
          </div>

          {/* Post Text */}
          <div style={{ padding: '0.5rem 1.5rem' }}>
            <p
              style={{
                fontSize: '1.0625rem',
                lineHeight: 1.75,
                color: '#374151',
                fontWeight: 500,
                whiteSpace: 'pre-wrap',
              }}
            >
              {post.text}
            </p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginTop: '1.25rem',
                }}
              >
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '0.375rem 0.875rem',
                      borderRadius: 9999,
                      background: '#fffaf0',
                      color: '#fb923c',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: '1px solid rgba(251, 146, 60, 0.15)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          {post.imageUrl && (
            <div
              style={{
                padding: '1.25rem 1.5rem 0',
              }}
            >
              <div
                style={{
                  width: '100%',
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  border: '1px solid rgba(234, 225, 213, 0.3)',
                }}
              >
                <img
                  src={post.imageUrl}
                  alt="Post content"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 500,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              marginTop: '1rem',
              background: 'rgba(248, 240, 229, 0.3)',
              borderTop: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Vote pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#fdf5eb',
                borderRadius: 9999,
                padding: 4,
                border: '1px solid rgba(243, 244, 246, 0.5)',
              }}
            >
              <button
                onClick={() => handlePostVote('up')}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background:
                    postVote === 'up'
                      ? 'linear-gradient(135deg, #ec4899, #fb923c)'
                      : 'transparent',
                  color: postVote === 'up' ? '#ffffff' : '#9ca3af',
                  boxShadow:
                    postVote === 'up'
                      ? '0 4px 12px rgba(236,72,153,0.2)'
                      : 'none',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20 }}
                >
                  expand_less
                </span>
              </button>
              <span
                style={{
                  padding: '0 0.875rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: '1rem',
                  color:
                    postVote === 'up'
                      ? '#ec4899'
                      : postVote === 'down'
                        ? '#b41340'
                        : '#322e28',
                  minWidth: '2.5rem',
                  textAlign: 'center',
                  transition: 'color 0.2s',
                }}
              >
                {formatScore(postScore)}
              </span>
              <button
                onClick={() => handlePostVote('down')}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background:
                    postVote === 'down'
                      ? 'rgba(180,19,64,0.1)'
                      : 'transparent',
                  color: postVote === 'down' ? '#b41340' : '#9ca3af',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20 }}
                >
                  expand_more
                </span>
              </button>
            </div>

            {/* Comment + Share */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ec4899',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: '0.9375rem',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 22 }}
                >
                  chat_bubble
                </span>
                {commentCount}
              </div>
              <button
                onClick={handleShare}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  display: 'flex',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fb923c'
                  e.currentTarget.style.background = '#fff7ed'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 22 }}
                >
                  share
                </span>
              </button>
                            <button
                onClick={() => setReportOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  display: 'flex',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#b41340'
                  e.currentTarget.style.background = '#fef2f2'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 22 }}
                >
                  flag
                </span>
              </button>
            </div>
          </div>
        </article>

        {/* ═══════════ DISCUSSION SECTION ═══════════ */}
        <section
          className="pd-animate-in"
          style={{ animationDelay: '0.15s' }}
        >
          {/* Section heading */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <h2
              className="pd-gradient-text"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1.5rem',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              The Discussion
            </h2>
            <div
              style={{
                height: 2,
                flex: 1,
                background:
                                   'linear-gradient(to right, rgba(179,172,163,0.3), transparent)',
              }}
            />
          </div>

          {/* Comment Form */}
          <div style={{ marginBottom: '2rem' }}>
            <CommentForm
              user={user}
              onSubmit={handleNewComment}
              placeholder="Add to the discussion..."
            />
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              gap: '1rem',
            }}>
              {comments.map((comment, i) => (
                <div
                  key={comment._id}
                  className="pd-animate-in"
                  style={{ animationDelay: `${0.2 + i * 0.06}s` }}
                >
                  <CommentCard
                    comment={comment}
                    postAuthorName={post.anonymousName}
                    user={user}
                    onReply={handleReply}
                    depth={0}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              background: '#ffffff',
              borderRadius: '1.5rem',
              boxShadow: '0 2px 12px rgba(50, 46, 40, 0.03)',
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 48, color: '#eae1d5', marginBottom: '0.75rem',
                display: 'block',
              }}>
                chat_bubble_outline
              </span>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: '1rem',
                color: '#7b766e', marginBottom: '0.25rem',
              }}>
                No comments yet
              </p>
              <p style={{ fontSize: '0.875rem', color: '#b3aca3' }}>
                Be the first to share your thoughts ☕
              </p>
            </div>
          )}
        </section>
      </main>
      {/* ═══════════ REPORT MODAL ═══════════ */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={async (data) => {
          console.log('Report submitted:', post._id, data)
        }}
        targetType="post"
      />
      {/* ═══════════ COPIED TOAST ═══════════ */}
      {copied && (
        <div style={{
          position: 'fixed',
          bottom: '6rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#322e28',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          borderRadius: 9999,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: '0.875rem',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          animation: 'pdToast 2s ease both',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#22c55e' }}>
            check_circle
          </span>
          Link copied!
        </div>
      )}

      {/* ═══════════ MOBILE BOTTOM NAV ═══════════ */}
      <nav className="pd-mob-nav pd-lg-hide">
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              WebkitTapHighlightColor: 'transparent',
              color: '#9ca3af',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              {item.icon}
            </span>
            <span style={{
              fontSize: '0.625rem', textTransform: 'uppercase',
              letterSpacing: '0.05em', fontWeight: 700,
              marginTop: '0.125rem',
            }}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}