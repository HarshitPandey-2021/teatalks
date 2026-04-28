'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'
import api from '@/lib/axios'

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })
}

export default function AdminUsersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [confirmModal, setConfirmModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

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
      alert(error?.response?.data?.message || 'Unable to ban user')
    }
  }

  const handleUnban = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/ban`, { banned: false, reason: '' })
      setToast('User has been unbanned')
      await loadUsers()
      setTimeout(() => setToast(null), 2000)
    } catch (error) {
      alert(error?.response?.data?.message || 'Unable to unban user')
    }
  }

  const activeCount = users.filter((u) => !u.banStatus).length
  const bannedCount = users.filter((u) => u.banStatus).length

  if (authLoading || !isAuthenticated || user?.role !== 'admin' || loadingData) {
    return (
      <div style={{ minHeight: '100vh', background: '#fdf5eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #eae1d5', borderTopColor: '#b00d6a', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf5eb' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        ::selection { background: #ff6daf; color: #4b002a; }
        @keyframes toastIn { 0% { opacity:0; transform:translate(-50%,10px); } 100% { opacity:1; transform:translate(-50%,0); } }
        @keyframes modalIn { 0% { opacity:0; transform:translateY(20px) scale(0.97); } 100% { opacity:1; transform:translateY(0) scale(1); } }
      `}</style>

      <AdminSidebar activePage="users" />

      <main className="admin-main-content" style={{ padding: '2rem 1.5rem', maxWidth: '80rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#322e28', marginBottom: '0.25rem' }}>Manage Community</h2>
          <p style={{ color: '#5f5b53', fontSize: '0.9375rem' }}>Reviewing {users.length} total user accounts</p>
        </div>

        <div className="admin-stats-banner" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
          <style>{`@media (min-width: 768px) { .admin-stats-banner { grid-template-columns: 2fr 1fr !important; } }`}</style>

          <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 20px 40px rgba(50,46,40,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7b766e', marginBottom: '0.5rem' }}>Safety Overview</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '3rem', fontWeight: 900, color: '#b00d6a', letterSpacing: '-0.03em' }}>{users.length}</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#904800', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>group</span>
                  Total Accounts
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#322e28' }}>{bannedCount} Banned</p>
                <p style={{ fontSize: '0.6875rem', color: '#7b766e' }}>Total bans</p>
              </div>
              <div style={{ width: 1, background: 'rgba(179,172,163,0.2)' }} />
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#322e28' }}>{activeCount} Active</p>
                <p style={{ fontSize: '0.6875rem', color: '#7b766e' }}>Currently active</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #b00d6a, #904800)', borderRadius: '1rem', padding: '2rem', color: '#ffffff', position: 'relative', overflow: 'hidden' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', right: -8, bottom: -8, fontSize: 96, opacity: 0.1, transform: 'rotate(12deg)' }}>security</span>
            <h3 style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8125rem', opacity: 0.8, marginBottom: '0.75rem' }}>Quick Action</h3>
            <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem', lineHeight: 1.4 }}>
              {bannedCount > 0 ? `${bannedCount} users currently banned.` : 'No users are banned. Community is healthy!'}
            </p>
            <Link href="/admin/flagged" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: '#ffffff', padding: '0.5rem 1.5rem', borderRadius: 9999, fontWeight: 700, fontSize: '0.8125rem', textDecoration: 'none', display: 'inline-block' }}>Review Flagged</Link>
          </div>
        </div>

        <div style={{ background: '#f8f0e5', borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(179,172,163,0.1)', background: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { k: 'all', l: 'All Users' },
                { k: 'flagged', l: 'Flagged' },
                { k: 'banned', l: 'Banned' },
              ].map(({ k, l }) => (
                <button key={k} onClick={() => setFilter(k)} style={{ padding: '0.375rem 1rem', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, background: filter === k ? '#ffc69f' : '#efe7dc', color: filter === k ? '#723800' : '#5f5b53' }}>{l}</button>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#b3aca3', fontSize: 18 }}>search</span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', background: '#ffffff', border: 'none', borderRadius: 9999, fontSize: '0.8125rem', color: '#322e28', outline: 'none', width: 240 }} />
            </div>
          </div>

          <div>
            {filtered.map((u) => {
              const isBanned = !!u.banStatus
              return (
                <div key={u._id} className="user-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.75fr 0.75fr 1fr 1fr', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(179,172,163,0.05)', background: isBanned ? 'rgba(228,220,207,0.2)' : 'transparent', transition: 'background 0.2s' }}>
                  <style>{`
                    .user-row:hover { background: #ffffff !important; }
                    .user-row:hover .user-actions { opacity: 1 !important; }
                    @media (max-width: 768px) {
                      .user-row {
                        grid-template-columns: 1fr !important;
                        gap: 0.75rem !important;
                      }
                    }
                  `}</style>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: isBanned ? 'rgba(179,172,163,0.2)' : 'rgba(176,13,106,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', filter: isBanned ? 'grayscale(100%)' : 'none', opacity: isBanned ? 0.5 : 1 }}>{u.emoji || '🙂'}</div>
                    <div>
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: '#322e28', textDecoration: isBanned ? 'line-through' : 'none', opacity: isBanned ? 0.5 : 1 }}>{u.anonymousName || 'Anonymous'}</p>
                      <p style={{ fontSize: '0.75rem', color: '#7b766e' }}>{u.branch || 'Student'} • {u.year || 'Unknown year'}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#5f5b53', opacity: isBanned ? 0.5 : 1 }}>{formatDate(u.createdAt)}</p>

                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#322e28', textAlign: 'center', opacity: isBanned ? 0.5 : 1 }}>{u.postCount || 0}</p>

                  <p style={{ fontSize: '0.875rem', fontWeight: 700, textAlign: 'center', color: (u.reportCount || 0) > 5 ? '#b41340' : '#322e28' }}>{u.reportCount || 0}</p>

                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, background: isBanned ? '#e4dccf' : 'rgba(34,197,94,0.08)', color: isBanned ? '#5f5b53' : '#22c55e' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: isBanned ? '#5f5b53' : '#22c55e' }} />
                      {isBanned ? 'Banned' : 'Active'}
                    </span>
                  </div>

                  <div className="user-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', opacity: 0, transition: 'opacity 0.2s' }}>
                    {isBanned ? (
                      <button onClick={() => handleUnban(u._id)} style={{ padding: '0.5rem 1rem', borderRadius: 9999, background: '#ffc69f', color: '#723800', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>Unban</button>
                    ) : (
                      <button onClick={() => setConfirmModal(u)} style={{ padding: '0.5rem', borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', color: '#b41340', display: 'flex' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>block</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#7b766e' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3 }}>person_off</span>
                <p style={{ fontWeight: 700, marginTop: '0.75rem' }}>No users match your search.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {confirmModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setConfirmModal(null) }} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,12,8,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '2rem', padding: '2.5rem', maxWidth: 420, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.15)', animation: 'modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(180,19,64,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#b41340' }}>warning</span>
            </div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '1.5rem', color: '#322e28', marginBottom: '0.5rem' }}>
              Ban {confirmModal.anonymousName || 'this user'}?
            </h3>
            <p style={{ color: '#5f5b53', lineHeight: 1.6, marginBottom: '2rem', fontSize: '0.9375rem' }}>
              This will revoke their access. They will no longer be able to post or interact with campus threads.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setConfirmModal(null)} style={{ flex: 1, padding: '1rem', borderRadius: 9999, background: '#efe7dc', color: '#5f5b53', border: 'none', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cancel</button>
              <button onClick={() => handleBan(confirmModal._id)} style={{ flex: 1, padding: '1rem', borderRadius: 9999, background: '#b41340', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 8px 24px rgba(180,19,64,0.2)' }}>Confirm Ban</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: '#322e28', color: '#ffffff', padding: '0.875rem 2rem', borderRadius: 9999, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.875rem', zIndex: 200, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', animation: 'toastIn 0.3s ease' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#22c55e' }}>check_circle</span>
          {toast}
        </div>
      )}
    </div>
  )
}
