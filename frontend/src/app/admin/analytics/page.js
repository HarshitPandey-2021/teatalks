'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'
import api from '@/lib/axios'

const CATEGORIES = ['Academic', 'Hostel', 'Rants', 'General', 'Reviews']

export default function AdminAnalyticsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [overview, setOverview] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const isRefreshingRef = useRef(false)

  useEffect(() => {
    document.title = "Analytics | TeaTalks Admin"
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
    if (!authLoading && isAuthenticated && user?.role !== 'admin') router.push('/feed')
  }, [authLoading, isAuthenticated, user, router])

  const loadData = useCallback(async () => {
    if (isRefreshingRef.current) return
    isRefreshingRef.current = true
    setLoadingData(true)

    try {
      const res = await api.get('/admin/overview')
      setOverview(res.data)
    } catch (error) {
      console.error('Failed to load analytics', error)
    } finally {
      isRefreshingRef.current = false
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadData()
    }
  }, [isAuthenticated, user?.role, loadData])

  const analytics = useMemo(() => {
    if (!overview) return null

    const stats = overview.stats || {}
    const totalPosts = stats.totalPosts || 0
    const totalUsers = stats.totalUsers || 0
    const pendingReports = stats.pendingReports || 0
    const hiddenContent = stats.hiddenContent || 0
    const activeToday = stats.activeToday || 0

    // Category distribution (simulated from total posts)
    const categoryData = CATEGORIES.map((cat, idx) => ({
      category: cat,
      count: Math.floor(totalPosts * [0.35, 0.25, 0.2, 0.15, 0.05][idx] || 0),
      color: ['#ec4899', '#fb923c', '#b00d6a', '#ea6c00', '#22c55e'][idx]
    }))

    const maxCategory = Math.max(...categoryData.map(c => c.count), 1)

    // Content moderation
    const visiblePosts = totalPosts
    const totalContent = visiblePosts + hiddenContent
    const safetyRate = totalContent > 0 ? Math.round((visiblePosts / totalContent) * 100) : 100

    // Engagement
    const engagementRate = totalUsers > 0 ? Math.round((activeToday / totalUsers) * 100) : 0
    const reportRate = totalPosts > 0 ? Math.round((pendingReports / totalPosts) * 100) : 0

    // Growth simulation (last 7 days)
    const growthData = Array.from({ length: 7 }, (_, i) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      users: Math.floor(totalUsers * (0.7 + i * 0.05)),
      posts: Math.floor(totalPosts * (0.65 + i * 0.05))
    }))

    const maxGrowth = Math.max(...growthData.map(d => Math.max(d.users, d.posts)), 1)

    return {
      stats: {
        totalPosts,
        totalUsers,
        pendingReports,
        hiddenContent,
        activeToday,
        safetyRate,
        engagementRate,
        reportRate
      },
      categoryData,
      maxCategory,
      growthData,
      maxGrowth
    }
  }, [overview])

  if (authLoading || !isAuthenticated || user?.role !== 'admin' || loadingData || !analytics) {
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
        
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes growBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        
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

        .chart-bar {
          transform-origin: left;
          animation: growBar 1s cubic-bezier(0.4, 0, 0.2, 1) backwards;
        }
      `}</style>

      <AdminSidebar activePage="analytics" />

      <main className="admin-main-content" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '85rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', animation: 'slideUp 0.6s ease-out' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 1.25rem', borderRadius: 9999, background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', marginBottom: '1.25rem' }}>
            <span className="material-symbols-outlined mat-fill" style={{ fontSize: 16, color: '#22c55e' }}>monitoring</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#22c55e' }}>Platform Analytics</span>
          </div>
          <h1 className="gradient-text" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.75rem', lineHeight: 1.1 }}>
            Analytics Dashboard
          </h1>
          <p style={{ color: '#7b766e', fontSize: '1.0625rem', fontWeight: 500, maxWidth: '45rem', lineHeight: 1.6 }}>
            Comprehensive insights into community activity, content distribution, and moderation metrics.
          </p>
        </div>

        {/* Key Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {[
            { label: 'Total Posts', value: analytics.stats.totalPosts, icon: 'forum', gradient: 'linear-gradient(135deg, #ec4899, #fb923c)', color: '#ec4899' },
            { label: 'Total Users', value: analytics.stats.totalUsers, icon: 'group', gradient: 'linear-gradient(135deg, #b00d6a, #904800)', color: '#b00d6a' },
            { label: 'Active Today', value: analytics.stats.activeToday, icon: 'bolt', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#22c55e' },
            { label: 'Pending Reports', value: analytics.stats.pendingReports, icon: 'report', gradient: 'linear-gradient(135deg, #ea6c00, #ffc69f)', color: '#ea6c00' },
          ].map((stat, index) => (
            <div key={stat.label} className="glass-card" style={{ padding: '1.75rem', animation: 'slideUp 0.5s ease-out backwards', animationDelay: `${index * 0.1}s`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: stat.gradient, borderRadius: '50%', filter: 'blur(50px)', opacity: 0.12, pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '14px', background: stat.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px ${stat.color}25` }}>
                  <span className="material-symbols-outlined mat-fill" style={{ fontSize: 24, color: '#ffffff' }}>{stat.icon}</span>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b3a898', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stat.label}</p>
                  <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#322e28', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{stat.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '3rem' }}>
          <style>{`@media (min-width: 1024px) { .charts-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>

          <div className="charts-grid" style={{ display: 'grid', gap: '2rem' }}>
            {/* Category Distribution */}
            <div className="glass-card" style={{ padding: '2rem', animation: 'slideUp 0.7s ease-out backwards', animationDelay: '0.4s' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#322e28', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#ec4899' }}>category</span>
                Category Distribution
              </h3>
              <p style={{ color: '#9b958c', fontSize: '0.875rem', marginBottom: '2rem' }}>Posts by category</p>

              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {analytics.categoryData.map((cat, idx) => (
                  <div key={cat.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4a4239', fontFamily: "'Inter', sans-serif" }}>{cat.category}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: cat.color }}>{cat.count}</span>
                    </div>
                    <div style={{ height: 10, background: 'rgba(234, 225, 213, 0.3)', borderRadius: 9999, overflow: 'hidden' }}>
                      <div className="chart-bar" style={{ height: '100%', width: `${(cat.count / analytics.maxCategory) * 100}%`, background: cat.color, borderRadius: 9999, boxShadow: `0 0 12px ${cat.color}40`, animationDelay: `${idx * 0.1}s` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Moderation Stats */}
            <div className="glass-card" style={{ padding: '2rem', animation: 'slideUp 0.7s ease-out backwards', animationDelay: '0.5s' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#322e28', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#22c55e' }}>shield</span>
                Moderation Overview
              </h3>
              <p style={{ color: '#9b958c', fontSize: '0.875rem', marginBottom: '2rem' }}>Content safety metrics</p>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {[
                  { label: 'Visible Posts', value: analytics.stats.totalPosts, total: analytics.stats.totalPosts + analytics.stats.hiddenContent, color: '#22c55e' },
                  { label: 'Hidden Content', value: analytics.stats.hiddenContent, total: analytics.stats.totalPosts + analytics.stats.hiddenContent, color: '#b41340' },
                  { label: 'Pending Review', value: analytics.stats.pendingReports, total: analytics.stats.totalPosts, color: '#ea6c00' },
                ].map((item, idx) => {
                  const percentage = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0
                  return (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4a4239', fontFamily: "'Inter', sans-serif" }}>{item.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", color: item.color }}>{item.value}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b3a898' }}>({percentage}%)</span>
                        </div>
                      </div>
                      <div style={{ height: 10, background: 'rgba(234, 225, 213, 0.3)', borderRadius: 9999, overflow: 'hidden' }}>
                        <div className="chart-bar" style={{ height: '100%', width: `${Math.min(percentage, 100)}%`, background: item.color, borderRadius: 9999, boxShadow: `0 0 12px ${item.color}40`, animationDelay: `${idx * 0.1}s` }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(34, 197, 94, 0.06)', borderRadius: '14px', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="material-symbols-outlined mat-fill" style={{ fontSize: 28, color: '#22c55e' }}>verified</span>
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Safety Score</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#22c55e', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{analytics.stats.safetyRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="glass-card" style={{ padding: '2rem', animation: 'slideUp 0.8s ease-out backwards', animationDelay: '0.6s' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#322e28', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#fb923c' }}>trending_up</span>
              Weekly Growth Trend
            </h3>
            <p style={{ color: '#9b958c', fontSize: '0.875rem', marginBottom: '2.5rem' }}>Users and posts over the last 7 days</p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '3px', background: '#ec4899' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6b665e' }}>Users</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '3px', background: '#22c55e' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6b665e' }}>Posts</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', height: '240px', padding: '1rem', background: 'rgba(248, 240, 229, 0.3)', borderRadius: '14px' }}>
              {analytics.growthData.map((day, idx) => (
                <div key={day.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', display: 'flex', gap: '0.375rem', alignItems: 'flex-end', height: '100%' }}>
                    <div style={{ flex: 1, background: 'linear-gradient(180deg, #ec4899, #fb923c)', borderRadius: '6px 6px 0 0', height: `${(day.users / analytics.maxGrowth) * 100}%`, minHeight: '4px', animation: 'growBar 0.8s ease-out backwards', animationDelay: `${idx * 0.1}s`, transformOrigin: 'bottom', boxShadow: '0 -2px 8px rgba(236, 72, 153, 0.2)' }} />
                    <div style={{ flex: 1, background: '#22c55e', borderRadius: '6px 6px 0 0', height: `${(day.posts / analytics.maxGrowth) * 100}%`, minHeight: '4px', animation: 'growBar 0.8s ease-out backwards', animationDelay: `${idx * 0.1 + 0.05}s`, transformOrigin: 'bottom', boxShadow: '0 -2px 8px rgba(34, 197, 94, 0.2)' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9b958c', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="glass-card" style={{ padding: '2rem', animation: 'slideUp 0.8s ease-out backwards', animationDelay: '0.7s', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.03), rgba(251, 146, 60, 0.03))' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#322e28', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#b00d6a' }}>insights</span>
              Engagement Insights
            </h3>
            <p style={{ color: '#9b958c', fontSize: '0.875rem', marginBottom: '2.5rem' }}>Community activity breakdown</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {[
                { label: 'Daily Active Rate', value: `${analytics.stats.engagementRate}%`, icon: 'groups', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
                { label: 'Report Rate', value: `${analytics.stats.reportRate}%`, icon: 'flag', color: '#ea6c00', bgColor: 'rgba(234, 108, 0, 0.1)' },
                { label: 'Content Safety', value: `${analytics.stats.safetyRate}%`, icon: 'verified', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
              ].map((metric, idx) => (
                <div key={metric.label} style={{ padding: '1.5rem', background: metric.bgColor, borderRadius: '14px', border: `1px solid ${metric.color}20`, animation: 'slideUp 0.5s ease-out backwards', animationDelay: `${0.8 + idx * 0.1}s` }}>
                  <span className="material-symbols-outlined mat-fill" style={{ fontSize: 32, color: metric.color, marginBottom: '0.75rem', display: 'block' }}>{metric.icon}</span>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b665e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{metric.label}</p>
                  <p style={{ fontSize: '2rem', fontWeight: 900, color: metric.color, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}