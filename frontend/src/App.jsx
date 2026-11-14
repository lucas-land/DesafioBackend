import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LoginRedirect from './components/LoginRedirect'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import AdminDisciplinas from './pages/admin/AdminDisciplinas'
import AdminTurmas from './pages/admin/AdminTurmas'
import AlunoTurmasDisponiveis from './pages/aluno/AlunoTurmasDisponiveis'
import AlunoMinhasMatriculas from './pages/aluno/AlunoMinhasMatriculas'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <LoginRedirect>
                <LoginPage />
              </LoginRedirect>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredPerfil="admin">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="disciplinas" replace />} />
            <Route path="disciplinas" element={<AdminDisciplinas />} />
            <Route path="turmas" element={<AdminTurmas />} />
          </Route>
          <Route
            path="/aluno"
            element={
              <ProtectedRoute requiredPerfil="aluno">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="turmas-disponiveis" replace />} />
            <Route path="turmas-disponiveis" element={<AlunoTurmasDisponiveis />} />
            <Route path="minhas-matriculas" element={<AlunoMinhasMatriculas />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
