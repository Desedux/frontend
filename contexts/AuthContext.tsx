"use client"

import {createContext, useContext, useEffect, useState, type ReactNode} from "react"

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const STORAGE_KEY = "desedux_user"

export function AuthProvider({children}: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function callRefresh(refreshToken: string, emailFallback?: string): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({refreshToken}),
      })


      if (!res.ok) {

        return null
      }

      const data: {
        idToken: string
        refreshToken: string
        expiresIn: string
        email?: string
      } = await res.json()


      const expiresAt = Date.now() + Number(data.expiresIn) * 1000

      return {
        email: data.email ?? emailFallback ?? "",
        tokens: {
          idToken: data.idToken,
          refreshToken: data.refreshToken,
          expiresAt,
        },
      }
    } catch (err) {

      return null
    }
  }

  // 1) INIT: lê do localStorage UMA vez
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
    } catch (err) {

      localStorage.removeItem(STORAGE_KEY)
      setUser(null)
    } finally {

      setIsLoading(false)
    }
  }, [])

  // 2) SYNC user -> localStorage (só DEPOIS do init terminar)
  useEffect(() => {


    if (typeof window === "undefined") return

    // enquanto está carregando do storage, NÃO mexe em nada
    if (isLoading) {

      return
    }

    if (user) {

      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {

      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user, isLoading])

  async function login(credentials: { email: string; password: string }) {


    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(credentials),
    })


    if (!res.ok) {
      throw new Error("Credenciais inválidas")
    }

    const data: {
      idToken: string
      refreshToken: string
      expiresIn: string
      email?: string
    } = await res.json()


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

  // 3) REFRESH automático
  useEffect(() => {


    if (!user?.tokens) {

      return
    }

    const now = Date.now()
    const msToExpiry = user.tokens.expiresAt - now


    const doRefresh = async () => {

      const refreshed = await callRefresh(user.tokens.refreshToken, user.email)

      if (!refreshed) {

        setUser(null)
      } else {

        setUser(refreshed)
      }
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

    return () => {

      clearTimeout(id)
    }
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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
