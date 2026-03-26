'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: 'dashboard', href: '/admin' },
  { key: 'flagged', label: 'Flagged Content', icon: 'flag', href: '/admin/flagged' },
  { key: 'users', label: 'User Management', icon: 'group', href: '/admin/users' },
]

export default function AdminSidebar({ activePage = 'overview' }) {
  const { logout } = useAuth()
  const router = useRouter()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar-desktop" style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: 260, zIndex: 50,
        background: '#f8f0e5',
        display: 'none', flexDirection: 'column',
        padding: '2rem 0',
        borderRight: '1px solid rgba(179,172,163,0.1)',
      }}>
        <style>{`
          @media (min-width: 1024px) {
            .admin-sidebar-desktop { display: flex !important; }
            .admin-main-content { margin-left: 260px !important; }
            .admin-mobile-nav { display: none !important; }
          }
        `}</style>

        {/* Logo */}
        <div style={{ padding: '0 2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #b00d6a, #904800)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff',
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 22,
                fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
              }}>local_cafe</span>
            </div>
            <div>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 900, fontSize: '1.25rem',
                color: '#322e28', lineHeight: 1.2,
              }}>TeaTalks</h1>
              <p style={{
                fontSize: '0.6875rem', fontWeight: 600,
                color: '#b00d6a', opacity: 0.8,
              }}>Editorial Control</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.key
            return (
              <Link key={item.key} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                margin: '0 1rem', padding: '0.875rem 1.5rem',
                borderRadius: 9999, textDecoration: 'none',
                transition: 'all 0.2s',
                ...(isActive ? {
                  background: 'linear-gradient(135deg, #b00d6a, #904800)',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(176,13,106,0.2)',
                } : {
                  background: 'transparent',
                  color: '#322e28',
                  opacity: 0.6,
                }),
              }}>
                <span className="material-symbols-outlined" style={{
                  fontSize: 22,
                  fontVariationSettings: isActive
                    ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                    : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                }}>{item.icon}</span>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600, fontSize: '0.875rem',
                  letterSpacing: '0.01em',
                }}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Link href="/feed" style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0.75rem 1.5rem', borderRadius: 9999,
            color: '#322e28', opacity: 0.6, textDecoration: 'none',
            fontSize: '0.875rem', fontWeight: 600, transition: 'opacity 0.2s',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_back</span>
            Back to Feed
          </Link>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0.75rem 1.5rem', borderRadius: 9999,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#b41340', fontSize: '0.875rem', fontWeight: 600,
            fontFamily: "'Inter', sans-serif", width: '100%',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="admin-mobile-nav" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(253,245,235,0.9)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        padding: '1rem',
        borderBottom: '1px solid rgba(179,172,163,0.1)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '0.75rem',
        }}>
          <Link href="/admin" style={{
            textDecoration: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900, fontSize: '1.25rem',
            background: 'linear-gradient(135deg, #b00d6a, #904800)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>TeaTalks Admin</Link>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/feed" style={{
              padding: '0.5rem', borderRadius: '50%',
              background: '#f8f0e5', color: '#7b766e',
              display: 'flex', textDecoration: 'none',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
            </Link>
            <button onClick={logout} style={{
              padding: '0.5rem', borderRadius: '50%',
              background: '#fef2f2', color: '#b41340',
              border: 'none', cursor: 'pointer', display: 'flex',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.key
            return (
              <Link key={item.key} href={item.href} style={{
                padding: '0.5rem 1rem', borderRadius: 9999,
                whiteSpace: 'nowrap', textDecoration: 'none',
                fontSize: '0.8125rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                transition: 'all 0.2s',
                ...(isActive ? {
                  background: 'linear-gradient(135deg, #b00d6a, #904800)',
                  color: '#ffffff',
                } : {
                  background: '#f8f0e5', color: '#5f5b53',
                }),
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}