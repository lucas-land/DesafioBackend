import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  api,
  clearSession,
  getSession,
  saveSession,
  setUnauthorizedHandler,
} from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession()?.usuario ?? null)

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  async function login(username, senha) {
    const usuarioTrimmed = (username || '').trim()
    const senhaTrimmed = senha || ''
    if (!usuarioTrimmed || !senhaTrimmed.trim()) {
      return { success: false, message: 'Preencha usuário e senha.' }
    }
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: { username: usuarioTrimmed, senha: senhaTrimmed },
      })
      saveSession({ accessToken: data.accessToken, usuario: data.usuario })
      setUser(data.usuario)
      return { success: true, perfil: data.usuario.perfil }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  async function registrar(username, senha) {
    return api('/auth/registrar', {
      method: 'POST',
      body: { username: username.trim(), senha },
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, registrar }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
