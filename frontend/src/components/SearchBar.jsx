'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const submitSearch = () => {
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div
      className="searchbar"
      style={{
        display: 'flex',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '8px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #ff6ec4, #ffb347)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        transition: 'transform 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submitSearch()
        }}
        placeholder="Search discussions..."
        style={{
          flex: 1,
          padding: '12px 16px',
          border: 'none',
          borderRadius: '8px 0 0 8px',
          fontSize: '16px',
          outline: 'none',
          background: 'rgba(255,255,255,0.9)',
          transition: 'box-shadow 0.3s ease',
        }}
        onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 12px rgba(0,0,0,0.2)' }}
        onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
      />

      <button
        className="btn-primary"
        onClick={submitSearch}
        style={{
          padding: '12px 24px',
          border: 'none',
          borderRadius: '0 8px 8px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#fff',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #fceabb, #ff6ec4)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #ffb347, #ff6ec4)'
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #fceabb, #ff6ec4)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        Search
      </button>
    </div>
  )
}
