'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'
import api from '@/lib/axios'

const ADMIN_OVERVIEW_REFRESH_INTERVAL_MS = 30000

function timeAgo(date) {
  if (!date) return 'just now'
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function AdminOverviewPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [overview, setOverview] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const isRefreshingOverviewRef = useRef(false)

  useEffect(() => {
    document.title = "Admin Dashboard | TeaTalks"
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
    if (!authLoading && isAuthenticated && user?.role !== 'admin') router.push('/feed')
  }, [authLoading, isAuthenticated, user, router])

  const loadOverview = useCallback(async ({ silent = false } = {}) => {
    if (!isAuthenticated || user?.role !== 'admin' || isRefreshingOverviewRef.current) return

    isRefreshingOverviewRef.current = true
    if (!silent) {
      setLoadingData(true)
    }

    try {
      const res = await api.get('/admin/overview')
      setOverview(res.data)
    } catch (error) {
      console.error('Failed to load admin overview', error)
    } finally {
      isRefreshingOverviewRef.current = false
      setLoadingData(false)
    }
  }, [isAuthenticated, user?.role])

  useEffect(() => {
    loadOverview()
  }, [loadOverview])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return undefined

    const handleRefresh = () => {
      if (document.visibilityState === 'visible') {
        loadOverview({ silent: true })
      }
    }

    const intervalId = window.setInterval(handleRefresh, ADMIN_OVERVIEW_REFRESH_INTERVAL_MS)
    window.addEventListener('focus', handleRefresh)
    document.addEventListener('visibilitychange', handleRefresh)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleRefresh)
      document.removeEventListener('visibilitychange', handleRefresh)
    }
  }, [isAuthenticated, user?.role, loadOverview])

  const stats = useMemo(() => {
    const data = overview?.stats || {}
    return [
      { 
        label: 'Total Posts', 
        value: data.totalPosts || 0, 
        change: '+12%', 
        trend: 'up',
        icon: 'forum',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #fb923c 100%)',
        glowColor: 'rgba(236, 72, 153, 0.15)'
      },
      { 
        label: 'Total Users', 
        value: data.totalUsers || 0, 
        change: '+8%',
        trend: 'up',
        icon: 'group',
        gradient: 'linear-gradient(135deg, #b00d6a 0%, #904800 100%)',
        glowColor: 'rgba(176, 13, 106, 0.15)'
      },
      { 
        label: 'Pending Reports', 
        value: data.pendingReports || 0, 
        trend: (data.pendingReports || 0) > 0 ? 'urgent' : 'stable',
        icon: 'report',
        gradient: 'linear-gradient(135deg, #b41340 0%, #ea6c00 100%)',
        glowColor: 'rgba(180, 19, 64, 0.15)',
        pulse: (data.pendingReports || 0) > 0
      },
      { 
        label: 'Active Today', 
        value: data.activeToday || 0, 
        trend: 'live',
        icon: 'bolt',
        gradient: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
        glowColor: 'rgba(34, 197, 94, 0.15)',
        pulse: true
      },
    ]
  }, [overview])

  const analytics = useMemo(() => {
    const data = overview?.stats || {}
    const total = (data.totalPosts || 0) + (data.hiddenContent || 0)
    const safetyRate = total > 0 ? Math.round(((data.totalPosts || 0) / total) * 100) : 100
    const engagementRate = (data.totalUsers || 0) > 0 ? Math.round(((data.activeToday || 0) / (data.totalUsers || 0)) * 100) : 0
    const reportRate = (data.totalPosts || 0) > 0 ? Math.round(((data.pendingReports || 0) / (data.totalPosts || 0)) * 100) : 0

    return {
      safetyRate,
      engagementRate,
      reportRate,
      hiddenContent: data.hiddenContent || 0,
      totalContent: total
    }
  }, [overview])

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
        
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.95); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        
        .glass-card {
          background: #ffffff;
          border: 1px solid rgba(234, 225, 213, 0.4);
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(50, 46, 40, 0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        
        .glass-card:hover {
          box-shadow: 0 8px 30px rgba(50, 46, 40, 0.08);
          transform: translateY(-4px);
          border-color: rgba(234, 225, 213, 0.6);
        }
        
        .stat-card {
          animation: slideUp 0.5s ease-out backwards;
        }
        
        .pulse-dot {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .chart-bar {
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gradient-text {
          background: linear-gradient(135deg, #b00d6a 0%, #fb923c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <AdminSidebar activePage="overview" />

      <main className="admin-main-content" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '85rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', animation: 'slideUp 0.6s ease-out' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 1.25rem', borderRadius: 9999, background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)', marginBottom: '1.25rem' }}>
            <span className="material-symbols-outlined mat-fill pulse-dot" style={{ fontSize: 16, color: '#ec4899' }}>verified_user</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b00d6a' }}>Admin Dashboard</span>
          </div>
          <h1 className="gradient-text" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.75rem', lineHeight: 1.1 }}>
            Welcome back, {user?.campusName || 'Admin'}
          </h1>
          <p style={{ color: '#7b766e', fontSize: '1.0625rem', fontWeight: 500, maxWidth: '45rem', lineHeight: 1.6 }}>
            Real-time insights into campus activity, content moderation, and community health metrics.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="glass-card stat-card" 
              style={{ 
                padding: '2rem 1.75rem', 
                position: 'relative',
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* Gradient Accent */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: stat.gradient, borderRadius: '50%', filter: 'blur(50px)', opacity: 0.12, pointerEvents: 'none' }} />
              
              {/* Icon & Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
                <div style={{ width: 60, height: 60, borderRadius: '18px', background: stat.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${stat.glowColor}` }}>
                  <span className="material-symbols-outlined mat-fill" style={{ fontSize: 30, color: '#ffffff' }}>{stat.icon}</span>
                </div>
                {stat.pulse && <div className="pulse-dot" style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 12px rgba(34, 197, 94, 0.5)' }} />}
              </div>
              
              {/* Value */}
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2.75rem', fontWeight: 900, color: '#322e28', marginBottom: '0.625rem', letterSpacing: '-0.03em', lineHeight: 1 }}>{stat.value}</h3>
              
              {/* Label & Trend */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#7b766e', textTransform: 'capitalize', fontFamily: "'Inter', sans-serif" }}>{stat.label}</p>
                {stat.change && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 700, color: stat.trend === 'up' ? '#22c55e' : '#ffc69f', background: stat.trend === 'up' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 198, 159, 0.08)', padding: '0.25rem 0.625rem', borderRadius: 9999 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{stat.trend === 'up' ? 'trending_up' : 'trending_flat'}</span>
                    {stat.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '3rem' }}>
          <style>{`@media (min-width: 1024px) { .analytics-grid { grid-template-columns: 2fr 1fr !important; } }`}</style>
          
          {/* Content Health Chart */}


<div className="glass-card" style={{ padding: '2.5rem', animation: 'slideUp 0.7s ease-out backwards', animationDelay: '0.4s' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
    <div>
      <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#322e28', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#22c55e' }}>health_and_safety</span>
        Content Health
      </h3>
      <p style={{ color: '#9b958c', fontSize: '0.9375rem' }}>Safety & engagement metrics</p>
    </div>
    <div style={{ padding: '0.625rem 1.25rem', borderRadius: 9999, background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#22c55e' }}>{analytics.safetyRate}% Safe</span>
    </div>
  </div>

  <div style={{ display: 'grid', gap: '2rem' }}>
    {/* Safety Rate - FIX: Cap width at 100% */}
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4a4239', fontFamily: "'Inter', sans-serif" }}>Content Safety</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#22c55e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{analytics.safetyRate}%</span>
      </div>
      <div style={{ height: 12, background: 'rgba(234, 225, 213, 0.3)', borderRadius: 9999, overflow: 'hidden' }}>
        <div className="chart-bar" style={{ height: '100%', width: `${Math.min(analytics.safetyRate, 100)}%`, background: 'linear-gradient(90deg, #22c55e, #86efac)', borderRadius: 9999, boxShadow: '0 0 16px rgba(34, 197, 94, 0.3)' }} />
      </div>
    </div>

    {/* Engagement Rate - FIX: Cap width at 100% */}
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4a4239', fontFamily: "'Inter', sans-serif" }}>Daily Engagement</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ec4899', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{analytics.engagementRate}%</span>
      </div>
      <div style={{ height: 12, background: 'rgba(234, 225, 213, 0.3)', borderRadius: 9999, overflow: 'hidden' }}>
        <div className="chart-bar" style={{ height: '100%', width: `${Math.min(analytics.engagementRate, 100)}%`, background: 'linear-gradient(90deg, #ec4899, #fb923c)', borderRadius: 9999, boxShadow: '0 0 16px rgba(236, 72, 153, 0.3)' }} />
      </div>
    </div>

    {/* Report Rate - FIX: Proper scaling */}
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4a4239', fontFamily: "'Inter', sans-serif" }}>Report Rate</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: analytics.reportRate > 5 ? '#ea6c00' : '#22c55e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{analytics.reportRate}%</span>
      </div>
      <div style={{ height: 12, background: 'rgba(234, 225, 213, 0.3)', borderRadius: 9999, overflow: 'hidden' }}>
        <div className="chart-bar" style={{ height: '100%', width: `${Math.min(analytics.reportRate * 5, 100)}%`, background: analytics.reportRate > 5 ? 'linear-gradient(90deg, #ea6c00, #ffc69f)' : 'linear-gradient(90deg, #22c55e, #86efac)', borderRadius: 9999, boxShadow: `0 0 16px ${analytics.reportRate > 5 ? 'rgba(234, 108, 0, 0.3)' : 'rgba(34, 197, 94, 0.3)'}` }} />
      </div>
    </div>
  </div>
</div>

          {/* Right Side Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* AI Moderation Card */}
            <div className="glass-card" style={{ padding: '2rem', animation: 'slideUp 0.7s ease-out backwards', animationDelay: '0.5s', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.03), rgba(251, 146, 60, 0.03))' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg, #b00d6a, #904800)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: '0 8px 24px rgba(176, 13, 106, 0.2)' }}>
                  <span className="material-symbols-outlined mat-fill" style={{ fontSize: 28, color: '#ffffff' }}>psychology</span>
                </div>
                <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.125rem', fontWeight: 700, color: '#322e28', marginBottom: '0.375rem' }}>AI Moderation</h4>
                <p style={{ fontSize: '0.875rem', color: '#7b766e' }}>Automated content filtering</p>
              </div>
              <div style={{ padding: '1.5rem', background: 'rgba(176, 13, 106, 0.06)', borderRadius: '16px', border: '1px solid rgba(176, 13, 106, 0.1)' }}>
                <div className="gradient-text" style={{ fontSize: '2.75rem', fontWeight: 900, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '0.375rem', lineHeight: 1 }}>{analytics.hiddenContent}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9b958c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Items Filtered</div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="glass-card" style={{ padding: '2rem', animation: 'slideUp 0.7s ease-out backwards', animationDelay: '0.6s' }}>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.125rem', fontWeight: 700, color: '#322e28', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fb923c' }}>bolt</span>
                Quick Actions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link href="/admin/flagged" style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, #ec4899, #fb923c)', border: 'none', borderRadius: '14px', color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(236, 72, 153, 0.2)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.3)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(236, 72, 153, 0.2)' }}>
                  Review Reports
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                </Link>
                <Link href="/admin/users" style={{ padding: '1rem 1.25rem', background: '#f8f0e5', border: '1px solid rgba(234, 225, 213, 0.5)', borderRadius: '14px', color: '#322e28', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#efe7dc'; e.currentTarget.style.transform = 'translateX(2px)' }} onMouseLeave={(e) => { e.currentTarget.style.background = '#f8f0e5'; e.currentTarget.style.transform = 'translateX(0)' }}>
                  Manage Users
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div style={{ animation: 'slideUp 0.8s ease-out backwards', animationDelay: '0.7s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#322e28', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="material-symbols-outlined mat-fill" style={{ color: '#b00d6a', fontSize: 32 }}>flag</span>
              Recent Reports
            </h3>
            <Link href="/admin/flagged" style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ec4899', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'gap 0.2s', padding: '0.5rem 1rem', borderRadius: 9999, border: '1px solid rgba(236, 72, 153, 0.2)', background: 'rgba(236, 72, 153, 0.05)' }} onMouseEnter={(e) => e.currentTarget.style.gap = '0.625rem'} onMouseLeave={(e) => e.currentTarget.style.gap = '0.375rem'}>
              View All
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </Link>
          </div>

          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {(overview?.recentReports || []).slice(0, 5).map((report, index) => (
              <div key={report.id || index} className="glass-card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', animation: 'slideUp 0.5s ease-out backwards', animationDelay: `${0.8 + index * 0.05}s` }}>
                <div style={{ width: 60, height: 60, borderRadius: '18px', background: report.severity === 'high' ? 'linear-gradient(135deg, #b41340, #dc2626)' : 'linear-gradient(135deg, #fb923c, #ffc69f)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: report.severity === 'high' ? '0 8px 24px rgba(180, 19, 64, 0.2)' : '0 8px 24px rgba(251, 146, 60, 0.2)' }}>
                  <span className="material-symbols-outlined mat-fill" style={{ color: '#ffffff', fontSize: 28 }}>{report.icon || 'report'}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '1.0625rem', color: '#322e28' }}>{report.title}</h4>
                    <span style={{ fontSize: '0.8125rem', color: '#b3a898', fontWeight: 500, whiteSpace: 'nowrap' }}>{timeAgo(report.time)}</span>
                  </div>
                  <p style={{ fontSize: '0.9375rem', color: '#6b665e', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                    Reported by <span style={{ color: '#fb923c', fontWeight: 700 }}>{report.actor || report.reporter}</span>: &ldquo;{report.reason}&rdquo;
                  </p>
                  <Link href="/admin/flagged" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 9999, background: 'linear-gradient(135deg, #b00d6a, #904800)', color: '#ffffff', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 16px rgba(176, 13, 106, 0.2)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(176, 13, 106, 0.3)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(176, 13, 106, 0.2)' }}>
                    Review Now
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}

            {(overview?.recentReports || []).length === 0 && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'rgba(234, 225, 213, 0.5)', marginBottom: '1rem', display: 'block' }}>check_circle</span>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '1.125rem', color: '#4a4239', marginBottom: '0.375rem' }}>All clear! No pending reports.</p>
                <p style={{ fontSize: '0.9375rem', color: '#b3a898' }}>Your community is behaving well ☕</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}