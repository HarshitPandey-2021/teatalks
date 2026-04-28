'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ToastContext = createContext(null)

const TOAST_META = {
  success: {
    icon: 'check_circle',
    accent: '#0f9f6e',
    border: 'rgba(15, 159, 110, 0.22)',
    glow: 'rgba(15, 159, 110, 0.18)',
    background: 'linear-gradient(135deg, rgba(236, 253, 245, 0.98), rgba(209, 250, 229, 0.96))',
  },
  error: {
    icon: 'error',
    accent: '#b4234f',
    border: 'rgba(180, 35, 79, 0.2)',
    glow: 'rgba(180, 35, 79, 0.18)',
    background: 'linear-gradient(135deg, rgba(255, 241, 242, 0.99), rgba(255, 228, 230, 0.97))',
  },
  warning: {
    icon: 'warning',
    accent: '#a35a00',
    border: 'rgba(163, 90, 0, 0.2)',
    glow: 'rgba(249, 115, 22, 0.16)',
    background: 'linear-gradient(135deg, rgba(255, 247, 237, 0.99), rgba(254, 215, 170, 0.94))',
  },
  info: {
    icon: 'info',
    accent: '#9a2f6b',
    border: 'rgba(154, 47, 107, 0.18)',
    glow: 'rgba(176, 13, 106, 0.18)',
    background: 'linear-gradient(135deg, rgba(253, 242, 248, 0.99), rgba(252, 231, 243, 0.96))',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const dismissToast = useCallback((id) => {
    const timeoutId = timersRef.current.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message, options = {}) => {
    if (!message) return null

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const type = options.type || 'info'
    const duration = options.duration ?? (type === 'error' ? 5000 : 3600)
    const title = options.title || (
      type === 'success' ? 'Success' :
      type === 'error' ? 'Something went wrong' :
      type === 'warning' ? 'Heads up' :
      'Update'
    )

    setToasts((prev) => [...prev, { id, title, message, type }])

    const timeoutId = setTimeout(() => dismissToast(id), duration)
    timersRef.current.set(id, timeoutId)
    return id
  }, [dismissToast])

  const value = useMemo(() => ({
    showToast,
    success: (message, options = {}) => showToast(message, { ...options, type: 'success' }),
    error: (message, options = {}) => showToast(message, { ...options, type: 'error' }),
    warning: (message, options = {}) => showToast(message, { ...options, type: 'warning' }),
    info: (message, options = {}) => showToast(message, { ...options, type: 'info' }),
    dismissToast,
  }), [dismissToast, showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="tt-toast-viewport" aria-live="polite" aria-atomic="true">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const meta = TOAST_META[toast.type] || TOAST_META.info

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="tt-toast-card"
                style={{
                  background: meta.background,
                  borderColor: meta.border,
                  boxShadow: `0 18px 40px -24px ${meta.glow}, 0 12px 34px rgba(50, 46, 40, 0.12)`,
                }}
              >
                <div
                  className="tt-toast-icon-wrap"
                  style={{
                    background: `linear-gradient(135deg, ${meta.accent}, #f97316)`,
                    boxShadow: `0 10px 22px -16px ${meta.accent}`,
                  }}
                >
                  <span className="material-symbols-outlined mat-fill" style={{ fontSize: 18, color: '#fff' }}>
                    {meta.icon}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="tt-toast-title" style={{ color: meta.accent }}>
                    {toast.title}
                  </p>
                  <p className="tt-toast-message">
                    {toast.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="tt-toast-close"
                  aria-label="Dismiss notification"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>')
  }
  return context
}
