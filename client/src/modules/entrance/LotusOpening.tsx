import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import type { Group, Mesh } from "three"

function Lotus({ onDone }: { onDone: () => void }) {
  const flower = useRef<Group>(null)
  const progress = useRef(0)
  const done = useRef(false)

  useFrame((_, delta) => {
    progress.current = Math.min(1, progress.current + delta / 2.6)
    const open = 1 - (1 - progress.current) ** 3
    const group = flower.current
    if (!group) return
    group.rotation.y += delta * 0.22
    group.children.forEach((child, index) => {
      if (index > 11) return
      const petal = child.children[0] as Mesh | undefined
      if (!petal) return
      const inner = index >= 8
      petal.rotation.x = (inner ? -0.7 : -1.2) + open * (inner ? 0.85 : 1.35)
    })
    if (progress.current >= 1 && !done.current) {
      done.current = true
      window.setTimeout(onDone, 320)
    }
  })

  const outer = Array.from({ length: 8 }, (_, index) => index)
  const inner = Array.from({ length: 4 }, (_, index) => index)

  return (
    <group ref={flower} position={[0, -0.15, 0]}>
      {outer.map((index) => (
        <group key={`out-${index}`} rotation={[0, (index / 8) * Math.PI * 2, 0]}>
          <mesh position={[0, 0.05, 0.15]} rotation={[-1.2, 0, 0.35]} scale={[0.62, 0.16, 1.05]}>
            <sphereGeometry args={[0.72, 18, 12]} />
            <meshStandardMaterial color={index % 2 === 0 ? "#f4d5dc" : "#f6cdb6"} roughness={0.46} />
          </mesh>
        </group>
      ))}
      {inner.map((index) => (
        <group key={`in-${index}`} rotation={[0, (index / 4) * Math.PI * 2 + 0.4, 0]}>
          <mesh position={[0, 0.12, 0.08]} rotation={[-0.7, 0, 0.2]} scale={[0.4, 0.14, 0.7]}>
            <sphereGeometry args={[0.6, 16, 10]} />
            <meshStandardMaterial color="#f8e7b0" roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.22, 18, 18]} />
        <meshStandardMaterial color="#c9dcc8" roughness={0.42} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
        <circleGeometry args={[1.7, 40]} />
        <meshStandardMaterial color="#c9e4f5" roughness={0.7} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

export default function LotusOpening({ onDone }: { onDone: () => void }) {
  const reduce = useRef(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  const fired = useRef(false)
  useEffect(() => {
    if (!reduce.current || fired.current) return
    fired.current = true
    onDone()
  }, [onDone])

  if (reduce.current) return null

  return (
    <div className="lotus-screen" role="status" aria-label="Abriendo Oasis">
      <Canvas camera={{ position: [0, 1.15, 4.4], fov: 38 }} dpr={[1, 1.25]}>
        <color attach="background" args={["#fbf6ee"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[2.2, 3.4, 2]} intensity={0.55} />
        <Lotus onDone={onDone} />
      </Canvas>
      <p className="lotus-caption">Oasis</p>
    </div>
  )
}
