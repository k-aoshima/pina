import { create } from 'zustand'

export type RunnerModel = 'FanFan' | 'Rabbit' | 'Tako'

export type GameStatus = 'loading' | 'ready' | 'playing' | 'gameover'

const HIGH_SCORE_KEY = 'pina-game-high-score'

function getStoredHighScore(): number {
  if (typeof window === 'undefined') return 0
  try {
    const v = localStorage.getItem(HIGH_SCORE_KEY)
    return v != null ? Math.max(0, parseInt(v, 10)) : 0
  } catch {
    return 0
  }
}

type GameStore = {
  status: GameStatus
  score: number
  highScore: number
  selectedModel: RunnerModel
  isDucking: boolean
  setStatus: (status: GameStatus) => void
  setScore: (score: number) => void
  addScore: (delta: number) => void
  setHighScore: (score: number) => void
  setSelectedModel: (model: RunnerModel) => void
  setDucking: (ducking: boolean) => void
  startGame: () => void
  endGame: () => void
  restart: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  status: 'loading',
  score: 0,
  highScore: getStoredHighScore(),
  selectedModel: 'FanFan',
  isDucking: false,
  setStatus: (status) => set({ status }),
  setScore: (score) => set({ score }),
  addScore: (delta) => set((s) => ({ score: s.score + delta })),
  setHighScore: (score) => {
    const prev = getStoredHighScore()
    const next = Math.max(prev, score)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(HIGH_SCORE_KEY, String(next))
      } catch {
        // ignore
      }
    }
    set({ highScore: next })
  },
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setDucking: (isDucking) => set({ isDucking }),
  startGame: () => set({ status: 'playing', score: 0 }),
  endGame: () =>
    set((s) => {
      const nextHigh = Math.max(s.highScore, s.score)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(HIGH_SCORE_KEY, String(nextHigh))
        } catch {
          // ignore
        }
      }
      return { status: 'gameover', highScore: nextHigh }
    }),
  restart: () => set({ status: 'ready', score: 0 }), // リトライ時はreadyに直接遷移
}))
