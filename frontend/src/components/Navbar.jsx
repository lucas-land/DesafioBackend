import { NavLink, useNavigate } from 'react-router-dom'
import { Box, Flex, Text } from '@radix-ui/themes'
import { useAuth } from '../contexts/AuthContext'
import LogoIcon from './LogoIcon'
import { BookIcon, UsersIcon, ListIcon, ClipboardIcon, LogoutIcon } from './Icons'

const ADMIN_ITEMS = [
  { to: '/admin/disciplinas', end: true, label: 'Disciplinas', icon: BookIcon },
  { to: '/admin/turmas', end: true, label: 'Turmas', icon: UsersIcon },
]

const ALUNO_ITEMS = [
  { to: '/aluno/turmas-disponiveis', end: false, label: 'Turmas disponíveis', icon: ListIcon },
  { to: '/aluno/minhas-matriculas', end: false, label: 'Minhas matrículas', icon: ClipboardIcon },
]

function NavItem({ to, end, label, icon: Icon, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 8,
        color: 'white',
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: 500,
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
      })}
    >
      <Icon />
      <span>{label}</span>
    </NavLink>
  )
}

export default function Navbar({ onNavigate, isDrawer }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.perfil === 'admin'
  const items = isAdmin ? ADMIN_ITEMS : ALUNO_ITEMS
  const subtitle = isAdmin ? 'Painel Admin' : 'Painel Aluno'

  function handleLogout() {
    logout()
    navigate('/')
  }

  const boxStyle = {
    width: 260,
    minHeight: '100vh',
    background: '#111827',
    padding: '24px 16px',
    boxSizing: 'border-box',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    ...(!isDrawer && {
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 1000,
    }),
    ...(isDrawer && {
      boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
    }),
  }

  return (
    <Box style={boxStyle}>
      <Flex direction="column" gap="6" style={{ flex: 1 }}>
        {!isDrawer && (
          <Flex align="center" gap="3" style={{ marginBottom: 8 }}>
            <LogoIcon size={40} />
            <Flex direction="column" gap="0">
              <Text size="3" weight="bold" style={{ color: 'white', lineHeight: 1.2 }}>
                Sistema Academico
              </Text>
              <Text size="1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {subtitle}
              </Text>
            </Flex>
          </Flex>
        )}

        <Flex direction="column" gap="1">
          {items.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              end={item.end}
              label={item.label}
              icon={item.icon}
              onNavigate={onNavigate}
            />
          ))}
        </Flex>
      </Flex>

      {!isDrawer && (
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: 'rgba(255,255,255,0.8)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            marginTop: 'auto',
          }}
        >
          <LogoutIcon />
          Sair
        </button>
      )}
    </Box>
  )
}
