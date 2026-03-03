import { useEffect } from 'react'
import type { GameStatus } from '../stores/useGameStore'

export function useGameInput(status: GameStatus, onJump: () => void): void {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        if (status === 'playing') onJump()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [status, onJump])
}
