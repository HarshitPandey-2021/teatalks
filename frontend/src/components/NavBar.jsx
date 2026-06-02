"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const linkClass = (path) =>
    `nav-link ${pathname === path ? "text-pink-500 font-semibold" : ""}`;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(12px)',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderBottom: '1px solid #e5e7eb'
    }}>

      {/* MAIN CONTAINER */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>

        {/* LOGO */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#1f2937',
          paddingLeft: '8px'
        }}>
     <Image
  src="/icon.png"
  alt="TeaTalks"
  width={64}
  height={64}
  priority
   className="h-13 w-auto object-contain rounded-lg"
/>
<span>TeaTalks</span>
        </div>

        {/* DESKTOP MENU */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '32px'
        }} className="desktop-nav">

          <Link href="/" className={linkClass("/")} style={{ textDecoration: 'none', color: pathname === '/' ? '#ec4899' : '#374151', fontWeight: pathname === '/' ? '600' : '500' }}>
            Home
          </Link>
          <Link href="/about" className={linkClass("/about")} style={{ textDecoration: 'none', color: pathname === '/about' ? '#ec4899' : '#374151', fontWeight: pathname === '/about' ? '600' : '500' }}>
            About
          </Link>
          <Link href="/privacy" className={linkClass("/privacy")} style={{ textDecoration: 'none', color: pathname === '/privacy' ? '#ec4899' : '#374151', fontWeight: pathname === '/privacy' ? '600' : '500' }}>
            Privacy
          </Link>
          <Link href="/terms" className={linkClass("/terms")} style={{ textDecoration: 'none', color: pathname === '/terms' ? '#ec4899' : '#374151', fontWeight: pathname === '/terms' ? '600' : '500' }}>
            Terms
          </Link>

          {/* BUTTON GROUP - EXTRA SPACING */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginLeft: '24px'
          }}>
            <Link href="/login">
              <button style={{
                height: '40px',
                padding: '0 28px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>
                Log In
              </button>
            </Link>

            <Link href="/signup">
              <button style={{
                height: '40px',
                padding: '0 32px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(to right, #ec4899, #fb923c, #fbbf24)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                Sign Up
              </button>
            </Link>
          </div>

        </div>

        {/* HAMBURGER */}
        <div style={{ paddingRight: '8px' }} className="mobile-hamburger">
          <button
            style={{
              fontSize: '28px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        </div>

      </div>

      {/* MOBILE MENU */}
      <div style={{
        maxHeight: open ? '400px' : '0',
        opacity: open ? '1' : '0',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }} className="mobile-menu">
        <div style={{
          padding: '16px 28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)'
        }}>

          <Link href="/" onClick={() => setOpen(false)} style={{ textDecoration: 'none', color: pathname === '/' ? '#ec4899' : '#374151', fontWeight: pathname === '/' ? '600' : '500', padding: '4px 0' }}>
            Home
          </Link>
          <Link href="/about" onClick={() => setOpen(false)} style={{ textDecoration: 'none', color: pathname === '/about' ? '#ec4899' : '#374151', fontWeight: pathname === '/about' ? '600' : '500', padding: '4px 0' }}>
            About
          </Link>
          <Link href="/privacy" onClick={() => setOpen(false)} style={{ textDecoration: 'none', color: pathname === '/privacy' ? '#ec4899' : '#374151', fontWeight: pathname === '/privacy' ? '600' : '500', padding: '4px 0' }}>
            Privacy
          </Link>
          <Link href="/terms" onClick={() => setOpen(false)} style={{ textDecoration: 'none', color: pathname === '/terms' ? '#ec4899' : '#374151', fontWeight: pathname === '/terms' ? '600' : '500', padding: '4px 0' }}>
            Terms
          </Link>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <Link href="/login" onClick={() => setOpen(false)}>
              <button style={{
                width: '100%',
                height: '44px',
                padding: '0 24px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '15px',
                fontWeight: '500',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}>
                Log In
              </button>
            </Link>

            <Link href="/signup" onClick={() => setOpen(false)}>
              <button style={{
                width: '100%',
                height: '44px',
                padding: '0 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '15px',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(to right, #ec4899, #fb923c, #fbbf24)',
                cursor: 'pointer'
              }}>
                Sign Up
              </button>
            </Link>
          </div>

        </div>
      </div>

    </nav>
  );
}