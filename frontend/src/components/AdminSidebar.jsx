'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import NotificationBell from './NotificationBell'

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: 'dashboard', href: '/admin' },
  { key: 'analytics', label: 'Analytics', icon: 'monitoring', href: '/admin/analytics' },
  { key: 'flagged', label: 'Flagged Content', icon: 'flag', href: '/admin/flagged' },
  { key: 'users', label: 'User Management', icon: 'group', href: '/admin/users' },
]
export default function AdminSidebar({ activePage = 'overview' }) {
  const { logout } = useAuth()

  return (
    <>
      <div className="admin-floating-notifications" style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 90,
        display: 'none',
      }}>
        <NotificationBell />
      </div>

      {/* Desktop Sidebar */}
      <aside className="admin-sidebar-desktop" style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: 280, zIndex: 50,
        background: '#ffffff',
        display: 'none', flexDirection: 'column',
        padding: '2.5rem 0',
        borderRight: '1px solid rgba(234, 225, 213, 0.4)',
        boxShadow: '4px 0 24px rgba(50, 46, 40, 0.03)',
      }}>
        <style>{`
          @media (min-width: 1024px) {
            .admin-sidebar-desktop { display: flex !important; }
            .admin-main-content { margin-left: 280px !important; }
            .admin-mobile-nav { display: none !important; }
            .admin-floating-notifications { display: block !important; }
          }
        `}</style>

        {/* Logo */}
        <div style={{ padding: '0 2rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '14px',
              background: 'linear-gradient(135deg, #ec4899, #fb923c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(236, 72, 153, 0.2)',
            }}>
              <span className="material-symbols-outlined mat-fill" style={{
                fontSize: 26, color: '#ffffff',
              }}>local_cafe</span>
            </div>
            <div>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 900, fontSize: '1.375rem',
                background: 'linear-gradient(135deg, #b00d6a, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2, marginBottom: '0.125rem',
              }}>TeaTalks</h1>
              <p style={{
                fontSize: '0.6875rem', fontWeight: 700,
                color: '#9b958c',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1.25rem' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.key
            return (
              <Link key={item.key} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.5rem',
                borderRadius: '14px', textDecoration: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                fontFamily: "'Inter', sans-serif",
                ...(isActive ? {
                  background: 'linear-gradient(135deg, #ec4899, #fb923c)',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(236, 72, 153, 0.25)',
                  transform: 'translateX(4px)',
                } : {
                  background: 'transparent',
                  color: '#6b665e',
                }),
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(248, 240, 229, 0.6)'
                  e.currentTarget.style.color = '#322e28'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#6b665e'
                }
              }}
              >
                <span className={`material-symbols-outlined ${isActive ? 'mat-fill' : ''}`} style={{
                  fontSize: 22,
                }}>{item.icon}</span>
                <span style={{
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.9375rem',
                  letterSpacing: '0.01em',
                }}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '0 1.25rem', marginTop: '1rem' }}>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1rem 1.5rem', borderRadius: '14px',
            background: 'rgba(180, 19, 64, 0.06)', border: '1px solid rgba(180, 19, 64, 0.1)',
            cursor: 'pointer',
            color: '#b41340', fontSize: '0.9375rem', fontWeight: 700,
            fontFamily: "'Inter', sans-serif", width: '100%',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(180, 19, 64, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(180, 19, 64, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(180, 19, 64, 0.06)'
            e.currentTarget.style.borderColor = 'rgba(180, 19, 64, 0.1)'
          }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="admin-mobile-nav" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid rgba(234, 225, 213, 0.4)',
        boxShadow: '0 4px 16px rgba(50, 46, 40, 0.03)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '1rem',
        }}>
          <Link href="/admin" style={{
            textDecoration: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900, fontSize: '1.375rem',
            background: 'linear-gradient(135deg, #b00d6a, #fb923c)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            display: 'flex', alignItems: 'center', gap: '0.625rem',
          }}>
            <span className="material-symbols-outlined mat-fill" style={{ fontSize: 24, color: '#ec4899' }}>local_cafe</span>
            TeaTalks
          </Link>
          <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
            <NotificationBell panelStyle={{ top: '3rem', right: 0, left: 'auto' }} />
            <button onClick={logout} style={{
              padding: '0.5rem', borderRadius: '12px',
              background: 'rgba(180, 19, 64, 0.06)', color: '#b41340',
              border: '1px solid rgba(180, 19, 64, 0.1)', cursor: 'pointer', display: 'flex',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
            </button>
          </div>
        </div>
        <div className="no-sb" style={{ display: 'flex', gap: '0.625rem', overflowX: 'auto', paddingBottom: '2px' }}>
          <style>{`.no-sb::-webkit-scrollbar { display: none; } .no-sb { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.key
            return (
              <Link key={item.key} href={item.href} style={{
                padding: '0.625rem 1.25rem', borderRadius: 9999,
                whiteSpace: 'nowrap', textDecoration: 'none',
                fontSize: '0.875rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.2s',
                fontFamily: "'Inter', sans-serif",
                ...(isActive ? {
                  background: 'linear-gradient(135deg, #ec4899, #fb923c)',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.2)',
                } : {
                  background: 'rgba(248, 240, 229, 0.5)', color: '#6b665e',
                  border: '1px solid rgba(234, 225, 213, 0.3)',
                }),
              }}>
                <span className={`material-symbols-outlined ${isActive ? 'mat-fill' : ''}`} style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}