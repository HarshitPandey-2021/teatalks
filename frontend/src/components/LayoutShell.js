'use client'

import { usePathname } from 'next/navigation'
import NavBar from './NavBar'
import Footer from './Footer'

const AUTH_ROUTES = ['/login', '/signup', '/feed','/create']

export default function LayoutShell({ children }) {
  const pathname = usePathname()
  const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r))

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
