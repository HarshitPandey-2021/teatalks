'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import AdminSidebar from '@/components/AdminSidebar'
import api from '@/lib/axios'

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })
}

export default function AdminUsersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { error: showErrorToast } = useToast()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [confirmModal, setConfirmModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    document.title = "User Management | TeaTalks Admin"
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
    if (!authLoading && isAuthenticated && user?.role !== 'admin') router.push('/feed')
  }, [authLoading, isAuthenticated, user, router])

  const loadUsers = async () => {
    try {
      setLoadingData(true)
      const res = await api.get('/admin/users')
      setUsers(Array.isArray(res.data?.users) ? res.data.users : [])
    } catch (error) {
      console.error('Failed to load admin users', error)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return
    loadUsers()
  }, [isAuthenticated, user])

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const status = u.banStatus ? 'banned' : 'active'
      if (filter === 'active' && status !== 'active') return false
      if (filter === 'banned' && status !== 'banned') return false
      if (filter === 'flagged' && (u.reportCount || 0) < 3) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          (u.anonymousName || '').toLowerCase().includes(q) ||
          String(u._id || '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [users, filter, search])

  const handleBan = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/ban`, { banned: true, reason: 'Banned by admin' })
      setConfirmModal(null)
      setToast('User has been banned')
      await loadUsers()
      setTimeout(() => setToast(null), 2000)
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Unable to ban user')
    }
  }

  const handleUnban = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/ban`, { banned: false, reason: '' })
      setToast('User has been unbanned')
      await loadUsers()
      setTimeout(() => setToast(null), 2000)
    } catch (error) {
      showErrorToast(error?.response?.data?.message || 'Unable to unban user')
    }
  }

  const activeCount = users.filter((u) => !u.banStatus).length
  const bannedCount = users.filter((u) => u.banStatus).length
  const flaggedCount = users.filter((u) => (u.reportCount || 0) >= 3).length

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

  return (
    <div style={{ minHeight: '100vh', background: '#fefcf9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .mat-fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        ::selection { background: #ec4899; color: #ffffff; }
        @keyframes toastIn { 0% { opacity:0; transform:translate(-50%,10px); } 100% { opacity:1; transform:translate(-50%,0); } }
        @keyframes modalIn { 0% { opacity:0; transform:translateY(20px) scale(0.97); } 100% { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .glass-card {
          background: #ffffff;
          border: 1px solid rgba(234, 225, 213, 0.4);
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(50, 46, 40, 0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gradient-text {
          background: linear-gradient(135deg, #b00d6a 0%, #fb923c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .filter-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 9999px;
          border: 1px solid rgba(234, 225, 213, 0.4);
          background: #ffffff;
          color: #6b665e;
          font-size: 0.8125rem;
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

        .user-row {
          transition: all 0.2s;
        }

        .user-row:hover {
          background: rgba(248, 240, 229, 0.3) !important;
        }

        .user-row:hover .user-actions {
          opacity: 1 !important;
        }
      `}</style>

      <AdminSidebar activePage="users" />

      <main className="admin-main-content" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '85rem', margin: '0 auto' }}>
        <div style={{ marginBottom: '2.5rem', animation: 'slideUp 0.6s ease-out' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 1.25rem', borderRadius: 9999, background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', marginBottom: '1.25rem' }}>
            <span className="material-symbols-outlined mat-fill" style={{ fontSize: 16, color: '#22c55e' }}>supervisor_account</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#22c55e' }}>Community Management</span>
          </div>
          
          <h1 className="gradient-text" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.5rem', lineHeight: 1.1 }}>
            Manage Community
          </h1>
          <p style={{ color: '#7b766e', fontSize: '1.0625rem', fontWeight: 500 }}>
            Reviewing {users.length} total user accounts
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <style>{`@media (min-width: 768px) { .stats-banner { grid-template-columns: 2fr 1fr !important; } }`}</style>

          <div className="stats-banner" style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', animation: 'slideUp 0.6s ease-out backwards', animationDelay: '0.1s' }}>
              <div>
                <p style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3a898', marginBottom: '0.75rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Community Overview</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                  <span className="gradient-text" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>{users.length}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#9b958c', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>group</span>
                    Total Users
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '2.5rem' }}>
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#22c55e', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '0.25rem' }}>{activeCount}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9b958c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</p>
                </div>
                <div style={{ width: '1px', background: 'rgba(234, 225, 213, 0.4)' }} />
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ea6c00', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '0.25rem' }}>{flaggedCount}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9b958c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Flagged</p>
                </div>
                <div style={{ width: '1px', background: 'rgba(234, 225, 213, 0.4)' }} />
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#b41340', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '0.25rem' }}>{bannedCount}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9b958c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Banned</p>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.03), rgba(251, 146, 60, 0.03))', position: 'relative', overflow: 'hidden', animation: 'slideUp 0.6s ease-out backwards', animationDelay: '0.2s' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: '120px', height: '120px', background: 'linear-gradient(135deg, #ec4899, #fb923c)', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.15, pointerEvents: 'none' }} />
              <span className="material-symbols-outlined mat-fill" style={{ position: 'absolute', right: '1rem', bottom: '1rem', fontSize: 80, opacity: 0.05, color: '#b00d6a' }}>security</span>
              <h3 style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem', color: '#b00d6a', marginBottom: '0.875rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Quick Actions</h3>
              <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1.25rem', lineHeight: 1.5, color: '#4a4239' }}>
                {bannedCount > 0 ? `${bannedCount} users currently banned.` : 'No users are banned. Community is healthy!'}
              </p>
              <Link href="/admin/flagged" style={{ background: 'linear-gradient(135deg, #ec4899, #fb923c)', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: 9999, fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 16px rgba(236, 72, 153, 0.2)', transition: 'all 0.2s', fontFamily: "'Inter', sans-serif" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.3)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(236, 72, 153, 0.2)' }}>
                Review Flagged
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ overflow: 'hidden', animation: 'slideUp 0.6s ease-out backwards', animationDelay: '0.3s' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(234, 225, 213, 0.3)', background: 'rgba(248, 240, 229, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              {[
                { k: 'all', l: 'All Users' },
                { k: 'flagged', l: 'Flagged' },
                { k: 'banned', l: 'Banned' },
              ].map(({ k, l }) => (
                <button 
                  key={k} 
                  onClick={() => setFilter(k)} 
                  className={`filter-btn ${filter === k ? 'active' : ''}`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#b3a898', fontSize: 20 }}>search</span>
              <input 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search users..." 
                style={{ 
                  padding: '0.75rem 1rem 0.75rem 3rem', 
                  background: '#ffffff', 
                  border: '1px solid rgba(234, 225, 213, 0.4)', 
                  borderRadius: 9999, 
                  fontSize: '0.9375rem', 
                  color: '#322e28', 
                  outline: 'none', 
                  width: 280,
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s'
                }} 
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.08)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(234, 225, 213, 0.4)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>
          </div>

          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.75fr 0.75fr 1fr 1fr', alignItems: 'center', padding: '1rem 2rem', background: 'rgba(248, 240, 229, 0.2)', borderBottom: '1px solid rgba(234, 225, 213, 0.2)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3a898', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>User</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3a898', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Joined</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3a898', textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Posts</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3a898', textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Reports</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3a898', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Status</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b3a898', textAlign: 'right', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Actions</div>
          </div>

          <div>
            {filtered.map((u) => {
              const isBanned = !!u.banStatus
              const isFlagged = (u.reportCount || 0) >= 3
              return (
                <div 
                  key={u._id} 
                  className="user-row" 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 0.75fr 0.75fr 1fr 1fr', 
                    alignItems: 'center', 
                    padding: '1.5rem 2rem', 
                    borderBottom: '1px solid rgba(234, 225, 213, 0.15)', 
                    background: isBanned ? 'rgba(180, 19, 64, 0.02)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: 52, 
                      height: 52, 
                      borderRadius: '14px', 
                      background: isBanned ? 'rgba(179, 172, 163, 0.15)' : 'rgba(248, 240, 229, 0.6)', 
                      border: '1px solid rgba(234, 225, 213, 0.4)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '1.5rem', 
                      filter: isBanned ? 'grayscale(100%)' : 'none', 
                      opacity: isBanned ? 0.5 : 1 
                    }}>{u.emoji || '🙂'}</div>
                    <div>
                      <p style={{ 
                        fontFamily: "'Plus Jakarta Sans', sans-serif", 
                        fontWeight: 700, 
                        color: '#322e28', 
                        fontSize: '1rem',
                        textDecoration: isBanned ? 'line-through' : 'none', 
                        opacity: isBanned ? 0.5 : 1,
                        marginBottom: '0.25rem'
                      }}>{u.anonymousName || 'Anonymous'}</p>
                      <p style={{ fontSize: '0.8125rem', color: '#9b958c', fontFamily: "'Inter', sans-serif" }}>
                        {u.branch || 'Student'} • {u.year || 'Unknown year'}
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b665e', opacity: isBanned ? 0.5 : 1, fontFamily: "'Inter', sans-serif" }}>
                    {formatDate(u.createdAt)}
                  </p>

                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#322e28', textAlign: 'center', opacity: isBanned ? 0.5 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {u.postCount || 0}
                  </p>

                  <p style={{ 
                    fontSize: '1rem', 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    color: (u.reportCount || 0) > 5 ? '#b41340' : (u.reportCount || 0) >= 3 ? '#ea6c00' : '#322e28',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}>
                    {u.reportCount || 0}
                  </p>

                  <div>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      padding: '0.5rem 1rem', 
                      borderRadius: 9999, 
                      fontSize: '0.8125rem', 
                      fontWeight: 700, 
                      background: isBanned ? 'rgba(180, 19, 64, 0.08)' : 'rgba(34, 197, 94, 0.08)', 
                      color: isBanned ? '#b41340' : '#22c55e',
                      border: `1px solid ${isBanned ? 'rgba(180, 19, 64, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: isBanned ? '#b41340' : '#22c55e', boxShadow: `0 0 8px ${isBanned ? '#b41340' : '#22c55e'}40` }} />
                      {isBanned ? 'Banned' : 'Active'}
                    </span>
                  </div>

                  <div className="user-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', opacity: 0, transition: 'opacity 0.2s' }}>
                    {isBanned ? (
                      <button 
                        onClick={() => handleUnban(u._id)} 
                        style={{ 
                          padding: '0.625rem 1.25rem', 
                          borderRadius: 9999, 
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
                          color: '#ffffff', 
                          border: 'none', 
                          fontWeight: 700, 
                          fontSize: '0.8125rem', 
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                          transition: 'all 0.2s',
                          fontFamily: "'Inter', sans-serif"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.3)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.2)' }}
                      >
                        Unban
                      </button>
                    ) : (
                      <button 
                        onClick={() => setConfirmModal(u)} 
                        style={{ 
                          padding: '0.625rem', 
                          borderRadius: '50%', 
                          background: 'rgba(180, 19, 64, 0.08)', 
                          border: '1px solid rgba(180, 19, 64, 0.2)', 
                          cursor: 'pointer', 
                          color: '#b41340', 
                          display: 'flex',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(180, 19, 64, 0.15)'; e.currentTarget.style.transform = 'scale(1.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(180, 19, 64, 0.08)'; e.currentTarget.style.transform = 'scale(1)' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>block</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#9b958c' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 64, opacity: 0.2, marginBottom: '1rem', display: 'block' }}>person_off</span>
                <p style={{ fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.125rem', color: '#6b665e' }}>No users match your search.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {confirmModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmModal(null) }} 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 200, 
            background: 'rgba(50, 46, 40, 0.4)', 
            backdropFilter: 'blur(12px)', 
            WebkitBackdropFilter: 'blur(12px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem' 
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              background: '#ffffff', 
              borderRadius: '24px', 
              padding: '2.5rem', 
              maxWidth: 460, 
              width: '100%', 
              boxShadow: '0 25px 60px rgba(50, 46, 40, 0.15)', 
              animation: 'modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid rgba(234, 225, 213, 0.4)'
            }}
          >
            <div style={{ 
              width: 72, 
              height: 72, 
              borderRadius: '20px', 
              background: 'linear-gradient(135deg, rgba(180, 19, 64, 0.1), rgba(220, 38, 38, 0.1))', 
              border: '1px solid rgba(180, 19, 64, 0.2)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '1.5rem' 
            }}>
              <span className="material-symbols-outlined mat-fill" style={{ fontSize: 36, color: '#b41340' }}>warning</span>
            </div>
            <h3 style={{ 
              fontFamily: "'Plus Jakarta Sans', sans-serif", 
              fontWeight: 900, 
              fontSize: '1.75rem', 
              color: '#322e28', 
              marginBottom: '0.75rem',
              lineHeight: 1.2
            }}>
              Ban {confirmModal.anonymousName || 'this user'}?
            </h3>
            <p style={{ 
              color: '#6b665e', 
              lineHeight: 1.7, 
              marginBottom: '2rem', 
              fontSize: '1rem',
              fontFamily: "'Inter', sans-serif"
            }}>
              This will revoke their access. They will no longer be able to post or interact with campus threads.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setConfirmModal(null)} 
                style={{ 
                  flex: 1, 
                  padding: '1rem', 
                  borderRadius: 9999, 
                  background: '#ffffff', 
                  color: '#6b665e', 
                  border: '1px solid rgba(234, 225, 213, 0.5)', 
                  fontWeight: 700, 
                  fontSize: '1rem', 
                  cursor: 'pointer', 
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248, 240, 229, 0.5)'; e.currentTarget.style.borderColor = 'rgba(234, 225, 213, 0.8)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(234, 225, 213, 0.5)' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleBan(confirmModal._id)} 
                style={{ 
                  flex: 1, 
                  padding: '1rem', 
                  borderRadius: 9999, 
                  background: 'linear-gradient(135deg, #b41340, #dc2626)', 
                  color: '#ffffff', 
                  border: 'none', 
                  fontWeight: 700, 
                  fontSize: '1rem', 
                  cursor: 'pointer', 
                  fontFamily: "'Inter', sans-serif", 
                  boxShadow: '0 8px 24px rgba(180, 19, 64, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(180, 19, 64, 0.4)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(180, 19, 64, 0.3)' }}
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ 
          position: 'fixed', 
          bottom: '2rem', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
          color: '#ffffff', 
          padding: '1rem 2rem', 
          borderRadius: 9999, 
          fontFamily: "'Plus Jakarta Sans', sans-serif", 
          fontWeight: 700, 
          fontSize: '0.9375rem', 
          zIndex: 200, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.625rem', 
          boxShadow: '0 12px 40px rgba(34, 197, 94, 0.3)', 
          animation: 'toastIn 0.3s ease' 
        }}>
          <span className="material-symbols-outlined mat-fill" style={{ fontSize: 20 }}>check_circle</span>
          {toast}
        </div>
      )}
    </div>
  )
}