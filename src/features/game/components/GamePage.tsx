import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import { useGameStore, type RunnerModel } from '../stores/useGameStore'
import { Runner3D, RUNNER_Y_OFFSETS } from '../game/Runner3D'
import { ROUTES } from '../../../app/routes'
import { modelAssetUrl } from '../../../config/constants'

// --- ゲーム設定 ---
const PLAYER_X = -4
const OBSTACLE_SPEED_MIN = 0.15
const OBSTACLE_SPEED_MAX = 0.32
const OBSTACLE_MIN_INTERVAL = 130 // 障害物の最小出現間隔（フレーム）
const OBSTACLE_MIN_DISTANCE = 12 // 直前の障害物がこのXより左になるまで次を出さない
const JUMP_FORCE = 0.26
const GRAVITY = 0.013
const MAX_JUMPS = 2
const MOBILE_MAX_WIDTH = 768

const RUNNER_OPTIONS: { id: RunnerModel; label: string }[] = [
  { id: 'FanFan', label: 'FanFan' },
  { id: 'Rabbit', label: 'Rabbit' },
  { id: 'Tako', label: 'Tako' },
]

function getModelUrl(model: RunnerModel): string {
  return model === 'Tako' 
    ? modelAssetUrl('models/Tako.glb') 
    : modelAssetUrl(`models/${model}.stl`)
}

export function GamePage() {
  console.log('🎮 GamePage component mounted')
  const mountRef = useRef<HTMLDivElement>(null)
  const status = useGameStore((s) => s.status)
  const score = useGameStore((s) => s.score)
  const highScore = useGameStore((s) => s.highScore)
  console.log('🎮 Game status:', status, 'score:', score, 'highScore:', highScore)
  const selectedModel = useGameStore((s) => s.selectedModel)
  const setSelectedModel = useGameStore((s) => s.setSelectedModel)
  const setScore = useGameStore((s) => s.setScore)
  const startGameStore = useGameStore((s) => s.startGame)
  const endGameStore = useGameStore((s) => s.endGame)
  const restartStore = useGameStore((s) => s.restart)

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

  const [showRotateModal, setShowRotateModal] = useState(false)

  const updateRotateModal = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    const isNarrow = w <= MOBILE_MAX_WIDTH
    const isPortrait = h > w
    setShowRotateModal(isNarrow && isPortrait)
  }

  useEffect(() => {
    updateRotateModal()
    window.addEventListener('resize', updateRotateModal)
    window.addEventListener('orientationchange', updateRotateModal)
    return () => {
      window.removeEventListener('resize', updateRotateModal)
      window.removeEventListener('orientationchange', updateRotateModal)
    }
  }, [])

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
    // GAMEOVER状態でのみクリックで再スタート可能
    // ready状態ではボタンクリックでのみ開始
  }

  // コンポーネントマウント時にゲーム状態をリセット
  useEffect(() => {
    console.log('🎮 GamePage mounted - setting loading state')
    useGameStore.getState().setStatus('loading')
    
    // クリーンアップ時もリセット
    return () => {
      console.log('🎮 GamePage unmounting')
    }
  }, [])

  // キャラクター変更時にモデルを再読み込み
  useEffect(() => {
    const runner = gameRef.current.runner3D
    if (!runner) {
      console.log('⚠️ runner3D not ready yet')
      return
    }
    const modelUrl = getModelUrl(selectedModel)
    console.log('🎮 Reloading model:', selectedModel, 'from', modelUrl)
    runner
      .loadModel(modelUrl, selectedModel)
      .then(() => console.log('✅ Model reloaded:', selectedModel))
      .catch((err) => console.error('❌ Model reload error:', err))
  }, [selectedModel])

  useEffect(() => {
    console.log('🎮 Three.js initialization started')
    if (!mountRef.current) {
      console.error('❌ mountRef.current is null')
      return
    }
    
    // 既存のcanvasがあれば削除
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild)
    }
    
    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight
    console.log('🎮 Canvas size:', width, 'x', height)

    if (width === 0 || height === 0) {
      console.error('❌ Invalid canvas size:', width, 'x', height)
      return
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#FFD60A')
    scene.fog = new THREE.Fog('#FFD60A', 10, 25)
    console.log('✅ Three.js scene created')

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
    console.log('✅ Renderer attached to DOM')

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(10, 20, 10)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    scene.add(dirLight)

    // Runner3Dでモデルを読み込み
    const dummyCanvas = document.createElement('canvas')
    const runner3D = new Runner3D(dummyCanvas, undefined, { targetScene: scene })
    const modelUrl = getModelUrl(selectedModel)
    console.log('🎮 Loading model:', selectedModel, 'from', modelUrl)
    
    runner3D
      .loadModel(modelUrl, selectedModel)
      .then(() => {
        console.log('✅ Model loaded successfully:', selectedModel)
        console.log('✅ All resources loaded, transitioning to ready state')
        // モデルロード完了後、ready状態に遷移
        setTimeout(() => {
          useGameStore.getState().setStatus('ready')
        }, 100)
      })
      .catch((err) => {
        console.error('❌ Model load error:', err)
        // エラーでもready状態に遷移（モデルなしでゲーム可能）
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

        // positionを設定（モデルタイプごとのオフセット適用）
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
        const rightmostX = obstacles.length > 0
          ? Math.max(...obstacles.map((o) => o.position.x))
          : -999
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
            OBSTACLE_SPEED_MIN +
            Math.random() * (OBSTACLE_SPEED_MAX - OBSTACLE_SPEED_MIN)
          obs.scale.y = scaleY
          const baseY = 0.8
          obs.position.set(25, baseY + (scaleY - 1) * 0.6, 0)
          obs.castShadow = true
          obs.userData.speed = speed
          obs.userData.scaleY = scaleY
          const scene = gameRef.current.scene
          if (scene) scene.add(obs)
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
        // rotation.yは変更しない（Runner3Dの基本回転を維持）
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
      console.log('🎮 Cleaning up Three.js resources')
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
      
      // Runner3Dをクリーンアップ
      if (gameRef.current.runner3D) {
        const runner = gameRef.current.runner3D
        if (runner.model && runner.scene) {
          runner.scene.remove(runner.model)
        }
        // Runner3Dのrendererは破棄（これが重要）
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
      
      // シーンをクリア
      scene.clear()
      
      console.log('✅ Cleanup complete')
    }
  }, [])

  useEffect(() => {
    gameRef.current.gameState = status === 'playing' ? 'PLAYING' : status === 'gameover' ? 'GAMEOVER' : 'START'
  }, [status])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        // playing中のみジャンプ
        if (status === 'playing') {
          jump()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [status])

  const isLoading = status === 'loading'
  const isReady = status === 'ready'
  const isGameOver = status === 'gameover'
  const isPlaying = status === 'playing'

  return (
    <div className="w-full h-screen bg-pina-yellow font-sans overflow-hidden select-none relative">
      {showRotateModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-pina-yellow/95 p-3 md:p-6"
          aria-modal="true"
          role="alert"
          aria-live="polite"
        >
          <div className="bg-white border-2 md:border-8 border-black p-3 md:p-8 max-w-[280px] md:max-w-sm w-full shadow-brutal-sm md:shadow-brutal-lg text-center">
            <div className="mb-2 md:mb-6 flex justify-center">
              <svg
                className="w-12 h-12 md:w-24 md:h-24 text-pina-navy"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <p className="text-sm md:text-xl font-black text-black mb-1 md:mb-2">
              横向きに回転してください
            </p>
            <p className="text-[10px] md:text-sm font-bold text-black/70">
              Please rotate to landscape
            </p>
          </div>
        </div>
      )}

      <div
        ref={mountRef}
        className="w-full h-full absolute inset-0"
        onClick={() => {
          // playing中のみジャンプ
          if (status === 'playing') {
            jump()
          }
        }}
        style={{ cursor: status === 'playing' ? 'pointer' : 'default' }}
      />

      <div className="absolute top-1 left-1 md:top-4 md:left-4 z-50 pointer-events-auto">
        <Link
          to={ROUTES.HOME}
          className="inline-block bg-pina-navy text-pina-yellow px-2 py-1 md:px-6 md:py-3 border-2 md:border-4 border-black font-black italic text-xs md:text-xl shadow-brutal-sm md:shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:scale-95"
        >
          ← HOME
        </Link>
      </div>

      <div className="absolute top-2 right-2 md:top-4 md:right-4 left-auto flex justify-end pointer-events-none z-10">
        <div className="bg-white/95 border-2 md:border-4 border-black px-2 py-1 md:px-4 md:py-2 shadow-brutal-sm md:shadow-brutal flex items-center gap-1.5 md:gap-4">
          <div className="flex flex-col items-center min-w-0">
            <span className="text-[6px] md:text-[10px] font-black uppercase opacity-40">Score</span>
            <span className="font-black text-sm md:text-2xl leading-none truncate">{score}</span>
          </div>
          <div className="w-px h-4 md:h-8 bg-black opacity-10 shrink-0" />
          <div className="flex flex-col items-center min-w-0">
            <span className="text-[6px] md:text-[10px] font-black uppercase opacity-40">High</span>
            <span className="font-black text-sm md:text-2xl leading-none text-orange-500 truncate">{highScore}</span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-400/60 backdrop-blur-md z-50 p-4 md:p-6">
          <div className="bg-white border-4 md:border-8 border-black p-6 md:p-12 shadow-brutal-sm md:shadow-brutal-lg text-center">
            <div className="mb-4 md:mb-6 inline-block bg-pina-navy text-pina-yellow px-3 py-1 md:px-6 md:py-2 text-xs md:text-sm font-black tracking-widest uppercase">
              LOADING...
            </div>
            <div className="flex gap-1.5 md:gap-2 justify-center">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-pina-pink rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 md:w-4 md:h-4 bg-pina-pink rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 md:w-4 md:h-4 bg-pina-pink rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-400/40 backdrop-blur-md z-50 p-6 pointer-events-none" aria-hidden />
      )}
      {isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-50 p-2 md:p-6 pointer-events-none overflow-y-auto">
          <div className="pointer-events-auto bg-white border-2 md:border-8 border-black p-3 md:p-8 w-full w-full max-w-sm md:max-w-lg max-h-[min(90dvh,100%)] overflow-y-auto shadow-brutal-sm md:shadow-brutal-lg transform md:-rotate-1 text-center relative my-auto">
            <Link
              to={ROUTES.HOME}
              className="absolute top-1 left-1 md:top-4 md:left-4 inline-flex items-center gap-1 bg-stone-200 text-black px-1.5 py-0.5 md:px-3 md:py-1.5 border-2 border-black font-bold text-[10px] md:text-sm shadow-sm md:shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              ← HOME
            </Link>
            <div className="mb-1 md:mb-3 inline-block bg-pina-navy text-pina-yellow px-1.5 py-0.5 md:px-4 md:py-1 text-[9px] md:text-xs font-black tracking-widest uppercase">
              Pinatoy&apos;s Game
            </div>
            <h1 className="text-2xl md:text-6xl font-black italic tracking-tighter mb-1 md:mb-3 uppercase leading-none">
              Collect Joy!
            </h1>
            <p className="text-sm md:text-xl font-bold mb-2 md:mb-6 text-pina-pink underline decoration-2 md:decoration-4 underline-offset-2">
              3D SUPER RUNNER
            </p>
            <p className="text-[10px] md:text-sm font-bold text-black mb-2 md:mb-4">キャラクターを選んでスタート</p>
            <div className="mb-3 md:mb-6 flex gap-1.5 md:gap-3 justify-center flex-wrap">
              {RUNNER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedModel(opt.id)
                  }}
                  className={`rounded-md md:rounded-xl border-2 md:border-4 border-black px-2 py-1 md:px-5 md:py-2.5 font-bold text-xs md:text-base uppercase transition-all active:scale-95 ${
                    selectedModel === opt.id
                      ? 'bg-pina-pink text-white shadow-sm md:shadow-brutal-sm'
                      : 'bg-stone-200 text-black shadow-sm md:shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                startGame()
              }}
              className="w-full bg-pina-pink text-white border-2 md:border-4 border-black py-2 md:py-5 text-base md:text-2xl font-black shadow-brutal-sm md:shadow-brutal-lg active:translate-y-2 active:shadow-none transition-all hover:bg-pink-600"
            >
              START GAME
            </button>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center z-50 p-2 md:p-6 pointer-events-none overflow-y-auto">
          <div className="pointer-events-auto bg-white border-2 md:border-8 border-black p-3 md:p-8 w-full w-full max-w-sm md:max-w-lg max-h-[min(90dvh,100%)] overflow-y-auto shadow-brutal-sm md:shadow-brutal-lg transform md:-rotate-1 text-center relative my-auto">
            <Link
              to={ROUTES.HOME}
              className="absolute top-1 left-1 md:top-4 md:left-4 inline-flex items-center gap-1 bg-stone-200 text-black px-1.5 py-0.5 md:px-3 md:py-1.5 border-2 border-black font-bold text-[10px] md:text-sm shadow-sm md:shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              ← HOME
            </Link>
            <h2 className="text-2xl md:text-5xl font-black mb-2 md:mb-4 uppercase text-red-500 italic">ざんねん！</h2>
            <div className="my-2 py-2 md:my-8 md:py-6 border-y-2 md:border-y-8 border-black border-dashed">
              <p className="text-3xl md:text-7xl font-black tracking-tighter leading-none">{score}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                restartStore()
              }}
              className="w-full bg-pina-navy text-pina-yellow border-2 md:border-4 border-black py-2 md:py-5 text-base md:text-2xl font-black shadow-brutal-sm md:shadow-brutal-lg active:translate-y-2 active:shadow-none transition-all hover:bg-blue-900"
            >
              RETRY
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 md:bottom-10 md:left-10 pointer-events-none hidden sm:block">
        <div className="bg-pina-navy text-pina-yellow px-2 py-1 md:px-8 md:py-3 border-2 md:border-4 border-black font-black italic text-xs md:text-2xl shadow-brutal-sm md:shadow-brutal">
          PINATOY'S
        </div>
      </div>
    </div>
  )
}
