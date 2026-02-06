import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export type RunnerModelType = 'FanFan' | 'Rabbit' | 'Tako'

const RUNNER_COLORS: Record<RunnerModelType, number> = {
  FanFan: 0xec4899,
  Rabbit: 0x8b5cf6,
  Tako: 0x10b981,
}

// モデルタイプごとのスケール設定
export const RUNNER_SCALES: Record<RunnerModelType, number> = {
  FanFan: 0.8,
  Rabbit: 0.3,
  Tako: 0.8,
}

// モデルタイプごとのY位置オフセット（地面からの高さ調整）
export const RUNNER_Y_OFFSETS: Record<RunnerModelType, number> = {
  FanFan: 0.4,
  Rabbit: 0.5,  // Rabbitは少し高めに配置
  Tako: 0.4,
}

// モデルタイプごとの基本回転（ラジアン）。X: 立てる、Y/Z: 進行方向（右）を向かせる
export type RunnerBaseRotation = { x: number; y: number; z: number }
export const RUNNER_BASE_ROTATIONS: Record<RunnerModelType, RunnerBaseRotation> = {
  FanFan: { x: -Math.PI / 2, y: 0, z: Math.PI / 2 },
  Rabbit: { x: -Math.PI / 2, y: 0, z: Math.PI / 2 },
  Tako: { x: 0, y: Math.PI / 2, z: 0 }, // GLBは逆向きなのでZを反転
}

/** Phaser の地面 Y 座標（ピクセル）。これと body.y の差で Three の Y を計算 */
const PHASER_GROUND_Y = 320
const PIXEL_TO_WORLD = 0.004

export type Runner3DOptions = {
  /** When set, the loaded model is added to this scene instead of an internal one (for single-scene games). */
  targetScene?: THREE.Scene
}

export class Runner3D {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  model: THREE.Object3D | null = null
  modelType: RunnerModelType = 'FanFan'
  private runTime = 0
  private baseRotationX = 0 // モデルの基本回転を保存
  private baseRotationY = 0
  private baseRotationZ = 0

  constructor(
    canvas: HTMLCanvasElement,
    context?: WebGLRenderingContext | WebGL2RenderingContext,
    options?: Runner3DOptions
  ) {
    this.scene = options?.targetScene ?? new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height, 0.1, 100)
    this.camera.position.set(0, 0, 2.5)
    this.camera.lookAt(0, 0, 0)

    const rendererOptions: { canvas: HTMLCanvasElement; antialias?: boolean; context?: WebGLRenderingContext } = {
      canvas,
      antialias: true,
    }
    if (context) {
      rendererOptions.context = context as WebGLRenderingContext
    }
    this.renderer = new THREE.WebGLRenderer(rendererOptions)
    this.renderer.autoClear = false
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(canvas.width, canvas.height)
    this.renderer.setClearColor(0x000000, 0)

    const light = new THREE.DirectionalLight(0xffffff, 1.2)
    light.position.set(2, 2, 3)
    this.scene.add(light)
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  }

  async loadModel(url: string, modelType: RunnerModelType): Promise<void> {
    this.modelType = modelType
    if (this.model) {
      this.scene.remove(this.model)
      if ((this.model as THREE.Mesh).geometry) {
        ((this.model as THREE.Mesh).geometry as THREE.BufferGeometry).dispose()
      }
      this.model = null
    }

    const isGlb = url.toLowerCase().endsWith('.glb')
    if (isGlb) {
      const loader = new GLTFLoader()
      const gltf = await loader.loadAsync(url)
      this.model = gltf.scene
      this.model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          if (mesh.material) {
            const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
            if ((mat as THREE.MeshStandardMaterial).color) {
              (mat as THREE.MeshStandardMaterial).color.setHex(RUNNER_COLORS[modelType])
            }
          }
        }
      })
    } else {
      const loader = new STLLoader()
      const geometry = await loader.loadAsync(url)
      geometry.center()
      geometry.computeVertexNormals()
      const material = new THREE.MeshStandardMaterial({
        color: RUNNER_COLORS[modelType],
        metalness: 0.1,
        roughness: 0.8,
      })
      this.model = new THREE.Mesh(geometry, material)
    }

    // モデルタイプごとのスケール適用
    const scale = RUNNER_SCALES[modelType]
    this.model.scale.setScalar(scale)
    
    // モデルタイプごとの基本回転を適用
    const rot = RUNNER_BASE_ROTATIONS[modelType]
    this.baseRotationX = rot.x
    this.baseRotationY = rot.y
    this.baseRotationZ = rot.z
    this.model.rotation.set(rot.x, rot.y, rot.z)
    
    this.scene.add(this.model)
  }

  update(bodyY: number, ducking: boolean): void {
    if (!this.model) return

    const worldY = (bodyY - PHASER_GROUND_Y) * -PIXEL_TO_WORLD
    // モデルタイプごとのオフセットを適用（直接値を使用）
    const offsetY = RUNNER_Y_OFFSETS[this.modelType]
    this.model.position.y = worldY + offsetY
    this.model.position.x = 0
    this.model.position.z = 0

    this.applyRunPose(ducking)
  }

  /**
   * Update model position/rotation using world-space Y (for use in standalone Three.js game).
   * Caller should set model.position.x and position.z as needed.
   */
  updateWorld(worldY: number, ducking: boolean): void {
    if (!this.model) return

    // モデルタイプごとのオフセットを適用
    const offsetY = RUNNER_Y_OFFSETS[this.modelType]
    this.model.position.y = worldY + offsetY
    this.applyRunPose(ducking)
  }

  private applyRunPose(ducking: boolean): void {
    if (!this.model) return
    const scale = RUNNER_SCALES[this.modelType]
    if (ducking) {
      this.model.scale.set(scale * 0.7, scale * 0.6, scale * 0.7)
      // 基本回転 + しゃがみ回転
      this.model.rotation.x = this.baseRotationX + 0.3
    } else {
      this.model.scale.setScalar(scale)
      this.runTime += 0.15
      // 基本回転 + 走るアニメーション
      this.model.rotation.x = this.baseRotationX + Math.sin(this.runTime) * 0.08
    }
    this.model.rotation.y = this.baseRotationY
    this.model.rotation.z = this.baseRotationZ
  }

  getModel(): THREE.Object3D | null {
    return this.model
  }

  render(): void {
    if (!this.renderer || !this.scene || !this.camera) return
    this.renderer.resetState()
    this.renderer.render(this.scene, this.camera)
  }

  setSize(width: number, height: number): void {
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }
}
