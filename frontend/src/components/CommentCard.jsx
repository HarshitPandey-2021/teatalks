'use client'

import { useState, useCallback } from 'react'
import CommentForm from './CommentForm'
import api from '@/lib/axios'

function timeAgo(dateStr) {
  if (!dateStr) return 'just now'
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return `${Math.floor(diff / 604800)}w ago`
}

export default function CommentCard({
  comment,
  postAuthorName,
  onReply,
  depth = 0,
}) {
  const [showReply, setShowReply] = useState(false)
  const [vote, setVote] = useState(comment.userVote ?? null)
  const [score, setScore] = useState(Number(comment.score || 0))

  const isOP = comment.anonymousName === postAuthorName
  const maxDepth = 2

  const handleVote = useCallback(async (dir) => {
    const prev = vote
    let newVote, delta = 0

    if (prev === dir) {
      newVote = null
      delta = dir === 'up' ? -1 : 1
    } else {
      newVote = dir
      delta = prev === null
        ? (dir === 'up' ? 1 : -1)
        : (dir === 'up' ? 2 : -2)
    }

    setVote(newVote)
    setScore((s) => s + delta)
    try {
      const res = await api.post(`/comments/${comment._id}/vote`, {
        vote: newVote === 'up' ? 1 : newVote === 'down' ? -1 : 0,
      })
      const updated = res.data?.comment
      if (updated) {
        setVote(updated.userVote ?? null)
        setScore(Number(updated.score || 0))
      }
    } catch {
      setVote(prev)
      setScore((s) => s - delta)
    }
  }, [vote, comment._id])

  const handleReplySubmit = async (text) => {
    if (onReply) onReply(comment._id, text)
    setShowReply(false)
  }

  return (
    <div>
      {/* Comment card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: depth > 0 ? '1rem' : '1.5rem',
          padding: depth > 0 ? '1rem' : '1.25rem',
          border: '1px solid rgba(234, 225, 213, 0.5)',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = 'rgba(236,72,153,0.15)')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = 'rgba(234,225,213,0.5)')
        }
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
          }}
        >
          <span
            style={{
              fontSize: depth > 0 ? '1rem' : '1.25rem',
              background: isOP
                ? 'linear-gradient(135deg, #ec4899, #fb923c)'
                : 'rgba(248, 240, 229, 0.5)',
              width: depth > 0 ? 32 : 40,
              height: depth > 0 ? 32 : 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: isOP ? '50%' : '0.75rem',
              flexShrink: 0,
            }}
          >
            {comment.anonymousEmoji}
          </span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: '#1f2937',
                  fontSize: depth > 0 ? '0.8125rem' : '0.875rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {comment.anonymousName}
              </span>
              {isOP && (
                <span
                  style={{
                    padding: '0.0625rem 0.375rem',
                    background: 'rgba(236, 72, 153, 0.1)',
                    color: '#ec4899',
                    fontSize: '0.5625rem',
                    fontWeight: 800,
                    borderRadius: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    lineHeight: '1.25rem',
                  }}
                >
                  OP
                </span>
              )}
              <span
                style={{
                  fontSize: '0.625rem',
                  color: '#9ca3af',
                  fontWeight: 600,
                }}
              >
                • {timeAgo(comment.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Text */}
        <p
          style={{
            color: '#4b5563',
            fontSize: depth > 0 ? '0.875rem' : '0.9375rem',
            lineHeight: 1.7,
            margin: '0.5rem 0 0.75rem',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {comment.text}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Vote pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'rgba(255, 247, 237, 0.5)',
              borderRadius: '0.75rem',
              padding: '0.125rem 0.5rem',
            }}
          >
            <button
              onClick={() => handleVote('up')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                padding: '0.25rem',
                color: vote === 'up' ? '#ec4899' : '#9ca3af',
                transition: 'color 0.2s',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 18,
                  fontVariationSettings:
                    vote === 'up'
                      ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                      : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                }}
              >
                thumb_up
              </span>
            </button>
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.75rem',
                color: '#4b5563',
                minWidth: '1rem',
                textAlign: 'center',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {score}
            </span>
            <button
              onClick={() => handleVote('down')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                padding: '0.25rem',
                color: vote === 'down' ? '#fb923c' : '#9ca3af',
                transition: 'color 0.2s',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 18,
                  fontVariationSettings:
                    vote === 'down'
                      ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                      : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                }}
              >
                thumb_down
              </span>
            </button>
          </div>

          {/* Reply */}
          {depth < maxDepth && (
            <button
              onClick={() => setShowReply(!showReply)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: showReply ? '#ec4899' : '#9ca3af',
                fontSize: '0.6875rem',
                fontWeight: 700,
                transition: 'color 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 14 }}
              >
                reply
              </span>
              Reply
            </button>
          )}
        </div>
      </div>

      {/* Reply form */}
      {showReply && (
        <div style={{ marginLeft: '1.5rem', marginTop: '0.75rem' }}>
          <CommentForm
            onSubmit={handleReplySubmit}
            placeholder={`Reply to ${comment.anonymousName}...`}
            autoFocus
            compact
          />
        </div>
      )}

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div
          style={{
            marginLeft: '1.25rem',
            marginTop: '1rem',
            paddingLeft: '1.25rem',
            borderLeft: '2px solid #eae1d5',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply._id}
              comment={reply}
              postAuthorName={postAuthorName}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}