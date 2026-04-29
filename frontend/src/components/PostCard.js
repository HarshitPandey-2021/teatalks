// components/PostCard.jsx
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ReportModal from './ReportModal'
import PostPoll from './PostPoll'
import api from '@/lib/axios'

const CAT_STYLES = {
  Academic: { bg: 'rgba(176,13,106,0.06)', color: '#b00d6a', border: 'rgba(176,13,106,0.10)' },
  Hostel:   { bg: 'rgba(154,52,18,0.06)',  color: '#9a3412', border: 'rgba(154,52,18,0.10)' },
  Rants:    { bg: 'rgba(180,19,64,0.06)',  color: '#b41340', border: 'rgba(180,19,64,0.10)' },
  General:  { bg: 'rgba(34,197,94,0.06)',  color: '#16a34a', border: 'rgba(34,197,94,0.10)' },
  Reviews:  { bg: 'rgba(249,115,22,0.06)', color: '#ea6c00', border: 'rgba(249,115,22,0.10)' },
}

function timeAgo(d) {
  if (!d) return 'just now'
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}

function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

function PollUI({ poll, postId }) {
  const [voted, setVoted] = useState(poll.userVoted)
  const [votes, setVotes] = useState([...poll.votes])

  const totalVotes = votes.reduce((a, b) => a + b, 0)

  const handleVote = useCallback((e, idx) => {
    e.stopPropagation()
    if (voted !== null && voted !== undefined) return

    const newVotes = [...votes]
    newVotes[idx] += 1
    setVotes(newVotes)
    setVoted(idx)
  }, [voted, votes])

  const hasVoted = voted !== null && voted !== undefined

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '0.375rem',
      padding: '0.75rem',
      background: 'linear-gradient(180deg, #faf8f4, #f5f0e8)',
      borderRadius: '0.75rem',
      border: '1px solid rgba(211,200,185,0.25)',
      marginTop: '0.5rem',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        marginBottom: '0.125rem',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#b00d6a' }}>ballot</span>
        <span style={{
          fontSize: '0.625rem', fontWeight: 700, color: '#857f75',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>Poll</span>
        {hasVoted && (
          <span style={{
            fontSize: '0.5625rem', fontWeight: 600, color: '#16a34a',
            marginLeft: 'auto',
          }}>✓ Voted</span>
        )}
      </div>

      {poll.options.map((opt, idx) => {
        const pct = totalVotes > 0 ? Math.round((votes[idx] / totalVotes) * 100) : 0
        const isSelected = voted === idx
        const isWinning = hasVoted && votes[idx] === Math.max(...votes)

        return (
          <button
            key={idx}
            onClick={(e) => handleVote(e, idx)}
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.5625rem 0.75rem',
              borderRadius: '0.5rem',
              border: isSelected
                ? '1.5px solid #b00d6a'
                : '1.5px solid rgba(211,200,185,0.3)',
              background: '#fff',
              cursor: hasVoted ? 'default' : 'pointer',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
              width: '100%',
              textAlign: 'left',
            }}
            onMouseEnter={e => {
              if (!hasVoted) e.currentTarget.style.borderColor = 'rgba(176,13,106,0.3)'
            }}
            onMouseLeave={e => {
              if (!hasVoted && !isSelected) e.currentTarget.style.borderColor = 'rgba(211,200,185,0.3)'
            }}
          >
            {/* Progress bar background */}
            {hasVoted && (
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0,
                width: `${pct}%`,
                background: isSelected
                  ? 'linear-gradient(90deg, rgba(176,13,106,0.08), rgba(176,13,106,0.04))'
                  : isWinning
                    ? 'rgba(34,197,94,0.06)'
                    : 'rgba(234,225,213,0.3)',
                borderRadius: '0.375rem',
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            )}

            <span style={{
              position: 'relative', zIndex: 1,
              fontSize: '0.8125rem',
              fontWeight: isSelected ? 700 : 500,
              color: isSelected ? '#b00d6a' : '#322e28',
              fontFamily: "'Inter', sans-serif",
            }}>
              {isSelected && (
                <span style={{ marginRight: '0.375rem' }}>✓</span>
              )}
              {opt}
            </span>

            {hasVoted && (
              <span style={{
                position: 'relative', zIndex: 1,
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: isSelected ? '#b00d6a' : '#857f75',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {pct}%
              </span>
            )}
          </button>
        )
      })}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: '0.125rem',
      }}>
        <span style={{
          fontSize: '0.5625rem', fontWeight: 600, color: '#b3a898',
        }}>
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </span>
        {poll.duration && (
          <span style={{
            fontSize: '0.5625rem', fontWeight: 600, color: '#b3a898',
            display: 'flex', alignItems: 'center', gap: '0.1875rem',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 11 }}>schedule</span>
            {poll.duration}
          </span>
        )}
      </div>
    </div>
  )
}

export default function PostCard({
  _id, anonymousEmoji = '🦊', anonymousName = 'Anonymous',
  category = 'General', text = '', imageUrl, tags = [],
  score = 0, commentCount = 0, createdAt, userVote = null,
  isMine = false, poll = null,
  onVote, onComment, onShare, onEdit, onDelete, compact = false,
}) {
  const [vote, setVote] = useState(userVote)
  const [sc, setSc] = useState(score)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportError, setReportError] = useState('')
  const [votePulse, setVotePulse] = useState(null)
  const [shareFlash, setShareFlash] = useState(false)
  const router = useRouter()
  const cs = CAT_STYLES[category] || CAT_STYLES.General

  const doVote = useCallback((dir) => {
    const prev = vote
    let nv, d = 0
    if (prev === dir) { nv = null; d = dir === 'up' ? -1 : 1 }
    else { nv = dir; d = prev === null ? (dir === 'up' ? 1 : -1) : (dir === 'up' ? 2 : -2) }
    setVote(nv)
    setSc(s => s + d)
    setVotePulse(dir)
    setTimeout(() => setVotePulse(null), 220)
    if (onVote) {
      onVote(_id, nv)
      return
    }
    const voteValue = nv === 'up' ? 1 : nv === 'down' ? -1 : 0
    api.post(`/posts/${_id}/vote`, { vote: voteValue }).catch(() => {})
  }, [vote, _id, onVote])

  const doShare = useCallback((e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/posts/${_id}`).catch(() => {})
    setShareFlash(true)
    setTimeout(() => setShareFlash(false), 1600)
    if (onShare) onShare(_id)
  }, [_id, onShare])

  if (compact) {
    return (
      <article
        onClick={() => router.push(`/posts/${_id}`)}
        style={{
          padding: '0.75rem 0.875rem',
          cursor: 'pointer',
          borderRadius: '0.75rem',
          transition: 'background 150ms ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,240,229,0.6)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
            <span style={{ fontSize: '0.875rem', flexShrink: 0 }}>{anonymousEmoji}</span>
            <span style={{
              fontSize: '0.6875rem', fontWeight: 700, color: '#4a4239',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>{anonymousName}</span>
            {isMine && (
              <span style={{
                fontSize: '0.5625rem', fontWeight: 700, color: '#b00d6a',
                background: 'rgba(176,13,106,0.08)',
                padding: '1px 5px', borderRadius: '999px',
                border: '1px solid rgba(176,13,106,0.12)',
                flexShrink: 0,
              }}>You</span>
            )}
            <span style={{
              fontSize: '0.5625rem', fontWeight: 700, color: cs.color,
              background: cs.bg, padding: '1px 6px', borderRadius: '999px',
              textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
            }}>{category}</span>
          </div>
          <span style={{ fontSize: '0.625rem', color: '#b3a898', fontWeight: 500, flexShrink: 0 }}>{timeAgo(createdAt)}</span>
        </div>
        <p style={{
          fontSize: '0.8125rem', lineHeight: 1.5, color: '#2e2318',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          margin: 0, fontWeight: 400,
        }}>{text}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.6875rem', color: '#9c8b7a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13, fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
            {fmt(sc)}
          </span>
          <span style={{ fontSize: '0.6875rem', color: '#9c8b7a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>chat_bubble</span>
            {fmt(commentCount)}
          </span>
          {poll && (
            <span style={{ fontSize: '0.6875rem', color: '#b00d6a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>ballot</span>
              Poll
            </span>
          )}
        </div>
      </article>
    )
  }

  return (
    <>
      <style>{`
        .tt-postcard {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(211, 200, 185, 0.35);
          box-shadow: 0 1px 2px rgba(80,55,30,0.04), 0 2px 8px rgba(80,55,30,0.03);
          cursor: pointer;
          overflow: hidden;
          transition: transform 180ms cubic-bezier(0.4,0,0.2,1),
                      box-shadow 180ms cubic-bezier(0.4,0,0.2,1),
                      border-color 180ms cubic-bezier(0.4,0,0.2,1);
          -webkit-tap-highlight-color: transparent;
        }
        .tt-postcard:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(80,55,30,0.06), 0 8px 24px rgba(80,55,30,0.07);
          border-color: rgba(211, 200, 185, 0.6);
        }
        .tt-postcard:active {
          transform: scale(0.988);
          box-shadow: 0 1px 4px rgba(80,55,30,0.06);
          transition-duration: 80ms;
        }
        .tt-postcard-mine {
          border-left: 3px solid #b00d6a;
        }
        .tt-vote-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer;
          transition: transform 200ms cubic-bezier(0.4,0,0.2,1),
                      background 150ms ease, color 150ms ease;
          flex-shrink: 0;
        }
        .tt-vote-btn:active { transform: scale(0.82) !important; transition-duration: 80ms; }
        .tt-vote-btn.pulse { animation: ttVotePulse 200ms cubic-bezier(0.4,0,0.2,1); }
        .tt-action-btn {
          display: flex; align-items: center; gap: 4px;
          background: none; border: none; cursor: pointer;
          padding: 5px 8px; border-radius: 8px;
          color: #9c8b7a; font-size: 0.8125rem; font-weight: 600;
          transition: background 140ms ease, color 140ms ease, transform 140ms cubic-bezier(0.4,0,0.2,1);
          -webkit-tap-highlight-color: transparent;
          font-family: 'Inter', sans-serif;
        }
        .tt-action-btn:hover { background: rgba(248,240,229,0.8); color: #6b665e; }
        .tt-action-btn:active { transform: scale(0.93); transition-duration: 80ms; }
        .tt-action-btn.share-flash { color: #16a34a; background: rgba(34,197,94,0.08); }
        .tt-img-wrap { overflow: hidden; border-radius: 10px; }
        .tt-img-wrap img {
          transition: transform 300ms cubic-bezier(0.4,0,0.2,1);
          display: block;
        }
        .tt-img-wrap:hover img { transform: scale(1.02); }
        .tt-tag {
          padding: 2px 8px; border-radius: 6px;
          background: rgba(242,234,222,0.6);
          color: #9a7c5e; font-size: 0.6875rem; font-weight: 600;
          border: 1px solid rgba(211,200,185,0.25);
          transition: background 150ms ease, color 150ms ease;
          cursor: pointer;
        }
        .tt-tag:hover { background: #fff7ed; color: #9a3412; }
        @keyframes ttVotePulse {
          0% { transform: scale(1); }
          40% { transform: scale(1.28); }
          100% { transform: scale(1); }
        }
        @keyframes ttNewPostGlow {
          0% { box-shadow: 0 0 0 0 rgba(176,13,106,0.2); }
          50% { box-shadow: 0 0 0 4px rgba(176,13,106,0.08); }
          100% { box-shadow: 0 0 0 0 rgba(176,13,106,0); }
        }
      `}</style>

      <article
        className={`tt-postcard${isMine ? ' tt-postcard-mine' : ''}`}
        onClick={() => router.push(`/posts/${_id}`)}
        style={isMine ? { animation: 'ttNewPostGlow 2s ease-out' } : {}}
      >
        <div style={{
          padding: '0.875rem 1rem 0.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: isMine
                ? 'linear-gradient(135deg, #fbd4e8, #e8b4f8)'
                : 'linear-gradient(135deg, #fde8c8, #fbd4e8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', flexShrink: 0,
              border: isMine
                ? '1.5px solid rgba(176,13,106,0.2)'
                : '1.5px solid rgba(211,200,185,0.35)',
            }}>{anonymousEmoji}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: '0.8125rem',
                color: '#2e2318', lineHeight: 1,
              }}>{anonymousName}</span>

              {/* "You" Badge */}
              {isMine && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.1875rem',
                  padding: '2px 7px', borderRadius: '999px',
                  background: 'linear-gradient(135deg, rgba(176,13,106,0.1), rgba(249,115,22,0.08))',
                  color: '#b00d6a',
                  border: '1px solid rgba(176,13,106,0.15)',
                  fontSize: '0.5625rem', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  lineHeight: 1,
                }}>
                  <span style={{ fontSize: '0.5rem' }}>•</span>
                  You
                </span>
              )}

              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '2px 7px', borderRadius: '999px',
                background: cs.bg, color: cs.color,
                border: `1px solid ${cs.border}`,
                fontSize: '0.5625rem', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                lineHeight: 1,
              }}>{category}</span>
              <span style={{
                fontSize: '0.6875rem', color: '#b3a898',
                fontWeight: 500, lineHeight: 1,
              }}>· {timeAgo(createdAt)}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '0.125rem 1rem 0.5rem' }}>
          <p style={{
            fontSize: '0.9375rem', lineHeight: 1.65, color: '#2e2318',
            display: '-webkit-box', WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            fontWeight: 400, margin: 0,
          }}>{text}</p>

          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
              {tags.map(t => (
                <span key={t} className="tt-tag"
                  onClick={e => { e.stopPropagation(); router.push(`/search?q=${t}`) }}
                >#{t}</span>
              ))}
            </div>
          )}

          {/* Poll UI */}
          {poll && poll.options && poll.options.length >= 2 && (
            <PostPoll poll={poll} postId={_id} />
          )}
        </div>

        {imageUrl && (
          <div style={{ padding: '0 1rem 0.5rem' }}>
            <div className="tt-img-wrap" style={{ border: '1px solid rgba(211,200,185,0.25)' }}>
              <img src={imageUrl} alt="" style={{
                width: '100%', height: 'auto', maxHeight: 320, objectFit: 'cover',
              }} />
            </div>
          </div>
        )}

        <div style={{
          padding: '0.375rem 0.75rem 0.375rem',
          borderTop: '1px solid rgba(211,200,185,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0px',
              background: '#f9f4ed', borderRadius: '10px',
              padding: '2px', border: '1px solid rgba(211,200,185,0.25)',
            }}>
              <button
                className={`tt-vote-btn${votePulse === 'up' ? ' pulse' : ''}`}
                onClick={e => { e.stopPropagation(); doVote('up') }}
                style={{
                  background: vote === 'up' ? 'linear-gradient(135deg, #ec4899, #fb923c)' : 'transparent',
                  color: vote === 'up' ? '#fff' : '#9c8b7a',
                }}
                aria-label="Upvote"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
              </button>
              <span style={{
                padding: '0 0.375rem',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: '0.8125rem',
                minWidth: '1.5rem', textAlign: 'center',
                color: vote === 'up' ? '#b00d6a' : vote === 'down' ? '#b41340' : '#3d2f1e',
                transition: 'color 150ms ease',
              }}>{fmt(sc)}</span>
              <button
                className={`tt-vote-btn${votePulse === 'down' ? ' pulse' : ''}`}
                onClick={e => { e.stopPropagation(); doVote('down') }}
                style={{
                  background: vote === 'down' ? 'rgba(180,19,64,0.1)' : 'transparent',
                  color: vote === 'down' ? '#b41340' : '#9c8b7a',
                }}
                aria-label="Downvote"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>arrow_downward</span>
              </button>
            </div>

            <button
              className="tt-action-btn"
              onClick={e => { e.stopPropagation(); router.push(`/posts/${_id}`) }}
              aria-label="View comments"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat_bubble</span>
              <span>{fmt(commentCount)}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
            {isMine && (
              <>
                <button
                  className="tt-action-btn"
                  onClick={e => { e.stopPropagation(); onEdit?.(_id) }}
                  aria-label="Edit post"
                  style={{ color: '#8b5cf6' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span>
                </button>
                <button
                  className="tt-action-btn"
                  onClick={e => { e.stopPropagation(); onDelete?.(_id) }}
                  aria-label="Delete post"
                  style={{ color: '#b41340' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
                </button>
              </>
            )}
            <button
              className={`tt-action-btn${shareFlash ? ' share-flash' : ''}`}
              onClick={doShare}
              aria-label="Share"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {shareFlash ? 'check' : 'share'}
              </span>
            </button>
            <button
              className="tt-action-btn"
              onClick={e => { e.stopPropagation(); setReportOpen(true) }}
              aria-label="Report"
              style={{ color: '#c4b8ab' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>outlined_flag</span>
            </button>
          </div>
        </div>
      </article>

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={async (data) => {
          setReportError('')
          try {
            await api.post('/reports', {
              targetId: _id,
              targetType: 'Post',
              reason: data.description
                ? `${data.reason}: ${data.description}`.slice(0, 500)
                : data.reason,
            })
          } catch (error) {
            const message = error?.response?.data?.message || 'Failed to submit report'
            setReportError(message)
            throw error
          }
        }}
        targetType="post"
      />
      {reportError ? (
        <div
          style={{
            marginTop: '0.5rem',
            color: '#b91c1c',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          {reportError}
        </div>
      ) : null}
    </>
  )
}
