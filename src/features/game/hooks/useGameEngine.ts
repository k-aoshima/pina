import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../stores/useGameStore'
import { Runner3D, RUNNER_Y_OFFSETS } from '../game/Runner3D'
import { PLAYER_X, JUMP_FORCE, GRAVITY, MAX_JUMPS, getModelUrl } from '../constants/gameConstants'
import { createGameScene } from '../game/sceneSetup'
import { trySpawnObstacle, updateObstacles } from '../game/obstacleUtils'

export interface GameEngineAPI {
  mountRef: React.RefObject<HTMLDivElement | null>
  startGame: () => void
  jump: () => void
}

export function useGameEngine(): GameEngineAPI {
  const mountRef = useRef<HTMLDivElement>(null)

  const status = useGameStore((s) => s.status)
  const selectedModel = useGameStore((s) => s.selectedModel)
  const setScore = useGameStore((s) => s.setScore)
  const startGameStore = useGameStore((s) => s.startGame)
  const endGameStore = useGameStore((s) => s.endGame)

  const gameRef = useRef<{
    scene: THREE.Scene | null
    camera: THREE.PerspectiveCamera | null
    renderer: THREE.WebGLRenderer | null
    runner3D: Runner3D | null
    obstacles: THREE.Mesh[]
    groundDots: THREE.Group | null
    isJumping: boolean
    velocityY: number
    posY: number
    jumpsRemaining: number
    frameId: number | null
    obstacleTimer: number
    score: number
    gameState: string
    lastObstacleScaleY: number
  }>({
    scene: null,
    camera: null,
    renderer: null,
    runner3D: null,
    obstacles: [],
    groundDots: null,
    isJumping: false,
    velocityY: 0,
    posY: 0,
    jumpsRemaining: MAX_JUMPS,
    frameId: null,
    obstacleTimer: 0,
    score: 0,
    gameState: 'START',
    lastObstacleScaleY: 1,
  })

  const startGame = () => {
    startGameStore()
    gameRef.current.gameState = 'PLAYING'
    gameRef.current.score = 0
    setScore(0)

    const { scene, obstacles } = gameRef.current
    if (scene) {
      obstacles.forEach((obs) => {
        scene.remove(obs)
        obs.geometry?.dispose()
        if (Array.isArray(obs.material)) obs.material.forEach((m) => m.dispose())
        else obs.material?.dispose()
      })
    }
    gameRef.current.obstacles = []

    gameRef.current.posY = 0
    gameRef.current.velocityY = 0
    gameRef.current.isJumping = false
    gameRef.current.jumpsRemaining = MAX_JUMPS
    gameRef.current.obstacleTimer = 0
    gameRef.current.lastObstacleScaleY = 1
  }

  const jump = () => {
    if (gameRef.current.gameState !== 'PLAYING' || gameRef.current.jumpsRemaining <= 0) return
    gameRef.current.jumpsRemaining--
    gameRef.current.isJumping = true
    gameRef.current.velocityY = JUMP_FORCE
  }

  // コンポーネントマウント時にゲーム状態をリセット
  useEffect(() => {
    useGameStore.getState().setStatus('loading')
    return () => {}
  }, [])

  // キャラクター変更時にモデルを再読み込み
  useEffect(() => {
    const runner = gameRef.current.runner3D
    if (!runner) return
    const modelUrl = getModelUrl(selectedModel)
    runner
      .loadModel(modelUrl, selectedModel)
      .catch((err) => console.error('❌ Model reload error:', err))
  }, [selectedModel])

  // Three.js セットアップ
  useEffect(() => {
    if (!mountRef.current) return

    // 既存のcanvasがあれば削除
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild)
    }

    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight

    if (width === 0 || height === 0) return

    const { scene, camera, renderer, groundDots } = createGameScene(mountRef.current)

    // Runner3D でモデルを読み込み
    const dummyCanvas = document.createElement('canvas')
    const runner3D = new Runner3D(dummyCanvas, undefined, { targetScene: scene })
    const modelUrl = getModelUrl(selectedModel)

    runner3D
      .loadModel(modelUrl, selectedModel)
      .then(() => {
        setTimeout(() => {
          useGameStore.getState().setStatus('ready')
        }, 100)
      })
      .catch(() => {
        useGameStore.getState().setStatus('ready')
      })

    gameRef.current.scene = scene
    gameRef.current.camera = camera
    gameRef.current.renderer = renderer
    gameRef.current.runner3D = runner3D
    gameRef.current.groundDots = groundDots

    const animate = () => {
      const frameId = requestAnimationFrame(animate)
      gameRef.current.frameId = frameId

      const time = Date.now() * 0.001
      const { runner3D: runner, groundDots: dots } = gameRef.current
      const playerModel = runner?.getModel()

      if (gameRef.current.gameState === 'PLAYING') {
        if (gameRef.current.isJumping || gameRef.current.posY > 0) {
          gameRef.current.velocityY -= GRAVITY
          gameRef.current.posY += gameRef.current.velocityY

          if (gameRef.current.posY <= 0) {
            gameRef.current.posY = 0
            gameRef.current.velocityY = 0
            gameRef.current.isJumping = false
            gameRef.current.jumpsRemaining = MAX_JUMPS
          }
        }

        let runBounce = 0
        if (gameRef.current.posY === 0) {
          runBounce = Math.abs(Math.sin(time * 15)) * 0.15
        }

        if (runner && playerModel) {
          const baseY = 0.7
          const modelOffset = RUNNER_Y_OFFSETS[runner.modelType]
          playerModel.position.set(
            PLAYER_X,
            gameRef.current.posY + baseY + modelOffset + runBounce,
            0,
          )
        }

        if (dots) {
          dots.position.x -= 0.18
          if (dots.position.x < -2) dots.position.x = 0
        }

        gameRef.current.obstacleTimer++
        trySpawnObstacle(gameRef.current, setScore)
        updateObstacles(gameRef.current, endGameStore)
      } else if (runner && playerModel) {
        // ゲームオーバー/スタート時のアイドルアニメーション
        const baseY = 0.7
        const modelOffset = RUNNER_Y_OFFSETS[runner.modelType]
        playerModel.position.set(PLAYER_X, baseY + modelOffset + Math.sin(time * 2) * 0.3, 0)
      }

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!mountRef.current) return
      const w = mountRef.current.clientWidth
      const h = mountRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (gameRef.current.frameId != null) {
        cancelAnimationFrame(gameRef.current.frameId)
        gameRef.current.frameId = null
      }

      // 障害物を削除
      gameRef.current.obstacles.forEach((obs) => {
        scene.remove(obs)
        obs.geometry?.dispose()
        if (Array.isArray(obs.material)) obs.material.forEach((m) => m.dispose())
        else obs.material?.dispose()
      })
      gameRef.current.obstacles = []

      if (gameRef.current.runner3D) {
        const runner = gameRef.current.runner3D
        if (runner.model && runner.scene) runner.scene.remove(runner.model)
        if (runner.renderer) {
          runner.renderer.forceContextLoss()
          runner.renderer.dispose()
        }
        gameRef.current.runner3D = null
      }

      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()

      scene.clear()
    }
  }, [])

  // Zustand status → gameRef.gameState 同期
  useEffect(() => {
    gameRef.current.gameState =
      status === 'playing' ? 'PLAYING' : status === 'gameover' ? 'GAMEOVER' : 'START'
  }, [status])

  // キーボードハンドラ（Space/ArrowUp → jump）
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        if (status === 'playing') jump()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [status])

  return { mountRef, startGame, jump }
}
