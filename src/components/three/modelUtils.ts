import { Box3, Vector3 } from 'three'
import type { BufferGeometry, Object3D } from 'three'

export interface NormalizedBounds {
  center: Vector3
  scaleFactor: number
}

/**
 * BoundingBox からモデルを正規化するための center と scaleFactor を計算する。
 */
export function normalizeModelBounds(object: Object3D): NormalizedBounds {
  const box = new Box3().setFromObject(object)
  return computeBoundsFromBox(box)
}

/**
 * BufferGeometry の BoundingBox からモデルを正規化するための center と scaleFactor を計算する。
 */
export function normalizeGeometryBounds(geometry: BufferGeometry): NormalizedBounds {
  geometry.computeBoundingBox()
  return computeBoundsFromBox(geometry.boundingBox!)
}

function computeBoundsFromBox(box: Box3): NormalizedBounds {
  const size = new Vector3()
  const center = new Vector3()
  box.getSize(size)
  box.getCenter(center)
  const maxDim = Math.max(size.x, size.y, size.z)
  const scaleFactor = maxDim > 0 ? 1 / maxDim : 1
  return { center, scaleFactor }
}

