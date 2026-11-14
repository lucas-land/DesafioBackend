import { Box } from '@radix-ui/themes'

export default function LogoIcon({ size = 48 }) {
  const iconSize = size === 48 ? 28 : Math.round((28 * size) / 48)
  return (
    <Box
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: 'var(--accent-9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    </Box>
  )
}
