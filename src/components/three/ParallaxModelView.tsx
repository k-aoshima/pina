import { useRef } from 'react'
import { Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Canvas } from '@react-three/fiber'
import type { Group } from 'three'
import { STLMesh } from './STLMesh'

interface ParallaxModelViewProps {
  modelUrl: string
  style?: React.CSSProperties
  className?: string
  color?: string
}

const FALL_SPEED = 0.15
const ROTATE_SPEED = 0.4
const RESET_Y = -1.8

function FallingModel({
  modelUrl,
  color,
}: {
  modelUrl: string
  color?: string
}) {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * ROTATE_SPEED
    group.current.position.y -= delta * FALL_SPEED
    if (group.current.position.y < RESET_Y) {
      group.current.position.y = 1.2
    }
  })

  return (
    <group ref={group} position={[0, 1.2, 0]}>
      <Suspense fallback={null}>
        <STLMesh url={modelUrl} color={color} scale={0.9} />
      </Suspense>
    </group>
  )
}

function Scene({ modelUrl, color }: { modelUrl: string; color?: string }) {
  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight position={[2, 2, 2]} intensity={1.1} />
      <directionalLight position={[-1, -1, 1]} intensity={0.4} />
      <FallingModel modelUrl={modelUrl} color={color} />
    </>
  )
}

export function ParallaxModelView({
  modelUrl,
  style,
  className = '',
  color = '#1e293b',
}: ParallaxModelViewProps) {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={style}
    >
      <Canvas
        camera={{ position: [0, 0, 1.2], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%', minHeight: 160 }}
      >
        <Scene modelUrl={modelUrl} color={color} />
      </Canvas>
    </div>
  )
}
