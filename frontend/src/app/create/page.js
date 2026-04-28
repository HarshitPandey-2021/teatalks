// app/create/page.jsx
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/axios'
import { MAX_TAGS, POST_MAX_LENGTH, POST_MIN_LENGTH, validatePostText, validateTags } from '@/lib/validation'

const CATEGORIES = [
  { key: 'academic', label: 'Academic', icon: 'school', feedLabel: 'Academic' },
  { key: 'professor-review', label: 'Prof Review', icon: 'rate_review', feedLabel: 'Reviews' },
  { key: 'hostel-life', label: 'Hostel Life', icon: 'apartment', feedLabel: 'Hostel' },
  { key: 'rants', label: 'Rants', icon: 'forum', feedLabel: 'Rants' },
  { key: 'questions', label: 'Questions', icon: 'quiz', feedLabel: 'General' },
  { key: 'lost-found', label: 'Lost & Found', icon: 'search_check', feedLabel: 'General' },
  { key: 'polls', label: 'Polls', icon: 'poll', feedLabel: 'General' },
  { key: 'memes', label: 'Memes & Fun', icon: 'celebration', feedLabel: 'General' },
  { key: 'general', label: 'General', icon: 'grid_view', feedLabel: 'General' },
  { key: 'campus-news', label: 'Campus News', icon: 'newspaper', feedLabel: 'General' },
]

const CATEGORY_TO_FEED = {
  'academic': 'Academic',
  'professor-review': 'Reviews',
  'hostel-life': 'Hostel',
  'rants': 'Rants',
  'questions': 'General',
  'lost-found': 'General',
  'polls': 'General',
  'memes': 'General',
  'general': 'General',
  'campus-news': 'General',
}

const DURATIONS = ['6h', '12h', '24h', '48h']
const MAX_CHARS = POST_MAX_LENGTH
const MAX_IMAGES = 4
const MAX_POLL_OPTIONS = 6
const MIN_CHARS = POST_MIN_LENGTH

export default function CreatePostPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const fileRef = useRef(null)

  const [cat, setCat] = useState('academic')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState([])
  const [tagIn, setTagIn] = useState('')
  const [images, setImages] = useState([])
  const [pollOn, setPollOn] = useState(false)
  const [pollOpts, setPollOpts] = useState(['', ''])
  const [pollDur, setPollDur] = useState('24h')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [tagAnim, setTagAnim] = useState('')
  const [imgAnim, setImgAnim] = useState('')
  const [shake, setShake] = useState(false)
  const [tagWarn, setTagWarn] = useState('')
  const imagesRef = useRef([])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (err) {
      const t = setTimeout(() => setErr(''), 4000)
      return () => clearTimeout(t)
    }
  }, [err])

  useEffect(() => {
    if (tagWarn) {
      const t = setTimeout(() => setTagWarn(''), 2500)
      return () => clearTimeout(t)
    }
  }, [tagWarn])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 2000)
      return () => clearTimeout(t)
    }
  }, [success])

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        if (img?.url?.startsWith('blob:')) {
          URL.revokeObjectURL(img.url)
        }
      })
    }
  }, [])

  const charPercent = (body.length / MAX_CHARS) * 100
  const charColor = charPercent > 90 ? '#dc2626' : charPercent > 70 ? '#f59e0b' : '#b00d6a'

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const tagKey = useCallback((e) => {
    if (e.key === 'Enter' && tagIn.trim()) {
      e.preventDefault()
      if (tags.length >= MAX_TAGS) {
        setTagWarn(`Max ${MAX_TAGS} tags allowed`)
        return
      }
      const c = tagIn.trim().replace(/^#/, '').replace(/[^a-zA-Z0-9_-]/g, '')
      if (!c) return
      if (tags.includes(c)) {
        setTagWarn('Tag already added')
        return
      }
      setTags(p => [...p, c])
      setTagIn('')
      setTagAnim(c)
      setTimeout(() => setTagAnim(''), 400)
    }
  }, [tagIn, tags])

  const onFile = useCallback((e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (images.length >= MAX_IMAGES) {
      setErr(`Max ${MAX_IMAGES} images allowed`)
      e.target.value = ''
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setErr('Image must be under 5MB')
      e.target.value = ''
      return
    }
    if (!f.type.startsWith('image/')) {
      setErr('Only image files are allowed')
      e.target.value = ''
      return
    }
    const newId = Date.now().toString()
    setImages(p => [...p, { id: newId, url: URL.createObjectURL(f), file: f }])
    setImgAnim(newId)
    setTimeout(() => setImgAnim(''), 500)
    e.target.value = ''
  }, [images])

  const validate = useCallback(() => {
    const textError = validatePostText(body)
    if (textError) {
      setErr(textError)
      triggerShake()
      return false
    }
    const tagResult = validateTags(tags)
    if (tagResult.error) {
      setErr(tagResult.error)
      triggerShake()
      return false
    }
    if (!body.trim()) {
      setErr('Your post can\'t be empty ✍️')
      triggerShake()
      return false
    }
    if (body.trim().length < MIN_CHARS) {
      setErr(`Write at least ${MIN_CHARS} characters to share your thought`)
      triggerShake()
      return false
    }
    if (pollOn) {
      const filled = pollOpts.filter(o => o.trim())
      if (filled.length < 2) {
        setErr('Polls need at least 2 options filled')
        triggerShake()
        return false
      }
      const unique = new Set(filled.map(o => o.trim().toLowerCase()))
      if (unique.size !== filled.length) {
        setErr('Poll options must be unique')
        triggerShake()
        return false
      }
    }
    return true
  }, [body, pollOn, pollOpts, tags])

  const uploadImageToCloudinary = useCallback(async (file) => {
    const sigRes = await api.post('/uploads/image-signature')
    const { timestamp, signature, folder, apiKey, cloudName, publicId } = sigRes.data

    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp)
    formData.append('signature', signature)
    formData.append('folder', folder)
    formData.append('public_id', publicId)

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!uploadRes.ok) {
      let errMsg = 'Image upload failed'
      try {
        const details = await uploadRes.json()
        errMsg = details?.error?.message || errMsg
      } catch {}
      throw new Error(errMsg)
    }
    return uploadRes.json()
  }, [])

  const submit = useCallback(async () => {
    if (!validate()) return
    setErr('')
    setLoading(true)

    const feedCategory = CATEGORY_TO_FEED[cat] || 'General'
    try {
      let uploadPayload = {}
      if (images.length > 0 && images[0]?.file) {
        const uploaded = await uploadImageToCloudinary(images[0].file)
        uploadPayload = {
          image: uploaded.secure_url,
          imagePublicId: uploaded.public_id,
          imageMeta: {
            width: uploaded.width,
            height: uploaded.height,
            format: uploaded.format,
            bytes: uploaded.bytes,
          },
        }
      }

      const res = await api.post('/posts', {
        category: feedCategory,
        text: body.trim(),
        tags,
        ...uploadPayload,
      })

      imagesRef.current.forEach((img) => {
        if (img?.url?.startsWith('blob:')) {
          URL.revokeObjectURL(img.url)
        }
      })

      const createdPost = res?.data?.post
      const toxicity = res?.data?.toxicity
      const isVisible = createdPost?.visibility === 'visible' || createdPost?.visibility === undefined || createdPost?.visibility === null

      setSuccess(!isVisible || toxicity?.score >= 0.6 ? 'Post submitted and hidden for admin review.' : 'Posted successfully!')
      setLoading(false)
      setTimeout(() => router.push('/feed'), 800)
    } catch (error) {
      setLoading(false)
      setErr(error.response?.data?.message || error.message || 'Failed to create post')
    }
  }, [cat, body, tags, images, router, validate, uploadImageToCloudinary])

  if (authLoading || !isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #fdf6ee 0%, #f8f0e5 100%)' }}>
        <div style={{ width: 44, height: 44, border: '3px solid #eae1d5', borderTopColor: '#b00d6a', borderRadius: '50%', animation: 'tt-spin 0.6s linear infinite' }} />
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes tt-pop-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes tt-fade-up {
          0% { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes tt-slide-in {
          0% { transform: translateX(-16px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes tt-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        @keyframes tt-img-in {
          0% { transform: scale(0.5) rotate(-8deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes tt-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(176,13,106,0.3); }
          70% { box-shadow: 0 0 0 8px rgba(176,13,106,0); }
          100% { box-shadow: 0 0 0 0 rgba(176,13,106,0); }
        }
        @keyframes tt-success-in {
          0% { transform: translateY(-20px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes tt-warn-in {
          0% { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .tt-create-textarea:focus {
          box-shadow: 0 0 0 2px rgba(176,13,106,0.15), 0 4px 16px rgba(176,13,106,0.06) !important;
        }
        .tt-cat-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .tt-cat-btn:active {
          transform: translateY(0px) scale(0.97);
        }
        .tt-img-thumb:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .tt-add-img-btn:hover {
          border-color: #b00d6a !important;
          color: #b00d6a !important;
          background: rgba(176,13,106,0.03) !important;
        }
        .tt-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(176,13,106,0.3) !important;
        }
        .tt-submit-btn:active:not(:disabled) {
          transform: translateY(0px) scale(0.98);
        }
        .tt-poll-opt:focus {
          box-shadow: 0 0 0 2px rgba(176,13,106,0.12) !important;
          border: 1px solid rgba(176,13,106,0.2) !important;
        }
        .tt-tag-input:focus {
          box-shadow: 0 0 0 2px rgba(176,13,106,0.12) !important;
        }
        .tt-dur-btn:hover {
          transform: scale(1.05);
        }
        .tt-remove-tag:hover {
          background: rgba(176,13,106,0.15) !important;
        }
        @media (max-width: 480px) {
          .tt-cat-grid {
            grid-template-columns: repeat(5, 1fr) !important;
            gap: 0.375rem !important;
          }
          .tt-cat-btn {
            padding: 0.625rem 0.25rem !important;
          }
          .tt-cat-label {
            font-size: 0.5625rem !important;
          }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fdf6ee 0%, #f8f0e5 50%, #fdf6ee 100%)',
        paddingBottom: 'env(safe-area-inset-bottom, 20px)',
      }}>
        <div style={{
          maxWidth: 560,
          margin: '0 auto',
          padding: '1rem',
          paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
        }}>
          {success && (
            <div style={{
              position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
              zIndex: 1000, padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: '#fff', borderRadius: 9999,
              fontWeight: 700, fontSize: '0.875rem',
              boxShadow: '0 8px 32px rgba(5,150,105,0.3)',
              animation: 'tt-success-in 0.3s ease-out',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
              {success}
            </div>
          )}

          <div style={{
            background: '#fff',
            borderRadius: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)',
            padding: '1.5rem',
            overflow: 'visible',
            animation: 'tt-fade-up 0.4s ease-out',
          }}>
            <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '0.25rem',
                background: 'linear-gradient(135deg, #b00d6a 0%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Share a Thought</h1>
              <p style={{
                color: '#857f75',
                fontWeight: 500,
                fontSize: '0.875rem',
                fontFamily: "'Inter', sans-serif",
              }}>
                What&apos;s the buzz on campus today? ☕
              </p>
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: '0.6875rem',
                textTransform: 'uppercase', letterSpacing: '0.12em',
                color: '#b00d6a', marginBottom: '0.625rem', display: 'block',
              }}>
                Select Category
              </label>
              <div className="tt-cat-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.5rem',
              }}>
                {CATEGORIES.map(c => {
                  const on = cat === c.key
                  return (
                    <button key={c.key} className="tt-cat-btn" onClick={() => setCat(c.key)} style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: '0.75rem 0.25rem', borderRadius: '0.875rem',
                      border: on ? '2px solid #b00d6a' : '2px solid transparent',
                      background: on
                        ? 'linear-gradient(135deg, rgba(176,13,106,0.08), rgba(249,115,22,0.05))'
                        : 'linear-gradient(180deg, #faf6f0, #f3ede4)',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: on ? '0 2px 12px rgba(176,13,106,0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
                      animation: on ? 'tt-pulse-ring 0.6s ease-out' : 'none',
                    }}>
                      <span className={`material-symbols-outlined ${on ? 'mat-fill' : ''}`}
                        style={{
                          fontSize: 22, marginBottom: '0.25rem',
                          color: on ? '#b00d6a' : '#857f75',
                          transition: 'color 0.2s',
                        }}
                      >{c.icon}</span>
                      <span className="tt-cat-label" style={{
                        fontSize: '0.5625rem', fontWeight: on ? 700 : 600,
                        color: on ? '#b00d6a' : '#857f75', textTransform: 'uppercase',
                        letterSpacing: '0.02em', textAlign: 'center',
                        lineHeight: 1.2,
                        transition: 'color 0.2s',
                      }}>{c.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{
              marginBottom: '1.5rem',
              position: 'relative',
              animation: shake ? 'tt-shake 0.5s ease' : 'none',
            }}>
              <textarea
                className="tt-create-textarea"
                placeholder="Spill the tea… ☕ What's on your mind?"
                value={body}
                onChange={e => { if (e.target.value.length <= MAX_CHARS) setBody(e.target.value) }}
                style={{
                  width: '100%', minHeight: 160,
                  background: 'linear-gradient(180deg, #faf6f0, #f5efe6)',
                  border: '1px solid rgba(211,205,196,0.4)',
                  borderRadius: '0.875rem', padding: '1rem 1.125rem',
                  paddingBottom: '2.5rem',
                  fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  color: '#322e28', outline: 'none', resize: 'none',
                  transition: 'box-shadow 0.25s, border-color 0.25s',
                }}
              />
              <div style={{
                position: 'absolute', bottom: '0.75rem', left: '1rem', right: '1rem',
                display: 'flex', alignItems: 'center', gap: '0.625rem',
              }}>
                <div style={{
                  flex: 1, height: 3, background: 'rgba(211,205,196,0.3)',
                  borderRadius: 9999, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${charPercent}%`,
                    height: '100%',
                    background: charPercent > 90
                      ? 'linear-gradient(90deg, #f59e0b, #dc2626)'
                      : 'linear-gradient(90deg, #b00d6a, #f97316)',
                    borderRadius: 9999,
                    transition: 'width 0.2s, background 0.3s',
                  }} />
                </div>
                <span style={{
                  fontSize: '0.625rem', fontWeight: 700,
                  color: charColor,
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: 52, textAlign: 'right',
                  transition: 'color 0.3s',
                }}>{body.length}/{MAX_CHARS}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.6875rem',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  color: '#b00d6a',
                }}>
                  Tags
                </label>
                <span style={{
                  fontSize: '0.625rem', fontWeight: 600,
                  color: tags.length >= MAX_TAGS ? '#dc2626' : '#857f75',
                  transition: 'color 0.2s',
                }}>
                  {tags.length}/{MAX_TAGS}
                </span>
              </div>

              {tags.length > 0 && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '0.375rem',
                  marginBottom: '0.5rem',
                }}>
                  {tags.map(t => (
                    <span key={t} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      background: 'linear-gradient(135deg, rgba(176,13,106,0.08), rgba(249,115,22,0.06))',
                      color: '#b00d6a',
                      padding: '0.3rem 0.625rem', borderRadius: 9999,
                      fontSize: '0.75rem', fontWeight: 700,
                      animation: tagAnim === t ? 'tt-pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                      border: '1px solid rgba(176,13,106,0.1)',
                    }}>
                      #{t}
                      <button className="tt-remove-tag" onClick={() => setTags(p => p.filter(x => x !== t))} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#b00d6a', display: 'flex', padding: '2px',
                        borderRadius: '50%', transition: 'background 0.15s',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {tagWarn && (
                <div style={{
                  marginBottom: '0.375rem', padding: '0.375rem 0.75rem',
                  background: 'rgba(245,158,11,0.08)', borderRadius: '0.5rem',
                  color: '#b45309', fontSize: '0.6875rem', fontWeight: 600,
                  animation: 'tt-warn-in 0.25s ease-out',
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>info</span>
                  {tagWarn}
                </div>
              )}

              <input
                className="tt-tag-input"
                type="text" placeholder="Type a tag and hit Enter 🎯"
                value={tagIn} onChange={e => setTagIn(e.target.value)} onKeyDown={tagKey}
                disabled={tags.length >= MAX_TAGS}
                style={{
                  width: '100%', padding: '0.6875rem 0.875rem',
                  background: tags.length >= MAX_TAGS ? '#f0ebe4' : 'linear-gradient(180deg, #faf6f0, #f5efe6)',
                  border: '1px solid rgba(211,205,196,0.4)',
                  borderRadius: '0.75rem',
                  fontSize: '0.8125rem', color: '#322e28', outline: 'none',
                  transition: 'box-shadow 0.2s',
                  opacity: tags.length >= MAX_TAGS ? 0.6 : 1,
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.6875rem',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  color: '#b00d6a',
                }}>
                  Images
                </label>
                <span style={{
                  fontSize: '0.625rem', fontWeight: 600,
                  color: images.length >= MAX_IMAGES ? '#dc2626' : '#857f75',
                }}>
                  {images.length}/{MAX_IMAGES}
                </span>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
              <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                {images.length < MAX_IMAGES && (
                  <button className="tt-add-img-btn" onClick={() => fileRef.current?.click()} style={{
                    width: 88, height: 76, borderRadius: '0.875rem',
                    border: '2px dashed #d3cdc4', background: 'transparent',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#857f75', transition: 'all 0.25s',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>add_a_photo</span>
                    <span style={{ fontSize: '0.5625rem', fontWeight: 700, marginTop: '0.1875rem' }}>Add</span>
                  </button>
                )}
                {images.map(img => (
                  <div key={img.id} className="tt-img-thumb" style={{
                    width: 88, height: 76, borderRadius: '0.875rem',
                    overflow: 'hidden', position: 'relative',
                    border: '1px solid rgba(211,205,196,0.5)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'transform 0.25s, box-shadow 0.25s',
                    animation: imgAnim === img.id ? 'tt-img-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                  }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => {
                      if (img.url?.startsWith('blob:')) {
                        URL.revokeObjectURL(img.url)
                      }
                      setImages(p => p.filter(i => i.id !== img.id))
                    }} style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.55)', color: '#fff',
                      border: 'none', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      backdropFilter: 'blur(4px)',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.8)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              marginBottom: '1.5rem', padding: '1rem 1.125rem',
              background: 'linear-gradient(180deg, #faf6f0, #f5efe6)',
              borderRadius: '0.875rem',
              border: pollOn ? '1px solid rgba(176,13,106,0.12)' : '1px solid rgba(211,205,196,0.3)',
              boxShadow: pollOn ? '0 2px 12px rgba(176,13,106,0.06)' : 'none',
              transition: 'all 0.3s',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: pollOn ? '0.875rem' : 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ color: '#b00d6a', fontSize: 20 }}>ballot</span>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700, fontSize: '0.8125rem', color: '#322e28',
                  }}>Add a Poll</span>
                </div>
                <button onClick={() => {
                  setPollOn(v => !v)
                  if (!pollOn) setPollOpts(['', ''])
                }} style={{
                  width: 46, height: 26, borderRadius: 9999,
                  border: 'none', cursor: 'pointer', position: 'relative',
                  background: pollOn
                    ? 'linear-gradient(135deg, #b00d6a, #d4168a)'
                    : '#d3cdc4',
                  transition: 'background 0.3s', padding: 0,
                  boxShadow: pollOn ? '0 2px 8px rgba(176,13,106,0.25)' : 'none',
                }}>
                  <div style={{
                    position: 'absolute', top: 3,
                    left: pollOn ? 23 : 3,
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </button>
              </div>

              {pollOn && (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '0.4375rem',
                  animation: 'tt-fade-up 0.3s ease-out',
                }}>
                  {pollOpts.map((o, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '0.375rem', alignItems: 'center',
                      animation: i >= 2 ? 'tt-slide-in 0.25s ease-out' : 'none',
                    }}>
                      <input
                        className="tt-poll-opt"
                        type="text"
                        placeholder={`Option ${i + 1} ${i < 2 ? '(required)' : ''}`}
                        value={o}
                        onChange={e => {
                          const c = [...pollOpts]; c[i] = e.target.value; setPollOpts(c)
                        }}
                        style={{
                          flex: 1, padding: '0.5625rem 0.75rem',
                          background: '#fff', border: '1px solid rgba(211,205,196,0.3)',
                          borderRadius: '0.625rem',
                          fontSize: '0.8125rem', outline: 'none',
                          transition: 'box-shadow 0.2s, border-color 0.2s',
                        }}
                      />
                      {i >= 2 && (
                        <button onClick={() => setPollOpts(p => p.filter((_, idx) => idx !== i))} style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#857f75', display: 'flex', padding: '4px',
                          borderRadius: '50%', transition: 'color 0.15s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                          onMouseLeave={e => e.currentTarget.style.color = '#857f75'}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>remove_circle</span>
                        </button>
                      )}
                    </div>
                  ))}

                  {pollOpts.length < MAX_POLL_OPTIONS && (
                    <button onClick={() => setPollOpts(p => [...p, ''])} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#b00d6a', fontSize: '0.6875rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: '0.25rem',
                      padding: '0.375rem 0',
                      transition: 'opacity 0.15s',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add_circle</span>
                      Add Option ({pollOpts.length}/{MAX_POLL_OPTIONS})
                    </button>
                  )}

                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.625rem', fontWeight: 700, color: '#857f75',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      marginBottom: '0.375rem', display: 'block',
                    }}>Duration</span>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      {DURATIONS.map(d => (
                        <button key={d} className="tt-dur-btn" onClick={() => setPollDur(d)} style={{
                          padding: '0.375rem 0.75rem', borderRadius: '0.5rem',
                          fontSize: '0.6875rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                          background: pollDur === d
                            ? 'linear-gradient(135deg, #b00d6a, #d4168a)'
                            : '#fff',
                          color: pollDur === d ? '#fff' : '#5f5b53',
                          boxShadow: pollDur === d ? '0 2px 8px rgba(176,13,106,0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
                          transition: 'all 0.2s',
                        }}>{d}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex', flexDirection: 'column', gap: '0.875rem',
              alignItems: 'center', paddingTop: '1.25rem',
              borderTop: '1px solid rgba(211,205,196,0.25)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                background: 'linear-gradient(135deg, rgba(176,13,106,0.04), rgba(249,115,22,0.03))',
                padding: '0.5rem 1rem', borderRadius: 9999,
                border: '1px solid rgba(176,13,106,0.08)',
              }}>
                <span style={{
                  fontSize: '1.375rem',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                }}>{user?.anonymousEmoji || '🎭'}</span>
                <div>
                  <p style={{
                    fontSize: '0.5625rem', fontWeight: 700, color: '#857f75',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    lineHeight: 1,
                    marginBottom: '0.125rem',
                  }}>Posting as</p>
                  <p style={{
                    fontSize: '0.8125rem', fontWeight: 700, color: '#322e28',
                    lineHeight: 1.2,
                  }}>{user?.anonymousName || 'Anonymous'}</p>
                </div>
              </div>

              {err && (
                <div style={{
                  padding: '0.625rem 1rem',
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.06), rgba(220,38,38,0.03))',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(220,38,38,0.1)',
                  color: '#b91c1c',
                  fontSize: '0.8125rem', fontWeight: 600,
                  width: '100%', textAlign: 'center',
                  animation: 'tt-fade-up 0.25s ease-out',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                  {err}
                </div>
              )}

              <button
                className="tt-submit-btn"
                onClick={submit}
                disabled={loading}
                style={{
                  width: '100%', maxWidth: 340, padding: '0.9375rem 1.5rem',
                  background: loading
                    ? 'linear-gradient(135deg, #c084a0, #d4a373)'
                    : 'linear-gradient(135deg, #b00d6a 0%, #d4168a 40%, #f97316 100%)',
                  color: '#fff', borderRadius: 9999, border: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.9375rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 6px 20px rgba(176,13,106,0.22)',
                  opacity: loading ? 0.85 : 1,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '-0.01em',
                  WebkitTapHighlightColor: 'transparent',
                }}>
                {loading ? (
                  <>
                    <span style={{
                      width: 18, height: 18,
                      border: '2.5px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'tt-spin 0.6s linear infinite',
                      display: 'inline-block',
                    }} />
                    Posting…
                  </>
                ) : (
                  <>Post Anonymously <span style={{ fontSize: '1.125rem' }}>🚀</span></>
                )}
              </button>

              <p style={{
                fontSize: '0.625rem',
                color: '#a39e95',
                fontWeight: 500,
                textAlign: 'center',
                lineHeight: 1.4,
                maxWidth: 280,
              }}>
                Your identity stays hidden. Be respectful & follow community guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
