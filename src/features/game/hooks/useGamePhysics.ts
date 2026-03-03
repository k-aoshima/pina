import { useRef, useCallback } from 'react'
import { JUMP_FORCE, GRAVITY, MAX_JUMPS } from '../constants/gameConstants'

export interface PhysicsState {
  isJumping: boolean
  velocityY: number
  posY: number
  jumpsRemaining: number
}

export interface GamePhysicsAPI {
  physicsRef: React.RefObject<PhysicsState>
  jump: () => void
  updatePhysics: () => void
  resetPhysics: () => void
}

export function useGamePhysics(getGameState: () => string): GamePhysicsAPI {
  const physicsRef = useRef<PhysicsState>({
    isJumping: false,
    velocityY: 0,
    posY: 0,
    jumpsRemaining: MAX_JUMPS,
  })

  const jump = useCallback(() => {
    const state = getGameState()
    const physics = physicsRef.current
    if (state !== 'PLAYING' || physics.jumpsRemaining <= 0) return
    physics.jumpsRemaining--
    physics.isJumping = true
    physics.velocityY = JUMP_FORCE
  }, [getGameState])

  const updatePhysics = useCallback(() => {
    const p = physicsRef.current
    if (p.isJumping || p.posY > 0) {
      p.velocityY -= GRAVITY
      p.posY += p.velocityY

      if (p.posY <= 0) {
        p.posY = 0
        p.velocityY = 0
        p.isJumping = false
        p.jumpsRemaining = MAX_JUMPS
      }
    }
  }, [])

  const resetPhysics = useCallback(() => {
    const p = physicsRef.current
    p.posY = 0
    p.velocityY = 0
    p.isJumping = false
    p.jumpsRemaining = MAX_JUMPS
  }, [])

  return { physicsRef, jump, updatePhysics, resetPhysics }
}
