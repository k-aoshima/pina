import { useRef, useState, useMemo } from 'react'
import { Suspense } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { modelAssetUrl } from '../../config/constants'
import { ModelMesh } from './ModelMesh'

const MODEL_URLS = [
  modelAssetUrl('/models/FanFan.stl'),
  modelAssetUrl('/models/Rabbit.stl'),
  modelAssetUrl('/models/Tako.glb'),
]

function PreloadModels() {
  useLoader.preload(STLLoader, MODEL_URLS[0]!)
  useLoader.preload(STLLoader, MODEL_URLS[1]!)
  useGLTF.preload(MODEL_URLS[2]!)
  return null
}

const ROTATE_SPEED = 0.35
const MODEL_SCALE_MOBILE = 0.28
const MODEL_SCALE_DESKTOP = 0.42
const RESET_Y = -1.5
const START_Y = 1.3

const COLORS = ['#A855F7', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6', '#14B8A6', '#F97316', '#EF4444', '#06B6D4']
const FALL_SPEEDS = [0.12, 0.14, 0.16, 0.18, 0.2, 0.15, 0.13, 0.19, 0.17, 0.21]

const X_MARGIN = 0.38
const NUM_X_SLOTS = 8

const RANGE = START_Y - RESET_Y
const AVG_FALL_SPEED = 0.17
const CYCLE_TIME = RANGE / AVG_FALL_SPEED
const STAGGER_WITHIN_GROUP = 0.45
const GROUP_SIZE = 3
const NUM_GROUPS = 4
const GROUP_OFFSET = CYCLE_TIME / NUM_GROUPS
const PHASE_INITIAL_OFFSET = -2.5

type ToyConfig = {
  modelUrl: string
  color: string
  initialX: number
  fallSpeed: number
  phase: number
  scale: number
}

const RECENT_COLORS_COUNT = 3
const HUE_SIMILAR_DEG = 42

function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return 0
  let h = 0
  if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return (h * 60 + 360) % 360
}

function hueDistance(h1: number, h2: number): number {
  const d = Math.abs(h1 - h2)
  return Math.min(d, 360 - d)
}

function isSimilarToRecent(hex: string, recentHexes: string[]): boolean {
  const h = hexToHue(hex)
  return recentHexes.some((rh) => hueDistance(h, hexToHue(rh)) < HUE_SIMILAR_DEG)
}

const RECENT_X_COUNT = 3
const X_MIN_DISTANCE = 1

function getXPositionsFromViewportWidth(viewportWidth: number): number[] {
  const halfExtent = Math.max(0.25, viewportWidth / 2 - X_MARGIN)
  return [...Array(NUM_X_SLOTS)].map((_, i) =>
    NUM_X_SLOTS <= 1 ? 0 : -halfExtent + (i / (NUM_X_SLOTS - 1)) * 2 * halfExtent
  )
}

function createToys(xPositions: number[], scale: number): ToyConfig[] {
  const count = NUM_GROUPS * GROUP_SIZE
  const toys: ToyConfig[] = []
  const recentColorIndices: number[] = []
  const recentXIndices: number[] = []
  const numColors = COLORS.length
  const numX = xPositions.length

  for (let i = 0; i < count; i++) {
    const groupIndex = Math.floor(i / GROUP_SIZE)
    const indexInGroup = i % GROUP_SIZE
    let phase = groupIndex * GROUP_OFFSET + indexInGroup * STAGGER_WITHIN_GROUP + PHASE_INITIAL_OFFSET
    const modelUrls = MODEL_URLS
    const mi = i % modelUrls.length
    const fi = i % FALL_SPEEDS.length

    const forbiddenX = new Set(
      recentXIndices.flatMap((xIdx) =>
        [...Array(2 * X_MIN_DISTANCE + 1)].map((_, d) => xIdx - X_MIN_DISTANCE + d).filter((k) => k >= 0 && k < numX)
      )
    )
    let allowedXIndices = [...Array(numX).keys()].filter((k) => !forbiddenX.has(k))
    if (allowedXIndices.length === 0) {
      allowedXIndices = [...Array(numX).keys()].filter((k) => !recentXIndices.includes(k))
    }
    const xi = allowedXIndices[i % allowedXIndices.length] ?? 0
    const reusingSameColumn = recentXIndices.includes(xi)
    phase += reusingSameColumn ? CYCLE_TIME / 2 : 0
    if (recentXIndices.length >= RECENT_X_COUNT) {
      recentXIndices.shift()
    }
    recentXIndices.push(xi)

    const recentHexes = recentColorIndices.map((idx) => COLORS[idx]!)
    let allowedIndices = [...Array(numColors).keys()].filter((k) => {
      if (recentColorIndices.includes(k)) return false
      return !isSimilarToRecent(COLORS[k]!, recentHexes)
    })
    if (allowedIndices.length === 0) {
      allowedIndices = [...Array(numColors).keys()].filter((k) => !recentColorIndices.includes(k))
    }
    const ci = allowedIndices[i % allowedIndices.length] ?? 0

    if (recentColorIndices.length >= RECENT_COLORS_COUNT) {
      recentColorIndices.shift()
    }
    recentColorIndices.push(ci)

    toys.push({
      modelUrl: modelUrls[mi]!,
      color: COLORS[ci]!,
      initialX: xPositions[xi]!,
      fallSpeed: FALL_SPEEDS[fi]!,
      phase,
      scale,
    })
  }
  return toys
}


function FallingToy({ config }: { config: ToyConfig }) {
  const group = useRef<Group>(null)
  const rotationAccum = useRef(0)
  const [initialRotation] = useState(() => ({
    x: (Math.random() - 0.5) * Math.PI,
    y: Math.random() * Math.PI * 2,
    z: (Math.random() - 0.5) * Math.PI * 0.5,
  }))

  useFrame((state, delta) => {
    if (!group.current) return
    const elapsed = state.clock.elapsedTime
    const traveled = Math.max(0, (elapsed - config.phase) * config.fallSpeed)
    const y = START_Y - (traveled % RANGE)

    rotationAccum.current += delta * ROTATE_SPEED
    group.current.rotation.x = initialRotation.x
    group.current.rotation.y = initialRotation.y + rotationAccum.current
    group.current.rotation.z = initialRotation.z
    group.current.position.y = y
  })

  return (
    <group ref={group} position={[config.initialX, START_Y, 0]}>
      <Suspense fallback={null}>
        <ModelMesh
          url={config.modelUrl}
          color={config.color}
          scale={config.scale}
        />
      </Suspense>
    </group>
  )
}

function Scene() {
  const { viewport, size } = useThree()
  const toys = useMemo(() => {
    // 768px以上をPC画面と判定
    const scale = size.width >= 768 ? MODEL_SCALE_DESKTOP : MODEL_SCALE_MOBILE
    return createToys(getXPositionsFromViewportWidth(viewport.width), scale)
  }, [viewport.width, size.width])
  return (
    <>
      <PreloadModels />
      <ambientLight intensity={0.9} />
      <hemisphereLight
        args={['#ffffff', '#666666', 1.0]}
        position={[0, 2, 0]}
      />
      <directionalLight position={[0, 5, 0]} intensity={0.8} />
      <directionalLight position={[0, 0, 5]} intensity={0.7} />
      <directionalLight position={[0, 0, -5]} intensity={0.7} />
      <directionalLight position={[-4, 2, 0]} intensity={0.5} />
      <directionalLight position={[4, 2, 0]} intensity={0.5} />
      <Suspense fallback={null}>
        {toys.map((config, i) => (
          <FallingToy key={i} config={config} />
        ))}
      </Suspense>
    </>
  )
}

export function FallingModelsScene() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 1.5], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
