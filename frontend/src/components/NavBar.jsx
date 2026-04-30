"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // active link detection
  const isActive = (path) => pathname === path;

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200"
      style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
    >
      {/* Main bar */}
      <div
        className="flex items-center justify-between h-16 w-full"
        style={{
          // ── FORCE uniform padding so logo & hamburger are evenly spaced ──
          paddingLeft: "2rem",      // ← desktop left margin
          paddingRight: "1.5rem",   // ← desktop right margin
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* LOGO – zero extra left padding */}
        <div
          className="flex  items-center gap-2 text-xl font-bold text-gray-800 md:-ml-2"
          style={{
            // nothing extra, just the gap
            fontSize: "1.3rem",
          }}
        >
          <span style={{ fontSize: "1.6rem" }}>☕</span>
          <span>TeaTalks</span>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center" style={{ gap: "2rem" }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: isActive("/") ? "#ec4899" : "#374151",
              fontWeight: isActive("/") ? 600 : 500,
              transition: "color 0.2s",
            }}
          >
            Home
          </Link>
          <Link
            href="/about"
            style={{
              textDecoration: "none",
              color: isActive("/about") ? "#ec4899" : "#374151",
              fontWeight: isActive("/about") ? 600 : 500,
              transition: "color 0.2s",
            }}
          >
            About
          </Link>
          <Link
            href="/privacy"
            style={{
              textDecoration: "none",
              color: isActive("/privacy") ? "#ec4899" : "#374151",
              fontWeight: isActive("/privacy") ? 600 : 500,
              transition: "color 0.2s",
            }}
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            style={{
              textDecoration: "none",
              color: isActive("/terms") ? "#ec4899" : "#374151",
              fontWeight: isActive("/terms") ? 600 : 500,
              transition: "color 0.2s",
            }}
          >
            Terms
          </Link>

          {/* Auth buttons */}
          <div className="flex items-center" style={{ gap: "12px", marginLeft: "12px" }}>
            <Link href="/login">
              <button
                style={{
                  height: "42px",
                  padding: "0 28px",        // ← breathing room
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",      // prevent text wrap
                }}
                className="hover:bg-gray-100 transition"
              >
                Log In
              </button>
            </Link>

            <Link href="/signup">
              <button
                style={{
                  height: "42px",
                  padding: "0 28px",
                  borderRadius: "10px",
                  background: "linear-gradient(90deg, #ec4899, #f97316, #facc15)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(236,72,153,0.25)",
                  whiteSpace: "nowrap",
                }}
                className="hover:scale-105 transition"
              >
                Sign Up
              </button>
            </Link>
          </div>
        </div>

        {/* HAMBURGER – adjusted right margin */}
        <div className="md:hidden">
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            style={{
              fontSize: "1.8rem",
              padding: "8px",
              marginRight: "0rem",   // ensures it's not pushed too far right
              borderRadius: "10px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#374151",
            }}
            className="hover:bg-gray-100 transition"
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        style={{
          maxHeight: open ? "400px" : "0",
          opacity: open ? 1 : 0,
          transition: "max-height 0.3s ease, opacity 0.3s ease",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: open ? "1.5rem 2rem" : "0 2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            backgroundColor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          {/* Mobile links */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            style={{
              textDecoration: "none",
              color: isActive("/") ? "#ec4899" : "#374151",
              fontWeight: isActive("/") ? 600 : 500,
              fontSize: "1rem",
            }}
          >
            Home
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            style={{
              textDecoration: "none",
              color: isActive("/about") ? "#ec4899" : "#374151",
              fontWeight: isActive("/about") ? 600 : 500,
              fontSize: "1rem",
            }}
          >
            About
          </Link>
          <Link
            href="/privacy"
            onClick={() => setOpen(false)}
            style={{
              textDecoration: "none",
              color: isActive("/privacy") ? "#ec4899" : "#374151",
              fontWeight: isActive("/privacy") ? 600 : 500,
              fontSize: "1rem",
            }}
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            onClick={() => setOpen(false)}
            style={{
              textDecoration: "none",
              color: isActive("/terms") ? "#ec4899" : "#374151",
              fontWeight: isActive("/terms") ? 600 : 500,
              fontSize: "1rem",
            }}
          >
            Terms
          </Link>

          {/* Mobile auth */}
          <div className="flex flex-col" style={{ gap: "12px", marginTop: "4px" }}>
            <Link href="/login" onClick={() => setOpen(false)}>
              <button
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 24px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Log In
              </button>
            </Link>
            <Link href="/signup" onClick={() => setOpen(false)}>
              <button
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 24px",
                  borderRadius: "10px",
                  background: "linear-gradient(90deg, #ec4899, #f97316, #facc15)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(236,72,153,0.2)",
                  whiteSpace: "nowrap",
                }}
              >
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}