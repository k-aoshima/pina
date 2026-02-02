export const COLORS = {
  pinaYellow: '#FFD60A',
  pinaNavy: '#1E3A8A',
  pinaPink: '#EC4899',
} as const

export interface NavLink {
  label: string
  href: string
}

export const NAV_LINKS: NavLink[] = [
  { label: 'HOME', href: '#' },
  { label: 'CATALOG', href: '#digital-archives' },
  { label: 'NEWS', href: '#' },
  { label: 'CONTACT', href: '#' },
]
