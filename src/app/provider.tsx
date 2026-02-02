import { type ReactNode } from 'react'
import { StrictMode } from 'react'

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return <StrictMode>{children}</StrictMode>
}
