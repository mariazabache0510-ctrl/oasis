import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import type { Group } from "three"

const rings = [
  { count: 8, length: 1.05, scale: [0.34, 0.82, 0.1] as [number, number, number], color: "#f6cdb6", delay: 0.12 },
  { count: 6, length: 0.72, scale: [0.26, 0.56, 0.09] as [number, number, number], color: "#e4d4f4", delay: 0.42 },
  { count: 5, length: 0.46, scale: [0.18, 0.36, 0.08] as [number, number, number], color: "#c9dcc8", delay: 0.68 },
]

function Petal({ angle, color, delay, length, scale }: { angle: number; color: string; delay: number; length: number; scale: [number, number, number] }) {
  const hinge = useRef<Group>(null)
  useFrame(({ clock }) => {
    const progress = Math.min(1, Math.max(0, (clock.elapsedTime - delay) / 1.35))
    const ease = 1 - (1 - progress) ** 3
    if (hinge.current) hinge.current.rotation.x = 0.15 + ease * 1.12
  })
  return (
    <group rotation={[0, angle, 0]}>
      <group ref={hinge}>
        <mesh position={[0, length * 0.5, 0]} scale={scale}>
          <sphereGeometry args={[1, 20, 12]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.02} />
        </mesh>
      </group>
    </group>
  )
}

function Flower() {
  const root = useRef<Group>(null)
  useFrame((_, delta) => {
    if (root.current) root.current.rotation.y += delta * 0.22
  })
  return (
    <group ref={root} position={[0, -0.15, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <circleGeometry args={[2.2, 48]} />
        <meshStandardMaterial color="#d7eef8" transparent opacity={0.9} />
      </mesh>
      {rings.map((ring) =>
        Array.from({ length: ring.count }, (_, index) => (
          <Petal
            key={`${ring.color}-${index}`}
            angle={(index / ring.count) * Math.PI * 2}
            color={ring.color}
            delay={ring.delay}
            length={ring.length}
            scale={ring.scale}
          />
        )),
      )}
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color="#f8e7b0" roughness={0.35} />
      </mesh>
    </group>
  )
}

export default function LotusBloom() {
  return (
    <Canvas camera={{ position: [0, 1.05, 4.4], fov: 38 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
      <ambientLight intensity={1.25} />
      <directionalLight position={[2, 4, 3]} intensity={0.55} />
      <Flower />
    </Canvas>
  )
}
