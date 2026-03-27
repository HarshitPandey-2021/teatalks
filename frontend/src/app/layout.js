import "./globals.css"
import LayoutShell from "../components/LayoutShell"
import { AuthProvider } from "../context/AuthContext"

export const metadata = {
  title: "TeaTalks",
  description: "Campus discussion platform",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  )
}