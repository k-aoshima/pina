import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ModelMesh } from './ModelMesh'

interface ModelView360Props {
  modelUrl: string
  className?: string
  color?: string
  /** モデルのY位置オフセット（負で下にずれる） */
  offsetY?: number
  /** false のときマウス操作なし・自動回転のみ（カードプレビュー用） */
  interactive?: boolean
}

function Scene({
  modelUrl,
  color,
  offsetY = 0,
  interactive = true,
}: {
  modelUrl: string
  color?: string
  offsetY?: number
  interactive?: boolean
}) {
  const speed = interactive ? 1.2 : 1.8

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
      <group position={[0, offsetY, 0]}>
        <Suspense fallback={null}>
          <ModelMesh url={modelUrl} color={color} />
        </Suspense>
      </group>
      <OrbitControls
        enableRotate={interactive}
        enableZoom={interactive}
        enablePan={false}
        minDistance={interactive ? 1 : 2}
        maxDistance={interactive ? 4 : 2}
        autoRotate
        autoRotateSpeed={speed}
      />
    </>
  )
}

export function ModelView360({
  modelUrl,
  className = '',
  color,
  offsetY,
  interactive = true,
}: ModelView360Props) {
  return (
    <div className={`aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 ${className}`}>
      <Canvas camera={{ position: [0, 0, 2], fov: 45 }} gl={{ antialias: true }}>
        <Scene
          modelUrl={modelUrl}
          color={color}
          offsetY={offsetY}
          interactive={interactive}
        />
      </Canvas>
    </div>
  )
}
