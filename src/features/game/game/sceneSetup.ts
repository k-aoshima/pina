import * as THREE from 'three'

export interface GameScene {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  groundDots: THREE.Group
  cleanup: () => void
}

export function createGameScene(container: HTMLDivElement): GameScene {
  const width = container.clientWidth
  const height = container.clientHeight

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#FFD60A')
  scene.fog = new THREE.Fog('#FFD60A', 10, 25)

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.set(0, 5, 12)
  camera.lookAt(0, 1.5, 0)

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  container.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.8))
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
  dirLight.position.set(10, 20, 10)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 1024
  dirLight.shadow.mapSize.height = 1024
  scene.add(dirLight)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 40),
    new THREE.MeshStandardMaterial({ color: 0xffd60a }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const dotsGroup = new THREE.Group()
  const dotGeo = new THREE.CircleGeometry(0.12, 8)
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xeab308 })
  for (let i = 0; i < 60; i++) {
    for (let j = 0; j < 12; j++) {
      const dot = new THREE.Mesh(dotGeo, dotMat)
      dot.position.set((i - 30) * 2, 0.01, (j - 6) * 2.5)
      dot.rotation.x = -Math.PI / 2
      dotsGroup.add(dot)
    }
  }
  scene.add(dotsGroup)

  const cleanup = () => {
    // Dispose dot geometry and material (shared across all dot meshes)
    dotGeo.dispose()
    dotMat.dispose()

    // Dispose ground mesh resources
    const groundGeo = ground.geometry
    const groundMat = ground.material as THREE.MeshStandardMaterial
    groundGeo.dispose()
    groundMat.dispose()

    // Dispose directional light shadow map
    dirLight.shadow.map?.dispose()
  }

  return { scene, camera, renderer, groundDots: dotsGroup, cleanup }
}
