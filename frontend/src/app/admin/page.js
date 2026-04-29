'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'
import api from '@/lib/axios'

function timeAgo(date) {
  if (!date) return 'just now'
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}

export default function AdminOverviewPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [overview, setOverview] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
    if (!authLoading && isAuthenticated && user?.role !== 'admin') router.push('/feed')
  }, [authLoading, isAuthenticated, user, router])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return

    const loadOverview = async () => {
      try {
        const res = await api.get('/admin/overview')
        setOverview(res.data)
      } catch (error) {
        console.error('Failed to load admin overview', error)
      } finally {
        setLoadingData(false)
      }
    }

    loadOverview()
  }, [isAuthenticated, user])

  const stats = useMemo(() => {
    const data = overview?.stats || {}
    return [
      { label: 'Total Posts', value: data.totalPosts || 0, trend: 'All time', icon: 'forum' },
      { label: 'Total Users', value: data.totalUsers || 0, trend: 'Registered', icon: 'person' },
      { label: 'Pending Reports', value: data.pendingReports || 0, trend: 'Action required', icon: 'report', urgent: (data.pendingReports || 0) > 0 },
      { label: 'Hidden Content', value: data.hiddenContent || 0, trend: 'Posts + comments', icon: 'visibility_off' },
      { label: 'Active Today', value: data.activeToday || 0, trend: 'Posts + comments today', icon: 'bolt', live: true },
    ]
  }, [overview])

  const healthMetrics = useMemo(() => {
    const health = overview?.health || {}
    return [
      { label: 'Report Backlog', value: `${health.reportBacklogPercent || 0}%`, width: Math.max(6, health.reportBacklogPercent || 0), gradient: 'linear-gradient(to right, #b00d6a, #904800)' },
      { label: 'Content Safety', value: `${health.contentSafetyPercent || 0}%`, width: Math.max(6, health.contentSafetyPercent || 0), gradient: 'linear-gradient(to right, #22c55e, #86efac)' },
      { label: 'Server Load', value: `${health.serverLoadPercent || 0}%`, width: Math.max(6, health.serverLoadPercent || 0), gradient: 'linear-gradient(to right, #904800, #ffc69f)' },
    ]
  }, [overview])

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
      `}</style>

      <AdminSidebar activePage="overview" />

      <main className="admin-main-content" style={{ padding: '2rem 1.5rem', maxWidth: '80rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 1rem', borderRadius: 9999, background: '#ffc69f', color: '#723800', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>verified_user</span>
            Admin Access
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #b00d6a, #904800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
            Welcome back, {user?.campusName || 'Admin'}.
          </h2>
          <p style={{ color: '#5f5b53', fontSize: '0.9375rem', maxWidth: '40rem', lineHeight: 1.6 }}>
            Monitor campus conversations, manage flagged content, and keep moderation decisions grounded in live data.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 20px 40px rgba(50,46,40,0.06)', position: 'relative', overflow: 'hidden', borderBottom: stat.urgent ? '4px solid #b41340' : 'none' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', fontSize: 48, color: '#322e28', opacity: 0.06 }}>{stat.icon}</span>
              <p style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7b766e', marginBottom: '0.75rem' }}>{stat.label}</p>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 900, color: '#322e28', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>{stat.value}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: stat.urgent ? '#b41340' : stat.live ? '#b00d6a' : '#7b766e' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{stat.urgent ? 'priority_high' : stat.live ? 'groups' : 'history'}</span>
                {stat.trend}
              </div>
            </div>
          ))}
        </div>

        <div className="admin-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <style>{`@media (min-width: 1024px) { .admin-two-col { grid-template-columns: 2fr 1fr !important; } }`}</style>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.375rem', fontWeight: 800, color: '#322e28', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#b00d6a' }}>warning</span>
                Recent Reports
              </h3>
              <Link href="/admin/flagged" style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#b00d6a', textDecoration: 'none' }}>View All →</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {(overview?.recentReports || []).map((report, index) => (
                <div key={report.id || `${report.title || 'report'}-${report.time || index}-${index}`} style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.25rem', display: 'flex', gap: '1rem', boxShadow: '0 2px 12px rgba(50,46,40,0.04)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: report.severity === 'high' ? 'rgba(180,19,64,0.1)' : 'rgba(144,72,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ color: report.severity === 'high' ? '#b41340' : '#904800', fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{report.icon || 'gavel'}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#322e28' }}>{report.title}</h4>
                      <span style={{ fontSize: '0.6875rem', color: '#7b766e', fontWeight: 500, whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>{timeAgo(report.time)}</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#5f5b53', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                      {report.label || 'Reported by'} <span style={{ color: '#904800', fontWeight: 600 }}>{report.actor || report.reporter}</span>: &ldquo;{report.reason}&rdquo;
                    </p>
                    <Link href="/admin/flagged" style={{ padding: '0.375rem 1rem', borderRadius: 9999, background: '#b00d6a', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>Review</Link>
                  </div>
                </div>
              ))}

              {(overview?.recentReports || []).length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '1rem', color: '#b3aca3' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.4 }}>check_circle</span>
                  <p style={{ fontWeight: 700, marginTop: '0.75rem', color: '#7b766e' }}>All clear! No pending reports.</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#efe7dc', borderRadius: '1rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.4)' }}>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.125rem', color: '#322e28', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#22c55e' }}>health_and_safety</span>
                Editorial Health
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {healthMetrics.map((m) => (
                  <div key={m.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7b766e', marginBottom: '0.5rem' }}>
                      <span>{m.label}</span>
                      <span>{m.value}</span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: '#eae1d5', borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${m.width}%`, background: m.gradient, borderRadius: 9999, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(176,13,106,0.08), rgba(144,72,0,0.08))', borderRadius: '1rem', padding: '2rem', border: '1px solid rgba(176,13,106,0.1)' }}>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.125rem', color: '#b00d6a', marginBottom: '0.75rem' }}>Live Operations</h4>
              <p style={{ fontSize: '0.875rem', color: '#5f5b53', lineHeight: 1.6, marginBottom: '1rem' }}>
                {overview?.health?.actionsToday || 0} admin actions were recorded today, and the average pending report age is about {overview?.health?.avgQueueMinutes || 0} minutes.
              </p>
              <Link href="/admin/flagged" style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b00d6a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Review Queue <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
