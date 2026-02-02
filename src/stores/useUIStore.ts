import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  scrollY: number
  setScrollY: (y: number) => void
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isMobileMenuOpen: false,
      toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),

      scrollY: 0,
      setScrollY: (y) => set({ scrollY: y }),

      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: 'UIStore' }
  )
)
