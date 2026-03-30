'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AppNavbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <>
      <style>{`
        .nav-wrap {
          position: sticky;
          top: 0;
          z-index: 50;
          height: 3.5rem;
          background: rgba(255, 247, 237, 0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(176, 13, 106, 0.06);
        }
        .nav-inner {
          width: 100%;
          max-width: 80rem;
          height: 100%;
          margin: 0 auto;
          padding: 0 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
          text-decoration: none;
        }
        .nav-logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #b00d6a, #f97316);
          border-radius: 0.625rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 1rem;
          box-shadow: 0 2px 8px rgba(176, 13, 106, 0.15);
        }
        .nav-logo-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          font-size: 1.125rem;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #b00d6a, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Center search — desktop only */
        .nav-center {
          display: none;
        }
        @media (min-width: 1024px) {
          .nav-center {
            display: flex;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            max-width: 24rem;
          }
        }
        .nav-search-wrap {
          position: relative;
          width: 100%;
        }
        .nav-search-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: #a09a90;
          font-size: 18px;
          pointer-events: none;
        }
        .nav-search {
          width: 100%;
          height: 2.25rem;
          background: rgba(234, 225, 213, 0.35);
          border: 1px solid rgba(234, 225, 213, 0.3);
          border-radius: 9999px;
          padding-left: 2.5rem;
          padding-right: 1rem;
          font-size: 0.8125rem;
          color: #322e28;
          outline: none;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Inter', sans-serif;
        }
        .nav-search::placeholder {
          color: #a09a90;
          font-weight: 500;
        }
        .nav-search:hover {
          background: rgba(234, 225, 213, 0.55);
          border-color: rgba(234, 225, 213, 0.5);
        }
        .nav-search:focus {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(176, 13, 106, 0.15);
          box-shadow: 0 0 0 3px rgba(176, 13, 106, 0.06);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 0.125rem;
          flex-shrink: 0;
        }

        .nav-icon-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          color: #5f5b53;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-icon-btn:hover {
          background: rgba(234, 225, 213, 0.5);
          color: #322e28;
        }
        .nav-icon-btn:active {
          transform: scale(0.94);
        }

        /* Mobile search button */
        .nav-search-mobile {
          display: flex;
        }
        @media (min-width: 1024px) {
          .nav-search-mobile {
            display: none;
          }
        }

        .nav-notif-dot {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 6px;
          height: 6px;
          background: #e11d48;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 247, 237, 0.9);
          pointer-events: none;
        }

        .nav-profile-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem;
          padding-right: 0.25rem;
          border-radius: 9999px;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-tap-highlight-color: transparent;
        }
        .nav-profile-link:hover {
          background: rgba(234, 225, 213, 0.45);
        }
        .nav-profile-link:active {
          transform: scale(0.97);
        }
        @media (min-width: 1024px) {
          .nav-profile-link {
            padding-right: 0.75rem;
          }
        }
        .nav-profile-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899, #fb923c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          flex-shrink: 0;
        }
        .nav-profile-name {
          display: none;
          font-size: 0.8125rem;
          font-weight: 700;
          color: #322e28;
          font-family: 'Plus Jakarta Sans', sans-serif;
          white-space: nowrap;
        }
        @media (min-width: 1024px) {
          .nav-profile-name {
            display: block;
          }
        }

        .nav-logout {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          color: #b3aca3;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-tap-highlight-color: transparent;
          opacity: 0.7;
        }
        .nav-logout:hover {
          background: rgba(225, 29, 72, 0.06);
          color: #be123c;
          opacity: 1;
        }
        .nav-logout:active {
          transform: scale(0.92);
        }

        .nav-divider {
          width: 1px;
          height: 20px;
          background: rgba(234, 225, 213, 0.5);
          margin: 0 0.375rem;
          flex-shrink: 0;
        }
      `}</style>

      <header className="nav-wrap">
        <div className="nav-inner">
          {/* Left — Logo */}
          <Link href="/feed" className="nav-left">
            <div className="nav-logo-icon">☕</div>
            <span className="nav-logo-text">TeaTalks</span>
          </Link>

          {/* Center — Search (desktop) */}
          <div className="nav-center">
            <div className="nav-search-wrap">
              <span className="material-symbols-outlined nav-search-icon">search</span>
              <input
                type="text"
                placeholder="Search campus tea..."
                onClick={() => router.push('/search')}
                readOnly
                className="nav-search"
              />
            </div>
          </div>

          {/* Right — Actions */}
          <div className="nav-right">
            {/* Mobile search */}
            <button
              onClick={() => router.push('/search')}
              className="nav-icon-btn nav-search-mobile"
              aria-label="Search"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 21 }}>search</span>
            </button>

            {/* Notifications */}
            <button className="nav-icon-btn" aria-label="Notifications">
              <span className="material-symbols-outlined" style={{ fontSize: 21 }}>notifications</span>
              <span className="nav-notif-dot" />
            </button>

            <div className="nav-divider" />

            {/* Profile pill */}
            <Link href="/profile" className="nav-profile-link">
              <div className="nav-profile-avatar">{user?.anonymousEmoji}</div>
              <span className="nav-profile-name">{user?.anonymousName}</span>
            </Link>

            {/* Logout */}
            <button onClick={logout} title="Log out" className="nav-logout">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}