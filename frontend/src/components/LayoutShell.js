'use client'

import { usePathname } from 'next/navigation'
import NavBar from './NavBar'
import Footer from './Footer'
import AppNavbar from './AppNavbar'
import MobileNav from './MobileNav'

const SHAKTI_ROUTES = ['/', '/about', '/privacy', '/terms']
const AUTH_ROUTES = ['/login', '/signup']
const APP_ROUTES = ['/feed', '/create', '/posts', '/search', '/profile']
const ADMIN_ROUTES = ['/admin']

export default function LayoutShell({ children }) {
  const pathname = usePathname()

  // Shakti's pages: her NavBar + Footer
  if (SHAKTI_ROUTES.includes(pathname)) {
    return (
      <>
        <NavBar />
        {children}
        <Footer />
      </>
    )
  }

  // Auth pages: no wrapper, they have their own layout
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return <>{children}</>
  }

  // Admin pages: no wrapper, they have their own sidebar
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    return <>{children}</>
  }

  // App pages: AppNavbar + MobileNavbar
  if (APP_ROUTES.some((r) => pathname.startsWith(r))) {
    return (
      <>
        <AppNavbar />
        {children}
        <MobileNav />
      </>
    )
  }

  // Fallback
  return <>{children}</>
}