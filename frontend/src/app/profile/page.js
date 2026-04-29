// app/profile/page.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import api from '@/lib/axios'
import { BRANCH_OPTIONS, YEAR_OPTIONS, validatePostText, validateTags } from '@/lib/validation'

const CATEGORIES = ['Academic', 'Hostel', 'Rants', 'General', 'Reviews']

const STREAK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
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
function daysSince(d) {
  if (!d) return 0
  const timestamp = new Date(d).getTime()
  if (Number.isNaN(timestamp)) return 0
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86400000))
}

function getDayKey(value) {
  const d = new Date(value)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function computeStreaks(posts) {
  const dayKeys = Array.from(new Set(posts.map((p) => getDayKey(p.createdAt)))).sort()
  if (dayKeys.length === 0) return { currentStreak: 0, longestStreak: 0 }

  let longest = 1
  let running = 1
  for (let i = 1; i < dayKeys.length; i++) {
    const prev = new Date(dayKeys[i - 1])
    const curr = new Date(dayKeys[i])
    const diff = Math.round((curr - prev) / 86400000)
    if (diff === 1) {
      running += 1
      longest = Math.max(longest, running)
    } else {
      running = 1
    }
  }

  const todayKey = getDayKey(new Date())
  let current = 0
  let cursor = new Date(todayKey)
  while (dayKeys.includes(getDayKey(cursor))) {
    current += 1
    cursor = new Date(cursor.getTime() - 86400000)
  }

  return { currentStreak: current, longestStreak: longest }
}

function getChronologicalPosts(posts) {
  return [...posts].filter((post) => post?.createdAt).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

function getKarmaEarnedDate(posts, target) {
  let total = 0
  for (const post of posts) {
    total += Math.max(0, post?.score || 0)
    if (total >= target) return post.createdAt
  }
  return null
}

function getStreakEarnedDate(posts, target) {
  const dayKeys = Array.from(new Set(posts.map((post) => getDayKey(post.createdAt)))).sort()
  if (!dayKeys.length) return null
  if (target <= 1) return dayKeys[0]

  let running = 1
  for (let i = 1; i < dayKeys.length; i++) {
    const prev = new Date(dayKeys[i - 1])
    const curr = new Date(dayKeys[i])
    const diff = Math.round((curr - prev) / 86400000)

    running = diff === 1 ? running + 1 : 1
    if (running >= target) return dayKeys[i]
  }

  return null
}

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

function PostItem({ post, index, onEdit, onDelete }) {
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
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(post) }}
            style={{ border: '1px solid rgba(236,72,153,0.18)', background: 'rgba(236,72,153,0.06)', color: '#b00d6a', borderRadius: 8, padding: '0.2rem 0.45rem', fontSize: '0.625rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(post._id) }}
            style={{ border: '1px solid rgba(180,19,64,0.2)', background: 'rgba(180,19,64,0.06)', color: '#b41340', borderRadius: 8, padding: '0.2rem 0.45rem', fontSize: '0.625rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Delete
          </button>
        </div>
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

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, logout, updateProfile } = useAuth()
  const { error: showErrorToast, warning: showWarningToast } = useToast()
  const router = useRouter()
  const [myPosts, setMyPosts] = useState([])
  const [profileLoading, setProfileLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [editModalPost, setEditModalPost] = useState(null)
  const [editForm, setEditForm] = useState({ text: '', category: 'General', tags: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [activityFeed, setActivityFeed] = useState([])

  // Editable fields
  const [editBranch, setEditBranch] = useState(user?.branch || 'CSE')
  const [editYear, setEditYear] = useState(user?.year || '1st Year')
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [settingsChanged, setSettingsChanged] = useState(false)

  // Track changes
  useEffect(() => {
    const branchChanged = editBranch !== (user?.branch || 'CSE')
    const yearChanged = editYear !== (user?.year || '1st Year')
    setSettingsChanged(branchChanged || yearChanged)
    setSettingsSaved(false)
  }, [editBranch, editYear, user])

  // Reset when settings panel opens
  useEffect(() => {
    if (showSettings) {
      setEditBranch(user?.branch || 'CSE')
      setEditYear(user?.year || '1st Year')
      setSettingsSaved(false)
      setSettingsChanged(false)
    }
  }, [showSettings, user])

  const handleSaveSettings = async () => {
    try {
      if (typeof updateProfile === 'function') {
        await updateProfile({ branch: editBranch, year: editYear })
      }
      setSettingsSaved(true)
      setSettingsChanged(false)
      setTimeout(() => {
        setSettingsSaved(false)
        setShowSettings(false)
      }, 1200)
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Failed to update profile')
    }
  }

  useEffect(() => {
    const loadProfilePosts = async () => {
      if (!isAuthenticated) return
      try {
        const [postsRes, activityRes] = await Promise.all([
          api.get('/users/my-posts'),
          api.get('/users/my-activity'),
        ])
        setMyPosts((postsRes.data.posts || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        setActivityFeed((activityRes.data.activity || []).map((item) => ({
          ...item,
          time: timeAgo(item.createdAt),
          color: item.type === 'comment' ? '#fb923c' : '#ec4899',
        })))
      } catch (error) {
        setMyPosts([])
        setActivityFeed([])
      } finally {
        setProfileLoading(false)
      }
    }
    loadProfilePosts()
  }, [isAuthenticated])

  const ds = (() => {
    const totalPosts = myPosts.length
    const totalComments = myPosts.reduce((acc, p) => acc + (p.commentCount || 0), 0)
    const karma = myPosts.reduce((acc, p) => acc + Math.max(0, p.score || 0), 0)
    const karmaNextLevel = Math.max(500, Math.ceil((karma + 1) / 500) * 500)
    const joinedDate = user?.createdAt || myPosts[myPosts.length - 1]?.createdAt || null

    const { currentStreak, longestStreak } = computeStreaks(myPosts)

    const weekStart = new Date()
    weekStart.setHours(0, 0, 0, 0)
    const shift = (weekStart.getDay() + 6) % 7
    weekStart.setDate(weekStart.getDate() - shift)
    const weeklyKarma = Array(7).fill(0)
    myPosts.forEach((p) => {
      const created = new Date(p.createdAt)
      const dayIndex = Math.floor((new Date(created.getFullYear(), created.getMonth(), created.getDate()) - weekStart) / 86400000)
      if (dayIndex >= 0 && dayIndex < 7) weeklyKarma[dayIndex] += Math.max(0, p.score || 0)
    })

    return {
      totalPosts,
      totalComments,
      karma,
      karmaNextLevel,
      joinedDate,
      currentStreak,
      longestStreak,
      weeklyKarma,
    }
  })()

  const chronologicalPosts = getChronologicalPosts(myPosts)
  const firstPostDate = chronologicalPosts[0]?.createdAt || null
  const karma100Date = getKarmaEarnedDate(chronologicalPosts, 100)
  const karma1000Date = getKarmaEarnedDate(chronologicalPosts, 1000)
  const streak7Date = getStreakEarnedDate(chronologicalPosts, 7)
  const streak30Date = getStreakEarnedDate(chronologicalPosts, 30)
  const viralDate = chronologicalPosts.find((post) => (post.score || 0) >= 500)?.createdAt || null

  const computedBadges = [
    { id: 'first-post', icon: '🎯', label: 'First Post', desc: 'Published your first anonymous post', earned: ds.totalPosts >= 1, earnedDate: firstPostDate },
    { id: 'karma-100', icon: '⭐', label: 'Rising Star', desc: 'Earned 100+ karma', earned: ds.karma >= 100, earnedDate: karma100Date, progress: Math.min(ds.karma, 100), total: 100 },
    { id: 'streak-7', icon: '🔥', label: 'On Fire', desc: '7-day posting streak', earned: ds.longestStreak >= 7, earnedDate: streak7Date, progress: Math.min(ds.longestStreak, 7), total: 7 },
    { id: 'karma-1000', icon: '💎', label: 'Diamond Mind', desc: 'Earned 1000+ karma', earned: ds.karma >= 1000, earnedDate: karma1000Date, progress: Math.min(ds.karma, 1000), total: 1000 },
    { id: 'viral', icon: '🚀', label: 'Going Viral', desc: 'Get 500+ upvotes on a post', earned: Boolean(viralDate), earnedDate: viralDate },
    { id: 'legend', icon: '👑', label: 'Legendary', desc: '30-day posting streak', earned: ds.longestStreak >= 30, earnedDate: streak30Date, progress: Math.min(ds.longestStreak, 30), total: 30 },
  ].map((badge) => (badge.earned ? badge : { ...badge, earnedDate: null }))

  const handleDeletePost = async (postId) => {
    setDeleteLoading(true)
    try {
      await api.delete(`/posts/${postId}`)
      setMyPosts((prev) => prev.filter((p) => p._id !== postId))
      setDeleteTarget(null)
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Could not delete post')
    } finally {
      setDeleteLoading(false)
    }
  }

  const openEditModal = (post) => {
    setEditModalPost(post)
    setEditForm({
      text: post.text || '',
      category: post.category || 'General',
      tags: (post.tags || []).join(', '),
    })
  }

  const closeEditModal = () => {
    setEditModalPost(null)
    setEditForm({ text: '', category: 'General', tags: '' })
    setEditLoading(false)
  }

  const submitEditPost = async () => {
    if (!editModalPost) return
    const text = editForm.text.trim()
    const textError = validatePostText(text)
    if (textError) {
      showWarningToast(textError, { title: 'Missing Content' })
      return
    }
    setEditLoading(true)
    try {
      const tagResult = validateTags(editForm.tags.split(',').map((t) => t.trim()).filter(Boolean))
      if (tagResult.error) {
        showWarningToast(tagResult.error, { title: 'Invalid Tags' })
        setEditLoading(false)
        return
      }
      const tags = tagResult.value
      const res = await api.patch(`/posts/${editModalPost._id}`, { text, category: editForm.category, tags })
      const updated = res?.data?.post
      const isVisible = updated?.visibility === 'visible' || updated?.visibility === undefined || updated?.visibility === null

      if (updated && isVisible) {
        setMyPosts((prev) => prev.map((p) => (p._id === editModalPost._id ? { ...p, ...updated } : p)))
      } else {
        setMyPosts((prev) => prev.filter((p) => p._id !== editModalPost._id))
        showWarningToast('Your post was hidden for review because it was detected as toxic.', { title: 'Post Hidden' })
      }
      closeEditModal()
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Could not update post')
      setEditLoading(false)
    }
  }

  useEffect(() => { if (!authLoading && !isAuthenticated) router.push('/login') }, [authLoading, isAuthenticated, router])

  const TABS = [
    { key: 'posts', label: 'Posts', icon: 'edit_square', count: myPosts.length },
    { key: 'badges', label: 'Badges', icon: 'military_tech', count: computedBadges.filter(b => b.earned).length },
    { key: 'activity', label: 'Activity', icon: 'timeline', count: activityFeed.length },
  ]

  if (authLoading || !isAuthenticated || profileLoading) {
    return (<div style={{ minHeight: '100vh', background: '#fefcf9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #eae1d5', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /></div>)
  }

  const kp = ds.karma / ds.karmaNextLevel
  const startOfWeek = new Date()
  startOfWeek.setHours(0, 0, 0, 0)
  const shift = (startOfWeek.getDay() + 6) % 7
  startOfWeek.setDate(startOfWeek.getDate() - shift)
  const postDays = new Set(myPosts.map((p) => getDayKey(p.createdAt)))
  const streakWeekData = STREAK_DAYS.map((_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return postDays.has(getDayKey(d))
  })

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
                    <span style={{ fontSize: '0.5625rem', fontWeight: 800, color: '#ec4899' }}>{ds.totalPosts}</span>
                    <span style={{ fontSize: '0.4375rem', fontWeight: 600, color: 'rgba(236,72,153,0.5)' }}>Total posts</span>
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
                          background: streakWeekData[i] ? 'linear-gradient(135deg, #f97316, #ef4444)' : 'rgba(234,225,213,0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {streakWeekData[i] && <span className="material-symbols-outlined" style={{ fontSize: 12, color: '#fff', fontVariationSettings: "'FILL' 1" }}>check</span>}
                      </motion.div>
                      <span style={{ fontSize: '0.4375rem', fontWeight: 700, color: streakWeekData[i] ? '#f97316' : '#c8c1b8' }}>{day}</span>
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
                { label: 'Comments', value: ds.totalComments, icon: 'chat_bubble', color: '#fb923c' },
                { label: 'Best', value: `${ds.longestStreak}d`, icon: 'emoji_events', color: '#f59e0b' }].map((s, i) => (
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
                  {myPosts.length > 0 ? myPosts.map((p, i) => <PostItem key={p._id} post={p} index={i} onEdit={openEditModal} onDelete={(id) => setDeleteTarget(myPosts.find((post) => post._id === id) || null)} />) : (
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
                    {[{ l: 'Earned', v: computedBadges.filter(b => b.earned).length, c: '#ec4899' },
                      { l: 'Locked', v: computedBadges.filter(b => !b.earned).length, c: '#b3aca3' }].map(s => (
                      <div key={s.l} style={{ flex: 1, padding: '0.625rem', borderRadius: '0.75rem',
                        background: '#fff', textAlign: 'center', border: '1px solid rgba(234,225,213,0.25)' }}>
                        <p style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: '1.125rem', color: s.c }}>{s.v}</p>
                        <p style={{ fontSize: '0.5rem', fontWeight: 700, color: '#b3aca3', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.375rem' }}>
                    {computedBadges.map((b, i) => (
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
                  {(() => { const n = computedBadges.find(b => !b.earned && b.progress !== undefined); if (!n) return null; return (
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
                    {activityFeed.map((item, i) => (
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

      <AnimatePresence>
        {editModalPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeEditModal() }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(16,12,8,0.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 16, padding: '1rem', border: '1px solid rgba(234,225,213,0.45)' }}
            >
              <h3 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 800, color: '#2e2318' }}>Edit Post</h3>
              <p style={{ margin: '0.35rem 0 0.8rem', color: '#857f75', fontSize: '0.8rem' }}>Update your content, category and tags.</p>
              <textarea
                value={editForm.text}
                onChange={(e) => setEditForm((prev) => ({ ...prev, text: e.target.value }))}
                rows={5}
                style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(211,200,185,0.45)', padding: '0.7rem', marginBottom: '0.65rem', resize: 'vertical' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                  style={{ borderRadius: 10, border: '1px solid rgba(211,200,185,0.45)', padding: '0.6rem' }}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  value={editForm.tags}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="tags (comma separated)"
                  style={{ borderRadius: 10, border: '1px solid rgba(211,200,185,0.45)', padding: '0.6rem' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.9rem' }}>
                <button onClick={closeEditModal} style={{ borderRadius: 999, border: '1px solid rgba(211,200,185,0.4)', background: '#fff', padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button onClick={submitEditPost} disabled={editLoading} style={{ borderRadius: 999, border: 'none', background: 'linear-gradient(135deg,#b00d6a,#f97316)', color: '#fff', padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer', opacity: editLoading ? 0.7 : 1 }}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null) }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(16,12,8,0.5)', zIndex: 1201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, padding: '1rem' }}
            >
              <h3 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, color: '#2e2318' }}>Delete this post?</h3>
              <p style={{ color: '#7b766e', fontSize: '0.82rem', lineHeight: 1.5 }}>
                This action cannot be undone. Your post and its comments will be removed permanently.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button onClick={() => setDeleteTarget(null)} style={{ borderRadius: 999, border: '1px solid rgba(211,200,185,0.4)', background: '#fff', padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer' }}>Keep</button>
                <button onClick={() => handleDeletePost(deleteTarget._id)} disabled={deleteLoading} style={{ borderRadius: 999, border: 'none', background: '#b41340', color: '#fff', padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer', opacity: deleteLoading ? 0.7 : 1 }}>
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
