import type { RunnerModel } from '../stores/useGameStore'
import { modelAssetUrl } from '../../../config/constants'

// --- ゲーム設定 ---
export const PLAYER_X = -4
export const OBSTACLE_SPEED_MIN = 0.15
export const OBSTACLE_SPEED_MAX = 0.32
export const OBSTACLE_MIN_INTERVAL = 130 // 障害物の最小出現間隔（フレーム）
export const OBSTACLE_MIN_DISTANCE = 12 // 直前の障害物がこのXより左になるまで次を出さない
export const JUMP_FORCE = 0.26
export const GRAVITY = 0.013
export const MAX_JUMPS = 2
export const MOBILE_MAX_WIDTH = 768

export const RUNNER_OPTIONS: { id: RunnerModel; label: string }[] = [
  { id: 'FanFan', label: 'FanFan' },
  { id: 'Rabbit', label: 'Rabbit' },
  { id: 'Tako', label: 'Tako' },
]

export function getModelUrl(model: RunnerModel): string {
  return model === 'Tako'
    ? modelAssetUrl('models/Tako.glb')
    : modelAssetUrl(`models/${model}.stl`)
}
