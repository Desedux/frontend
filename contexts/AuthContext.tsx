"use client"

import {createContext, useContext, useEffect, useState, type ReactNode} from "react"
import {http} from "@/lib/api/http"  // <-- usa o helper

interface Tokens {
  idToken: string
  refreshToken: string
  expiresAt: number
}

interface User {
  email: string
  tokens: Tokens
}

interface AuthContextType {
  user: User | null
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "desedux_user"

type LoginResponse = {
  idToken: string
  refreshToken: string
  expiresIn: string
  email?: string
}

export function AuthProvider({children}: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function callRefresh(refreshToken: string, emailFallback?: string): Promise<User | null> {
    try {
      const data = await http<LoginResponse>("/auth/refresh", {
        method: "POST",
        body: {refreshToken},
      })

      const expiresAt = Date.now() + Number(data.expiresIn) * 1000

      return {
        email: data.email ?? emailFallback ?? "",
        tokens: {
          idToken: data.idToken,
          refreshToken: data.refreshToken,
          expiresAt,
        },
      }
    } catch {
      return null
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        setUser(null)
        return
      }

      const parsed = JSON.parse(stored) as User

      if (!parsed?.tokens?.refreshToken || !parsed?.tokens?.expiresAt) {
        localStorage.removeItem(STORAGE_KEY)
        setUser(null)
        return
      }

      setUser(parsed)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (isLoading) return

    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user, isLoading])

  async function login(credentials: { email: string; password: string }) {
    const data = await http<LoginResponse>("/auth/login", {
      method: "POST",
      body: credentials,
    })

    const expiresAt = Date.now() + Number(data.expiresIn) * 1000

    const newUser: User = {
      email: data.email ?? credentials.email,
      tokens: {
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresAt,
      },
    }

    setUser(newUser)
  }

  useEffect(() => {
    if (!user?.tokens) return

    const now = Date.now()
    const msToExpiry = user.tokens.expiresAt - now

    const doRefresh = async () => {
      const refreshed = await callRefresh(user.tokens.refreshToken, user.email)
      if (!refreshed) setUser(null)
      else setUser(refreshed)
    }

    if (msToExpiry <= 0) {
      void doRefresh()
      return
    }

    const offset = 5 * 60 * 1000
    const timeoutMs = Math.max(msToExpiry - offset, 30 * 1000)

    const id = setTimeout(() => {
      void doRefresh()
    }, timeoutMs)

    return () => clearTimeout(id)
  }, [user])

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{user, login, logout, isLoading}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
