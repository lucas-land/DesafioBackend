import { Flex, Text } from '@radix-ui/themes'
import LogoIcon from './LogoIcon'
import { MenuIcon, LogoutIcon } from './Icons'

export default function MobileHeader({ onMenuClick, onLogout }) {
  return (
    <Flex
      align="center"
      justify="between"
      style={{
        height: 56,
        padding: '0 16px',
        background: '#111827',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menu"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          border: 'none',
          borderRadius: 8,
          background: 'transparent',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        <MenuIcon />
      </button>
      <Flex align="center" gap="2">
        <LogoIcon size={32} />
        <Text size="2" weight="bold" style={{ color: 'white' }}>
          Sistema Academico
        </Text>
      </Flex>
      <button
        type="button"
        onClick={onLogout}
        aria-label="Sair"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          height: 36,
          padding: '0 12px',
          border: 'none',
          borderRadius: 8,
          background: 'transparent',
          color: 'rgba(255,255,255,0.9)',
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        <LogoutIcon />
        Sair
      </button>
    </Flex>
  )
}
