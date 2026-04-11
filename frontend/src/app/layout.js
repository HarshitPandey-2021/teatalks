import "./globals.css";


import LayoutShell from "@/components/LayoutShell";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "TeaTalks",
  description: "Your Campus. Your Voice. Zero Judgment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>

      <body suppressHydrationWarning>
        <AuthProvider>

          {/* NAVBAR */}
  

          {/* MAIN LAYOUT WRAPPER */}
          <LayoutShell>
            <main style={{ minHeight: "100vh" }}>
              {children}
            </main>
          </LayoutShell>

          {/* FOOTER */}
   

        </AuthProvider>
      </body>
    </html>
  );
}