'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function CommentForm({
  onSubmit,
  placeholder,
  autoFocus = false,
  compact = false,
}) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [expanded, setExpanded] = useState(autoFocus)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() || loading) return
    setLoading(true)
    try {
      if (onSubmit) await onSubmit(text.trim())
      setText('')
      if (!autoFocus) setExpanded(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          background: '#ffffff',
          borderRadius: expanded ? '1.5rem' : '1rem',
          border: expanded
            ? '1px solid rgba(236, 72, 153, 0.15)'
            : '1px solid #eae1d5',
          padding: expanded ? '1.25rem' : '0.5rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: expanded ? '0 8px 24px rgba(0,0,0,0.04)' : 'none',
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setExpanded(true)}
          autoFocus={autoFocus}
          placeholder={placeholder || 'Add a comment... spill some tea ☕'}
          style={{
            width: '100%',
            background: expanded ? 'rgba(255, 247, 237, 0.5)' : 'transparent',
            border: 'none',
            borderRadius: '0.75rem',
            padding: expanded ? '1rem' : '0.625rem 0.75rem',
            fontFamily: "'Inter', sans-serif",
            fontSize: compact ? '0.875rem' : '0.9375rem',
            color: '#322e28',
            outline: 'none',
            resize: 'none',
            minHeight: expanded ? (compact ? '80px' : '100px') : '40px',
            lineHeight: 1.6,
            transition: 'all 0.3s',
          }}
        />

        {expanded && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            {/* Identity pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(251, 146, 60, 0.06)',
                padding: '0.375rem 0.75rem',
                borderRadius: 9999,
                border: '1px solid rgba(251, 146, 60, 0.1)',
              }}
            >
              <span style={{ fontSize: '0.9375rem' }}>
                {user?.anonymousEmoji}
              </span>
              <div>
                <p
                  style={{
                    fontSize: '0.5rem',
                    fontWeight: 700,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    lineHeight: 1,
                    marginBottom: 2,
                  }}
                >
                  Commenting As
                </p>
                <p
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    color: '#904800',
                  }}
                >
                  {user?.anonymousName}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <button
                type="button"
                onClick={() => {
                  setExpanded(false)
                  setText('')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#9ca3af',
                  padding: '0.5rem 0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!text.trim() || loading}
                style={{
                  background: text.trim()
                    ? 'linear-gradient(135deg, #ec4899, #fb923c)'
                    : '#e4dccf',
                  color: text.trim() ? '#ffffff' : '#b3aca3',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '0.625rem 1.25rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: text.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s',
                  boxShadow: text.trim()
                    ? '0 4px 12px rgba(236, 72, 153, 0.15)'
                    : 'none',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Posting…' : 'Comment'}
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 14 }}
                >
                  send
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}