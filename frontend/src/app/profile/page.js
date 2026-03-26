'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const FAKE_STATS = {
  totalPosts: 12,
  totalComments: 47,
  karma: 1834,
  daysActive: 23,
}

const MY_POSTS = [
  { _id: '1', text: "Does anyone have Sharma sir's DBMS notes? Unit 4 specifically...", category: 'Academic', score: 342, commentCount: 56, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { _id: '4', text: "Why does the WiFi in Hostel Block C work perfectly at 3 AM but dies during classes?", category: 'Rants', score: 567, commentCount: 34, createdAt: new Date(Date.now() - 12 * 3600000).toISOString() },
]

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('posts')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

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
        <button
          onClick={() => router.push('/feed')}
          style={{
            padding: '0.5rem', background: 'none', border: 'none',
            cursor: 'pointer', color: '#7b766e', display: 'flex',
            borderRadius: '0.5rem', transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ec4899')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#7b766e')}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: '42rem', margin: '0 auto', padding: '2rem 1rem', paddingBottom: '7rem' }}>

        {/* Identity Card */}
        <div style={{
          background: '#ffffff', borderRadius: '2rem',
          padding: '2.5rem 2rem', textAlign: 'center',
          boxShadow: '0 20px 40px rgba(50,46,40,0.06)',
          marginBottom: '2rem',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Background gradient */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 120,
            background: 'linear-gradient(135deg, #ec4899, #fb923c)',
            opacity: 0.08,
          }} />

          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ec4899, #fb923c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', margin: '0 auto 1rem',
            boxShadow: '0 8px 24px rgba(236,72,153,0.2)',
            position: 'relative',
          }}>
            {user?.anonymousEmoji}
          </div>

          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: '1.75rem',
            color: '#322e28', marginBottom: '0.25rem',
          }}>
            {user?.anonymousName}
          </h1>

          <p style={{
            fontSize: '0.8125rem', color: '#7b766e',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '0.5rem',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span>
            Anonymous Identity • {user?.branch || 'CSE'} • {user?.year || '3rd Year'}
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem', marginBottom: '2rem',
        }}>
          {[
            { label: 'Posts', value: FAKE_STATS.totalPosts, icon: 'edit_square', color: '#ec4899' },
            { label: 'Comments', value: FAKE_STATS.totalComments, icon: 'chat_bubble', color: '#fb923c' },
            { label: 'Karma', value: FAKE_STATS.karma, icon: 'favorite', color: '#b00d6a' },
            { label: 'Days Active', value: FAKE_STATS.daysActive, icon: 'local_fire_department', color: '#9a3412' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: '#ffffff', borderRadius: '1.5rem',
              padding: '1.25rem', textAlign: 'center',
              boxShadow: '0 4px 16px rgba(50,46,40,0.04)',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: stat.color, marginBottom: '0.5rem', display: 'block' }}>
                {stat.icon}
              </span>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: '1.5rem', color: '#322e28',
              }}>
                {stat.value.toLocaleString()}
              </p>
              <p style={{
                fontSize: '0.6875rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#b3aca3',
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0.5rem',
          marginBottom: '1.5rem',
          background: '#f8f0e5', borderRadius: '1rem',
          padding: '0.375rem',
        }}>
          {[
            { key: 'posts', label: 'Your Posts', icon: 'edit_square' },
            { key: 'saved', label: 'Saved', icon: 'bookmark' },
            { key: 'settings', label: 'Settings', icon: 'settings' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: '0.75rem',
                borderRadius: '0.75rem', border: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: '0.8125rem',
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.375rem',
                background: activeTab === tab.key ? '#ffffff' : 'transparent',
                color: activeTab === tab.key ? '#ec4899' : '#7b766e',
                boxShadow: activeTab === tab.key ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <span className={`material-symbols-outlined ${activeTab === tab.key ? 'mat-fill' : ''}`}
                style={{ fontSize: 18 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {MY_POSTS.map((post) => (
              <Link key={post._id} href={`/posts/${post._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: '#ffffff', borderRadius: '1.5rem',
                  padding: '1.25rem',
                  boxShadow: '0 4px 16px rgba(50,46,40,0.04)',
                  transition: 'all 0.2s', cursor: 'pointer',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(50,46,40,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(50,46,40,0.04)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.625rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      color: '#ec4899',
                    }}>#{post.category}</span>
                    <span style={{ fontSize: '0.75rem', color: '#b3aca3' }}>{timeAgo(post.createdAt)}</span>
                  </div>
                  <p style={{
                    fontSize: '0.9375rem', lineHeight: 1.5,
                    color: '#374151', fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {post.text}
                  </p>
                  <div style={{
                    display: 'flex', gap: '1.25rem', marginTop: '0.75rem',
                    fontSize: '0.8125rem', color: '#7b766e', fontWeight: 600,
                  }}>
                    <span>▲ {post.score}</span>
                    <span>💬 {post.commentCount}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'saved' && (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: '#ffffff', borderRadius: '2rem',
            boxShadow: '0 4px 20px rgba(50,46,40,0.04)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#eae1d5' }}>
              bookmark_border
            </span>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, color: '#7b766e',
              marginTop: '0.75rem',
            }}>No saved posts yet</p>
            <p style={{ fontSize: '0.875rem', color: '#b3aca3', marginTop: '0.25rem' }}>
              Bookmark posts to find them later
            </p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{
            background: '#ffffff', borderRadius: '2rem',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(50,46,40,0.04)',
            display: 'flex', flexDirection: 'column', gap: '1rem',
          }}>
            {/* Branch */}
            <div>
              <label style={{
                fontSize: '0.6875rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#b3aca3', marginBottom: '0.5rem', display: 'block',
              }}>Branch</label>
              <select defaultValue={user?.branch || 'CSE'} style={{
                width: '100%', padding: '0.875rem 1rem',
                background: '#f8f0e5', border: 'none',
                borderRadius: '0.75rem', fontSize: '0.9375rem',
                fontWeight: 600, color: '#322e28', outline: 'none',
                cursor: 'pointer',
              }}>
                {['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'IT', 'Other'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label style={{
                fontSize: '0.6875rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#b3aca3', marginBottom: '0.5rem', display: 'block',
              }}>Year</label>
              <select defaultValue={user?.year || '3rd Year'} style={{
                width: '100%', padding: '0.875rem 1rem',
                background: '#f8f0e5', border: 'none',
                borderRadius: '0.75rem', fontSize: '0.9375rem',
                fontWeight: 600, color: '#322e28', outline: 'none',
                cursor: 'pointer',
              }}>
                {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#f3f4f6', margin: '0.5rem 0' }} />

            {/* Logout */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                width: '100%', padding: '1rem',
                background: 'rgba(180,19,64,0.06)',
                border: '1px solid rgba(180,19,64,0.15)',
                borderRadius: '1rem',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: '0.9375rem',
                color: '#b41340', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(180,19,64,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(180,19,64,0.06)')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
              Log Out
            </button>
          </div>
        )}
      </main>

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutConfirm(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(15,12,8,0.5)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{
            background: '#ffffff', borderRadius: '2rem',
            padding: '2rem', maxWidth: 360, width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#b41340', marginBottom: '1rem', display: 'block' }}>
              waving_hand
            </span>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: '1.25rem',
              color: '#322e28', marginBottom: '0.5rem',
            }}>Leaving already?</h3>
            <p style={{ fontSize: '0.875rem', color: '#7b766e', marginBottom: '1.5rem' }}>
              Your anonymous identity will be waiting for you.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1, padding: '0.875rem',
                  background: '#f8f0e5', border: 'none',
                  borderRadius: 9999,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.875rem',
                  color: '#322e28', cursor: 'pointer',
                }}>Stay</button>
              <button
                onClick={logout}
                style={{
                  flex: 1, padding: '0.875rem',
                  background: '#b41340', border: 'none',
                  borderRadius: 9999,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.875rem',
                  color: '#ffffff', cursor: 'pointer',
                }}>Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile nav */}
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
          { icon: 'search', label: 'Search', href: '/search' },
          { icon: 'add_circle', label: 'Post', href: '/create' },
          { icon: 'person', label: 'Profile', href: '/profile', active: true },
        ].map((item) => (
          <Link key={item.label} href={item.href} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', textDecoration: 'none',
            color: item.active ? '#ec4899' : '#9ca3af',
          }}>
            <span className={`material-symbols-outlined ${item.active ? 'mat-fill' : ''}`}
              style={{ fontSize: 24 }}>{item.icon}</span>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, marginTop: '0.125rem' }}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}