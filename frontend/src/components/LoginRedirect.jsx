import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * If user is already logged in, redirect to the appropriate area by profile.
 * Otherwise render children (LoginPage).
 */
export default function LoginRedirect({ children }) {
  const { user } = useAuth()

  if (!user) return children
  if (user.perfil === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/aluno" replace />
}
