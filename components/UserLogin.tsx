"use client"

import type React from "react"
import { useState } from "react"

interface UserLoginProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (credentials: { email: string; password: string }) => void
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001"

export default function UserLogin({ isOpen, onClose, onLogin }: UserLoginProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot-password">("login")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [registerEmail, setRegisterEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [codeSent, setCodeSent] = useState(false)

  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotCode, setForgotCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [forgotCodeSent, setForgotCodeSent] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const parseApiError = async (res: Response) => {
    let body: any = null
    try {
      body = await res.json()
    } catch {}
    const msg = body?.message || body?.error || ""
    if (res.status === 401) return "E-mail ou senha inválidos."
    if (res.status === 400) {
      console.log("API 400 error message:", msg)
      if (typeof msg === "string" && /Account with this email already exist/i.test(msg)) return "Já existe conta para este e-mail."
      if (typeof msg === "string" && /Invalid token/i.test(msg)) return "Código de verificação inválido."
      if (typeof msg === "object" && /the domains/i.test(msg[0])) return "O email deve pertencer ao dominío newtonpaiva.edu.br"
      return "Requisição inválida."
    }
    if (res.status === 429) return "Muitas tentativas. Tente novamente mais tarde."
    if (res.status >= 500) return "Erro interno. Tente novamente mais tarde."
    return msg || "Falha na solicitação."
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setIsLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      })
      if (!res.ok) {
        setError(await parseApiError(res))
        return
      }
      const data = await res.json()
      if (data?.idToken) {
        try {
          localStorage.setItem("idToken", data.idToken)
          if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken)
          if (data.expiresIn) localStorage.setItem("expiresIn", String(data.expiresIn))
        } catch {}
      }
      onLogin({ email: email.trim(), password: password.trim() })
      setEmail("")
      setPassword("")
      onClose()
    } catch {
      setError("Erro ao fazer login. Verifique sua conexão.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendCode = async () => {
    if (!registerEmail.trim()) {
      setError("Por favor, insira um e-mail válido.")
      return
    }
    setIsLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`${API_BASE}/user/verification-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registerEmail.trim() }),
      })
      if (!res.ok) {
        setError(await parseApiError(res))
        return
      }
      setCodeSent(true)
      setSuccess("Código de verificação enviado para seu e-mail.")
    } catch {
      setError("Erro ao enviar código. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!registerEmail.trim() || !verificationCode.trim() || !registerPassword.trim() || !confirmPassword.trim() || !firstName.trim()) {
      setError("Por favor, preencha todos os campos.")
      return
    }
    if (!codeSent) {
      setError("Solicite o código de verificação primeiro.")
      return
    }
    if (registerPassword.length < 8 || registerPassword.length > 40) {
      setError("A senha deve ter entre 8 e 40 caracteres.")
      return
    }
    if (registerPassword !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          token: verificationCode.trim(),
          email: registerEmail.trim(),
          password: registerPassword.trim(),
        }),
      })
      if (!res.ok) {
        setError(await parseApiError(res))
        return
      }
      const autoLoginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registerEmail.trim(), password: registerPassword.trim() }),
      })
      if (autoLoginRes.ok) {
        const data = await autoLoginRes.json()
        if (data?.idToken) {
          try {
            localStorage.setItem("idToken", data.idToken)
            if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken)
            if (data.expiresIn) localStorage.setItem("expiresIn", String(data.expiresIn))
          } catch {}
        }
        onLogin({ email: registerEmail.trim(), password: registerPassword.trim() })
      }
      setRegisterEmail("")
      setVerificationCode("")
      setRegisterPassword("")
      setConfirmPassword("")
      setFirstName("")
      setCodeSent(false)
      setMode("login")
      onClose()
    } catch {
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendForgotCode = async () => {
    if (!forgotEmail.trim()) {
      setError("Por favor, insira um e-mail válido.")
      return
    }
    setIsLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`${API_BASE}/user/refactor-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      })
      if (!res.ok) {
        setError(await parseApiError(res))
        return
      }
      setForgotCodeSent(true)
      setSuccess("Código de verificação enviado para seu e-mail.")
    } catch {
      setError("Erro ao enviar código. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!forgotEmail.trim() || !forgotCode.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setError("Por favor, preencha todos os campos.")
      return
    }
    if (!forgotCodeSent) {
      setError("Solicite o código de verificação primeiro.")
      return
    }
    if (newPassword.length < 8 || newPassword.length > 40) {
      setError("A senha deve ter entre 8 e 40 caracteres.")
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError("As senhas não coincidem.")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/user/change-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          token: forgotCode.trim(),
          newPassword: newPassword.trim(),
        }),
      })
      if (!res.ok) {
        setError(await parseApiError(res))
        return
      }
      setSuccess("Senha alterada com sucesso.")
      setTimeout(() => {
        setForgotEmail("")
        setForgotCode("")
        setNewPassword("")
        setConfirmNewPassword("")
        setForgotCodeSent(false)
        setMode("login")
        setSuccess("")
      }, 1500)
    } catch {
      setError("Erro ao redefinir senha. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    setPassword("")
    setRegisterEmail("")
    setVerificationCode("")
    setRegisterPassword("")
    setConfirmPassword("")
    setFirstName("")
    setCodeSent(false)
    setForgotEmail("")
    setForgotCode("")
    setNewPassword("")
    setConfirmNewPassword("")
    setForgotCodeSent(false)
    setError("")
    setSuccess("")
    setMode("login")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-textDark">
            {mode === "login" ? "Entrar" : mode === "register" ? "Cadastrar" : "Recuperar Senha"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fechar modal"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-textDark mb-2">E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-textDark mb-2">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => { setMode("forgot-password"); setError(""); setSuccess(""); }}
                className="text-sm text-wine hover:text-wine/80 transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center"
                disabled={!email.trim() || !password.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>

              <div className="text-center text-sm text-gray-600">
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
                  className="text-wine hover:text-wine/80 transition-colors font-medium"
                >
                  Cadastre-se
                </button>
              </div>
            </div>
          </form>
        ) : mode === "register" ? (
          <form onSubmit={handleRegister} className="p-6 space-y-5">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-textDark mb-2">E-mail</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  id="register-email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent"
                  required
                  disabled={isLoading || codeSent}
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isLoading || !registerEmail.trim() || codeSent}
                  className="px-4 py-3 bg-wine text-white rounded-lg hover:bg-wine/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap text-sm font-medium"
                >
                  {codeSent ? "Enviado" : "Enviar Código"}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-textDark mb-2">Nome</label>
              <input
                type="text"
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Seu nome"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="verification-code" className="block text-sm font-medium text-textDark mb-2">Código de Verificação</label>
              <input
                type="text"
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Digite o código recebido"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent"
                required
                disabled={isLoading || !codeSent}
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-textDark mb-2">Senha</label>
              <input
                type="password"
                id="register-password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="Digite sua senha (8-40 caracteres)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent"
                required
                disabled={isLoading}
                minLength={8}
                maxLength={40}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-textDark mb-2">Confirmar Senha</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite sua senha novamente"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent"
                required
                disabled={isLoading}
                minLength={8}
                maxLength={40}
              />
            </div>

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center"
                disabled={isLoading || !codeSent}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cadastrando...
                  </>
                ) : (
                  "Cadastrar"
                )}
              </button>

              <div className="text-center text-sm text-gray-600">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                  className="text-wine hover:text-wine/80 transition-colors font-medium"
                >
                  Entrar
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="p-6 space-y-5">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-textDark mb-2">E-mail</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  id="forgot-email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent"
                  required
                  disabled={isLoading || forgotCodeSent}
                />
                <button
                  type="button"
                  onClick={handleSendForgotCode}
                  disabled={isLoading || !forgotEmail.trim() || forgotCodeSent}
                  className="px-4 py-3 bg-wine text-white rounded-lg hover:bg-wine/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap text-sm font-medium"
                >
                  {forgotCodeSent ? "Enviado" : "Enviar Código"}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="forgot-code" className="block text-sm font-medium text-textDark mb-2">Código de Verificação</label>
              <input
                type="text"
                id="forgot-code"
                value={forgotCode}
                onChange={(e) => setForgotCode(e.target.value)}
                placeholder="Digite o código recebido"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent"
                required
                disabled={isLoading || !forgotCodeSent}
              />
            </div>

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-textDark mb-2">Nova Senha</label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha (8-40 caracteres)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent"
                required
                disabled={isLoading}
                minLength={8}
                maxLength={40}
              />
            </div>

            <div>
              <label htmlFor="confirm-new-password" className="block text-sm font-medium text-textDark mb-2">Confirmar Nova Senha</label>
              <input
                type="password"
                id="confirm-new-password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Digite sua nova senha novamente"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent"
                required
                disabled={isLoading}
                minLength={8}
                maxLength={40}
              />
            </div>

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center"
                disabled={isLoading || !forgotCodeSent}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Alterando senha...
                  </>
                ) : (
                  "Alterar Senha"
                )}
              </button>

              <div className="text-center text-sm text-gray-600">
                Lembrou sua senha?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                  className="text-wine hover:text-wine/80 transition-colors font-medium"
                >
                  Entrar
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
