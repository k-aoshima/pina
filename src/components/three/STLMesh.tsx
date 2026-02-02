import { useLoader } from '@react-three/fiber'
import { useMemo } from 'react'
import { Vector3 } from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import type { BufferGeometry } from 'three'

interface STLMeshProps {
  url: string
  color?: string
  scale?: number
}

export function STLMesh({ url, color = '#1e293b', scale = 1 }: STLMeshProps) {
  const geometry = useLoader(STLLoader, url) as BufferGeometry

  const normalized = useMemo(() => {
    geometry.computeBoundingBox()
    const box = geometry.boundingBox!
    const size = new Vector3()
    const center = new Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z)
    const scaleFactor = maxDim > 0 ? 1 / maxDim : 1
    return { center, scaleFactor }
  }, [geometry])

  const s = scale * normalized.scaleFactor
  const cx = -normalized.center.x * normalized.scaleFactor * scale
  const cy = -normalized.center.y * normalized.scaleFactor * scale
  const cz = -normalized.center.z * normalized.scaleFactor * scale

  // モデルが倒れている状態で読み込まれるため、X軸 -90° で立てる
  const rotationX = -Math.PI / 2

  return (
    <mesh
      geometry={geometry}
      scale={[s, s, s]}
      position={[cx, cy, cz]}
      rotation={[rotationX, 0, 0]}
    >
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
