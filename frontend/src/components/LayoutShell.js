'use client'

import { usePathname } from 'next/navigation'
import NavBar from './NavBar'
import Footer from './Footer'
const APP_ROUTES = ['/login', '/signup', '/feed', '/create', '/posts', '/search', '/profile', '/admin']

export default function LayoutShell({ children }) {
  const pathname = usePathname()
  // const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r)) prevoius one
  const isAuth = APP_ROUTES.some((r) => pathname.startsWith(r))

  if (isAuth) {
    return <>{children}</>
  }

  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  )
}
