"use client";

import { useState } from "react";
import Link from "next/link";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      
      <div className="logo">☕ TeaTalks</div>

      {/* HAMBURGER */}
      <div className="menu-toggle" onClick={() => setOpen(!open)}>
        ☰
      </div>

      {/* NAV LINKS */}
      <div className={`navlinks ${open ? "active" : ""}`}>
        <Link href="/" onClick={() => setOpen(false)}>Home</Link>
        <Link href="/about" onClick={() => setOpen(false)}>About</Link>
        <Link href="/privacy" onClick={() => setOpen(false)}>Privacy</Link>
        <Link href="/terms" onClick={() => setOpen(false)}>Terms</Link>

        <button className="btn-outline">Log In</button>
        <button className="btn-primary">Sign Up</button>
      </div>

    </nav>
  );
}