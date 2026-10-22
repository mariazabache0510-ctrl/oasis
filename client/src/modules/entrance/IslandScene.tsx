import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import type { Group, Mesh } from "three"

/**
 * Para usar tu propio modelo (Spline, Blender, Vectary, Poly Pizza, Sketchfab):
 * exporta un .glb liviano (menos de 1 MB, comprimido con gltf.report) y guárdalo
 * en client/public/models/oasis.glb. Si el archivo existe, reemplaza la isla de abajo.
 */
const MODEL_URL = "/models/oasis.glb"

const LEAVES = [
  { r: 0.3, a: 0.2, tilt: 0.55, h: 0.78, color: "#a9cdb0" },
  { r: 0.34, a: 1.7, tilt: 0.62, h: 0.9, color: "#bcdcc0" },
  { r: 0.3, a: 3.2, tilt: 0.5, h: 0.74, color: "#9fc8a8" },
  { r: 0.33, a: 4.6, tilt: 0.66, h: 0.86, color: "#c9e4cf" },
  { r: 0.18, a: 0.9, tilt: 0.25, h: 1.08, color: "#d4ecd8" },
]

const BUBBLES = [
  { x: -1.5, z: 0.4, s: 0.16, speed: 0.22, offset: 0.1, color: "#c9e4f5" },
  { x: 1.45, z: -0.2, s: 0.22, speed: 0.17, offset: 0.45, color: "#e4d4f4" },
  { x: -0.7, z: 0.9, s: 0.1, speed: 0.28, offset: 0.7, color: "#f8e7b0" },
  { x: 0.95, z: 0.7, s: 0.13, speed: 0.2, offset: 0.25, color: "#f6cdb6" },
  { x: -1.1, z: -0.5, s: 0.12, speed: 0.24, offset: 0.9, color: "#c9e4f5" },
  { x: 0.2, z: -0.9, s: 0.18, speed: 0.15, offset: 0.55, color: "#e4d4f4" },
  { x: 1.75, z: 0.5, s: 0.09, speed: 0.3, offset: 0.35, color: "#c9dcc8" },
]

function Bubble({ x, z, s, speed, offset, color }: (typeof BUBBLES)[number]) {
  const mesh = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    const node = mesh.current
    if (!node) return
    const t = (clock.elapsedTime * speed + offset) % 1
    node.position.set(x + Math.sin(t * 6.28 + offset * 9) * 0.12, -0.2 + t * 3.1, z)
    const fade = Math.sin(t * Math.PI)
    node.scale.setScalar(s * (0.6 + fade * 0.6))
    ;(node.material as { opacity: number }).opacity = 0.2 + fade * 0.55
  })
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 18, 18]} />
      <meshStandardMaterial color={color} transparent opacity={0.6} roughness={0.25} />
    </mesh>
  )
}

function Island() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.25, 1.2, 0.3, 40]} />
        <meshStandardMaterial color="#c9dcc8" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.78, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.2, 1.25, 40]} />
        <meshStandardMaterial color="#e8d3c1" roughness={0.85} />
      </mesh>
      <mesh position={[0.38, 0.16, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.46, 32]} />
        <meshStandardMaterial color="#9fd0ee" roughness={0.2} />
      </mesh>
      <mesh position={[-0.35, 0.45, -0.1]}>
        <cylinderGeometry args={[0.035, 0.05, 0.7, 10]} />
        <meshStandardMaterial color="#8fb59a" roughness={0.6} />
      </mesh>
      <group position={[-0.35, 0.16, -0.1]}>
        {LEAVES.map((leaf) => (
          <mesh
            key={leaf.a}
            position={[Math.cos(leaf.a) * leaf.r, leaf.h, Math.sin(leaf.a) * leaf.r]}
            rotation={[Math.sin(leaf.a) * leaf.tilt, 0, -Math.cos(leaf.a) * leaf.tilt]}
            scale={[0.14, 0.42, 0.07]}
          >
            <sphereGeometry args={[1, 14, 12]} />
            <meshStandardMaterial color={leaf.color} roughness={0.55} />
          </mesh>
        ))}
      </group>
      <group position={[0.38, 0.2, 0.5]}>
        {[0, 1, 2, 3, 4, 5].map((petal) => (
          <mesh
            key={petal}
            position={[Math.cos((petal / 6) * Math.PI * 2) * 0.12, 0.05, Math.sin((petal / 6) * Math.PI * 2) * 0.12]}
            rotation={[Math.sin((petal / 6) * Math.PI * 2) * 0.7, 0, -Math.cos((petal / 6) * Math.PI * 2) * 0.7]}
            scale={[0.07, 0.16, 0.05]}
          >
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color={petal % 2 ? "#f6cdb6" : "#f4d5dc"} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.07, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#f8e7b0" />
        </mesh>
      </group>
    </group>
  )
}

function GltfModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function Rig({ children, calm }: { children: ReactNode; calm: boolean }) {
  const group = useRef<Group>(null)
  useFrame(({ clock, pointer }, delta) => {
    const node = group.current
    if (!node) return
    const t = clock.elapsedTime
    node.position.y = calm ? 0 : Math.sin(t * 0.8) * 0.12
    const targetY = pointer.x * 0.5 + (calm ? 0 : t * 0.12)
    node.rotation.y += (targetY - node.rotation.y) * Math.min(1, delta * 2.2)
    node.rotation.x += (-pointer.y * 0.18 - node.rotation.x) * Math.min(1, delta * 2.2)
  })
  return <group ref={group}>{children}</group>
}

export default function IslandScene() {
  const [modelReady, setModelReady] = useState(false)
  const [calm] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)

  useEffect(() => {
    let alive = true
    fetch(MODEL_URL, { method: "HEAD" })
      .then((response) => {
        const type = response.headers.get("content-type") ?? ""
        if (alive && response.ok && !type.includes("text/html")) setModelReady(true)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])

  return (
    <Canvas
      style={{ position: "absolute", inset: 0 }}
      camera={{ position: [0, 0.8, 4.3], fov: 40 }}
      dpr={[1, 1.5]}
      frameloop={calm ? "demand" : "always"}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[2.5, 3.5, 3]} intensity={0.7} />
      <Rig calm={calm}>
        {modelReady ? (
          <Suspense fallback={<Island />}>
            <GltfModel url={MODEL_URL} />
          </Suspense>
        ) : (
          <Island />
        )}
      </Rig>
      {calm ? null : BUBBLES.map((bubble) => <Bubble key={bubble.x} {...bubble} />)}
    </Canvas>
  )
}
