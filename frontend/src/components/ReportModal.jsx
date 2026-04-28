'use client'

import { useState } from 'react'
import { MAX_REPORT_REASON_LENGTH } from '@/lib/validation'

const REASONS = [
  { key: 'harassment', label: 'Harassment or Bullying', icon: 'block' },
  { key: 'spam', label: 'Spam or Self-promotion', icon: 'report' },
  { key: 'personal_info', label: 'Exposes Personal Info', icon: 'visibility_off' },
  { key: 'inappropriate', label: 'Inappropriate Content', icon: 'dangerous' },
  { key: 'hate_speech', label: 'Hate Speech', icon: 'sentiment_very_dissatisfied' },
  { key: 'other', label: 'Other', icon: 'more_horiz' },
]

export default function ReportModal({ isOpen, onClose, onSubmit, targetType = 'post' }) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!reason) return
    setLoading(true)
    try {
      await onSubmit({ reason, description: description.trim() })
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setReason('')
        setDescription('')
        onClose()
      }, 1500)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setReason('')
      setDescription('')
      onClose()
    }
  }

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15, 12, 8, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'rmFadeIn 0.2s ease',
      }}
    >
           <div
        onClick={(e) => e.stopPropagation()}
        style={{
        background: '#ffffff',
        borderRadius: '2rem',
        width: '100%', maxWidth: '28rem',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
        animation: 'rmSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>

        {submitted ? (
          /* ── Success State ── */
          <div style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            animation: 'rmFadeIn 0.3s ease',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#22c55e' }}>
                check_circle
              </span>
            </div>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: '1.25rem',
              color: '#322e28', marginBottom: '0.5rem',
            }}>
              Report Submitted
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#7b766e' }}>
              Our team will review this {targetType} shortly.
            </p>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div style={{
              padding: '1.5rem 1.5rem 1rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1px solid #f3f4f6',
            }}>
              <div>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: '1.25rem',
                  color: '#322e28',
                }}>
                  Report {targetType === 'post' ? 'Post' : 'Comment'}
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  Help us keep TeaTalks safe
                </p>
              </div>
              <button
                onClick={() => { setReason(''); setDescription(''); onClose() }}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#f8f0e5', border: 'none',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#7b766e', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#eae1d5')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#f8f0e5')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            {/* ── Reasons ── */}
            <div style={{ padding: '1rem 1.5rem' }}>
              <p style={{
                fontSize: '0.6875rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#b3aca3', marginBottom: '0.75rem',
              }}>
                Select a reason
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {REASONS.map((r) => {
                  const selected = reason === r.key
                  return (
                    <button
                      key={r.key}
                      onClick={() => setReason(r.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.875rem 1rem',
                        borderRadius: '1rem',
                        border: selected ? '2px solid #b41340' : '2px solid transparent',
                        background: selected ? 'rgba(180, 19, 64, 0.04)' : '#f8f0e5',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        width: '100%', textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        if (!selected) e.currentTarget.style.background = '#eae1d5'
                      }}
                      onMouseLeave={(e) => {
                        if (!selected) e.currentTarget.style.background = '#f8f0e5'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{
                        fontSize: 20,
                        color: selected ? '#b41340' : '#7b766e',
                      }}>
                        {r.icon}
                      </span>
                      <span style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: selected ? 700 : 600,
                        fontSize: '0.875rem',
                        color: selected ? '#b41340' : '#322e28',
                      }}>
                        {r.label}
                      </span>
                      {selected && (
                        <span className="material-symbols-outlined" style={{
                          fontSize: 18, color: '#b41340', marginLeft: 'auto',
                        }}>
                          check_circle
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Description ── */}
            {reason && (
              <div style={{
                padding: '0 1.5rem 1rem',
                animation: 'rmFadeIn 0.2s ease',
              }}>
                <p style={{
                  fontSize: '0.6875rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: '#b3aca3', marginBottom: '0.5rem',
                }}>
                  Additional details (optional)
                </p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, MAX_REPORT_REASON_LENGTH))}
                  placeholder="Tell us more about what's wrong..."
                  style={{
                    width: '100%', minHeight: 80,
                    background: '#f8f0e5', border: 'none',
                    borderRadius: '0.75rem', padding: '0.75rem 1rem',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.875rem', color: '#322e28',
                    outline: 'none', resize: 'none',
                    lineHeight: 1.6,
                  }}
                />
                <p style={{ marginTop: '0.375rem', fontSize: '0.6875rem', color: '#9ca3af', textAlign: 'right' }}>
                  {description.length}/{MAX_REPORT_REASON_LENGTH}
                </p>
              </div>
            )}

            {/* ── Actions ── */}
            <div style={{
              padding: '1rem 1.5rem 1.5rem',
              display: 'flex', gap: '0.75rem',
              borderTop: '1px solid #f3f4f6',
            }}>
              <button
                onClick={() => { setReason(''); setDescription(''); onClose() }}
                style={{
                  flex: 1, padding: '0.875rem',
                  background: 'transparent',
                  border: '1px solid #eae1d5',
                  borderRadius: 9999,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.875rem',
                  color: '#7b766e', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f0e5')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason || loading}
                style={{
                  flex: 1, padding: '0.875rem',
                  background: reason ? '#b41340' : '#eae1d5',
                  border: 'none',
                  borderRadius: 9999,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.875rem',
                  color: reason ? '#ffffff' : '#b3aca3',
                  cursor: reason ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'rmSpin 0.6s linear infinite',
                    }} />
                    Submitting…
                  </>
                ) : 'Submit Report'}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes rmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes rmSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rmSpin { to { transform: rotate(360deg); } }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  )
}
