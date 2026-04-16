'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'
import api from '@/lib/axios'

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
  const [items, setItems] = useState([])
  const [statusFilter, setStatusFilter] = useState('pending')
  const [typeFilter, setTypeFilter] = useState('all')
  const [actionDone, setActionDone] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
    if (!authLoading && isAuthenticated && user?.role !== 'admin') router.push('/feed')
  }, [authLoading, isAuthenticated, user, router])

  const loadItems = async (status = statusFilter, type = typeFilter) => {
    try {
      setLoadingData(true)
      const res = await api.get('/admin/flagged-content', {
        params: {
          status,
          type: type === 'all' ? 'all' : type === 'post' ? 'Post' : 'Comment',
        },
      })
      setItems(Array.isArray(res.data?.items) ? res.data.items : [])
    } catch (error) {
      console.error('Failed to load flagged content', error)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return
    loadItems()
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return
    loadItems(statusFilter, typeFilter)
  }, [statusFilter, typeFilter])

  const filtered = useMemo(() => items, [items])

  const handleAction = async (item, action) => {
    try {
      if (action === 'approve') {
        await api.patch(`/admin/content/${item.targetId}/moderation`, {
          targetType: item.targetType,
          status: 'normal',
          reason: 'Approved by admin review',
        })
        setActionDone('Content approved')
      } else if (action === 'remove') {
        await api.patch(`/admin/content/${item.targetId}/moderation`, {
          targetType: item.targetType,
          status: 'toxic',
          reason: 'Confirmed toxic by admin review',
        })
        setActionDone('Content removed')
      } else if (action === 'ban') {
        if (item.authorId) {
          await api.patch(`/admin/users/${item.authorId}/ban`, {
            banned: true,
            reason: 'Banned from flagged content review',
          })
        }
        await api.patch(`/admin/content/${item.targetId}/moderation`, {
          targetType: item.targetType,
          status: 'toxic',
          reason: 'Content removed and user banned by admin',
        })
        setActionDone('User banned and content removed')
      }

      await loadItems(statusFilter, typeFilter)
      setTimeout(() => setActionDone(null), 2000)
    } catch (error) {
      alert(error?.response?.data?.message || 'Admin action failed')
    }
  }

  if (authLoading || !isAuthenticated || user?.role !== 'admin' || loadingData) {
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

  const averageToxicity = filtered.length
    ? Math.round(filtered.reduce((sum, item) => sum + item.moderationScore, 0) / filtered.length)
    : 0

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
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#b00d6a', marginBottom: '0.5rem' }}>Moderation Queue</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #b00d6a, #904800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Flagged Content</h2>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: '#efe7dc', borderRadius: 9999, padding: 4 }}>
                {['pending', 'reviewed'].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '0.5rem 1.25rem', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'capitalize', background: statusFilter === s ? '#ffffff' : 'transparent', color: statusFilter === s ? '#322e28' : '#5f5b53', boxShadow: statusFilter === s ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}>{s}</button>
                ))}
              </div>
              <div style={{ display: 'flex', background: '#efe7dc', borderRadius: 9999, padding: 4 }}>
                {[{ k: 'all', l: 'All' }, { k: 'post', l: 'Posts' }, { k: 'comment', l: 'Comments' }].map(({ k, l }) => (
                  <button key={k} onClick={() => setTypeFilter(k)} style={{ padding: '0.5rem 1rem', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700, background: typeFilter === k ? '#ffffff' : 'transparent', color: typeFilter === k ? '#322e28' : '#5f5b53', boxShadow: typeFilter === k ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <style>{`@media (min-width: 1024px) { .admin-two-col { grid-template-columns: 2fr 1fr !important; } }`}</style>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filtered.map((item) => {
              const sev = severityStyle(item.severity)
              return (
                <div key={item.id} style={{ background: '#ffffff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 20px 40px rgba(50,46,40,0.06)', borderLeft: `4px solid ${sev.border}`, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f8f0e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{item.anonymousEmoji}</div>
                      <div>
                        <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: '#322e28' }}>{item.anonymousName}</h4>
                        <p style={{ fontSize: '0.75rem', color: '#7b766e' }}>{item.type === 'post' ? 'Post' : 'Comment'} • Reported {timeAgo(item.createdAt)}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: 9999, background: sev.bg }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: sev.color }}>{item.severity === 'critical' ? 'priority_high' : 'info'}</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: sev.color, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{sev.label}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '1rem', color: '#322e28', lineHeight: 1.65, marginBottom: '1rem', fontStyle: item.type === 'comment' ? 'italic' : 'normal' }}>"{item.text}"</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1.5rem' }}>
                    {item.reasons.map((r) => (
                      <span key={r} style={{ padding: '0.375rem 0.875rem', borderRadius: 9999, background: '#f8f0e5', fontSize: '0.75rem', fontWeight: 600, color: '#5f5b53', border: '1px solid rgba(179,172,163,0.15)' }}>{r}</span>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#f8f0e5', padding: '1rem', borderRadius: '0.75rem' }}>
                      <p style={{ fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3aca3', marginBottom: '0.25rem' }}>REPORTS</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#322e28', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.reportCount}</p>
                    </div>
                    <div style={{ background: '#f8f0e5', padding: '1rem', borderRadius: '0.75rem' }}>
                      <p style={{ fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3aca3', marginBottom: '0.25rem' }}>AI SCORE</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Plus Jakarta Sans', sans-serif", color: item.moderationScore > 80 ? '#b41340' : item.moderationScore > 40 ? '#904800' : '#22c55e' }}>{item.moderationScore}%</p>
                    </div>
                    <div style={{ background: '#f8f0e5', padding: '1rem', borderRadius: '0.75rem' }}>
                      <p style={{ fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3aca3', marginBottom: '0.25rem' }}>REASON</p>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#5f5b53' }}>{item.mainReason}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(179,172,163,0.1)', flexWrap: 'wrap' }}>
                    <button onClick={() => handleAction(item, 'approve')} style={{ padding: '0.625rem 1.5rem', borderRadius: 9999, background: '#e4dccf', color: '#322e28', border: 'none', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>Approve</button>
                    <button onClick={() => handleAction(item, 'remove')} style={{ padding: '0.625rem 1.5rem', borderRadius: 9999, background: '#b41340', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>Remove</button>
                    {item.severity === 'critical' && (
                      <button onClick={() => handleAction(item, 'ban')} style={{ padding: '0.625rem 1.5rem', borderRadius: 9999, background: '#322e28', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>Ban User</button>
                    )}
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#ffffff', borderRadius: '1rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#eae1d5' }}>check_circle</span>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: '#7b766e', marginTop: '1rem' }}>Queue is clear!</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #b00d6a, #904800)', padding: '2rem', borderRadius: '1.5rem', color: '#ffffff', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(176,13,106,0.2)' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', right: -16, bottom: -16, fontSize: 96, opacity: 0.1, color: '#ffffff' }}>monitoring</span>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.375rem', marginBottom: '0.5rem' }}>Toxicity Pulse</h3>
              <p style={{ opacity: 0.8, fontSize: '0.8125rem', marginBottom: '1.5rem' }}>Live moderation view from hidden posts and comments.</p>
              {[
                { label: 'Average Toxicity', value: `${averageToxicity}%`, width: Math.max(6, averageToxicity) },
                { label: 'Queue Size', value: `${filtered.length}`, width: Math.min(100, Math.max(6, filtered.length * 10)) },
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

            <div style={{ background: '#f8f0e5', padding: '2rem', borderRadius: '1.25rem' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, color: '#322e28', marginBottom: '1rem' }}>Guidelines</h3>
              {[
                { color: '#b41340', text: 'Approve only after confirming the content is safe to restore' },
                { color: '#b00d6a', text: 'Remove content that remains toxic after review' },
                { color: '#904800', text: 'Use ban for repeated or severe abuse' },
              ].map((g) => (
                <div key={g.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#322e28' }}>{g.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {actionDone && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: '#322e28', color: '#ffffff', padding: '0.875rem 2rem', borderRadius: 9999, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.875rem', zIndex: 200, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', animation: 'toastIn 0.3s ease' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#22c55e' }}>check_circle</span>
          {actionDone}
        </div>
      )}
    </div>
  )
}
