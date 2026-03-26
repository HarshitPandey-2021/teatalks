'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'

const FLAGGED_ITEMS = [
  {
    id: 'f1', type: 'post', status: 'pending', severity: 'critical',
    anonymousEmoji: '🐍', anonymousName: 'Silent Snake',
    text: "I honestly can't believe how stupid people are being about this campus policy. If you don't like it, just leave. We don't need your kind of thinking here anyway.",
    reasons: ['Hate Speech', 'Harassment'],
    reportCount: 12, moderationScore: 94, mainReason: 'Incitement',
    createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
  },
  {
    id: 'f2', type: 'comment', status: 'pending', severity: 'low',
    anonymousEmoji: '🐸', anonymousName: 'Chilled Frog',
    text: "This whole thread is just spam at this point. Why is this even allowed? Mods are sleeping as usual.",
    reasons: ['Spam'],
    reportCount: 2, moderationScore: 12, mainReason: 'Spam',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'f3', type: 'post', status: 'pending', severity: 'critical',
    anonymousEmoji: '🦊', anonymousName: 'Golden Fox',
    text: "Someone needs to teach the admin office a lesson. They can't keep treating students like this. I know where they park their cars.",
    reasons: ['Threat', 'Personal Info'],
    reportCount: 8, moderationScore: 91, mainReason: 'Threat',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'f4', type: 'comment', status: 'pending', severity: 'medium',
    anonymousEmoji: '🦋', anonymousName: 'Velvet Wing',
    text: "Check out this amazing crypto opportunity! DM me for free Bitcoin. Guaranteed 10x returns in 24 hours! 🚀💰",
    reasons: ['Spam', 'Scam'],
    reportCount: 5, moderationScore: 45, mainReason: 'Commercial Spam',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'f5', type: 'post', status: 'reviewed', severity: 'low',
    anonymousEmoji: '🐼', anonymousName: 'Sleepy Panda',
    text: "The mess food is literally poison. Anyone who eats there is an absolute fool. No wonder everyone is always sick.",
    reasons: ['Inappropriate'],
    reportCount: 3, moderationScore: 38, mainReason: 'Inappropriate',
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
]

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function AdminFlaggedPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  const [items, setItems] = useState(FLAGGED_ITEMS)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [typeFilter, setTypeFilter] = useState('all')
  const [actionDone, setActionDone] = useState(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
    if (!authLoading && isAuthenticated && user?.role !== 'admin') router.push('/feed')
  }, [authLoading, isAuthenticated, user, router])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      if (typeFilter !== 'all' && item.type !== typeFilter) return false
      return true
    })
  }, [items, statusFilter, typeFilter])

  const handleAction = (id, action) => {
    if (action === 'approve') {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: 'reviewed' } : i))
      showToast('Content approved')
    } else if (action === 'remove') {
      setItems((prev) => prev.filter((i) => i.id !== id))
      showToast('Content removed')
    } else if (action === 'ban') {
      setItems((prev) => prev.filter((i) => i.id !== id))
      showToast('User banned & content removed')
    }
  }

  const showToast = (msg) => {
    setActionDone(msg)
    setTimeout(() => setActionDone(null), 2000)
  }

  if (authLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#fdf5eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #eae1d5', borderTopColor: '#b00d6a', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const severityStyle = (s) => {
    if (s === 'critical') return { bg: 'rgba(180,19,64,0.08)', color: '#b41340', border: '#b41340', label: 'Critical' }
    if (s === 'medium') return { bg: 'rgba(144,72,0,0.08)', color: '#904800', border: 'rgba(144,72,0,0.3)', label: 'Medium' }
    return { bg: 'rgba(179,172,163,0.1)', color: '#904800', border: 'rgba(179,172,163,0.3)', label: 'Low' }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf5eb' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        ::selection { background: #ff6daf; color: #4b002a; }
        @keyframes toastIn { 0% { opacity:0; transform:translate(-50%,10px); } 100% { opacity:1; transform:translate(-50%,0); } }
      `}</style>

      <AdminSidebar activePage="flagged" />

      <main className="admin-main-content" style={{ padding: '2rem 1.5rem', maxWidth: '80rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#b00d6a', marginBottom: '0.5rem' }}>
            Moderation Queue
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800, letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #b00d6a, #904800)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Flagged Content</h2>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: '#efe7dc', borderRadius: 9999, padding: 4 }}>
                {['pending', 'reviewed'].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)} style={{
                    padding: '0.5rem 1.25rem', borderRadius: 9999, border: 'none', cursor: 'pointer',
                    fontSize: '0.8125rem', fontWeight: 700, transition: 'all 0.2s',
                    textTransform: 'capitalize',
                    background: statusFilter === s ? '#ffffff' : 'transparent',
                    color: statusFilter === s ? '#322e28' : '#5f5b53',
                    boxShadow: statusFilter === s ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  }}>{s}</button>
                ))}
              </div>
              <div style={{ display: 'flex', background: '#efe7dc', borderRadius: 9999, padding: 4 }}>
                {[{ k: 'all', l: 'All' }, { k: 'post', l: 'Posts' }, { k: 'comment', l: 'Comments' }].map(({ k, l }) => (
                  <button key={k} onClick={() => setTypeFilter(k)} style={{
                    padding: '0.5rem 1rem', borderRadius: 9999, border: 'none', cursor: 'pointer',
                    fontSize: '0.8125rem', fontWeight: 700, transition: 'all 0.2s',
                    background: typeFilter === k ? '#ffffff' : 'transparent',
                    color: typeFilter === k ? '#322e28' : '#5f5b53',
                    boxShadow: typeFilter === k ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  }}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="admin-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <style>{`@media (min-width: 1024px) { .admin-two-col { grid-template-columns: 2fr 1fr !important; } }`}</style>

          {/* Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filtered.map((item) => {
              const sev = severityStyle(item.severity)
              return (
                <div key={item.id} style={{
                  background: '#ffffff', borderRadius: '1rem',
                  padding: '2rem', boxShadow: '0 20px 40px rgba(50,46,40,0.06)',
                  borderLeft: `4px solid ${sev.border}`,
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: '#f8f0e5', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}>{item.anonymousEmoji}</div>
                      <div>
                        <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: '#322e28' }}>
                          {item.anonymousName}
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: '#7b766e' }}>
                          {item.type === 'post' ? 'Post' : 'Comment'} • Reported {timeAgo(item.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.25rem 0.75rem', borderRadius: 9999,
                      background: sev.bg,
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: sev.color }}>
                        {item.severity === 'critical' ? 'priority_high' : 'info'}
                      </span>
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: 800, color: sev.color,
                        textTransform: 'uppercase', letterSpacing: '0.02em',
                      }}>{sev.label}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <p style={{
                    fontSize: '1rem', color: '#322e28', lineHeight: 1.65,
                    marginBottom: '1rem',
                    fontStyle: item.type === 'comment' ? 'italic' : 'normal',
                  }}>"{item.text}"</p>

                  {/* Reason tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1.5rem' }}>
                    {item.reasons.map((r) => (
                      <span key={r} style={{
                        padding: '0.375rem 0.875rem', borderRadius: 9999,
                        background: '#f8f0e5', fontSize: '0.75rem',
                        fontWeight: 600, color: '#5f5b53',
                        border: '1px solid rgba(179,172,163,0.15)',
                      }}>{r}</span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#f8f0e5', padding: '1rem', borderRadius: '0.75rem' }}>
                      <p style={{ fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3aca3', marginBottom: '0.25rem' }}>REPORTS</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#322e28', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.reportCount}</p>
                    </div>
                    <div style={{ background: '#f8f0e5', padding: '1rem', borderRadius: '0.75rem' }}>
                      <p style={{ fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3aca3', marginBottom: '0.25rem' }}>AI SCORE</p>
                      <p style={{
                        fontSize: '1.5rem', fontWeight: 900,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: item.moderationScore > 80 ? '#b41340' : item.moderationScore > 40 ? '#904800' : '#22c55e',
                      }}>{item.moderationScore}%</p>
                    </div>
                    <div style={{ background: '#f8f0e5', padding: '1rem', borderRadius: '0.75rem' }}>
                      <p style={{ fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3aca3', marginBottom: '0.25rem' }}>REASON</p>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#5f5b53' }}>{item.mainReason}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex', justifyContent: 'flex-end',
                    gap: '0.625rem', paddingTop: '1.25rem',
                    borderTop: '1px solid rgba(179,172,163,0.1)',
                    flexWrap: 'wrap',
                  }}>
                    <button onClick={() => handleAction(item.id, 'approve')} style={{
                      padding: '0.625rem 1.5rem', borderRadius: 9999,
                      background: '#e4dccf', color: '#322e28',
                      border: 'none', fontWeight: 700, fontSize: '0.8125rem',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>Approve</button>
                    <button onClick={() => handleAction(item.id, 'remove')} style={{
                      padding: '0.625rem 1.5rem', borderRadius: 9999,
                      background: '#b41340', color: '#ffffff',
                      border: 'none', fontWeight: 700, fontSize: '0.8125rem',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>Remove</button>
                    {item.severity === 'critical' && (
                      <button onClick={() => handleAction(item.id, 'ban')} style={{
                        padding: '0.625rem 1.5rem', borderRadius: 9999,
                        background: '#322e28', color: '#ffffff',
                        border: 'none', fontWeight: 700, fontSize: '0.8125rem',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>Ban User</button>
                    )}
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '4rem 2rem',
                background: '#ffffff', borderRadius: '1rem',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#eae1d5' }}>check_circle</span>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: '#7b766e', marginTop: '1rem' }}>
                  Queue is clear!
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Toxicity Pulse */}
            <div style={{
              background: 'linear-gradient(135deg, #b00d6a, #904800)',
              padding: '2rem', borderRadius: '1.5rem',
              color: '#ffffff', position: 'relative', overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(176,13,106,0.2)',
            }}>
              <span className="material-symbols-outlined" style={{
                position: 'absolute', right: -16, bottom: -16,
                fontSize: 96, opacity: 0.1, color: '#ffffff',
              }}>monitoring</span>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.375rem', marginBottom: '0.5rem' }}>Toxicity Pulse</h3>
              <p style={{ opacity: 0.8, fontSize: '0.8125rem', marginBottom: '1.5rem' }}>Real-time AI community health monitoring.</p>
              {[
                { label: 'Average Toxicity', value: '24%', width: 24 },
                { label: 'Report Volatility', value: 'High', width: 78 },
              ].map((m) => (
                <div key={m.label} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                    <span>{m.label}</span><span>{m.value}</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.width}%`, background: '#ffffff', borderRadius: 9999, boxShadow: '0 0 10px rgba(255,255,255,0.5)' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Guidelines */}
            <div style={{ background: '#f8f0e5', padding: '2rem', borderRadius: '1.25rem' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, color: '#322e28', marginBottom: '1rem' }}>Guidelines</h3>
              {[
                { color: '#b41340', text: 'Zero tolerance for hate speech' },
                { color: '#b00d6a', text: 'AI scores >90% flag automatically' },
                { color: '#904800', text: '3 strikes policy enforced' },
              ].map((g) => (
                <div key={g.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#322e28' }}>{g.text}</span>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { icon: 'verified_user', value: '412', label: 'Actions Today', color: '#b00d6a' },
                { icon: 'hourglass_empty', value: '18', label: 'Avg Queue (m)', color: '#904800' },
              ].map((s) => (
                <div key={s.label} style={{
                  background: '#ffffff', padding: '1.25rem', borderRadius: '1.25rem',
                  boxShadow: '0 2px 12px rgba(50,46,40,0.04)',
                  border: '1px solid rgba(179,172,163,0.05)',
                }}>
                  <span className="material-symbols-outlined" style={{ color: s.color, fontSize: 22, marginBottom: '0.5rem', display: 'block' }}>{s.icon}</span>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '1.5rem', color: '#322e28' }}>{s.value}</p>
                  <p style={{ fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3aca3' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {actionDone && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%',
          transform: 'translateX(-50%)',
          background: '#322e28', color: '#ffffff',
          padding: '0.875rem 2rem', borderRadius: 9999,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700, fontSize: '0.875rem', zIndex: 200,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          animation: 'toastIn 0.3s ease',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#22c55e' }}>check_circle</span>
          {actionDone}
        </div>
      )}
    </div>
  )
}