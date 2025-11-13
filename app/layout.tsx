import type { ReactNode } from "react"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
    <body>
    <AuthProvider>
      {children}
    </AuthProvider>
    </body>
    </html>
  )
}