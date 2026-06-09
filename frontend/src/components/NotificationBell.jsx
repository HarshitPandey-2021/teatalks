'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import api from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'

function timeAgo(dateValue) {
  if (!dateValue) return 'now'
  const seconds = Math.floor((Date.now() - new Date(dateValue).getTime()) / 1000)
  if (seconds < 60) return 'now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

export default function NotificationBell({ panelStyle, dropdownAlign = 'right' }) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const dropdownRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const res = await api.get('/users/notifications', { params: { limit: 12 } })
      const allNotifications = Array.isArray(res.data?.notifications) ? res.data.notifications : []
      setNotifications(allNotifications.filter((item) => !item?.readAt))
      setUnreadCount(Number(res.data?.unreadCount || 0))
    } catch (error) {
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadNotifications()
    const intervalId = window.setInterval(loadNotifications, 30000)
    return () => window.clearInterval(intervalId)
  }, [loadNotifications])

  useEffect(() => {
    if (!open) return
    const onClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const handle = () => setIsMobile(mq.matches)
    handle()
    if (mq.addEventListener) mq.addEventListener('change', handle)
    else mq.addListener(handle)
    window.addEventListener('resize', handle)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handle)
      else mq.removeListener(handle)
      window.removeEventListener('resize', handle)
    }
  }, [])

  const hasUnread = unreadCount > 0
  const positionStyle = useMemo(() => (
    dropdownAlign === 'left'
      ? { left: 0 }
      : { right: 0 }
  ), [dropdownAlign])
  const footerHref = user?.role === 'admin' ? '/admin/flagged' : '/profile'
  const footerLabel = user?.role === 'admin' ? 'Review flagged content' : 'View profile activity'

  const openNotification = useCallback(async (notification) => {
    try {
      if (!notification.readAt) {
        const res = await api.patch(`/users/notifications/${notification._id}/read`)
        setUnreadCount(Number(res.data?.unreadCount || 0))
        setNotifications((prev) => prev.filter((item) => item._id !== notification._id))
      }
    } catch (error) {
      // Ignore transient mark-read failures and still navigate.
    } finally {
      setOpen(false)
      router.push(notification.href || '/feed')
    }
  }, [router])

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        aria-label="Notifications"
        onClick={() => setOpen((value) => !value)}
        style={{
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          color: '#5f5b53',
          transition: 'all 0.2s',
          position: 'relative',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
        {hasUnread ? (
          <span style={{
            position: 'absolute',
            top: 2,
            right: -2,
            minWidth: 18,
            height: 18,
            borderRadius: 999,
            background: '#e11d48',
            color: '#fff',
            fontSize: '0.625rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 5px',
            border: '2px solid rgba(255,247,237,0.95)',
          }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        ) : null}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            style={{
              position: isMobile ? 'fixed' : 'absolute',
              top: isMobile ? '4.25rem' : '3rem',
              left: isMobile ? '50%' : undefined,
              transform: isMobile ? 'translateX(-50%)' : undefined,
              width: isMobile ? 'calc(100vw - 1.5rem)' : 340,
              maxWidth: isMobile ? 'calc(100vw - 1rem)' : 'calc(100vw - 2rem)',
              background: '#fff',
              border: '1px solid rgba(234,225,213,0.35)',
              borderRadius: 12,
              boxShadow: '0 12px 30px rgba(50,46,40,0.12)',
              zIndex: 120,
              padding: '0.5rem 0.5rem 0.25rem',
              ...(isMobile ? {} : positionStyle),
              ...panelStyle,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.5rem 0.5rem' }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: '0.8rem', color: '#322e28' }}>Notifications</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#b00d6a', background: 'rgba(176,13,106,0.08)', padding: '2px 8px', borderRadius: 999 }}>
                {unreadCount} unread
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '1rem', fontSize: '0.75rem', color: '#9b958c', textAlign: 'center' }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#d4cec5' }}>notifications_none</span>
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: '#7b766e', fontWeight: 700 }}>No notifications yet</p>
              </div>
            ) : (
              <div style={{
                maxHeight: notifications.length > 3 ? 350 : 'none',
                overflowY: notifications.length > 3 ? 'auto' : 'visible',
                paddingRight: notifications.length > 3 ? '0.125rem' : 0,
              }}>
                {notifications.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => openNotification(item)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.65rem 0.6rem',
                      textAlign: 'left',
                      borderRadius: 8,
                      marginBottom: '0.2rem',
                      border: '1px solid rgba(234,225,213,0.2)',
                      background: item.readAt ? '#fff' : 'rgba(255,247,237,0.85)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#322e28' }}>{item.title}</span>
                      <span style={{ fontSize: '0.62rem', color: '#9b958c', fontWeight: 600, flexShrink: 0 }}>{timeAgo(item.createdAt)}</span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: '#6b665e', lineHeight: 1.35 }}>{item.message}</p>
                    {!item.readAt ? (
                      <span style={{ display: 'inline-flex', marginTop: '0.4rem', fontSize: '0.62rem', fontWeight: 800, color: '#b00d6a' }}>
                        New
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}

            <Link
              href={footerHref}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '0.45rem 0.55rem 0.55rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#904800',
                textDecoration: 'none',
              }}
            >
              {footerLabel}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
