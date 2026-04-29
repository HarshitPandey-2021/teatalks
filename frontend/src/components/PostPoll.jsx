'use client'

import { useCallback, useState, useMemo } from 'react'
import api from '@/lib/axios'

function formatPollTimeLeft(expiresAt) {
  if (!expiresAt) return null
  const diffMs = new Date(expiresAt).getTime() - Date.now()
  if (diffMs <= 0) return 'Ended'
  const totalMinutes = Math.ceil(diffMs / 60000)
  if (totalMinutes < 60) return `${totalMinutes}m left`
  const totalHours = Math.ceil(totalMinutes / 60)
  if (totalHours < 24) return `${totalHours}h left`
  const totalDays = Math.ceil(totalHours / 24)
  return `${totalDays}d left`
}

// Normalize poll data to handle both formats safely
function normalizePollData(poll) {
  const options = []
  const votes = []

  if (!poll.options || !Array.isArray(poll.options)) {
    return { options: [], votes: [] }
  }

  poll.options.forEach((opt, idx) => {
    if (typeof opt === 'string') {
      // Format 1: options are strings, votes are in separate array
      options.push(opt)
      votes.push(poll.votes?.[idx] ?? 0)
    } else if (opt && typeof opt === 'object') {
      // Format 2: options are objects with {text, votes}
      options.push(opt.text || '')
      votes.push(opt.votes ?? 0)
    } else {
      // Fallback for unexpected formats
      options.push(String(opt))
      votes.push(0)
    }
  })

  return { options, votes }
}

export default function PostPoll({ poll, postId, onPollUpdate }) {
  const { options: normalizedOptions, votes: normalizedVotes } = useMemo(
    () => normalizePollData(poll),
    [poll]
  )

  const [voted, setVoted] = useState(poll.userVoted)
  const [votes, setVotes] = useState(normalizedVotes)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totalVotes = votes.reduce((sum, voteCount) => sum + (voteCount || 0), 0)
  const hasVoted = voted !== null && voted !== undefined
  const isExpired = Boolean(poll.isExpired)
  const timeLabel = isExpired ? 'Ended' : formatPollTimeLeft(poll.expiresAt) || poll.duration

  const handleVote = useCallback(async (e, idx) => {
    e.stopPropagation()
    if (hasVoted || submitting || isExpired) return

    const previousVotes = [...votes]
    const nextVotes = [...votes]
    nextVotes[idx] = (nextVotes[idx] || 0) + 1
    setVotes(nextVotes)
    setVoted(idx)
    setError('')
    setSubmitting(true)

    try {
      const res = await api.post(`/posts/${postId}/poll-vote`, { optionIndex: idx })
      const nextPoll = res.data?.poll || res.data?.post?.poll
      if (nextPoll) {
        const { votes: updatedVotes } = normalizePollData(nextPoll)
        setVotes(updatedVotes)
        setVoted(nextPoll.userVoted ?? idx)
        onPollUpdate?.(nextPoll)
      }
    } catch (err) {
      setVotes(previousVotes)
      setVoted(poll.userVoted ?? null)
      setError(err?.response?.data?.message || 'Could not submit your vote')
    } finally {
      setSubmitting(false)
    }
  }, [hasVoted, isExpired, onPollUpdate, poll.userVoted, postId, submitting, votes])

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
        {(hasVoted || isExpired) ? (
          <span style={{
            fontSize: '0.5625rem', fontWeight: 600, color: hasVoted ? '#16a34a' : '#857f75',
            marginLeft: 'auto',
          }}>{hasVoted ? 'Voted' : 'Closed'}</span>
        ) : null}
      </div>

      {normalizedOptions.map((optionText, idx) => {
        const voteCount = votes[idx] || 0
        const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
        const isSelected = voted === idx
        const maxVotes = Math.max(...votes, 0)
        const isWinning = (hasVoted || isExpired) && voteCount === maxVotes && maxVotes > 0

        return (
          <button
            key={`${postId}-poll-${idx}`}
            onClick={(e) => handleVote(e, idx)}
            disabled={hasVoted || isExpired || submitting}
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.5625rem 0.75rem',
              borderRadius: '0.5rem',
              border: isSelected
                ? '1.5px solid #b00d6a'
                : '1.5px solid rgba(211,200,185,0.3)',
              background: '#fff',
              cursor: hasVoted || isExpired || submitting ? 'default' : 'pointer',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
              width: '100%',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (!hasVoted && !isExpired) e.currentTarget.style.borderColor = 'rgba(176,13,106,0.3)'
            }}
            onMouseLeave={(e) => {
              if (!hasVoted && !isExpired && !isSelected) e.currentTarget.style.borderColor = 'rgba(211,200,185,0.3)'
            }}
          >
            {(hasVoted || isExpired) ? (
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
            ) : null}

            <span style={{
              position: 'relative', zIndex: 1,
              fontSize: '0.8125rem',
              fontWeight: isSelected ? 700 : 500,
              color: isSelected ? '#b00d6a' : '#322e28',
              fontFamily: "'Inter', sans-serif",
            }}>
              {isSelected ? <span style={{ marginRight: '0.375rem' }}>✓</span> : null}
              {optionText}
            </span>

            {(hasVoted || isExpired) ? (
              <span style={{
                position: 'relative', zIndex: 1,
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: isSelected ? '#b00d6a' : '#857f75',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {pct}%
              </span>
            ) : null}
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
        {timeLabel ? (
          <span style={{
            fontSize: '0.5625rem', fontWeight: 600, color: '#b3a898',
            display: 'flex', alignItems: 'center', gap: '0.1875rem',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 11 }}>schedule</span>
            {timeLabel}
          </span>
        ) : null}
      </div>

      {error ? (
        <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.6875rem', fontWeight: 600 }}>{error}</p>
      ) : null}
    </div>
  )
}