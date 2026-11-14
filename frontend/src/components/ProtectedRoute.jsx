import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Redirects to / if not authenticated or if profile does not match the required one.
 * requiredPerfil: 'admin' | 'aluno'
 */
export default function ProtectedRoute({ children, requiredPerfil }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/" replace />
  }
  if (user.perfil !== requiredPerfil) {
    return <Navigate to="/" replace />
  }
  return children
}
