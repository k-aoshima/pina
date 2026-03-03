import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { Mesh, MeshStandardMaterial } from 'three'
import { normalizeModelBounds } from './modelUtils'

interface GlbMeshProps {
  url: string
  color?: string
  scale?: number
  /** true のとき回転をかけず正面のまま表示（例: Tako） */
  upright?: boolean
}

export function GlbMesh({ url, color = '#1e293b', scale = 1, upright = false }: GlbMeshProps) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => scene.clone(), [scene])

  const normalized = useMemo(() => normalizeModelBounds(cloned), [cloned])

  useMemo(() => {
    if (!color) return
    cloned.traverse((child) => {
      if ('material' in child && child.material) {
        const mat = (child as Mesh).material
        const setColor = (m: MeshStandardMaterial) => m.color?.setStyle?.(color)
        if (Array.isArray(mat)) mat.forEach((m) => setColor(m as MeshStandardMaterial))
        else setColor(mat as MeshStandardMaterial)
      }
    })
  }, [cloned, color])

  const s = scale * normalized.scaleFactor
  const cx = -normalized.center.x * normalized.scaleFactor * scale
  const cy = -normalized.center.y * normalized.scaleFactor * scale
  const cz = -normalized.center.z * normalized.scaleFactor * scale
  const rotation: [number, number, number] = upright ? [0, 0, 0] : [-Math.PI / 2, 0, 0]

  return (
    <group position={[cx, cy, cz]} scale={[s, s, s]} rotation={rotation}>
      <primitive object={cloned} />
    </group>
  )
}
