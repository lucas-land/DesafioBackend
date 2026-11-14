import { useEffect } from 'react'
import { Box } from '@radix-ui/themes'

const toastStyle = {
  position: 'fixed',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '12px 20px',
  borderRadius: 8,
  color: 'white',
  fontSize: 14,
  fontWeight: 500,
  boxShadow: 'var(--shadow-4)',
  zIndex: 9999,
}

export function Toast({ message, onClose, variant = 'success' }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const background = variant === 'error' ? 'var(--red-9)' : 'var(--green-9)'
  return (
    <Box style={{ ...toastStyle, background }}>
      {message}
    </Box>
  )
}

export function ToastError({ message, onClose }) {
  return <Toast message={message} onClose={onClose} variant="error" />
}
