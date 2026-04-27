"use client";

import { useState } from "react";
import Link from "next/link";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between h-16">

        {/* LOGO */}
        <div className="text-xl font-bold text-gray-800">
          ☕ TeaTalks
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">

          <Link href="/" className="nav-link">Home</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/privacy" className="nav-link">Privacy</Link>
          <Link href="/terms" className="nav-link">Terms</Link>

          {/* AUTH */}
          <Link href="/login">
            <button className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100 transition">
              Log In
            </button>
          </Link>

          <Link href="/signup">
            <button className="px-5 py-2 rounded-lg text-sm font-semibold text-white 
              bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 
              shadow-md hover:scale-105 transition">
              Sign Up
            </button>
          </Link>

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 pt-2 flex flex-col gap-4 bg-white/90 backdrop-blur-md">

          <Link href="/" onClick={() => setOpen(false)} className="mobile-link">
            Home
          </Link>
          <Link href="/about" onClick={() => setOpen(false)} className="mobile-link">
            About
          </Link>
          <Link href="/privacy" onClick={() => setOpen(false)} className="mobile-link">
            Privacy
          </Link>
          <Link href="/terms" onClick={() => setOpen(false)} className="mobile-link">
            Terms
          </Link>

          <div className="flex flex-col gap-3 mt-2">

            <Link href="/login" onClick={() => setOpen(false)}>
              <button className="w-full py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100 transition">
                Log In
              </button>
            </Link>

            <Link href="/signup" onClick={() => setOpen(false)}>
              <button className="w-full py-2 rounded-lg text-sm font-semibold text-white 
                bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 
                shadow-md">
                Sign Up
              </button>
            </Link>

          </div>

        </div>
      </div>

    </nav>
  );
}
