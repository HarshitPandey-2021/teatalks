"use client";
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import PostCard from '@/components/PostCard'
import { useAuth } from '@/context/AuthContext'

/* ─────────────────── DATA ─────────────────── */

const CATEGORIES = ['All', 'Academic', 'Hostel', 'Rants', 'General', 'Reviews']

const SORTS = [
  { key: 'hot', label: 'Hot', icon: 'local_fire_department', fill: true },
  { key: 'new', label: 'New', icon: 'schedule', fill: false },
  { key: 'top', label: 'Top', icon: 'trending_up', fill: false },
]

const POSTS = [
  {
    _id: '1',
    anonymousEmoji: '🦊',
    anonymousName: 'Silent Fox',
    category: 'Academic',
    text: "Does anyone have Sharma sir's DBMS notes? Unit 4 specifically. Exam in 3 days 😭",
    imageUrl: null,
    tags: ['DBMS', 'HostelLife', 'AcademicStress'],
    score: 342,
    commentCount: 56,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    userVote: null,
  },
  {
    _id: '2',
    anonymousEmoji: '🐼',
    anonymousName: 'Sleepy Panda',
    category: 'Hostel',
    text: 'The mess food today was surprisingly... edible? Like, the paneer actually felt like paneer and not rubber. Did we get a new chef or is it just the sunset mood? 🌅',
    imageUrl: null,
    tags: ['MessFood', 'HostelLife'],
    score: 1200,
    commentCount: 89,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    userVote: null,
  },
  {
    _id: '3',
    anonymousEmoji: '🦄',
    anonymousName: 'Glitter Uni',
    category: 'Reviews',
    text: 'The new coffee shop near the main gate is a total vibe. ☕️ The cold brew is 10/10 and they play actual good indie music. Perfect for those who hate the library quiet.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC01eKhfFsmA3tGd7JwM1zt4MilRfc7YOZcfrbNpQ-GmcjeQb-o-yIqZrjMnjQef2gOdTw0wCMDqnScxbrKrSpVcsB5swJlAcM8Y1SsJ_hv2-6lgoqlKy8m2tejHWfwaH5PFrxy_Ti5r5pQ-O_FeqoZI6BeFqAWQnnZ-2dWybRXPMU3bFi_vZPblxY-0d_iSg7w8yMCKYyNER_eWXWRiFbynAfi5C3f1bmgwceWzHu_rAc3-SOJ1JPyjjHGKnDKvZSiINv1wXgnjNxT',
    tags: ['CafeReview', 'CampusVibes'],
    score: 854,
    commentCount: 23,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    userVote: null,
  },
  {
    _id: '4',
    anonymousEmoji: '🦉',
    anonymousName: 'Night Owl',
    category: 'Rants',
    text: "Why does the WiFi in Hostel Block C work perfectly at 3 AM but completely dies during online classes? It's like the router has a personal vendetta against academics. 📡💀",
    imageUrl: null,
    tags: ['WiFi', 'HostelProblems'],
    score: 567,
    commentCount: 34,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    userVote: null,
  },
  {
    _id: '5',
    anonymousEmoji: '🐸',
    anonymousName: 'Chilled Frog',
    category: 'General',
    text: 'Unpopular opinion: The campus at 6 AM is genuinely the most beautiful thing ever. Went for a walk today and saw peacocks near the sports complex. This place hits different when nobody is around. 🌄',
    imageUrl: null,
    tags: ['CampusLife', 'MorningVibes', 'Peaceful'],
    score: 923,
    commentCount: 41,
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    userVote: null,
  },
]

const TRENDING = ['#DBMS', '#LibraryAC', '#MessHeist', '#Convocation', '#WiFiWoes']

const NAV_ITEMS = [
  { icon: 'home', label: 'Feed', active: true, fill: true },
  { icon: 'insights', label: 'Pulse', active: false },
  { icon: 'trending_up', label: 'Trending', active: false },
  { icon: 'groups', label: 'Groups', active: false },
]

const MOBILE_NAV = [
  { icon: 'home', label: 'Home', href: '/feed', active: true },
  { icon: 'search', label: 'Search', href: '/search', active: false },
  { icon: 'bolt', label: 'Pulse', href: '/feed', active: false },
  { icon: 'person', label: 'Profile', href: '/profile', active: false },
]

/* ─────────────────── COMPONENT ─────────────────── */

export default function FeedPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSort, setActiveSort] = useState('hot')

  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()
  const router = useRouter()

  // ── Protect this page ──
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

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

  const handleVote = (postId, newVote) => {
    console.log('Vote:', postId, newVote)
  }

  const handleComment = (postId) => {
    console.log('Comment:', postId)
  }

  const handleShare = (postId) => {
    console.log('Share:', postId)
  }

  const filteredPosts = activeCategory === 'All'
    ? POSTS
    : POSTS.filter((p) => p.category === activeCategory)

  return (
    <div className="se-feed">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,800&family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .se-feed {
          min-height: 100vh;
          min-height: 100dvh;
          background: #fff7ed;
          font-family: 'Inter', sans-serif;
          color: #322e28;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
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
        .sunset-grad {
          background: linear-gradient(135deg, #ec4899 0%, #fb923c 100%);
        }

        .glass-nav {
          background: rgba(253, 245, 235, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        .se-search {
          width: 100%;
          background: #f8f0e5;
          border: none;
          border-radius: 9999px;
          padding: 0.625rem 1rem 0.625rem 3rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #322e28;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .se-search::placeholder { color: #b3aca3; }
        .se-search:focus {
          background: #ffffff;
          box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.15);
        }

        .chip {
          padding: 0.625rem 1.5rem;
          border-radius: 1rem;
          font-weight: 600; font-size: 0.875rem;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          font-family: 'Inter', sans-serif;
          -webkit-tap-highlight-color: transparent;
        }
        .chip-active {
          background: #b00d6a;
          color: #ffeff2;
          box-shadow: 0 4px 16px rgba(176, 13, 106, 0.15);
        }
        .chip-inactive { background: #eae1d5; color: #5f5b53; }
        .chip-inactive:hover { background: #e4dccf; }

        .sort-btn {
          display: flex; align-items: center; gap: 0.5rem;
          font-weight: 600; font-size: 0.875rem;
          padding-bottom: 0.5rem;
          background: none; border: none;
          cursor: pointer; transition: all 0.2s;
          font-family: 'Inter', sans-serif;
          -webkit-tap-highlight-color: transparent;
        }
        .sort-active { color: #b00d6a; border-bottom: 2px solid #b00d6a; font-weight: 700; }
        .sort-inactive { color: #7b766e; border-bottom: 2px solid transparent; }
        .sort-inactive:hover { color: #322e28; }

        .side-link {
          display: flex; align-items: center; gap: 1rem;
          padding: 0.875rem 1.25rem;
          border-radius: 1rem;
          font-weight: 600;
          transition: all 0.2s;
          text-decoration: none;
          cursor: pointer; border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          -webkit-tap-highlight-color: transparent;
        }
        .side-link-active {
          background: linear-gradient(135deg, #b00d6a, #904800);
          color: #ffffff;
          box-shadow: 0 8px 24px rgba(176, 13, 106, 0.2);
        }
        .side-link-inactive { background: transparent; color: rgba(50,46,40,0.7); }
        .side-link-inactive:hover { background: #eae1d5; }

        .trend-tag {
          padding: 0.5rem 1rem;
          background: #ffc69f; color: #723800;
          border-radius: 0.75rem;
          font-size: 0.75rem; font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          display: inline-block;
        }
        .trend-tag:hover { transform: scale(1.05); opacity: 0.85; }

        .mob-nav {
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
        .mob-nav-item {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 0.5rem 1rem;
          border-radius: 1rem;
          text-decoration: none;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .mob-nav-active {
          background: linear-gradient(135deg, #ec4899, #fb923c);
          color: #ffffff;
          border-radius: 50%;
          padding: 0.75rem;
          box-shadow: 0 4px 16px rgba(236, 72, 153, 0.3);
        }
        .mob-nav-inactive { color: #9ca3af; }

        .mob-fab {
          position: fixed; bottom: 6rem; right: 1.5rem;
          z-index: 60;
          width: 3.5rem; height: 3.5rem;
          border-radius: 1.25rem;
          background: linear-gradient(135deg, #ec4899, #fb923c);
          color: #ffffff;
          border: 2px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(236, 72, 153, 0.3);
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .mob-fab:active { transform: scale(0.9); }

        @media (min-width: 1024px) {
          .lg-show { display: flex !important; }
          .lg-hide { display: none !important; }
        }
        @media (max-width: 1023px) {
          .lg-show { display: none !important; }
        }
        @media (min-width: 1280px) {
          .xl-show { display: flex !important; }
        }
        @media (max-width: 1279px) {
          .xl-show { display: none !important; }
        }
        .se-feed-content {
          flex: 1;
          min-width: 0;
          width: 100%;
        }
        @media (min-width: 1024px) {
          .se-feed-content {
            max-width: 40rem;
          }
        }
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .mob-nav { padding-bottom: calc(1.5rem + env(safe-area-inset-bottom)); }
        }
      `}</style>

      {/* ═══════════ TOP NAV ═══════════ */}
      <header className="glass-nav" style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', maxWidth: '80rem', margin: '0 auto',
        padding: '1rem 1.5rem',
      }}>
        <style>{`
          @media (min-width: 768px) {
            .se-header { padding: 1rem 2rem !important; }
          }
        `}</style>

        <Link href="/feed" style={{ textDecoration: 'none' }}>
          <span className="sunset-text" style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900, fontSize: '1.5rem',
            letterSpacing: '-0.03em',
          }}>
            TeaTalks
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="lg-show" style={{
          display: 'none', alignItems: 'center', gap: '2rem',
        }}>
          {['Feed', 'Trending', 'Categories'].map((item, i) => (
            <a key={item} href="#" style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '1.125rem',
              letterSpacing: '-0.01em',
              color: i === 0 ? '#ec4899' : '#322e28',
              textDecoration: 'none',
              borderBottom: i === 0 ? '2px solid #ec4899' : '2px solid transparent',
              paddingBottom: '0.25rem',
              transition: 'all 0.3s',
            }}
              onMouseEnter={(e) => { if (i !== 0) e.target.style.color = '#ec4899' }}
              onMouseLeave={(e) => { if (i !== 0) e.target.style.color = '#322e28' }}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Desktop Search */}
        <div className="lg-show" style={{
          display: 'none',
          flex: 1, maxWidth: '24rem', margin: '0 2rem',
          position: 'relative',
        }}>
          <span className="material-symbols-outlined" style={{
            position: 'absolute', left: '1rem', top: '50%',
            transform: 'translateY(-50%)', color: '#b3aca3', fontSize: 20,
          }}>search</span>
          <input type="text" placeholder="Search TeaTalks..." className="se-search" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={{
            padding: '0.5rem', background: 'none', border: 'none',
            cursor: 'pointer', color: '#322e28', borderRadius: '0.5rem',
            transition: 'background 0.2s', display: 'flex',
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f0e5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 1rem', background: 'none', border: '1px solid #eae1d5',
              cursor: 'pointer', color: '#322e28', borderRadius: '9999px',
              transition: 'background 0.2s', display: 'flex',
              alignItems: 'center', gap: '0.5rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600, fontSize: '0.8125rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f0e5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: '1.125rem' }}>{user?.anonymousEmoji}</span>
            <span className="lg-show" style={{ display: 'none' }}>{user?.anonymousName}</span>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#b3aca3' }}>logout</span>
          </button>
        </div>
      </header>

      {/* ═══════════ MAIN LAYOUT ═══════════ */}
      <main style={{
        maxWidth: '80rem', margin: '0 auto',
        display: 'flex', gap: '2rem',
        padding: '2rem 1.5rem',
        paddingBottom: '7rem',
      }}>
        <style>{`
          @media (min-width: 1024px) {
            .se-main-wrap { padding: 2rem 3rem !important; padding-bottom: 2rem !important; }
          }
        `}</style>

        {/* ─── LEFT SIDEBAR ─── */}
        <aside className="lg-show" style={{
          display: 'none', flexDirection: 'column',
          width: 256, flexShrink: 0, gap: '2rem',
          position: 'sticky', top: '6rem',
          height: 'calc(100vh - 8rem)',
        }}>
          <div style={{ padding: '0 1rem' }}>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: '1.5rem',
              color: '#322e28', marginBottom: '0.25rem',
            }}>TeaTalks</h2>
            <p style={{
              fontSize: '0.625rem', fontWeight: 700,
              color: '#b3aca3', textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}>Campus Pulse by TeaTalks</p>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href="#"
                className={`side-link ${item.active ? 'side-link-active' : 'side-link-inactive'}`}
              >
                <span className={`material-symbols-outlined ${item.fill ? 'mat-fill' : ''}`}
                  style={{ fontSize: 22 }}
                >{item.icon}</span>
                <span style={{ fontWeight: item.active ? 700 : 600 }}>{item.label}</span>
              </a>
            ))}
          </nav>

          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={() => router.push('/create')}
              className="sunset-grad" style={{
              width: '100%', padding: '1rem', borderRadius: '1rem',
              border: 'none', color: '#ffffff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              boxShadow: '0 8px 32px rgba(236, 72, 153, 0.2)',
              transition: 'all 0.3s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 12px 40px rgba(236, 72, 153, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(236, 72, 153, 0.2)')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>edit_square</span>
              Spill the Tea
            </button>
          </div>
        </aside>

        {/* ─── MAIN FEED ─── */}
        {/* <section style={{ flex: 1, maxWidth: '38rem', minWidth: 0 }}> */}
                  <section className="se-feed-content">

          {/* Category Tabs */}
          <div className="no-scroll" style={{
            overflowX: 'auto', marginBottom: '2rem',
            WebkitOverflowScrolling: 'touch',
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.5rem' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`chip ${activeCategory === cat ? 'chip-active' : 'chip-inactive'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSort(s.key)}
                  className={`sort-btn ${activeSort === s.key ? 'sort-active' : 'sort-inactive'}`}
                >
                  <span
                    className={`material-symbols-outlined ${activeSort === s.key && s.fill ? 'mat-fill' : ''}`}
                    style={{ fontSize: 18 }}
                  >{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
            <button style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#7b766e', display: 'flex', padding: 0,
              transition: 'color 0.2s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ec4899')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#7b766e')}
            >
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>

          {/* ─── POST CARDS ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.08,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <PostCard
                  {...post}
                  onVote={handleVote}
                  onComment={handleComment}
                  onShare={handleShare}
                />
              </motion.div>
            ))}

            {filteredPosts.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '4rem 2rem',
                color: '#b3aca3',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.4 }}>
                  search_off
                </span>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '1.125rem',
                  marginTop: '1rem', color: '#7b766e',
                }}>
                  No posts in {activeCategory} yet
                </p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Be the first to spill some tea ☕
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ─── RIGHT SIDEBAR ─── */}
        <aside className="xl-show" style={{
          display: 'none', flexDirection: 'column',
          width: 320, flexShrink: 0, gap: '1.5rem',
          position: 'sticky', top: '6rem',
          height: 'fit-content',
        }}>
          <div style={{
            background: '#f8f0e5', borderRadius: '2rem',
            padding: '2rem',
            display: 'flex', flexDirection: 'column', gap: '2rem',
          }}>
            <div>
              <h2 className="sunset-text" style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: '1.5rem',
                marginBottom: '0.25rem',
              }}>Campus Pulse</h2>
              <p style={{
                fontSize: '0.75rem', fontWeight: 700,
                color: '#b3aca3', textTransform: 'uppercase',
                letterSpacing: '0.1em', opacity: 0.6,
              }}>By TeaTalks</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                background: 'rgba(255,255,255,0.8)', padding: '1.25rem',
                borderRadius: '1.5rem', transition: 'box-shadow 0.3s',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '1rem',
                  background: 'rgba(176, 13, 106, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#b00d6a',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>group</span>
                </div>
                <div>
                  <p style={{
                    fontWeight: 800, fontSize: '1rem', color: '#322e28',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>342 students</p>
                  <p style={{ fontSize: '0.75rem', color: '#7b766e', fontWeight: 500 }}>
                    spilling tea now
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                background: 'rgba(255,255,255,0.8)', padding: '1.25rem',
                borderRadius: '1.5rem', transition: 'box-shadow 0.3s',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '1rem',
                  background: '#ffedd5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#9a3412',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>bolt</span>
                </div>
                <div>
                  <p style={{
                    fontWeight: 800, fontSize: '1rem', color: '#322e28',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>Vibe: Energetic ⚡</p>
                  <p style={{ fontSize: '0.75rem', color: '#7b766e', fontWeight: 500 }}>
                    Mid-term season
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(179, 172, 163, 0.1)',
            }}>
              <p style={{
                fontSize: '0.625rem', fontWeight: 900,
                color: '#7b766e', textTransform: 'uppercase',
                letterSpacing: '0.2em', marginBottom: '1rem',
              }}>Trending #Tea</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                {TRENDING.map((tag) => (
                  <a key={tag} href="#" className="trend-tag">{tag}</a>
                ))}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '0 2rem' }}>
            <p style={{
              fontSize: '0.625rem', color: '#b3aca3',
              fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}>TeaTalks v2.4.0 • Student Made</p>
          </div>
        </aside>
      </main>

      <Link href="/create" className="mob-fab lg-hide" style={{ textDecoration: 'none', color: '#ffffff' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 28 }}>add</span>
      </Link>
      {/* ═══════════ MOBILE BOTTOM NAV ═══════════ */}
      <nav className="mob-nav lg-hide">
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`mob-nav-item ${item.active ? 'mob-nav-active' : 'mob-nav-inactive'}`}
          >
            <span className={`material-symbols-outlined ${item.active ? 'mat-fill' : ''}`}
              style={{ fontSize: 24 }}
            >{item.icon}</span>
            {!item.active && (
              <span style={{
                fontSize: '0.625rem', textTransform: 'uppercase',
                letterSpacing: '0.05em', fontWeight: 700, marginTop: '0.125rem',
              }}>{item.label}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  )
}