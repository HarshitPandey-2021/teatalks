"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const linkClass = (path) =>
    `nav-link ${pathname === path ? "text-pink-500 font-semibold" : ""}`;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200">

      {/* ✅ Increased side padding */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 flex items-center justify-between h-16">

        {/* LOGO */}
        <div className="flex items-center gap-2 pl-2 text-xl font-bold text-gray-800">
          <span className="text-2xl">☕</span>
          <span>TeaTalks</span>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center gap-8">

          <Link href="/" className={linkClass("/")}>Home</Link>
          <Link href="/about" className={linkClass("/about")}>About</Link>
          <Link href="/privacy" className={linkClass("/privacy")}>Privacy</Link>
          <Link href="/terms" className={linkClass("/terms")}>Terms</Link>

          <div className="flex items-center gap-3 ml-2">
            <Link href="/login">
              <button className="h-10 px-6 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100 transition">
                Log In
              </button>
            </Link>

            <Link href="/signup">
              <button className="h-10 px-7 rounded-lg text-sm font-semibold text-white 
                bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 
                shadow-md hover:scale-105 transition">
                Sign Up
              </button>
            </Link>
          </div>

        </div>

        {/* ✅ FIXED HAMBURGER SPACING */}
        <div className="md:hidden pr-3">
          <button
            className="text-2xl"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        </div>

      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 pt-2 flex flex-col gap-4 bg-white/90 backdrop-blur-md">

          <Link href="/" onClick={() => setOpen(false)} className={linkClass("/")}>Home</Link>
          <Link href="/about" onClick={() => setOpen(false)} className={linkClass("/about")}>About</Link>
          <Link href="/privacy" onClick={() => setOpen(false)} className={linkClass("/privacy")}>Privacy</Link>
          <Link href="/terms" onClick={() => setOpen(false)} className={linkClass("/terms")}>Terms</Link>

          <div className="flex flex-col gap-3 mt-2">
            <Link href="/login" onClick={() => setOpen(false)}>
              <button className="w-full h-11 px-6 rounded-lg border border-gray-300">
                Log In
              </button>
            </Link>

            <Link href="/signup" onClick={() => setOpen(false)}>
              <button className="w-full h-11 px-7 rounded-lg text-white 
                bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400">
                Sign Up
              </button>
            </Link>
          </div>

        </div>
      </div>

    </nav>
  );
}