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
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, -5, 5]} intensity={0.4} />
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
        autoRotateSpeed={interactive ? 0.8 : 1.2}
      />
    </>
  )
}

export function ModelView360({ modelUrl, className = '', color, offsetY, interactive = true }: ModelView360Props) {
  return (
    <div className={`aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 ${className}`}>
      <Canvas camera={{ position: [0, 0, 2], fov: 45 }} gl={{ antialias: true }}>
        <Scene modelUrl={modelUrl} color={color} offsetY={offsetY} interactive={interactive} />
      </Canvas>
    </div>
  )
}
