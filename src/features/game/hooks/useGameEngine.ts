import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../stores/useGameStore'
import { Runner3D, RUNNER_Y_OFFSETS } from '../game/Runner3D'
import {
  PLAYER_X,
  OBSTACLE_SPEED_MIN,
  OBSTACLE_SPEED_MAX,
  OBSTACLE_MIN_INTERVAL,
  OBSTACLE_MIN_DISTANCE,
  JUMP_FORCE,
  GRAVITY,
  MAX_JUMPS,
  getModelUrl,
} from '../constants/gameConstants'

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

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#FFD60A')
    scene.fog = new THREE.Fog('#FFD60A', 10, 25)

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(0, 5, 12)
    camera.lookAt(0, 1.5, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    mountRef.current.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(10, 20, 10)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    scene.add(dirLight)

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

    const groundGeo = new THREE.PlaneGeometry(300, 40)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xffd60a })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const dotsGroup = new THREE.Group()
    const dotGeo = new THREE.CircleGeometry(0.12, 8)
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xeab308 })
    for (let i = 0; i < 60; i++) {
      for (let j = 0; j < 12; j++) {
        const dot = new THREE.Mesh(dotGeo, dotMat)
        dot.position.set((i - 30) * 2, 0.01, (j - 6) * 2.5)
        dot.rotation.x = -Math.PI / 2
        dotsGroup.add(dot)
      }
    }
    scene.add(dotsGroup)

    gameRef.current.scene = scene
    gameRef.current.camera = camera
    gameRef.current.renderer = renderer
    gameRef.current.runner3D = runner3D
    gameRef.current.groundDots = dotsGroup

    const animate = () => {
      const frameId = requestAnimationFrame(animate)
      gameRef.current.frameId = frameId

      const time = Date.now() * 0.001
      const { runner3D: runner, groundDots } = gameRef.current
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
          const modelType = runner.modelType
          const modelOffset = RUNNER_Y_OFFSETS[modelType]
          const playerY = gameRef.current.posY + baseY + modelOffset + runBounce
          playerModel.position.y = playerY
          playerModel.position.x = PLAYER_X
          playerModel.position.z = 0
        }

        if (groundDots) {
          groundDots.position.x -= 0.18
          if (groundDots.position.x < -2) groundDots.position.x = 0
        }

        gameRef.current.obstacleTimer++
        const obstacles = gameRef.current.obstacles
        const rightmostX =
          obstacles.length > 0 ? Math.max(...obstacles.map((o) => o.position.x)) : -999
        const canSpawn =
          gameRef.current.scene &&
          gameRef.current.obstacleTimer > OBSTACLE_MIN_INTERVAL &&
          rightmostX <= 25 - OBSTACLE_MIN_DISTANCE

        if (canSpawn) {
          const type = Math.floor(Math.random() * 3)
          let obsGeo: THREE.BufferGeometry
          if (type === 0) obsGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2)
          else if (type === 1) obsGeo = new THREE.TorusGeometry(0.6, 0.25, 8, 16)
          else obsGeo = new THREE.SphereGeometry(0.7, 12, 12)

          const colors = ['#22d3ee', '#a855f7', '#fb923c']
          const obsMat = new THREE.MeshStandardMaterial({ color: colors[type] })
          const obs = new THREE.Mesh(obsGeo, obsMat)
          const lastWasTall = gameRef.current.lastObstacleScaleY === 2
          const scaleY = lastWasTall ? 1 : Math.random() < 0.5 ? 2 : 1
          const speed =
            OBSTACLE_SPEED_MIN + Math.random() * (OBSTACLE_SPEED_MAX - OBSTACLE_SPEED_MIN)
          obs.scale.y = scaleY
          const baseY = 0.8
          obs.position.set(25, baseY + (scaleY - 1) * 0.6, 0)
          obs.castShadow = true
          obs.userData.speed = speed
          obs.userData.scaleY = scaleY
          const currentScene = gameRef.current.scene
          if (currentScene) currentScene.add(obs)
          gameRef.current.obstacles.push(obs)
          gameRef.current.obstacleTimer = 0
          gameRef.current.lastObstacleScaleY = scaleY

          gameRef.current.score += 10
          setScore(gameRef.current.score)
        }

        for (let i = gameRef.current.obstacles.length - 1; i >= 0; i--) {
          const obs = gameRef.current.obstacles[i]
          if (!obs) continue
          const speed = (obs.userData.speed as number) ?? 0.22
          obs.position.x -= speed
          obs.rotation.y += 0.02

          const playerY = gameRef.current.posY + 0.7
          const dx = obs.position.x - PLAYER_X
          const dy = obs.position.y - playerY
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 1.1) {
            endGameStore()
            gameRef.current.gameState = 'GAMEOVER'
          }

          if (obs.position.x < -15 && gameRef.current.scene) {
            gameRef.current.scene.remove(obs)
            obs.geometry.dispose()
            if (Array.isArray(obs.material)) obs.material.forEach((m) => m.dispose())
            else obs.material.dispose()
            gameRef.current.obstacles.splice(i, 1)
          }
        }
      } else if (runner && playerModel) {
        // ゲームオーバー/スタート時のアイドルアニメーション
        const baseY = 0.7
        const modelOffset = RUNNER_Y_OFFSETS[runner.modelType]
        playerModel.position.y = baseY + modelOffset + Math.sin(time * 2) * 0.3
        playerModel.position.x = PLAYER_X
        playerModel.position.z = 0
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

      // Runner3D をクリーンアップ
      if (gameRef.current.runner3D) {
        const runner = gameRef.current.runner3D
        if (runner.model && runner.scene) {
          runner.scene.remove(runner.model)
        }
        if (runner.renderer) {
          runner.renderer.forceContextLoss()
          runner.renderer.dispose()
        }
        gameRef.current.runner3D = null
      }

      // レンダラーをクリーンアップ
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
        if (status === 'playing') {
          jump()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [status])

  return { mountRef, startGame, jump }
}
