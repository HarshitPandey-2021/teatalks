'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORY_STYLES = {
  Academic: { bg: '#fdf2f8', color: '#ec4899' },
  Hostel: { bg: '#fff7ed', color: '#fb923c' },
  Rants: { bg: '#fef2f2', color: '#b41340' },
  General: { bg: '#f8f0e5', color: '#904800' },
  Reviews: { bg: '#fffaf0', color: '#9a3412' },
}

function timeAgo(dateStr) {
  if (!dateStr) return 'just now'
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return `${Math.floor(diff / 604800)}w ago`
}

function formatScore(n) {
  if (n >= 10000) return (n / 1000).toFixed(0) + 'k'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toString()
}

export default function PostCard({
  _id,
  anonymousEmoji = '🦊',
  anonymousName = 'Anonymous',
  category = 'General',
  text = '',
  imageUrl = null,
  tags = [],
  score = 0,
  commentCount = 0,
  createdAt = null,
  userVote = null,
  onVote,
  onComment,
  onShare,
}) {
  const [localVote, setLocalVote] = useState(userVote)
  const [localScore, setLocalScore] = useState(score)
  const [hovered, setHovered] = useState(false)

  const catStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.General
    const router = useRouter()

  const navigateToPost = () => {
    router.push(`/posts/${_id}`)
  }

  const handleVote = useCallback((dir) => {
    setLocalVote((prev) => {
      let newVote
      let scoreDelta = 0

      if (prev === dir) {
        newVote = null
        scoreDelta = dir === 'up' ? -1 : 1
      } else {
        newVote = dir
        if (prev === null) {
          scoreDelta = dir === 'up' ? 1 : -1
        } else {
          scoreDelta = dir === 'up' ? 2 : -2
        }
      }

      setLocalScore((s) => s + scoreDelta)
      if (onVote) onVote(_id, newVote)
      return newVote
    })
  }, [_id, onVote])

  return (
       <article
      onClick={navigateToPost}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: hovered
          ? '0 20px 40px rgba(50, 46, 40, 0.08)'
          : '0 4px 20px rgba(0, 0, 0, 0.03)',
        transform: hovered ? 'scale(1.01)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        padding: '1.5rem 1.5rem 1rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Avatar */}
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
          }}>
            {anonymousEmoji}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '1rem',
              color: '#1f2937', lineHeight: 1.2,
            }}>
              {anonymousName}
            </span>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.6875rem', color: '#9ca3af',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              fontWeight: 500,
            }}>
              {timeAgo(createdAt)}
            </span>
          </div>
        </div>

        {/* Category Pill */}
        <div style={{
          background: catStyle.bg,
          padding: '0.25rem 0.75rem',
          borderRadius: 9999,
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.625rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: catStyle.color,
          }}>
            #{category}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '0.5rem 1.5rem' }}>
        <p style={{
          fontSize: '1rem', lineHeight: 1.6,
          color: '#1f2937', fontWeight: 500,
          fontFamily: "'Inter', sans-serif",
        }}>
          {text}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
            marginTop: '1rem',
          }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 9999,
                  background: '#fffaf0',
                  color: '#fb923c',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  border: '1px solid rgba(251, 146, 60, 0.1)',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Optional Image ── */}
      {imageUrl && (
        <div style={{
          padding: '1rem 1.5rem 0',
        }}>
          <div style={{
            width: '100%',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(251, 146, 60, 0.05)',
          }}>
            <img
              src={imageUrl}
              alt="Post content"
              style={{
                width: '100%', height: 'auto',
                objectFit: 'cover', display: 'block',
                maxHeight: 400,
                transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hovered ? 'scale(1.03)' : 'scale(1)',
              }}
            />
          </div>
        </div>
      )}

      {/* ── Action Bar ── */}
      <div style={{
        padding: '1.25rem 1.5rem',
        marginTop: '1rem',
        background: 'rgba(248, 240, 229, 0.3)',
        borderTop: '1px solid rgba(243, 244, 246, 1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

          {/* Vote Pill */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: '#fdf5eb',
            borderRadius: 9999,
            padding: 4,
            border: '1px solid rgba(243, 244, 246, 0.5)',
          }}>
            {/* Upvote */}
            <button
              onClick={(e) => { e.stopPropagation(); handleVote('up') }}
              style={{
                width: 36, height: 36,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.2s',
                ...(localVote === 'up'
                  ? {
                      background: 'linear-gradient(135deg, #ec4899, #fb923c)',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(236, 72, 153, 0.2)',
                    }
                  : {
                      background: 'transparent',
                      color: '#9ca3af',
                    }),
              }}
              onMouseEnter={(e) => {
                if (localVote !== 'up') e.currentTarget.style.background = 'rgba(243,244,246,0.5)'
              }}
              onMouseLeave={(e) => {
                if (localVote !== 'up') e.currentTarget.style.background = 'transparent'
              }}
            >
              <span
                className={`material-symbols-outlined ${localVote === 'up' ? 'mat-fill' : ''}`}
                style={{ fontSize: 18 }}
              >arrow_upward</span>
            </button>

            {/* Score */}
            <span style={{
              padding: '0 0.75rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: '0.9375rem',
              color: localVote === 'up' ? '#ec4899' : localVote === 'down' ? '#b41340' : '#322e28',
              minWidth: '2.5rem', textAlign: 'center',
              transition: 'color 0.2s',
            }}>
              {formatScore(localScore)}
            </span>

            {/* Downvote */}
            <button
              onClick={(e) => { e.stopPropagation(); handleVote('down') }}
              style={{
                width: 36, height: 36,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.2s',
                ...(localVote === 'down'
                  ? {
                      background: 'rgba(180, 19, 64, 0.1)',
                      color: '#b41340',
                    }
                  : {
                      background: 'transparent',
                      color: '#9ca3af',
                    }),
              }}
              onMouseEnter={(e) => {
                if (localVote !== 'down') e.currentTarget.style.background = 'rgba(243,244,246,0.5)'
              }}
              onMouseLeave={(e) => {
                if (localVote !== 'down') e.currentTarget.style.background = 'transparent'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                arrow_downward
              </span>
            </button>
          </div>

          {/* Comments */}
          <button
            onClick={(e) => { e.stopPropagation(); if (onComment) onComment(_id) }}
            className="pc-action-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 1rem',
              borderRadius: 9999,
              background: 'transparent',
              border: '1px solid transparent',
              cursor: 'pointer',
              color: '#6b7280',
              transition: 'all 0.2s',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '0.875rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.borderColor = 'rgba(243,244,246,1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <span style={{ fontSize: '1rem' }}>💬</span>
            <span>{commentCount}</span>
          </button>
        </div>

        {/* Secondary Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {/* Share/Link */}
          <button
            onClick={(e) => { e.stopPropagation(); if (onShare) onShare(_id) }}
            style={{
              width: 40, height: 40,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              border: '1px solid transparent',
              cursor: 'pointer',
              color: '#9ca3af',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.borderColor = 'rgba(243,244,246,1)'
              e.currentTarget.style.color = '#ec4899'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.color = '#9ca3af'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>link</span>
          </button>

          {/* More */}
          <button
            style={{
              width: 40, height: 40,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              border: '1px solid transparent',
              cursor: 'pointer',
              color: '#9ca3af',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.borderColor = 'rgba(243,244,246,1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_horiz</span>
          </button>
        </div>
      </div>

      {/* Styles for material icons */}
      <style>{`
        .mat-fill {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </article>
  )
}