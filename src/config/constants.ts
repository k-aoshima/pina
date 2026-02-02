/** GitHub Pages など base がある環境でモデルパスを解決する */
export const modelAssetUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.startsWith('/') ? path.slice(1) : path}`

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
