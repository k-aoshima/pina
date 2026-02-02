import { useRef, useState } from 'react'
import { Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Canvas } from '@react-three/fiber'
import type { Group } from 'three'
import { modelAssetUrl } from '../../config/constants'
import { ModelMesh } from './ModelMesh'

const ROTATE_SPEED = 0.35
const MODEL_SCALE = 0.4
const RESET_Y = -1.5
const START_Y = 1.3

const COLORS = ['#A855F7', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6', '#14B8A6', '#F97316', '#EF4444', '#06B6D4']
const X_POSITIONS = [-0.85, -0.6, -0.35, -0.1, 0.15, 0.4, 0.65, 0.9]
const FALL_SPEEDS = [0.12, 0.14, 0.16, 0.18, 0.2, 0.15, 0.13, 0.19, 0.17, 0.21]

type ToyConfig = {
  modelUrl: string
  color: string
  initialX: number
  initialY: number
  fallSpeed: number
}

function createToys(): ToyConfig[] {
  const range = START_Y - RESET_Y
  const count = 8
  const toys: ToyConfig[] = []
  for (let i = 0; i < count; i++) {
    const initialY = START_Y - (i / (count - 1)) * range
    const modelUrls = [
      modelAssetUrl('/models/FanFan.stl'),
      modelAssetUrl('/models/Rabbit.stl'),
      modelAssetUrl('/models/Tako.glb'),
    ]
    const mi = i % modelUrls.length
    const ci = i % COLORS.length
    const xi = i % X_POSITIONS.length
    const fi = i % FALL_SPEEDS.length
    toys.push({
      modelUrl: modelUrls[mi]!,
      color: COLORS[ci]!,
      initialX: X_POSITIONS[xi]!,
      initialY,
      fallSpeed: FALL_SPEEDS[fi]!,
    })
  }
  return toys
}

const TOYS = createToys()

function FallingToy({ config }: { config: ToyConfig }) {
  const group = useRef<Group>(null)
  const rotationAccum = useRef(0)
  const [initialRotation] = useState(() => ({
    x: (Math.random() - 0.5) * Math.PI,
    y: Math.random() * Math.PI * 2,
    z: (Math.random() - 0.5) * Math.PI * 0.5,
  }))

  useFrame((_, delta) => {
    if (!group.current) return
    rotationAccum.current += delta * ROTATE_SPEED
    group.current.rotation.x = initialRotation.x
    group.current.rotation.y = initialRotation.y + rotationAccum.current
    group.current.rotation.z = initialRotation.z
    group.current.position.y -= delta * config.fallSpeed
    if (group.current.position.y < RESET_Y) {
      group.current.position.y = START_Y
    }
  })

  return (
    <group ref={group} position={[config.initialX, config.initialY, 0]}>
      <Suspense fallback={null}>
        <ModelMesh
          url={config.modelUrl}
          color={config.color}
          scale={MODEL_SCALE}
        />
      </Suspense>
    </group>
  )
}

function Scene() {
  return (
    <>
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
      {TOYS.map((config, i) => (
        <FallingToy key={i} config={config} />
      ))}
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
