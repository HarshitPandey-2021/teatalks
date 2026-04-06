// app/profile/page.jsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import usePosts from '@/store/usePosts'

const BRANCH_OPTIONS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AI/ML', 'Data Science', 'Biotech', 'Chemical', 'Aerospace']
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']

const PROFILE_STATS = {
  totalPosts: 12, totalComments: 47, karma: 1834, karmaNextLevel: 2500,
  daysActive: 23, currentStreak: 7, longestStreak: 14, campusRank: 42,
  totalUsers: 1847, joinedDate: new Date(Date.now() - 23 * 86400000).toISOString(),
  weeklyKarma: [120, 85, 200, 156, 312, 98, 245],
}

const MY_POSTS = [
  { _id: '1', text: "Does anyone have Sharma sir's DBMS notes? Unit 4 specifically. Exam in 3 days 😭", category: 'Academic', score: 342, commentCount: 56, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), tags: ['DBMS', 'Notes'] },
  { _id: '4', text: "Why does the WiFi in Hostel Block C work at 3 AM but dies during classes? 📡💀", category: 'Rants', score: 567, commentCount: 34, createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), tags: ['WiFi', 'HostelLife'] },
  { _id: '6', text: "Placement cell just dropped intern opportunities for pre-final years. Check email ASAP.", category: 'Academic', score: 1456, commentCount: 112, createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), tags: ['Placements'] },
]

const ACTIVITY_FEED = [
  { id: 'a1', type: 'upvote', icon: 'arrow_upward', text: 'Your DBMS post received 12 new upvotes', time: '2h ago', color: '#ec4899' },
  { id: 'a2', type: 'comment', icon: 'chat_bubble', text: 'Someone replied to your WiFi rant', time: '4h ago', color: '#fb923c' },
  { id: 'a3', type: 'milestone', icon: 'emoji_events', text: 'You crossed 1,800 karma! 🎉', time: '8h ago', color: '#f59e0b' },
  { id: 'a4', type: 'streak', icon: 'local_fire_department', text: '7-day streak! Keep the fire going 🔥', time: '1d ago', color: '#ef4444' },
  { id: 'a5', type: 'upvote', icon: 'trending_up', text: 'Placement post is trending in Academic', time: '1d ago', color: '#ec4899' },
  { id: 'a6', type: 'badge', icon: 'military_tech', text: 'You earned "Going Viral" badge 🚀', time: '2d ago', color: '#8b5cf6' },
]

const BADGES = [
  { id: 'first-post', icon: '🎯', label: 'First Post', desc: 'Published your first anonymous post', earned: true, earnedDate: '2024-01-15' },
  { id: 'karma-100', icon: '⭐', label: 'Rising Star', desc: 'Earned 100+ karma', earned: true, earnedDate: '2024-01-18' },
  { id: 'streak-7', icon: '🔥', label: 'On Fire', desc: '7-day posting streak', earned: true, earnedDate: '2024-02-01' },
  { id: 'karma-1000', icon: '💎', label: 'Diamond Mind', desc: 'Earned 1000+ karma', earned: true, earnedDate: '2024-02-10' },
  { id: 'comments-50', icon: '💬', label: 'Chatterbox', desc: '50+ comments posted', earned: false, progress: 47, total: 50 },
  { id: 'viral', icon: '🚀', label: 'Going Viral', desc: 'Get 500+ upvotes on a post', earned: true, earnedDate: '2024-02-12' },
  { id: 'streak-30', icon: '👑', label: 'Legendary', desc: '30-day posting streak', earned: false, progress: 7, total: 30 },
  { id: 'helper', icon: '🤝', label: 'Campus Helper', desc: 'Get 20 "helpful" reactions', earned: false, progress: 12, total: 20 },
]

const STREAK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const STREAK_DATA = [true, true, true, true, true, true, true]
const CAT_COLORS = { Academic: '#b00d6a', Rants: '#b41340', Reviews: '#ea6c00', Hostel: '#9a3412', General: '#16a34a' }

function timeAgo(d) {
  if (!d) return 'just now'
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
function fmt(n) { if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'; return String(n) }
function daysSince(d) { return Math.floor((Date.now() - new Date(d).getTime()) / 86400000) }

function KarmaRing({ current, target, size = 76, stroke = 4 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, p = Math.min(current / target, 1)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(176,13,106,0.1)" strokeWidth={stroke} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#kg)" strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - p * c }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.4,0,0.2,1] }} />
      <defs><linearGradient id="kg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ec4899" /><stop offset="100%" stopColor="#fb923c" />
      </linearGradient></defs>
    </svg>
  )
}

function WeeklyChart({ data }) {
  const max = Math.max(...data, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.3rem', height: 44 }}>
      {data.map((v, i) => (
        <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(v / max) * 100}%` }}
          transition={{ duration: 0.5, delay: 0.05 * i }}
          style={{ flex: 1, borderRadius: 3, minHeight: 3,
            background: i === data.length - 1 ? 'linear-gradient(180deg, #ec4899, #fb923c)' : 'rgba(234,225,213,0.6)' }} />
      ))}
    </div>
  )
}

function PostItem({ post, index }) {
  const cc = CAT_COLORS[post.category] || '#6b665e'
  const router = useRouter()
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }} whileTap={{ scale: 0.985 }}
      onClick={() => router.push(`/posts/${post._id}`)}
      style={{ background: '#fff', borderRadius: '0.875rem', padding: '0.875rem 1rem',
        boxShadow: '0 1px 3px rgba(50,46,40,0.04)', border: '1px solid rgba(234,225,213,0.25)',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
        <span style={{ fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: cc, background: `${cc}10`, padding: '1px 6px', borderRadius: 999, border: `1px solid ${cc}18` }}>{post.category}</span>
        <span style={{ fontSize: '0.625rem', color: '#b3aca3', fontWeight: 500 }}>{timeAgo(post.createdAt)}</span>
      </div>
      <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: '#2e2318', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{post.text}</p>
      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
          {post.tags.map(t => <span key={t} style={{ fontSize: '0.5625rem', fontWeight: 600, color: '#9a7c5e',
            background: 'rgba(242,234,222,0.6)', padding: '1px 5px', borderRadius: 3 }}>#{t}</span>)}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.375rem',
        borderTop: '1px solid rgba(234,225,213,0.2)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.6875rem', color: '#6b665e', fontWeight: 600 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#ec4899', fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>{fmt(post.score)}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.6875rem', color: '#6b665e', fontWeight: 600 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>chat_bubble</span>{fmt(post.commentCount)}</span>
      </div>
    </motion.div>
  )
}

/* ─── Custom Select ─── */
function CustomSelect({ value, options, onChange, icon, label }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.75rem 0.875rem', background: open ? 'rgba(248,240,229,0.6)' : 'transparent',
          border: 'none', cursor: 'pointer', transition: 'background 0.15s',
          WebkitTapHighlightColor: 'transparent', textAlign: 'left',
        }}>
        <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#857f75' }}>{icon}</span>
        <span style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 600, color: '#322e28' }}>{label}</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ec4899',
          background: 'rgba(236,72,153,0.06)', padding: '0.1875rem 0.5rem', borderRadius: 999 }}>{value}</span>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#c8c1b8',
          transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>expand_more</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0.25rem 0.625rem 0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {options.map(opt => (
                <button key={opt} onClick={() => { onChange(opt); setOpen(false) }}
                  style={{
                    padding: '0.375rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans'", cursor: 'pointer',
                    background: opt === value ? 'linear-gradient(135deg, #ec4899, #fb923c)' : 'rgba(248,240,229,0.6)',
                    color: opt === value ? '#fff' : '#5f5b53',
                    border: opt === value ? 'none' : '1px solid rgba(234,225,213,0.3)',
                    transition: 'all 0.15s',
                    WebkitTapHighlightColor: 'transparent',
                  }}>
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* We need useRef for CustomSelect */
import { useRef } from 'react'

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, logout, updateProfile } = useAuth()
  const router = useRouter()
  const livePosts = usePosts((s) => s.posts)
  const [activeTab, setActiveTab] = useState('posts')
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  // Editable fields
  const [editBranch, setEditBranch] = useState(user?.branch || 'CSE')
  const [editYear, setEditYear] = useState(user?.year || '3rd Year')
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [settingsChanged, setSettingsChanged] = useState(false)

  // Track changes
  useEffect(() => {
    const branchChanged = editBranch !== (user?.branch || 'CSE')
    const yearChanged = editYear !== (user?.year || '3rd Year')
    setSettingsChanged(branchChanged || yearChanged)
    setSettingsSaved(false)
  }, [editBranch, editYear, user])

  // Reset when settings panel opens
  useEffect(() => {
    if (showSettings) {
      setEditBranch(user?.branch || 'CSE')
      setEditYear(user?.year || '3rd Year')
      setSettingsSaved(false)
      setSettingsChanged(false)
    }
  }, [showSettings, user])

  const handleSaveSettings = () => {
    // If updateProfile exists in auth context, call it
    if (typeof updateProfile === 'function') {
      updateProfile({ branch: editBranch, year: editYear })
    }
    setSettingsSaved(true)
    setSettingsChanged(false)
    setTimeout(() => {
      setSettingsSaved(false)
      setShowSettings(false)
    }, 1200)
  }

  const myPosts = (() => {
    const from = livePosts.filter(p => p.isMine)
    const merged = [...from, ...MY_POSTS]
    const seen = new Set()
    return merged.filter(p => { if (seen.has(p._id)) return false; seen.add(p._id); return true })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })()

  const ds = { ...PROFILE_STATS, totalPosts: PROFILE_STATS.totalPosts + livePosts.filter(p => p.isMine).length }

  useEffect(() => { if (!authLoading && !isAuthenticated) router.push('/login') }, [authLoading, isAuthenticated, router])

  const TABS = [
    { key: 'posts', label: 'Posts', icon: 'edit_square', count: myPosts.length },
    { key: 'badges', label: 'Badges', icon: 'military_tech', count: BADGES.filter(b => b.earned).length },
    { key: 'activity', label: 'Activity', icon: 'timeline', count: ACTIVITY_FEED.length },
  ]

  if (authLoading || !isAuthenticated) {
    return (<div style={{ minHeight: '100vh', background: '#fefcf9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #eae1d5', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /></div>)
  }

  const kp = ds.karma / ds.karmaNextLevel
  const rp = Math.round((1 - ds.campusRank / ds.totalUsers) * 100)

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes checkPop { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .ptab:active { transform: scale(0.96); }
        .ptab { -webkit-tap-highlight-color: transparent; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fefcf9',
        paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom, 16px))' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          {/* ══ HERO ══ */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            style={{ position: 'relative', overflow: 'hidden', background: '#fff',
              borderRadius: '0 0 1.5rem 1.5rem', padding: '1.25rem 1rem 1.5rem',
              boxShadow: '0 2px 12px rgba(50,46,40,0.05)',
              border: '1px solid rgba(234,225,213,0.2)', borderTop: 'none' }}>

            {/* Top gradient accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4,
              background: 'linear-gradient(90deg, #ec4899, #fb923c)', borderRadius: '0 0 2px 2px' }} />

            {/* Settings gear */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSettings(!showSettings)}
                style={{ width: 34, height: 34, borderRadius: '50%',
                  background: showSettings ? 'rgba(236,72,153,0.08)' : 'rgba(248,240,229,0.5)',
                  border: showSettings ? '1px solid rgba(236,72,153,0.15)' : '1px solid rgba(234,225,213,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  color: showSettings ? '#ec4899' : '#857f75', transition: 'all 0.2s',
                  WebkitTapHighlightColor: 'transparent' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18,
                  transform: showSettings ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>settings</span>
              </motion.button>
            </div>

            {/* Avatar row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <KarmaRing current={ds.karma} target={ds.karmaNextLevel} />
                <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(249,115,22,0.06))',
                  fontSize: '2rem' }}>{user?.anonymousEmoji || '🎭'}</div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.5 }}
                  style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f97316, #ef4444)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 800,
                    color: '#fff', border: '2px solid #fff', boxShadow: '0 2px 6px rgba(249,115,22,0.3)' }}>
                  {ds.currentStreak}
                </motion.div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: '1.25rem',
                  color: '#322e28', marginBottom: '0.125rem', lineHeight: 1.2 }}>{user?.anonymousName || 'Anonymous'}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#857f75', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 11 }}>verified_user</span>{user?.branch || editBranch}</span>
                  <span style={{ color: '#d3cdc4', fontSize: '0.375rem' }}>•</span>
                  <span style={{ fontSize: '0.5625rem', fontWeight: 600, color: '#b3aca3' }}>{user?.year || editYear}</span>
                  <span style={{ color: '#d3cdc4', fontSize: '0.375rem' }}>•</span>
                  <span style={{ fontSize: '0.5625rem', fontWeight: 600, color: '#b3aca3' }}>{daysSince(ds.joinedDate)}d active</span>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.1875rem 0.5rem',
                    borderRadius: 999, background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.1)' }}>
                    <span style={{ fontSize: '0.5625rem' }}>👑</span>
                    <span style={{ fontSize: '0.5625rem', fontWeight: 800, color: '#ec4899' }}>#{ds.campusRank}</span>
                    <span style={{ fontSize: '0.4375rem', fontWeight: 600, color: 'rgba(236,72,153,0.5)' }}>Top {rp}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.1875rem 0.5rem',
                    borderRadius: 999, background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.1)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 11, color: '#fb923c', fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    <span style={{ fontSize: '0.5625rem', fontWeight: 800, color: '#fb923c' }}>{fmt(ds.karma)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Karma bar */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#b3aca3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Next Level</span>
                <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#857f75' }}>{fmt(ds.karma)} / {fmt(ds.karmaNextLevel)}</span>
              </div>
              <div style={{ height: 5, background: 'rgba(234,225,213,0.35)', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${kp * 100}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.4,0,0.2,1] }}
                  style={{ height: '100%', borderRadius: 999,
                    background: 'linear-gradient(90deg, #ec4899, #fb923c)' }} />
              </div>
            </div>

            {/* ── Inline Settings Panel ── */}
            <AnimatePresence>
              {showSettings && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden', marginTop: '0.875rem' }}>
                  <div style={{ background: 'rgba(248,240,229,0.4)', borderRadius: '0.875rem',
                    border: '1px solid rgba(234,225,213,0.25)', overflow: 'hidden' }}>

                    <div style={{ padding: '0.625rem 0.875rem', borderBottom: '1px solid rgba(234,225,213,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '0.1em', color: '#b3aca3', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#b3aca3' }}>tune</span>
                        Edit Profile
                      </span>
                      <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none',
                        cursor: 'pointer', color: '#857f75', display: 'flex', padding: 2,
                        WebkitTapHighlightColor: 'transparent' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                      </button>
                    </div>

                    {/* Branch selector */}
                    <CustomSelect
                      value={editBranch}
                      options={BRANCH_OPTIONS}
                      onChange={setEditBranch}
                      icon="school"
                      label="Branch"
                    />

                    <div style={{ height: 1, background: 'rgba(234,225,213,0.15)', margin: '0 0.625rem' }} />

                    {/* Year selector */}
                    <CustomSelect
                      value={editYear}
                      options={YEAR_OPTIONS}
                      onChange={setEditYear}
                      icon="calendar_month"
                      label="Year"
                    />

                    {/* Save / Confirm button */}
                    <div style={{ padding: '0.625rem 0.875rem' }}>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSaveSettings}
                        disabled={!settingsChanged && !settingsSaved}
                        style={{
                          width: '100%', padding: '0.75rem',
                          background: settingsSaved
                            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                            : settingsChanged
                              ? 'linear-gradient(135deg, #ec4899, #fb923c)'
                              : 'rgba(234,225,213,0.5)',
                          border: 'none', borderRadius: 999,
                          fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '0.8125rem',
                          color: (settingsChanged || settingsSaved) ? '#fff' : '#b3aca3',
                          cursor: (settingsChanged || settingsSaved) ? 'pointer' : 'default',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                          transition: 'all 0.3s',
                          boxShadow: settingsChanged ? '0 3px 12px rgba(236,72,153,0.2)' : 'none',
                          WebkitTapHighlightColor: 'transparent',
                        }}>
                        {settingsSaved ? (
                          <>
                            <span className="material-symbols-outlined" style={{
                              fontSize: 16, fontVariationSettings: "'FILL' 1",
                              animation: 'checkPop 0.3s ease-out',
                            }}>check_circle</span>
                            Saved!
                          </>
                        ) : settingsChanged ? (
                          <>
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>save</span>
                            Save Changes
                          </>
                        ) : (
                          'No changes'
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ══ STATS GRID ══ */}
          <div style={{ padding: '0 0.75rem' }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginTop: '0.75rem' }}>

              {/* Streak */}
              <div style={{ background: '#fff', borderRadius: '0.875rem', padding: '0.875rem',
                border: '1px solid rgba(234,225,213,0.25)', boxShadow: '0 1px 3px rgba(50,46,40,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3aca3' }}>Streak</span>
                  <span style={{ fontSize: '0.5625rem', fontWeight: 800, color: '#f97316' }}>🔥 {ds.currentStreak}d</span>
                </div>
                <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'space-between' }}>
                  {STREAK_DAYS.map((day, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.04, type: 'spring', damping: 15, stiffness: 250 }}
                        style={{ width: 22, height: 22, borderRadius: '50%',
                          background: STREAK_DATA[i] ? 'linear-gradient(135deg, #f97316, #ef4444)' : 'rgba(234,225,213,0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {STREAK_DATA[i] && <span className="material-symbols-outlined" style={{ fontSize: 12, color: '#fff', fontVariationSettings: "'FILL' 1" }}>check</span>}
                      </motion.div>
                      <span style={{ fontSize: '0.4375rem', fontWeight: 700, color: STREAK_DATA[i] ? '#f97316' : '#c8c1b8' }}>{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly */}
              <div style={{ background: '#fff', borderRadius: '0.875rem', padding: '0.875rem',
                border: '1px solid rgba(234,225,213,0.25)', boxShadow: '0 1px 3px rgba(50,46,40,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3aca3' }}>This Week</span>
                  <span style={{ fontSize: '0.5625rem', fontWeight: 800, color: '#ec4899' }}>+{ds.weeklyKarma.reduce((a,b) => a+b, 0)}</span>
                </div>
                <WeeklyChart data={ds.weeklyKarma} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  {STREAK_DAYS.map((d, i) => <span key={i} style={{ fontSize: '0.4375rem', fontWeight: 600, color: '#c8c1b8', flex: 1, textAlign: 'center' }}>{d}</span>)}
                </div>
              </div>
            </motion.div>

            {/* Quick stats */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem' }}>
              {[{ label: 'Posts', value: ds.totalPosts, icon: 'edit_square', color: '#ec4899' },
                { label: 'Comments', value: PROFILE_STATS.totalComments, icon: 'chat_bubble', color: '#fb923c' },
                { label: 'Best', value: `${PROFILE_STATS.longestStreak}d`, icon: 'emoji_events', color: '#f59e0b' }].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  style={{ flex: 1, background: '#fff', borderRadius: '0.75rem', padding: '0.625rem 0.375rem',
                    textAlign: 'center', border: '1px solid rgba(234,225,213,0.25)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: s.color, display: 'block',
                    marginBottom: '0.1875rem', fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  <p style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: '1rem', color: '#322e28', lineHeight: 1 }}>
                    {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
                  <p style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#b3aca3', marginTop: '0.125rem' }}>{s.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* ══ TABS ══ */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ display: 'flex', gap: '0.25rem', marginTop: '1rem', marginBottom: '0.75rem',
                background: 'rgba(248,240,229,0.5)', borderRadius: '0.75rem', padding: '0.25rem' }}>
              {TABS.map(tab => {
                const on = activeTab === tab.key
                return (
                  <button key={tab.key} className="ptab" onClick={() => setActiveTab(tab.key)}
                    style={{ flex: 1, padding: '0.5625rem 0.125rem', borderRadius: '0.625rem', border: 'none',
                      fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '0.6875rem',
                      cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                      background: on ? '#fff' : 'transparent', color: on ? '#ec4899' : '#9b958c',
                      boxShadow: on ? '0 1px 6px rgba(0,0,0,0.04)' : 'none' }}>
                    <span className={`material-symbols-outlined ${on ? 'mat-fill' : ''}`} style={{ fontSize: 14 }}>{tab.icon}</span>
                    {tab.label}
                    <span style={{ fontSize: '0.5rem', fontWeight: 800, padding: '0px 4px', borderRadius: 999,
                      background: on ? 'rgba(236,72,153,0.08)' : 'rgba(0,0,0,0.03)',
                      color: on ? '#ec4899' : '#b3aca3' }}>{tab.count}</span>
                  </button>
                )
              })}
            </motion.div>

            {/* ══ TAB CONTENT ══ */}
            <AnimatePresence mode="wait">
              {activeTab === 'posts' && (
                <motion.div key="p" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.18 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {myPosts.length > 0 ? myPosts.map((p, i) => <PostItem key={p._id} post={p} index={i} />) : (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: '#fff',
                      borderRadius: '1rem', border: '1px dashed rgba(234,225,213,0.5)' }}>
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}
                        style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>✍️</motion.span>
                      <p style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, color: '#7b766e', fontSize: '0.875rem' }}>No posts yet</p>
                      <p style={{ fontSize: '0.75rem', color: '#b3aca3', marginTop: '0.25rem', marginBottom: '0.75rem' }}>Your campus needs your voice!</p>
                      <Link href="/create" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.625rem 1.25rem', borderRadius: 999,
                        background: 'linear-gradient(135deg, #ec4899, #fb923c)', color: '#fff',
                        textDecoration: 'none', fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '0.75rem',
                        boxShadow: '0 3px 12px rgba(236,72,153,0.2)' }}>
                        <span className="material-symbols-outlined mat-fill" style={{ fontSize: 14 }}>edit_square</span>Create Post
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'badges' && (
                <motion.div key="b" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.18 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                    {[{ l: 'Earned', v: BADGES.filter(b => b.earned).length, c: '#ec4899' },
                      { l: 'Locked', v: BADGES.filter(b => !b.earned).length, c: '#b3aca3' }].map(s => (
                      <div key={s.l} style={{ flex: 1, padding: '0.625rem', borderRadius: '0.75rem',
                        background: '#fff', textAlign: 'center', border: '1px solid rgba(234,225,213,0.25)' }}>
                        <p style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: '1.125rem', color: s.c }}>{s.v}</p>
                        <p style={{ fontSize: '0.5rem', fontWeight: 700, color: '#b3aca3', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.375rem' }}>
                    {BADGES.map((b, i) => (
                      <motion.button key={b.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, delay: i * 0.04 }} whileTap={{ scale: 0.92 }}
                        onClick={() => setSelectedBadge(b)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          gap: '0.2rem', padding: '0.625rem 0.375rem', background: b.earned ? '#fff' : 'rgba(248,240,229,0.5)',
                          borderRadius: '0.75rem', border: b.earned ? '1px solid rgba(234,225,213,0.3)' : '1px dashed rgba(211,200,185,0.4)',
                          cursor: 'pointer', position: 'relative', overflow: 'hidden', opacity: b.earned ? 1 : 0.6,
                          WebkitTapHighlightColor: 'transparent', minWidth: 0 }}>
                        <span style={{ fontSize: '1.375rem', filter: b.earned ? 'none' : 'grayscale(1)' }}>{b.icon}</span>
                        <span style={{ fontSize: '0.5rem', fontWeight: 700, color: b.earned ? '#322e28' : '#b3aca3',
                          textAlign: 'center', lineHeight: 1.2, fontFamily: "'Plus Jakarta Sans'" }}>{b.label}</span>
                        {!b.earned && b.progress !== undefined && (
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5, background: 'rgba(234,225,213,0.5)' }}>
                            <div style={{ height: '100%', width: `${(b.progress / b.total) * 100}%`,
                              background: 'linear-gradient(90deg, #ec4899, #fb923c)', borderRadius: 2 }} />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  {(() => { const n = BADGES.find(b => !b.earned && b.progress !== undefined); if (!n) return null; return (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      style={{ marginTop: '0.625rem', padding: '0.75rem', background: '#fff', borderRadius: '0.75rem',
                        border: '1px solid rgba(234,225,213,0.25)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span style={{ fontSize: '1.25rem', filter: 'grayscale(0.5)' }}>{n.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#322e28', fontFamily: "'Plus Jakarta Sans'" }}>
                          Almost! <span style={{ color: '#ec4899' }}>{n.label}</span></p>
                        <div style={{ height: 4, background: 'rgba(234,225,213,0.4)', borderRadius: 999, overflow: 'hidden', marginTop: '0.25rem' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(n.progress / n.total) * 100}%` }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                            style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #ec4899, #fb923c)' }} />
                        </div>
                        <p style={{ fontSize: '0.5rem', color: '#857f75', fontWeight: 600, marginTop: '0.1875rem' }}>{n.progress}/{n.total} — {n.desc}</p>
                      </div>
                    </motion.div>
                  ) })()}
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <motion.div key="a" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.18 }}>
                  <div style={{ background: '#fff', borderRadius: '0.875rem',
                    border: '1px solid rgba(234,225,213,0.25)', overflow: 'hidden' }}>
                    {ACTIVITY_FEED.map((item, i) => (
                      <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.04 }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                          padding: '0.75rem 0.875rem',
                          borderTop: i > 0 ? '1px solid rgba(234,225,213,0.15)' : 'none' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${item.color}10`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: item.color,
                            fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.75rem', lineHeight: 1.4, color: '#322e28', fontWeight: 500, margin: 0 }}>{item.text}</p>
                          <p style={{ fontSize: '0.5625rem', color: '#b3aca3', fontWeight: 600, marginTop: '0.1875rem' }}>{item.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ══ BADGE MODAL ══ */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setSelectedBadge(null) }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,12,8,0.5)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.75rem 1.25rem',
                maxWidth: 340, width: '100%', textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                marginBottom: 'env(safe-area-inset-bottom, 1rem)' }}>
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                style={{ fontSize: '3rem', display: 'block', marginBottom: '0.625rem' }}>{selectedBadge.icon}</motion.span>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: '1.125rem', color: '#322e28', marginBottom: '0.25rem' }}>{selectedBadge.label}</h3>
              <p style={{ fontSize: '0.8125rem', color: '#7b766e', marginBottom: '0.875rem', lineHeight: 1.4 }}>{selectedBadge.desc}</p>
              {selectedBadge.earned ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.375rem 0.75rem',
                  borderRadius: 999, background: 'rgba(34,197,94,0.08)', color: '#16a34a', fontSize: '0.6875rem', fontWeight: 700 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check_circle</span>
                  Earned {selectedBadge.earnedDate ? new Date(selectedBadge.earnedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </div>
              ) : selectedBadge.progress !== undefined && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontWeight: 700, color: '#857f75', marginBottom: '0.3rem' }}>
                    <span>Progress</span><span>{selectedBadge.progress}/{selectedBadge.total}</span>
                  </div>
                  <div style={{ height: 7, background: 'rgba(234,225,213,0.5)', borderRadius: 999, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(selectedBadge.progress / selectedBadge.total) * 100}%` }}
                      transition={{ duration: 0.7 }}
                      style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #ec4899, #fb923c)' }} />
                  </div>
                </div>
              )}
              <button onClick={() => setSelectedBadge(null)} style={{ marginTop: '1rem', width: '100%', padding: '0.75rem',
                background: '#f8f0e5', border: 'none', borderRadius: 999, fontFamily: "'Plus Jakarta Sans'",
                fontWeight: 700, fontSize: '0.8125rem', color: '#322e28', cursor: 'pointer' }}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}