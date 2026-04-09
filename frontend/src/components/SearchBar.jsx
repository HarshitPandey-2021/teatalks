'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import SearchDropdown from './SearchDropdown'


export default function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <div
      className="searchbar"
      style={{
        display: "flex",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "8px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #ff6ec4, #ffb347)",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        transition: "transform 0.3s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
    >
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search discussions..."
        style={{
          flex: 1,
          padding: "12px 16px",
          border: "none",
          borderRadius: "8px 0 0 8px",
          fontSize: "16px",
          outline: "none",
          background: "rgba(255,255,255,0.9)",
          transition: "box-shadow 0.3s ease",
        }}
        onFocus={(e) => e.currentTarget.style.boxShadow = "0 0 12px rgba(0,0,0,0.2)"}
        onBlur={(e) => e.currentTarget.style.boxShadow = "none"}
      />

      <button
        className="btn-primary"
        style={{
          padding: "12px 24px",
          border: "none",
          borderRadius: "0 8px 8px 0",
          fontSize: "16px",
          fontWeight: "600",
          color: "#fff",
          cursor: "pointer",
          background: "linear-gradient(135deg, #fceabb, #ff6ec4)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, #ffb347, #ff6ec4)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, #fceabb, #ff6ec4)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        Search
      </button>
    </div>
  );}
// components/SearchBar.jsx

const ALL_POSTS = [
  { _id: '1', anonymousEmoji: '🦊', anonymousName: 'Silent Fox', category: 'Academic', text: "Does anyone have Sharma sir's DBMS notes? Unit 4 specifically. Exam in 3 days 😭", tags: ['DBMS', 'AcademicStress'], score: 342, commentCount: 56 },
  { _id: '2', anonymousEmoji: '🐼', anonymousName: 'Sleepy Panda', category: 'Hostel', text: 'The mess food today was surprisingly... edible? Like, the paneer actually felt like paneer.', tags: ['MessFood', 'HostelLife'], score: 1200, commentCount: 89 },
  { _id: '3', anonymousEmoji: '🦄', anonymousName: 'Glitter Uni', category: 'Reviews', text: 'The new coffee shop near the main gate is a total vibe. ☕️ Cold brew is 10/10.', tags: ['CafeReview', 'CampusVibes'], score: 854, commentCount: 23 },
  { _id: '4', anonymousEmoji: '🦉', anonymousName: 'Night Owl', category: 'Rants', text: "Why does the WiFi in Hostel Block C work at 3 AM but dies during classes? 📡💀", tags: ['WiFi', 'HostelProblems'], score: 567, commentCount: 34 },
  { _id: '5', anonymousEmoji: '🐸', anonymousName: 'Chilled Frog', category: 'General', text: 'Unpopular opinion: The campus at 6 AM is genuinely beautiful. Saw peacocks near the sports complex. 🌄', tags: ['CampusLife', 'MorningVibes'], score: 923, commentCount: 41 },
  { _id: '6', anonymousEmoji: '🐝', anonymousName: 'Busy Bee', category: 'Academic', text: 'The placement cell just dropped intern opportunities for pre-final years. Check your email ASAP.', tags: ['Placements', 'Internships'], score: 1456, commentCount: 112 },
  { _id: '7', anonymousEmoji: '🐉', anonymousName: 'Dragon Anon', category: 'Rants', text: "Someone in my wing plays guitar at 2 AM every single night. Bro you're not John Mayer 💀🎸", tags: ['HostelLife', 'Rants'], score: 789, commentCount: 67 },
]

const TRENDING_TAGS = ['DBMS', 'MessFood', 'WiFi', 'CampusVibes', 'HostelLife', 'Exams', 'Placements', 'HostelProblems']

const CAT_STYLES = {
  Academic: { bg: 'rgba(176,13,106,0.06)', color: '#b00d6a' },
  Hostel: { bg: 'rgba(154,52,18,0.06)', color: '#9a3412' },
  Rants: { bg: 'rgba(180,19,64,0.06)', color: '#b41340' },
  General: { bg: 'rgba(34,197,94,0.06)', color: '#16a34a' },
  Reviews: { bg: 'rgba(249,115,22,0.06)', color: '#ea6c00' },
}

function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

// export default function SearchBar({ variant = 'desktop' }) {
//   const [isOpen, setIsOpen] = useState(false)
//   const [query, setQuery] = useState('')
//   const inputRef = useRef(null)
//   const containerRef = useRef(null)
//   const router = useRouter()

//   // Close on outside click
//   useEffect(() => {
//     if (!isOpen) return
//     const handler = (e) => {
//       if (containerRef.current && !containerRef.current.contains(e.target)) {
//         setIsOpen(false)
//       }
//     }
//     document.addEventListener('mousedown', handler)
//     return () => document.removeEventListener('mousedown', handler)
//   }, [isOpen])

//   // Close on Escape + slash shortcut
//   useEffect(() => {
//     const handler = (e) => {
//       if (e.key === 'Escape' && isOpen) {
//         setIsOpen(false)
//         inputRef.current?.blur()
//       }
//       if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
//         e.preventDefault()
//         setIsOpen(true)
//         setTimeout(() => inputRef.current?.focus(), 50)
//       }
//     }
//     document.addEventListener('keydown', handler)
//     return () => document.removeEventListener('keydown', handler)
//   }, [isOpen])

//   const handleFocus = useCallback(() => setIsOpen(true), [])

//   const handleChange = useCallback((e) => {
//     setQuery(e.target.value)
//     if (!isOpen) setIsOpen(true)
//   }, [isOpen])

//   const handleClear = useCallback(() => {
//     setQuery('')
//     inputRef.current?.focus()
//   }, [])

//   const handleTagClick = useCallback((tag) => {
//     setQuery(tag)
//     inputRef.current?.focus()
//   }, [])

//   const handleClose = useCallback(() => {
//     setIsOpen(false)
//     setQuery('')
//     inputRef.current?.blur()
//   }, [])

//   const handleResultClick = useCallback((postId) => {
//     router.push(`/posts/${postId}`)
//     handleClose()
//   }, [router, handleClose])

//   // Search results
//   const results = useMemo(() => {
//     if (!query.trim()) return []
//     const q = query.toLowerCase().trim()
//     return ALL_POSTS.filter((p) =>
//       p.text.toLowerCase().includes(q) ||
//       p.tags.some((t) => t.toLowerCase().includes(q)) ||
//       p.anonymousName.toLowerCase().includes(q) ||
//       p.category.toLowerCase().includes(q)
//     ).slice(0, 6)
//   }, [query])

//   const matchingTags = useMemo(() => {
//     if (!query.trim()) return []
//     const q = query.toLowerCase().trim()
//     return TRENDING_TAGS.filter(t => t.toLowerCase().includes(q)).slice(0, 5)
//   }, [query])

//   const isMobile = variant === 'mobile'

//   return (
//     <>
//       <style>{`
//         .sb-container { position: relative; width: 100%; }
//         .sb-input-wrap { position: relative; display: flex; align-items: center; cursor: pointer; }
//         .sb-icon {
//           position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);
//           color: #a09a90; font-size: 17px; pointer-events: none;
//           transition: color 0.18s; z-index: 1;
//         }
//         .sb-icon-active { color: #b00d6a; }
//         .sb-input {
//           width: 100%; height: 2.25rem;
//           background: rgba(234,225,213,0.35);
//           border: 1px solid rgba(234,225,213,0.3);
//           border-radius: 9999px;
//           padding: 0 2rem 0 2.375rem;
//           font-size: 0.8125rem; color: #322e28;
//           outline: none; font-family: 'Inter', sans-serif;
//           font-weight: 500; cursor: pointer;
//           transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
//           -webkit-tap-highlight-color: transparent;
//         }
//         .sb-input::placeholder { color: #a09a90; font-weight: 500; }
//         .sb-input:hover {
//           background: rgba(234,225,213,0.55);
//           border-color: rgba(234,225,213,0.5);
//         }
//         .sb-input:focus {
//           cursor: text;
//           background: rgba(255,255,255,0.9);
//           border-color: rgba(176,13,106,0.18);
//           box-shadow: 0 0 0 3px rgba(176,13,106,0.05);
//         }
//         .sb-input-open {
//           background: rgba(255,255,255,0.9) !important;
//           border-color: rgba(176,13,106,0.18) !important;
//           box-shadow: 0 0 0 3px rgba(176,13,106,0.05) !important;
//           cursor: text !important;
//         }
//         .sb-clear {
//           position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%);
//           width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
//           background: rgba(211,200,185,0.2); border: none; border-radius: 50%;
//           color: #7b766e; cursor: pointer; transition: all 0.14s; z-index: 1;
//           -webkit-tap-highlight-color: transparent;
//         }
//         .sb-clear:hover { background: rgba(211,200,185,0.4); color: #322e28; }
//         .sb-clear:active { transform: translateY(-50%) scale(0.88); }
//         .sb-kbd {
//           position: absolute; right: 0.625rem; top: 50%; transform: translateY(-50%);
//           padding: 2px 6px; border-radius: 4px;
//           background: rgba(234,225,213,0.4); border: 1px solid rgba(211,200,185,0.3);
//           font-size: 0.5625rem; font-weight: 700; color: #b3aca3;
//           font-family: 'Inter', sans-serif; pointer-events: none; z-index: 1;
//         }
//         .search-dd-scroll::-webkit-scrollbar { width: 5px; }
//         .search-dd-scroll::-webkit-scrollbar-track { background: transparent; }
//         .search-dd-scroll::-webkit-scrollbar-thumb { background: rgba(211,200,185,0.25); border-radius: 3px; }
//         .sb-mobile-overlay {
//           position: fixed; inset: 0; z-index: 9997;
//           background: rgba(254,252,249,0.97);
//           backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
//           padding: 0.75rem;
//           padding-top: calc(0.75rem + env(safe-area-inset-top, 0));
//           display: flex; flex-direction: column;
//         }
//         .sb-mobile-header {
//           display: flex; align-items: center; gap: 0.5rem;
//           margin-bottom: 0.625rem; flex-shrink: 0;
//         }
//         .sb-mobile-input-wrap {
//           flex: 1; position: relative; display: flex; align-items: center;
//         }
//         .sb-mobile-input {
//           width: 100%; height: 2.625rem;
//           background: #fff;
//           border: 1px solid rgba(211,200,185,0.3);
//           border-radius: 12px;
//           padding: 0 2.25rem 0 2.5rem;
//           font-size: 0.9375rem; color: #322e28;
//           outline: none; font-family: 'Inter', sans-serif; font-weight: 500;
//           -webkit-tap-highlight-color: transparent;
//         }
//         .sb-mobile-input:focus {
//           border-color: rgba(176,13,106,0.2);
//           box-shadow: 0 0 0 3px rgba(176,13,106,0.05);
//         }
//         .sb-mobile-input::placeholder { color: #b3aca3; }
//         .sb-mobile-cancel {
//           padding: 0.5rem 0.5rem; background: none; border: none;
//           font-family: 'Plus Jakarta Sans', sans-serif;
//           font-weight: 700; font-size: 0.8125rem; color: #b00d6a;
//           cursor: pointer; flex-shrink: 0;
//           -webkit-tap-highlight-color: transparent;
//         }
//         .sb-mobile-cancel:active { opacity: 0.6; }
//         .sb-mobile-content {
//           flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
//           border-radius: 14px; background: #fff;
//           border: 1px solid rgba(234,225,213,0.25);
//           box-shadow: 0 2px 12px rgba(50,46,40,0.04);
//           padding: 0.75rem;
//         }
//       `}</style>

//       {isMobile ? (
//         <AnimatePresence>
//           {isOpen && (
//             <div className="sb-mobile-overlay" ref={containerRef}>
//               <div className="sb-mobile-header">
//                 <div className="sb-mobile-input-wrap">
//                   <span className="material-symbols-outlined" style={{
//                     position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
//                     color: query ? '#b00d6a' : '#a09a90', fontSize: 18, pointerEvents: 'none',
//                     zIndex: 1, transition: 'color 0.18s',
//                   }}>search</span>
//                   <input
//                     ref={inputRef}
//                     type="text" value={query} onChange={handleChange}
//                     placeholder="Search posts, tags, topics..."
//                     className="sb-mobile-input" autoFocus
//                   />
//                   {query && (
//                     <button onClick={handleClear} className="sb-clear" style={{ right: '0.5rem' }}>
//                       <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
//                     </button>
//                   )}
//                 </div>
//                 <button onClick={handleClose} className="sb-mobile-cancel">Cancel</button>
//               </div>

//               <div className="sb-mobile-content search-dd-scroll">
//                 {!query.trim() ? (
//                   <div>
//                     <p style={{
//                       fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase',
//                       letterSpacing: '0.12em', color: '#b3aca3', marginBottom: '0.5rem',
//                       display: 'flex', alignItems: 'center', gap: '0.375rem',
//                     }}>
//                       <span style={{ fontSize: '0.6875rem' }}>🔥</span> Trending on campus
//                     </p>
//                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
//                       {TRENDING_TAGS.map(tag => (
//                         <button key={tag} onClick={() => handleTagClick(tag)} style={{
//                           padding: '0.4375rem 0.875rem', borderRadius: 8,
//                           background: 'rgba(248,240,229,0.55)',
//                           border: '1px solid rgba(211,200,185,0.2)',
//                           fontFamily: "'Plus Jakarta Sans', sans-serif",
//                           fontWeight: 600, fontSize: '0.8125rem', color: '#7a5c2e',
//                           cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
//                         }}>#{tag}</button>
//                       ))}
//                     </div>
//                   </div>
//                 ) : (
//                   <div>
//                     {matchingTags.length > 0 && (
//                       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
//                         {matchingTags.map(tag => (
//                           <button key={tag} onClick={() => handleTagClick(tag)} style={{
//                             padding: '0.3rem 0.625rem', borderRadius: 999,
//                             background: 'rgba(236,72,153,0.06)',
//                             border: '1px solid rgba(236,72,153,0.12)',
//                             fontWeight: 600, fontSize: '0.75rem', color: '#b00d6a',
//                             cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem',
//                             fontFamily: "'Inter', sans-serif",
//                             WebkitTapHighlightColor: 'transparent',
//                           }}>
//                             <span className="material-symbols-outlined" style={{ fontSize: 11 }}>tag</span>
//                             {tag}
//                           </button>
//                         ))}
//                       </div>
//                     )}

//                     {results.length > 0 && (
//                       <p style={{
//                         fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase',
//                         letterSpacing: '0.1em', color: '#b3aca3', marginBottom: '0.5rem',
//                       }}>{results.length} result{results.length !== 1 ? 's' : ''}</p>
//                     )}

//                     {results.length > 0 ? (
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
//                         {results.map(post => {
//                           const cs = CAT_STYLES[post.category] || CAT_STYLES.General
//                           return (
//                             <div key={post._id} onClick={() => handleResultClick(post._id)} style={{
//                               padding: '0.75rem', borderRadius: 10, cursor: 'pointer',
//                               WebkitTapHighlightColor: 'transparent',
//                             }}>
//                               <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
//                                 <span style={{ fontSize: '0.875rem' }}>{post.anonymousEmoji}</span>
//                                 <span style={{
//                                   fontFamily: "'Plus Jakarta Sans'", fontWeight: 700,
//                                   fontSize: '0.75rem', color: '#322e28', flex: 1,
//                                   overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
//                                 }}>{post.anonymousName}</span>
//                                 <span style={{
//                                   padding: '1px 5px', borderRadius: 5, background: cs.bg, color: cs.color,
//                                   fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase',
//                                 }}>{post.category}</span>
//                               </div>
//                               <p style={{
//                                 fontSize: '0.8125rem', lineHeight: 1.5, color: '#4a4239',
//                                 display: '-webkit-box', WebkitLineClamp: 2,
//                                 WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0,
//                               }}>{post.text}</p>
//                               <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.375rem' }}>
//                                 <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.625rem', fontWeight: 600, color: '#9c8b7a' }}>
//                                   <span className="material-symbols-outlined" style={{ fontSize: 11, fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
//                                   {fmt(post.score)}
//                                 </span>
//                                 <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.625rem', fontWeight: 600, color: '#9c8b7a' }}>
//                                   <span className="material-symbols-outlined" style={{ fontSize: 11 }}>chat_bubble</span>
//                                   {fmt(post.commentCount)}
//                                 </span>
//                               </div>
//                             </div>
//                           )
//                         })}
//                       </div>
//                     ) : (
//                       <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
//                         <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#e0d9cf', display: 'block', marginBottom: '0.5rem' }}>search_off</span>
//                         <p style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: '0.875rem', color: '#7b766e' }}>No results for "{query}"</p>
//                         <p style={{ fontSize: '0.75rem', color: '#b3aca3', marginTop: '0.125rem' }}>Try different keywords</p>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </AnimatePresence>
//       ) : (
//         <div className="sb-container" ref={containerRef}>
//           <div className="sb-input-wrap">
//             <span className={`material-symbols-outlined sb-icon ${isOpen ? 'sb-icon-active' : ''}`}>search</span>
//             <input
//               ref={inputRef} type="text" value={query}
//               onChange={handleChange} onFocus={handleFocus}
//               placeholder="Search campus tea..."
//               className={`sb-input ${isOpen ? 'sb-input-open' : ''}`}
//             />
//             {query ? (
//               <button onClick={handleClear} className="sb-clear">
//                 <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
//               </button>
//             ) : !isOpen ? (
//               <span className="sb-kbd">/</span>
//             ) : null}
//           </div>
//           <AnimatePresence>
//             {isOpen && (
//               <SearchDropdown query={query} onTagClick={handleTagClick} onClose={handleClose} />
//             )}
//           </AnimatePresence>
//         </div>
//       )}
//     </>
//   )
// }