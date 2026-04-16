// app/post/[id]/page.jsx
'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import CommentCard from '@/components/CommentCard'
import CommentForm from '@/components/CommentForm'
import ReportModal from '@/components/ReportModal'
import PostCard from '@/components/PostCard'
import api from '@/lib/axios'



async function fetchPost(id) {
  const res = await api.get(`/posts/${id}`)
  return res.data.post
}

async function fetchComments(postId) {
  const res = await api.get(`/posts/${postId}/comments`)
  const flat = res.data.comments || []
  const byId = new Map(flat.map((c) => [c._id, { ...c, replies: [] }]))
  const roots = []
  flat.forEach((c) => {
    const node = byId.get(c._id)
    if (c.parentCommentId && byId.has(c.parentCommentId)) {
      byId.get(c.parentCommentId).replies.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

async function fetchRelatedPosts(postId, category) {
  const res = await api.get('/posts', { params: { category, exclude: postId, limit: 3 } })
  return res.data.posts || []
}

async function submitVote(postId, vote) {
  const mappedVote = vote === 'up' ? 1 : vote === 'down' ? -1 : 0
  const res = await api.post(`/posts/${postId}/vote`, { value: mappedVote })
  return res.data.post
}

async function submitComment(postId, text) {
  const res = await api.post(`/posts/${postId}/comments`, { text })
  return res.data
}

async function submitReply(postId, parentCommentId, text) {
  const res = await api.post(`/posts/${postId}/comments/${parentCommentId}/replies`, { text })
  return res.data
}

/* ─────────────────────────────────────────────────────────────
   MOCK DATA (remove when API is wired)
───────────────────────────────────────────────────────────── */

const MOCK_POSTS = {
  '1': {
    _id: '1', anonymousEmoji: '🦊', anonymousName: 'Silent Fox',
    category: 'Academic',
    text: "Does anyone have Sharma sir's DBMS notes? Unit 4 specifically. Exam is in 3 days and I'm honestly starting to panic. The library copies are all checked out and my own notes are... let's just say 'incomplete' is an understatement. BCNF and 4NF are starting to look like ancient hieroglyphics. 😭",
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOjBQnBbgGBCpnOuHhWbOqdCMGcjluDvfu5_MwvjK8hVa_39GIksUJ-q0MUtVVE2NIBdXqB-TSGvt2Nkjv5YEt8uaj72FotBCA60s-YI3zUj_QQoUO_8Ql5AwJ8jCGoGViKMEfiTryWVYh5EUCYk_f5r5PD7phYNlxLLty4lc6VL6HvqE7yS8aH8fhOF4Q_7B_RRD1sU9Rgz-8YaKx6ZLBtoSGctnVr37MuCK_YwlMxcVzopz6Wad5hvGseHBzU4dDPt4Y43wepd4c',
    tags: ['DBMS', 'AcademicStress', 'HostelLife'],
    score: 342, commentCount: 6,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  '2': {
    _id: '2', anonymousEmoji: '🐼', anonymousName: 'Sleepy Panda',
    category: 'Hostel',
    text: 'The mess food today was surprisingly... edible? Like, the paneer actually felt like paneer and not rubber. Did we get a new chef or is it just the sunset mood? The dal was actually seasoned for once. 🌅',
    imageUrl: null, tags: ['MessFood', 'HostelLife'],
    score: 1200, commentCount: 89,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  '3': {
    _id: '3', anonymousEmoji: '🦄', anonymousName: 'Glitter Uni',
    category: 'Reviews',
    text: 'The new coffee shop near the main gate is a total vibe. ☕️ Cold brew is 10/10, plays actual good indie music, and prices are student-friendly — iced coffee is just ₹80.',
    imageUrl: null, tags: ['CafeReview', 'CampusVibes'],
    score: 854, commentCount: 23,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  '4': {
    _id: '4', anonymousEmoji: '🦉', anonymousName: 'Night Owl',
    category: 'Rants',
    text: "Why does the WiFi in Hostel Block C work perfectly at 3 AM but completely dies during online classes? Admin said they'll 'look into it' three months ago. 📡💀",
    imageUrl: null, tags: ['WiFi', 'HostelProblems'],
    score: 567, commentCount: 34,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  '5': {
    _id: '5', anonymousEmoji: '🐸', anonymousName: 'Chilled Frog',
    category: 'General',
    text: 'Unpopular opinion: The campus at 6 AM is genuinely the most beautiful thing ever. Peacocks near the sports complex. The mist over the football ground. Try it once before you graduate. 🌄',
    imageUrl: null, tags: ['CampusLife', 'MorningVibes'],
    score: 923, commentCount: 41,
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
}

const MOCK_COMMENTS = {
  '1': [
    {
      _id: 'c1', anonymousEmoji: '🐼', anonymousName: 'Sleepy Panda',
      text: "I have them! Check the Block C Telegram group, I uploaded the scanned PDF there yesterday. Good luck with the exam — Sharma sir's papers are usually tricky but he repeats questions from 2021.",
      score: 15, createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
      userVote: null,
      replies: [
        {
          _id: 'r1', anonymousEmoji: '🦊', anonymousName: 'Silent Fox',
          text: 'You are a lifesaver! Just found it. Thank you so much! 🙏',
          score: 8, createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
          userVote: 'up', replies: [],
        },
        {
          _id: 'r2', anonymousEmoji: '🐧', anonymousName: 'Cool Penguin',
          text: 'Can you share the link here too? Not in that group 😅',
          score: 3, createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
          userVote: null, replies: [],
        },
        {
          _id: 'r3', anonymousEmoji: '🦁', anonymousName: 'Bold Lion',
          text: 'Same here, please share the link!',
          score: 1, createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
          userVote: null, replies: [],
        },
      ],
    },
    {
      _id: 'c2', anonymousEmoji: '🦉', anonymousName: 'Night Owl',
      text: "Wait, there's a Unit 4? I thought we only had 3 units for this midterm... 💀",
      score: 45, createdAt: new Date(Date.now() - 80 * 60000).toISOString(),
      userVote: 'up', replies: [],
    },
    {
      _id: 'c3', anonymousEmoji: '🐧', anonymousName: 'Cool Penguin',
      text: "Honestly, the marking for DBMS is so random. Just focus on the diagrams, that's what he likes.",
      score: 8, createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      userVote: null, replies: [],
    },
  ],
}

const TRENDING_TAGS = [
  'DBMS', 'LibraryAC', 'MessHeist', 'Convocation', 'WiFiWoes', 'HostelLife',
]

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */

const CAT_STYLES = {
  Academic: { bg: 'rgba(176,13,106,0.07)',  color: '#b00d6a', border: 'rgba(176,13,106,0.12)' },
  Hostel:   { bg: 'rgba(154,52,18,0.07)',   color: '#9a3412', border: 'rgba(154,52,18,0.12)' },
  Rants:    { bg: 'rgba(180,19,64,0.07)',   color: '#b41340', border: 'rgba(180,19,64,0.12)' },
  General:  { bg: 'rgba(34,197,94,0.08)',   color: '#16a34a', border: 'rgba(34,197,94,0.14)' },
  Reviews:  { bg: 'rgba(249,115,22,0.08)',  color: '#ea6c00', border: 'rgba(249,115,22,0.14)' },
}

const REPLIES_PREVIEW = 2  // max replies shown before "View more"

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

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
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

function insertReplyRecursive(comments, parentId, newReply) {
  return comments.map(c => {
    if (c._id === parentId) return { ...c, replies: [...(c.replies || []), newReply] }
    if (c.replies?.length) return { ...c, replies: insertReplyRecursive(c.replies, parentId, newReply) }
    return c
  })
}

/* ─────────────────────────────────────────────────────────────
   MINI LIVE PULSE
───────────────────────────────────────────────────────────── */

const PULSE_TEMPLATES = [
  () => ({ icon: '🟢', text: `${Math.floor(Math.random() * 5) + 2} people viewing this` }),
  () => ({ icon: '💬', text: `${Math.floor(Math.random() * 4) + 1} new replies recently` }),
  () => ({ icon: '📈', text: `Gained +${Math.floor(Math.random() * 15) + 5} votes today` }),
  () => ({ icon: '✨', text: `${Math.floor(Math.random() * 3) + 1} people typing a reply…` }),
]

function MiniPulse() {
  const [idx, setIdx] = useState(0)
  const [msg, setMsg] = useState(PULSE_TEMPLATES[0]())

  useEffect(() => {
    const t = setInterval(() => {
      setIdx(prev => {
        const next = (prev + 1) % PULSE_TEMPLATES.length
        setMsg(PULSE_TEMPLATES[next]())
        return next
      })
    }, 4500)
    return () => clearInterval(t)
  }, [])
  

  return (
    <div style={{ padding: '0.5rem 1.25rem 0.75rem', borderTop: '1px solid rgba(234,225,213,0.2)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.75rem', color: '#b3a898', fontWeight: 500,
          }}
        >
          <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>{msg.icon}</span>
          <span>{msg.text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SINGLE COMMENT ROW (inline, no external CommentCard dep issue)
───────────────────────────────────────────────────────────── */

function CommentRow({ comment, postAuthorName, user, onReply, postId, depth = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [vote, setVote] = useState(comment.userVote)
  const [score, setScore] = useState(comment.score)
  const [showAllReplies, setShowAllReplies] = useState(false)

  const replies = comment.replies || []
  const visibleReplies = showAllReplies ? replies : replies.slice(0, REPLIES_PREVIEW)
  const hiddenCount = replies.length - REPLIES_PREVIEW

  const doVote = useCallback((dir) => {
    const prev = vote
    let nv, d = 0
    if (prev === dir) { nv = null; d = dir === 'up' ? -1 : 1 }
    else { nv = dir; d = prev === null ? (dir === 'up' ? 1 : -1) : (dir === 'up' ? 2 : -2) }
    setVote(nv); setScore(s => s + d)
  }, [vote])

  const handleReplySubmit = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setSubmitting(true)
    await submitReply(postId, comment._id, replyText.trim())
    onReply(comment._id, replyText.trim())
    setReplyText('')
    setShowReplyForm(false)
    setSubmitting(false)
    setShowAllReplies(true)
  }

  const isOP = comment.anonymousName === postAuthorName
  const indentLeft = depth * 20

  return (
    <div style={{ marginLeft: indentLeft, position: 'relative' }}>
      {/* Thread line for replies */}
      {depth > 0 && (
        <div style={{
          position: 'absolute', left: -12, top: 0, bottom: 0,
          width: 2, background: 'rgba(234,225,213,0.5)', borderRadius: 1,
        }} />
      )}

      <div style={{
        background: depth > 0 ? 'rgba(253,246,236,0.5)' : '#ffffff',
        border: '1px solid rgba(234,225,213,0.4)',
        borderRadius: 14, padding: '0.875rem 1rem',
        transition: 'box-shadow 0.2s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #fde8c8, #fbd4e8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.875rem', flexShrink: 0,
            border: '1px solid rgba(211,200,185,0.3)',
          }}>{comment.anonymousEmoji}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '0.8125rem', color: '#2e2318',
              whiteSpace: 'nowrap',
            }}>{comment.anonymousName}</span>
            {isOP && (
              <span style={{
                fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'linear-gradient(135deg, #ec4899, #fb923c)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>OP</span>
            )}
            <span style={{
              fontSize: '0.7rem', color: '#b3a898', fontWeight: 500, marginLeft: 'auto',
              flexShrink: 0,
            }}>{timeAgo(comment.createdAt)}</span>
          </div>
        </div>

        {/* Text */}
        <p style={{
          fontSize: '0.875rem', lineHeight: 1.65,
          color: '#3d2f1e', marginBottom: '0.625rem',
        }}>{comment.text}</p>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {/* Vote */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1px',
            background: 'rgba(248,240,229,0.8)', borderRadius: 9999,
            padding: '2px',
          }}>
            <button onClick={() => doVote('up')} style={{
              width: 26, height: 26, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
              background: vote === 'up' ? 'linear-gradient(135deg,#ec4899,#fb923c)' : 'transparent',
              color: vote === 'up' ? '#fff' : '#9c8b7a',
              transition: 'all 0.15s',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_upward</span>
            </button>
            <span style={{
              padding: '0 0.3rem', fontSize: '0.75rem', fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: vote === 'up' ? '#b00d6a' : vote === 'down' ? '#b41340' : '#3d2f1e',
              minWidth: '1.25rem', textAlign: 'center',
            }}>{formatScore(score)}</span>
            <button onClick={() => doVote('down')} style={{
              width: 26, height: 26, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
              background: vote === 'down' ? 'rgba(180,19,64,0.08)' : 'transparent',
              color: vote === 'down' ? '#b41340' : '#9c8b7a',
              transition: 'all 0.15s',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_downward</span>
            </button>
          </div>

          {/* Reply trigger — only at depth 0 */}
          {depth === 0 && (
            <button
              onClick={() => setShowReplyForm(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                background: showReplyForm ? 'rgba(176,13,106,0.07)' : 'none',
                border: 'none', cursor: 'pointer',
                color: showReplyForm ? '#b00d6a' : '#9c8b7a',
                fontSize: '0.75rem', fontWeight: 700,
                padding: '4px 8px', borderRadius: 8,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'all 0.15s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>reply</span>
              Reply
            </button>
          )}
        </div>

        {/* Reply form */}
        <AnimatePresence>
          {showReplyForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              onSubmit={handleReplySubmit}
              style={{ marginTop: '0.75rem', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write a reply…"
                  rows={2}
                  style={{
                    flex: 1, resize: 'none',
                    padding: '0.625rem 0.875rem',
                    background: '#fff',
                    border: '1px solid rgba(211,200,185,0.5)',
                    borderRadius: 10, outline: 'none',
                    fontSize: '0.875rem', lineHeight: 1.5,
                    color: '#3d2f1e', fontFamily: 'inherit',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(176,13,106,0.35)'
                    e.target.style.boxShadow = '0 0 0 3px rgba(176,13,106,0.06)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(211,200,185,0.5)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || submitting}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg,#ec4899,#fb923c)',
                    color: '#fff', border: 'none', borderRadius: 9999,
                    fontWeight: 700, fontSize: '0.8125rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                    opacity: replyText.trim() ? 1 : 0.45,
                    transition: 'opacity 0.15s, transform 0.15s',
                    flexShrink: 0,
                  }}
                >
                  {submitting ? '…' : 'Reply'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div style={{ marginTop: '0.375rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <AnimatePresence initial={false}>
            {visibleReplies.map((reply, i) => (
              <motion.div
                key={reply._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, delay: i * 0.04 }}
              >
                <CommentRow
                  comment={reply}
                  postAuthorName={postAuthorName}
                  user={user}
                  onReply={onReply}
                  postId={postId}
                  depth={depth + 1}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* View more replies */}
          {!showAllReplies && hiddenCount > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowAllReplies(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                background: 'rgba(248,240,229,0.6)',
                border: '1px solid rgba(234,225,213,0.5)',
                borderRadius: 9999, padding: '0.3125rem 0.875rem',
                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                color: '#b00d6a',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginLeft: 20,
                alignSelf: 'flex-start',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(176,13,106,0.08)'
                e.currentTarget.style.borderColor = 'rgba(176,13,106,0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(248,240,229,0.6)'
                e.currentTarget.style.borderColor = 'rgba(234,225,213,0.5)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>expand_more</span>
              View {hiddenCount} more {hiddenCount === 1 ? 'reply' : 'replies'}
            </motion.button>
          )}

          {/* Collapse */}
          {showAllReplies && replies.length > REPLIES_PREVIEW && (
            <button
              onClick={() => setShowAllReplies(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.7rem', fontWeight: 600, color: '#b3a898',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginLeft: 20, padding: '0.25rem 0',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>expand_less</span>
              Collapse
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   RELATED POSTS SECTION
───────────────────────────────────────────────────────────── */

function RelatedPosts({ currentPostId, currentCategory }) {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetchRelatedPosts(currentPostId, currentCategory).then(setPosts)
  }, [currentPostId, currentCategory])

  if (!posts.length) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 }}
      style={{ marginTop: '2.5rem' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '1rem', fontWeight: 800, color: '#3d2f1e', flexShrink: 0,
        }}>More like this</h2>
        <div style={{
          height: 1, flex: 1,
          background: 'linear-gradient(to right, rgba(211,200,185,0.5), transparent)',
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {posts.map((p, i) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.28 + i * 0.07 }}
          >
            <PostCard {...p} />
          </motion.div>
        ))}
      </div>

      {/* Trending tags */}
      <div style={{ marginTop: '1.25rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#ea6c00' }}>trending_up</span>
          <span style={{
            fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'rgba(61,47,30,0.35)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>Trending</span>
        </div>
        <div style={{
          display: 'flex', gap: '0.375rem',
          overflowX: 'auto', paddingBottom: 2,
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        }}>
          {TRENDING_TAGS.map(tag => (
            <Link key={tag} href={`/search?q=${tag}`} style={{
              padding: '0.3rem 0.75rem', borderRadius: 9999,
              background: 'rgba(242,234,222,0.6)',
              border: '1px solid rgba(211,200,185,0.3)',
              color: '#6b5240', fontSize: '0.75rem', fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'background 0.15s, color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.color = '#9a3412' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(242,234,222,0.6)'; e.currentTarget.style.color = '#6b5240' }}
            >#{tag}</Link>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const commentFormRef = useRef(null)

  const [post, setPost] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [commentCount, setCommentCount] = useState(0)
  const [postVote, setPostVote] = useState(null)
  const [postScore, setPostScore] = useState(0)
  const [copied, setCopied] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  /* Load post + comments */
  useEffect(() => {
    if (!params.id) return

    const loadData = async () => {
      setPageLoading(true)
      const [p, c] = await Promise.all([fetchPost(params.id), fetchComments(params.id)])
      setPost(p)
      setComments(c)
      setCommentCount(p?.commentCount || c.length)
      setPostScore(p?.score || 0)
      setPostVote(p?.userVote === 1 ? 'up' : p?.userVote === -1 ? 'down' : null)
      setPageLoading(false)
    }

    loadData()
  }, [params.id])


  /* Auth guard */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  const handlePostVote = useCallback((dir) => {
    const prev = postVote
    let newVote = null
    let delta = 0

    if (prev === dir) {
      newVote = null
      delta = dir === 'up' ? -1 : 1
    } else {
      newVote = dir
      delta = prev === null ? (dir === 'up' ? 1 : -1) : (dir === 'up' ? 2 : -2)
    }

    setPostVote(newVote)
    setPostScore((score) => score + delta)

    submitVote(params.id, newVote)
      .then((updatedPost) => {
        setPost((current) => current ? { ...current, ...updatedPost } : updatedPost)
        setPostVote(updatedPost?.userVote === 1 ? 'up' : updatedPost?.userVote === -1 ? 'down' : null)
        setPostScore(updatedPost?.score || 0)
      })
      .catch(() => {
        setPostVote(prev)
        setPostScore((score) => score - delta)
      })
  }, [params.id, postVote])


  const handleNewComment = useCallback(async (text) => {
    const result = await submitComment(params.id, text)
    const createdComment = result?.comment
    const isVisible = createdComment?.visibility === 'visible' || createdComment?.visibility === undefined || createdComment?.visibility === null

    if (createdComment && isVisible) {
      setComments(prev => [{ ...createdComment, replies: createdComment.replies || [] }, ...prev])
      setCommentCount(c => c + 1)
      return
    }

    if (result?.toxicity?.score >= 0.6 || createdComment?.moderationStatus === 'toxic') {
      alert('Your comment was hidden for review because it was detected as toxic.')
    }
  }, [params.id])

  const handleReply = useCallback(async (parentId, text) => {
    const result = await submitReply(params.id, parentId, text)
    const newReply = result?.comment
    const isVisible = newReply?.visibility === 'visible' || newReply?.visibility === undefined || newReply?.visibility === null

    if (newReply && isVisible) {
      setComments(prev => insertReplyRecursive(prev, parentId, { ...newReply, replies: newReply.replies || [] }))
      setCommentCount(c => c + 1)
      return
    }

    if (result?.toxicity?.score >= 0.6 || newReply?.moderationStatus === 'toxic') {
      alert('Your reply was hidden for review because it was detected as toxic.')
    }
  }, [params.id])

  const handleShare = useCallback(async () => {
    try { await navigator.clipboard.writeText(window.location.href) }
    catch { /* fallback omitted for brevity */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  /* ── Loading ── */
  if (authLoading || !isAuthenticated || pageLoading) {
    return (
      <div className="app-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid #eae1d5', borderTopColor: '#ec4899',
          borderRadius: '50%', animation: 'ttSpin 0.6s linear infinite',
        }} />
      </div>
    )
  }

  /* ── Not Found ── */
  if (!post) {
    return (
      <div className="app-page" style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1rem', padding: '2rem', textAlign: 'center',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#e4dccf' }}>search_off</span>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '1.375rem', fontWeight: 800, color: '#3d2f1e',
        }}>Post not found</h1>
        <p style={{ color: '#9c8270', fontSize: '0.9rem' }}>This tea may have gone cold ☕</p>
        <Link href="/feed" style={{
          marginTop: '0.5rem',
          background: 'linear-gradient(135deg, #ec4899, #fb923c)',
          color: '#fff', padding: '0.6875rem 1.75rem',
          borderRadius: 9999, textDecoration: 'none',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700, fontSize: '0.875rem',
        }}>Back to Feed</Link>
      </div>
    )
  }

  const cs = CAT_STYLES[post.category] || CAT_STYLES.General

  /* ─────────────── RENDER ─────────────── */
  return (
    <>
      <style>{`
        @keyframes ttSpin { to { transform: rotate(360deg); } }

        .tt-post-detail-root { scrollbar-width: thin; scrollbar-color: rgba(211,200,185,0.5) transparent; }
        .tt-post-detail-root::-webkit-scrollbar { width: 4px; }
        .tt-post-detail-root::-webkit-scrollbar-thumb { background: rgba(211,200,185,0.5); border-radius: 2px; }

        .tt-vote-btn-lg {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer;
          transition: background 150ms ease, color 150ms ease, transform 150ms cubic-bezier(0.4,0,0.2,1);
        }
        .tt-vote-btn-lg:active { transform: scale(0.82); }

        .tt-action-btn {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 50%;
          border: none; cursor: pointer; background: none;
          transition: background 150ms ease, color 150ms ease, transform 150ms ease;
        }
        .tt-action-btn:active { transform: scale(0.88); }

        @media (max-width: 640px) {
          .tt-post-header-row { flex-direction: column; align-items: flex-start !important; gap: 0.625rem !important; }
        }
      `}</style>

      <div className="app-page tt-post-detail-root">
        <main style={{
          maxWidth: '46rem', margin: '0 auto',
          padding: '1.25rem 1rem 4rem',
        }}>

          {/* ── Back ── */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => router.back()}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9c8270', fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '0.75rem',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '1.25rem', padding: '0.375rem 0',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#b00d6a'}
            onMouseLeave={e => e.currentTarget.style.color = '#9c8270'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_back</span>
            Feed
          </motion.button>

          {/* ════════════ POST CARD ════════════ */}
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background: '#ffffff',
              borderRadius: 18,
              overflow: 'hidden',
              border: '1px solid rgba(211,200,185,0.45)',
              boxShadow: '0 1px 3px rgba(80,55,30,0.05), 0 4px 14px rgba(80,55,30,0.04)',
              marginBottom: '1.75rem',
            }}
          >
            {/* Header */}
            <div className="tt-post-header-row" style={{
              padding: '1.125rem 1.25rem 0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fde8c8, #fbd4e8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', flexShrink: 0,
                  border: '1.5px solid rgba(211,200,185,0.4)',
                }}>{post.anonymousEmoji}</div>
                <div>
                  <p style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800, fontSize: '1rem', color: '#2e2318', lineHeight: 1.2,
                  }}>{post.anonymousName}</p>
                  <p style={{
                    fontSize: '0.75rem', color: '#b3a898', fontWeight: 500,
                    marginTop: 2, display: 'flex', alignItems: 'center', gap: '0.375rem',
                  }}>
                    <span>{timeAgo(post.createdAt)}</span>
                    <span style={{ width: 3, height: 3, background: '#d4c8ba', borderRadius: '50%', display: 'inline-block' }} />
                    <span style={{ color: cs.color, fontWeight: 700 }}>{post.category}</span>
                  </p>
                </div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 9999,
                background: cs.bg, color: cs.color, border: `1px solid ${cs.border}`,
                fontSize: '0.6rem', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                flexShrink: 0,
              }}>#{post.category}</span>
            </div>

            {/* Text */}
            <div style={{ padding: '0 1.25rem 0.75rem' }}>
              <p style={{
                fontSize: '0.9375rem', lineHeight: 1.75, color: '#3d2f1e',
                fontWeight: 400, whiteSpace: 'pre-wrap',
              }}>{post.text}</p>

              {post.tags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.875rem' }}>
                  {post.tags.map(tag => (
                    <span key={tag} style={{
                      padding: '3px 9px', borderRadius: 9999,
                      background: 'rgba(242,234,222,0.7)', color: '#9a7c5e',
                      fontSize: '0.6875rem', fontWeight: 600,
                      border: '1px solid rgba(211,200,185,0.3)',
                    }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Image */}
            {post.imageUrl && (
              <div style={{ padding: '0 1.25rem 0.875rem' }}>
                <div style={{
                  borderRadius: 12, overflow: 'hidden',
                  border: '1px solid rgba(211,200,185,0.3)',
                }}>
                  <img src={post.imageUrl} alt="Post image" style={{
                    width: '100%', height: 'auto', maxHeight: 460,
                    objectFit: 'cover', display: 'block',
                  }} />
                </div>
              </div>
            )}

            {/* Action bar */}
            <div style={{
              padding: '0.625rem 1.125rem',
              borderTop: '1px solid rgba(211,200,185,0.25)',
              background: 'rgba(253,246,236,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              {/* Left: vote + comment count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Vote cluster */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '1px',
                  background: 'rgba(248,240,229,0.9)',
                  borderRadius: 11, padding: '2px',
                  border: '1px solid rgba(211,200,185,0.3)',
                }}>
                  <motion.button
                    whileTap={{ scale: 1.22 }}
                    className="tt-vote-btn-lg"
                    onClick={() => handlePostVote('up')}
                    style={{
                      background: postVote === 'up' ? 'linear-gradient(135deg,#ec4899,#fb923c)' : 'transparent',
                      color: postVote === 'up' ? '#fff' : '#9c8b7a',
                      boxShadow: postVote === 'up' ? '0 2px 8px rgba(236,72,153,0.22)' : 'none',
                    }}
                    aria-label="Upvote"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 19 }}>arrow_upward</span>
                  </motion.button>

                  <motion.span
                    key={postScore}
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 14 }}
                    style={{
                      padding: '0 0.5rem',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800, fontSize: '0.875rem',
                      color: postVote === 'up' ? '#b00d6a' : postVote === 'down' ? '#b41340' : '#3d2f1e',
                      minWidth: '2rem', textAlign: 'center',
                    }}
                  >{formatScore(postScore)}</motion.span>

                  <motion.button
                    whileTap={{ scale: 1.22 }}
                    className="tt-vote-btn-lg"
                    onClick={() => handlePostVote('down')}
                    style={{
                      background: postVote === 'down' ? 'rgba(180,19,64,0.09)' : 'transparent',
                      color: postVote === 'down' ? '#b41340' : '#9c8b7a',
                    }}
                    aria-label="Downvote"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 19 }}>arrow_downward</span>
                  </motion.button>
                </div>

                {/* Comment count */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  color: '#9c8b7a', fontSize: '0.8125rem', fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  padding: '0.375rem 0.5rem',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 17 }}>chat_bubble</span>
                  {commentCount}
                </div>
              </div>

              {/* Right: share + report */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <button
                  className="tt-action-btn"
                  onClick={handleShare}
                  style={{ color: copied ? '#16a34a' : '#b3a898' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.color = '#ea6c00' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = copied ? '#16a34a' : '#b3a898' }}
                  aria-label="Share"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {copied ? 'check' : 'share'}
                  </span>
                </button>
                <button
                  className="tt-action-btn"
                  onClick={() => setReportOpen(true)}
                  style={{ color: '#b3a898' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#b41340' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#b3a898' }}
                  aria-label="Report"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>flag</span>
                </button>
              </div>
            </div>

            {/* Live pulse */}
            <MiniPulse />
          </motion.article>

          {/* ════════════ DISCUSSION ════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
          >
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.125rem' }}>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1rem', fontWeight: 800, color: '#3d2f1e', flexShrink: 0,
              }}>Discussion</h2>
              <div style={{
                height: 1, flex: 1,
                background: 'linear-gradient(to right, rgba(211,200,185,0.5), transparent)',
              }} />
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, color: '#b3a898',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
            </div>

            {/* Inline comment form — always visible, no FAB */}
            <div
              ref={commentFormRef}
              style={{ marginBottom: '1.25rem' }}
            >
              <CommentForm user={user} onSubmit={handleNewComment} placeholder="Add to the discussion…" />
            </div>

            {/* Comments list */}
            {comments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <AnimatePresence initial={false}>
                  {comments.map((comment, i) => (
                    <motion.div
                      key={comment._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, delay: i * 0.04 }}
                    >
                      <CommentRow
                        comment={comment}
                        postAuthorName={post.anonymousName}
                        user={user}
                        onReply={handleReply}
                        postId={params.id}
                        depth={0}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '2.25rem 1.5rem',
                background: '#fff', borderRadius: 14,
                border: '1px solid rgba(211,200,185,0.35)',
              }}>
                <span className="material-symbols-outlined" style={{
                  fontSize: 36, color: '#e4dccf', display: 'block', marginBottom: '0.5rem',
                }}>chat_bubble_outline</span>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.9rem', color: '#9c8270',
                }}>No comments yet</p>
                <p style={{ fontSize: '0.8rem', color: '#b3a898', marginTop: '0.25rem' }}>
                  Be the first to share your thoughts ☕
                </p>
              </div>
            )}
          </motion.section>

          {/* ════════════ RELATED ════════════ */}
          <RelatedPosts currentPostId={post._id} currentCategory={post.category} />
        </main>

        {/* Report Modal */}
        <ReportModal
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
          onSubmit={async (data) => console.log('Report:', post._id, data)}
          targetType="post"
        />

        {/* Copied toast */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              style={{
                position: 'fixed', bottom: '4.5rem', left: '50%',
                transform: 'translateX(-50%)',
                background: '#2e2318', color: '#fff',
                padding: '0.5625rem 1.125rem',
                borderRadius: 9999,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: '0.8125rem',
                zIndex: 10000,
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#22c55e' }}>check_circle</span>
              Link copied!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
