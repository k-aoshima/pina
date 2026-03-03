import * as THREE from 'three'
import {
  PLAYER_X,
  OBSTACLE_SPEED_MIN,
  OBSTACLE_SPEED_MAX,
  OBSTACLE_MIN_INTERVAL,
  OBSTACLE_MIN_DISTANCE,
} from '../constants/gameConstants'

interface ObstacleUserData {
  speed: number
  scaleY: number
}

interface ObstacleState {
  scene: THREE.Scene | null
  obstacles: THREE.Mesh[]
  obstacleTimer: number
  lastObstacleScaleY: number
  score: number
  posY: number
  gameState: string
}

export function trySpawnObstacle(state: ObstacleState, setScore: (n: number) => void): void {
  const rightmostX =
    state.obstacles.length > 0 ? Math.max(...state.obstacles.map((o) => o.position.x)) : -999
  const canSpawn =
    state.scene &&
    state.obstacleTimer > OBSTACLE_MIN_INTERVAL &&
    rightmostX <= 25 - OBSTACLE_MIN_DISTANCE

  if (!canSpawn) return

  const type = Math.floor(Math.random() * 3)
  let obsGeo: THREE.BufferGeometry
  if (type === 0) obsGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2)
  else if (type === 1) obsGeo = new THREE.TorusGeometry(0.6, 0.25, 8, 16)
  else obsGeo = new THREE.SphereGeometry(0.7, 12, 12)

  const colors = ['#22d3ee', '#a855f7', '#fb923c']
  const obs = new THREE.Mesh(obsGeo, new THREE.MeshStandardMaterial({ color: colors[type] }))
  const lastWasTall = state.lastObstacleScaleY === 2
  const scaleY = lastWasTall ? 1 : Math.random() < 0.5 ? 2 : 1
  const speed = OBSTACLE_SPEED_MIN + Math.random() * (OBSTACLE_SPEED_MAX - OBSTACLE_SPEED_MIN)
  obs.scale.y = scaleY
  obs.position.set(25, 0.8 + (scaleY - 1) * 0.6, 0)
  obs.castShadow = true
  ;(obs.userData as ObstacleUserData).speed = speed
  ;(obs.userData as ObstacleUserData).scaleY = scaleY
  state.scene!.add(obs)
  state.obstacles.push(obs)
  state.obstacleTimer = 0
  state.lastObstacleScaleY = scaleY
  state.score += 10
  setScore(state.score)
}

export function updateObstacles(state: ObstacleState, endGame: () => void): void {
  for (let i = state.obstacles.length - 1; i >= 0; i--) {
    const obs = state.obstacles[i]
    if (!obs) continue
    const speed = (obs.userData as ObstacleUserData).speed ?? 0.22
    obs.position.x -= speed
    obs.rotation.y += 0.02

    const playerY = state.posY + 0.7
    const dx = obs.position.x - PLAYER_X
    const dy = obs.position.y - playerY
    if (Math.sqrt(dx * dx + dy * dy) < 1.1) {
      endGame()
      state.gameState = 'GAMEOVER'
    }

    if (obs.position.x < -15 && state.scene) {
      state.scene.remove(obs)
      obs.geometry.dispose()
      if (Array.isArray(obs.material)) obs.material.forEach((m) => m.dispose())
      else obs.material.dispose()
      state.obstacles.splice(i, 1)
    }
  }
}
