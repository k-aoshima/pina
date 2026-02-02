import { ShoppingCart, Menu, X } from 'lucide-react'
import { NAV_LINKS } from '../../config/constants'
import { useUIStore } from '../../stores/useUIStore'

export function Header() {
  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen)
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu)

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-4 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-2 sm:gap-4 rounded-xl md:rounded-2xl border-4 md:border-[6px] border-black bg-pina-yellow px-3 py-2 shadow-brutal md:px-6 md:py-4">
          <a
            href="#"
            className="flex shrink-0 items-center rounded-lg border-4 border-black bg-pina-navy px-4 py-2 font-black italic text-pina-yellow text-xl md:text-2xl"
          >
            PINATOY'S
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-bold uppercase tracking-wide text-black hover:text-pink-500 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-4 border-black bg-pink-500 text-white shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95"
              aria-label="カート"
            >
              <ShoppingCart size={22} />
            </button>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-xl border-4 border-black bg-white md:hidden"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="mt-2 flex flex-col gap-2 rounded-2xl border-4 border-black bg-white p-4 shadow-brutal md:hidden">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg border-2 border-black px-4 py-3 font-bold uppercase text-black"
                onClick={() => useUIStore.getState().closeMobileMenu()}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
