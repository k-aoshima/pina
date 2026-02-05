import { type ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-screen flex-col overflow-x-clip bg-pina-yellow">
      <Header />
      <main className="w-full flex-1 overflow-x-clip">{children}</main>
      <Footer />
    </div>
  )
}
