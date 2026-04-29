'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
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
  const { error: showErrorToast } = useToast()
  const router = useRouter()
  const [items, setItems] = useState([])
  const [statusFilter, setStatusFilter] = useState('pending')
  const [typeFilter, setTypeFilter] = useState('all')
  const [actionDone, setActionDone] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    document.title = "Flagged Content | TeaTalks Admin"
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
    if (!authLoading && isAuthenticated && user?.role !== 'admin') router.push('/feed')
  }, [authLoading, isAuthenticated, user, router])

  const loadItems = useCallback(async (status = statusFilter, type = typeFilter) => {
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
  }, [statusFilter, typeFilter])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return
    loadItems()
  }, [isAuthenticated, user?.role, loadItems])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return
    loadItems(statusFilter, typeFilter)
  }, [isAuthenticated, user?.role, statusFilter, typeFilter, loadItems])

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
      showErrorToast(error?.response?.data?.message || 'Admin action failed')
    }
  }

  if (authLoading || !isAuthenticated || user?.role !== 'admin' || loadingData) {
    return (
      <div style={{ minHeight: '100vh', background: '#fefcf9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 56, height: 56, border: '3px solid rgba(234,225,213,0.3)', borderTopColor: '#b00d6a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 10, border: '2px solid rgba(234,225,213,0.2)', borderBottomColor: '#fb923c', borderRadius: '50%', animation: 'spin 1.2s linear infinite reverse' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const severityStyle = (s) => {
    if (s === 'critical') return { bg: 'rgba(180,19,64,0.08)', color: '#b41340', border: '#b41340', label: 'Critical', gradient: 'linear-gradient(135deg, #b41340, #dc2626)' }
    if (s === 'medium') return { bg: 'rgba(234,108,0,0.08)', color: '#ea6c00', border: '#ea6c00', label: 'Medium', gradient: 'linear-gradient(135deg, #fb923c, #ffc69f)' }
    return { bg: 'rgba(179,172,163,0.1)', color: '#9b958c', border: '#c8c1b8', label: 'Low', gradient: 'linear-gradient(135deg, #9b958c, #c8c1b8)' }
  }

  const averageToxicity = filtered.length
    ? Math.round(filtered.reduce((sum, item) => sum + item.moderationScore, 0) / filtered.length)
    : 0

  return (
    <div style={{ minHeight: '100vh', background: '#fefcf9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .mat-fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        ::selection { background: #ec4899; color: #ffffff; }
        @keyframes toastIn { 0% { opacity:0; transform:translate(-50%,10px); } 100% { opacity:1; transform:translate(-50%,0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .glass-card {
          background: #ffffff;
          border: 1px solid rgba(234, 225, 213, 0.4);
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(50, 46, 40, 0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-card:hover {
          box-shadow: 0 8px 30px rgba(50, 46, 40, 0.08);
          border-color: rgba(234, 225, 213, 0.6);
        }

        .gradient-text {
          background: linear-gradient(135deg, #b00d6a 0%, #fb923c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .filter-btn {
          padding: 0.625rem 1.25rem;
          border-radius: 9999px;
          border: 1px solid rgba(234, 225, 213, 0.4);
          background: #ffffff;
          color: #6b665e;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .filter-btn:hover {
          background: rgba(248, 240, 229, 0.6);
          border-color: rgba(234, 225, 213, 0.6);
          color: #322e28;
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #ec4899, #fb923c);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 4px 16px rgba(236, 72, 153, 0.2);
        }
      `}</style>

      <AdminSidebar activePage="flagged" />

      <main className="admin-main-content" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '85rem', margin: '0 auto' }}>
        <div style={{ marginBottom: '2.5rem', animation: 'slideUp 0.6s ease-out' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 1.25rem', borderRadius: 9999, background: 'rgba(180, 19, 64, 0.08)', border: '1px solid rgba(180, 19, 64, 0.2)', marginBottom: '1.25rem' }}>
            <span className="material-symbols-outlined mat-fill" style={{ fontSize: 16, color: '#b41340' }}>shield</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b41340' }}>Moderation Queue</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <h1 className="gradient-text" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.5rem', lineHeight: 1.1 }}>
                Flagged Content
              </h1>
              <p style={{ color: '#7b766e', fontSize: '1.0625rem', fontWeight: 500 }}>
                Review and moderate reported content
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['pending', 'reviewed', 'all'].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setStatusFilter(s)} 
                    className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[{ k: 'all', l: 'All' }, { k: 'post', l: 'Posts' }, { k: 'comment', l: 'Comments' }].map(({ k, l }) => (
                  <button 
                    key={k} 
                    onClick={() => setTypeFilter(k)} 
                    className={`filter-btn ${typeFilter === k ? 'active' : ''}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <style>{`@media (min-width: 1024px) { .analytics-grid { grid-template-columns: 2fr 1fr !important; } }`}</style>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filtered.map((item, index) => {
              const sev = severityStyle(item.severity)
              return (
                <div 
                  key={item.id} 
                  className="glass-card" 
                  style={{ 
                    padding: '2rem', 
                    borderLeft: `4px solid ${sev.border}`, 
                    position: 'relative', 
                    overflow: 'hidden',
                    animation: 'slideUp 0.5s ease-out backwards',
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  {/* Gradient Accent */}
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '140px', height: '140px', background: sev.gradient, borderRadius: '50%', filter: 'blur(60px)', opacity: 0.08, pointerEvents: 'none' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(248, 240, 229, 0.6)', border: '1px solid rgba(234, 225, 213, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>{item.anonymousEmoji}</div>
                      <div>
                        <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: '#322e28', fontSize: '1.0625rem', marginBottom: '0.25rem' }}>{item.anonymousName}</h4>
                        <p style={{ fontSize: '0.8125rem', color: '#9b958c', fontFamily: "'Inter', sans-serif" }}>{item.type === 'post' ? 'Post' : 'Comment'} • Reported {timeAgo(item.createdAt)}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 9999, background: sev.bg, border: `1px solid ${sev.color}20` }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: sev.color }}>{item.severity === 'critical' ? 'priority_high' : 'info'}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: sev.color, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{sev.label}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '1.0625rem', color: '#322e28', lineHeight: 1.7, marginBottom: '1.25rem', fontFamily: "'Inter', sans-serif", fontStyle: item.type === 'comment' ? 'italic' : 'normal', padding: '1rem 1.25rem', background: 'rgba(248, 240, 229, 0.4)', borderRadius: '12px', border: '1px solid rgba(234, 225, 213, 0.3)' }}>
                    &quot;{item.text}&quot;
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
                    {item.reasons.map((r) => (
                      <span key={r} style={{ padding: '0.375rem 0.875rem', borderRadius: 9999, background: 'rgba(248, 240, 229, 0.6)', fontSize: '0.8125rem', fontWeight: 600, color: '#6b665e', border: '1px solid rgba(234, 225, 213, 0.4)', fontFamily: "'Inter', sans-serif" }}>{r}</span>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                    <div style={{ background: 'rgba(248, 240, 229, 0.5)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(234, 225, 213, 0.3)' }}>
                      <p style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3a898', marginBottom: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>REPORTS</p>
                      <p style={{ fontSize: '2rem', fontWeight: 900, color: '#322e28', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{item.reportCount}</p>
                    </div>
                    <div style={{ background: 'rgba(248, 240, 229, 0.5)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(234, 225, 213, 0.3)' }}>
                      <p style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3a898', marginBottom: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI SCORE</p>
                      <p style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1, color: item.moderationScore > 80 ? '#b41340' : item.moderationScore > 40 ? '#ea6c00' : '#22c55e' }}>{item.moderationScore}%</p>
                    </div>
                    <div style={{ background: 'rgba(248, 240, 229, 0.5)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(234, 225, 213, 0.3)' }}>
                      <p style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3a898', marginBottom: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>PRIMARY</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#6b665e', fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>{item.mainReason}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(234, 225, 213, 0.3)', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleAction(item, 'approve')} 
                      style={{ 
                        padding: '0.75rem 1.75rem', 
                        borderRadius: 9999, 
                        background: '#ffffff', 
                        color: '#322e28', 
                        border: '1px solid rgba(234, 225, 213, 0.5)', 
                        fontWeight: 700, 
                        fontSize: '0.9375rem', 
                        cursor: 'pointer', 
                        fontFamily: "'Inter', sans-serif",
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248, 240, 229, 0.6)'; e.currentTarget.style.borderColor = 'rgba(234, 225, 213, 0.8)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(234, 225, 213, 0.5)' }}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAction(item, 'remove')} 
                      style={{ 
                        padding: '0.75rem 1.75rem', 
                        borderRadius: 9999, 
                        background: 'linear-gradient(135deg, #b41340, #dc2626)', 
                        color: '#ffffff', 
                        border: 'none', 
                        fontWeight: 700, 
                        fontSize: '0.9375rem', 
                        cursor: 'pointer', 
                        fontFamily: "'Inter', sans-serif",
                        boxShadow: '0 4px 16px rgba(180, 19, 64, 0.2)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(180, 19, 64, 0.3)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(180, 19, 64, 0.2)' }}
                    >
                      Remove
                    </button>
                    {item.severity === 'critical' && (
                      <button 
                        onClick={() => handleAction(item, 'ban')} 
                        style={{ 
                          padding: '0.75rem 1.75rem', 
                          borderRadius: 9999, 
                          background: '#322e28', 
                          color: '#ffffff', 
                          border: 'none', 
                          fontWeight: 700, 
                          fontSize: '0.9375rem', 
                          cursor: 'pointer', 
                          fontFamily: "'Inter', sans-serif",
                          boxShadow: '0 4px 16px rgba(50, 46, 40, 0.2)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(50, 46, 40, 0.3)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(50, 46, 40, 0.2)' }}
                      >
                        Ban User
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 72, color: 'rgba(234, 225, 213, 0.5)', marginBottom: '1rem', display: 'block' }}>check_circle</span>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: '#4a4239', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Queue is clear!</p>
                <p style={{ fontSize: '0.9375rem', color: '#b3a898' }}>No flagged content to review</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.03), rgba(251, 146, 60, 0.03))', position: 'relative', overflow: 'hidden', animation: 'slideUp 0.7s ease-out backwards', animationDelay: '0.3s' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: '120px', height: '120px', background: 'linear-gradient(135deg, #ec4899, #fb923c)', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.1, pointerEvents: 'none' }} />
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg, #b00d6a, #904800)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: '0 8px 24px rgba(176, 13, 106, 0.2)' }}>
                  <span className="material-symbols-outlined mat-fill" style={{ fontSize: 28, color: '#ffffff' }}>monitoring</span>
                </div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#322e28', marginBottom: '0.5rem' }}>Toxicity Pulse</h3>
                <p style={{ fontSize: '0.875rem', color: '#7b766e' }}>Live moderation metrics</p>
              </div>

              {[
                { label: 'Average Toxicity', value: `${averageToxicity}%`, width: Math.max(6, averageToxicity), color: averageToxicity > 70 ? '#b41340' : averageToxicity > 40 ? '#ea6c00' : '#22c55e' },
                { label: 'Queue Size', value: `${filtered.length}`, width: Math.min(100, Math.max(6, filtered.length * 10)), color: '#ec4899' },
              ].map((m) => (
                <div key={m.label} style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.625rem', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#6b665e' }}>
                    <span>{m.label}</span>
                    <span style={{ color: m.color }}>{m.value}</span>
                  </div>
                  <div style={{ height: 10, background: 'rgba(234, 225, 213, 0.3)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.width}%`, background: m.color, borderRadius: 9999, boxShadow: `0 0 12px ${m.color}40`, transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card" style={{ padding: '2rem', animation: 'slideUp 0.7s ease-out backwards', animationDelay: '0.4s' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, color: '#322e28', marginBottom: '1.25rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fb923c' }}>info</span>
                Guidelines
              </h3>
              {[
                { color: '#22c55e', text: 'Approve only after confirming the content is safe to restore' },
                { color: '#b41340', text: 'Remove content that remains toxic after review' },
                { color: '#322e28', text: 'Use ban for repeated or severe abuse' },
              ].map((g) => (
                <div key={g.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(234, 225, 213, 0.2)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: g.color, flexShrink: 0, marginTop: '0.25rem', boxShadow: `0 0 8px ${g.color}40` }} />
                  <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#4a4239', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{g.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {actionDone && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#ffffff', padding: '1rem 2rem', borderRadius: 9999, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.9375rem', zIndex: 200, display: 'flex', alignItems: 'center', gap: '0.625rem', boxShadow: '0 12px 40px rgba(34, 197, 94, 0.3)', animation: 'toastIn 0.3s ease' }}>
          <span className="material-symbols-outlined mat-fill" style={{ fontSize: 20 }}>check_circle</span>
          {actionDone}
        </div>
      )}
    </div>
  )
}