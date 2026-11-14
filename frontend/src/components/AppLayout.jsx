import { useState, useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { Flex } from '@radix-ui/themes'
import { useAuth } from '../contexts/AuthContext'
import Navbar from './Navbar'
import MobileHeader from './MobileHeader'

const MOBILE_BREAKPOINT = 768

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile
}

export default function AppLayout() {
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <Flex style={{ minHeight: '100vh' }} direction="column">
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1001,
          }}
        >
          <MobileHeader
            onMenuClick={() => setMenuOpen((open) => !open)}
            onLogout={handleLogout}
          />
        </div>
      )}

      <Flex style={{ flex: 1, minHeight: 0, paddingTop: isMobile ? 56 : 0 }}>
        {isMobile ? (
          <>
            {menuOpen && (
              <div
                role="button"
                tabIndex={0}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  zIndex: 999,
                  cursor: 'pointer',
                }}
                onClick={closeMenu}
                onKeyDown={(e) => e.key === 'Escape' && closeMenu()}
                aria-label="Fechar menu"
              />
            )}
            <div
              style={{
                position: 'fixed',
                left: 0,
                top: 56,
                bottom: 0,
                zIndex: 1000,
                transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.2s ease',
                visibility: menuOpen ? 'visible' : 'hidden',
                pointerEvents: menuOpen ? 'auto' : 'none',
              }}
            >
              <Navbar isDrawer onNavigate={closeMenu} />
            </div>
          </>
        ) : (
          <Navbar />
        )}

        <Flex
          direction="column"
          style={{
            flex: 1,
            minWidth: 0,
            background: 'var(--gray-2)',
            marginLeft: isMobile ? 0 : 260,
          }}
        >
          <Outlet />
        </Flex>
      </Flex>
    </Flex>
  )
}
