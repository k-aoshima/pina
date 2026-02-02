import { GlbMesh } from './GlbMesh'
import { STLMesh } from './STLMesh'

interface ModelMeshProps {
  url: string
  color?: string
  scale?: number
}

export function ModelMesh({ url, color, scale = 1 }: ModelMeshProps) {
  const isGlb = url.toLowerCase().endsWith('.glb') || url.toLowerCase().endsWith('.gltf')
  const isTako = url.toLowerCase().includes('tako')

  if (isGlb) {
    return (
      <GlbMesh
        url={url}
        color={color}
        scale={isTako ? scale * 0.8 : scale}
        upright={isTako}
      />
    )
  }
  return <STLMesh url={url} color={color} scale={scale} />
}
