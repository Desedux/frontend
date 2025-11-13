"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import CreatePostModal from "./CreatePostModal"
import UserLogin from "./UserLogin"
import { useAuth } from "@/contexts/AuthContext"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { user, login, logout, isLoading } = useAuth()

  const handleCreatePost = (postData: {
    title: string
    content: string
    category: string
    isAnonymous: boolean
  }) => {
    console.log("Nova pergunta criada:", postData)
  }

  useEffect(() => {
    const open = () => setIsLoginModalOpen(true)
    window.addEventListener("open-login", open)
    return () => window.removeEventListener("open-login", open)
  }, [])

  const handleLogin = (credentials: { email: string; password: string }) => {
    login(credentials)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-wine rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-xl font-bold text-textDark">Desedux</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-textDark hover:text-wine transition-colors">
                Início
              </Link>
              <Link href="/categorias" className="text-textDark hover:text-wine transition-colors">
                Categorias
              </Link>
              <Link href="/sobre" className="text-textDark hover:text-wine transition-colors">
                Sobre
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="w-24 h-6 rounded bg-gray-200 animate-pulse" />
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-textDark">
                    Olá, {user.email.split("@")[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-textDark transition-colors"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="btn-secondary text-sm"
                >
                  Entrar
                </button>
              )}

              {user && !isLoading && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-primary text-sm"
                >
                  Nova Pergunta
                </button>
              )}

              <button
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="text-textDark hover:text-wine transition-colors">
                  Início
                </Link>
                <Link href="/categorias" className="text-textDark hover:text-wine transition-colors">
                  Categorias
                </Link>
                <Link href="/sobre" className="text-textDark hover:text-wine transition-colors">
                  Sobre
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      <UserLogin
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </>
  )
}
