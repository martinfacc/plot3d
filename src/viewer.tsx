// components/Viewer.tsx
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import JSON5 from 'json5'
import { OrbitControls } from './orbit-controls'

const EXAMPLE_SPHERES = [
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 1, z: 1 },
  { x: 1, y: 1, z: 1 },
  { x: 1, y: 0, z: 1 },
]

const DEFAULT_jSON = JSON.stringify(EXAMPLE_SPHERES, null, 2)

function crearEtiqueta(texto: string, color: string) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo obtener el contexto del canvas')

  canvas.width = 256
  canvas.height = 64
  ctx.fillStyle = color
  ctx.font = '48px sans-serif'
  ctx.fillText(texto, 10, 50)

  const texture = new THREE.CanvasTexture(canvas)
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
  const sprite = new THREE.Sprite(spriteMaterial)
  sprite.scale.set(1.5, 0.5, 1)
  return sprite
}

export default function Viewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const [sphereSize, setSphereSize] = useState(0.2)
  const [sphereColor, setSphereColor] = useState('#0077ff')
  const [rawJson, setRawJson] = useState(DEFAULT_jSON)
  const sphereRefs = useRef<THREE.Mesh[]>([])
  const [panelVisible, setPanelVisible] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    sceneRef.current = scene
    scene.background = new THREE.Color(0xeeeeee)

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(5, 5, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    if (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild)
    }
    containerRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.25

    const axesHelper = new THREE.AxesHelper(5)
    scene.add(axesHelper)

    const etiquetaX = crearEtiqueta('X', '#ff0000')
    etiquetaX.position.set(6, 0, 0)
    scene.add(etiquetaX)

    const etiquetaY = crearEtiqueta('Y', '#00ff00')
    etiquetaY.position.set(0, 6, 0)
    scene.add(etiquetaY)

    const etiquetaZ = crearEtiqueta('Z', '#0000ff')
    etiquetaZ.position.set(0, 0, 6)
    scene.add(etiquetaZ)

    // ADD EXAMPLE SPHERES
    EXAMPLE_SPHERES.forEach((pos) => {
      const sphereGeom = new THREE.SphereGeometry(sphereSize, 16, 16)
      const sphereMat = new THREE.MeshBasicMaterial({ color: sphereColor })
      const sphere = new THREE.Mesh(sphereGeom, sphereMat)
      sphere.position.set(pos.x, pos.y, pos.z)
      scene.add(sphere)
    })

    let isMounted = true
    function animate() {
      if (!isMounted) return
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      isMounted = false
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  const handleRender = () => {
    let parsed: any
    try {
      parsed = JSON.parse(rawJson)
    } catch {
      try {
        parsed = JSON5.parse(rawJson)
      } catch {
        alert('No se pudo parsear el texto como JSON o JSON5.')
        return
      }
    }

    if (
      Array.isArray(parsed) &&
      parsed.every(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.x === 'number' &&
          typeof item.y === 'number' &&
          typeof item.z === 'number'
      )
    ) {
      if (!sceneRef.current) return
      sphereRefs.current.forEach((s) => sceneRef.current!.remove(s))
      sphereRefs.current = []

      const spheres = parsed.map((pos) => {
        const sphereGeom = new THREE.SphereGeometry(sphereSize, 16, 16)
        const sphereMat = new THREE.MeshBasicMaterial({ color: sphereColor })
        const sphere = new THREE.Mesh(sphereGeom, sphereMat)
        sphere.position.set(pos.x, pos.y, pos.z)
        sceneRef.current!.add(sphere)
        return sphere
      })

      sphereRefs.current = spheres
    } else {
      alert('El contenido no es válido. Debe ser un array con x, y, z.')
    }
  }

  return (
    <>
      {panelVisible && (
        <div className="admin-panel">
          <div className="admin-control">
            <label>Color:</label>
            <input
              type="color"
              value={sphereColor}
              onChange={(e) => setSphereColor(e.target.value)}
            />
          </div>

          <div className="admin-control">
            <label>Tamaño:</label>
            <input
              type="number"
              min="0.05"
              step="0.05"
              value={sphereSize}
              onChange={(e) => setSphereSize(Number(e.target.value))}
            />
          </div>

          <div className="admin-control">
            <label>Datos (JSON):</label>
            <textarea
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              rows={6}
              style={{ width: '100%' }}
            />
            <button className="admin-button" onClick={() => setRawJson('[]')}>
              Limpiar
            </button>
          </div>

          <button className="admin-button" onClick={handleRender}>
            Renderizar
          </button>
        </div>
      )}

      <button
        className="toggle-admin-btn"
        onClick={() => {
          setPanelVisible((prev) => !prev)
        }}
      >
        🛠️
      </button>

      <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
    </>
  )
}
