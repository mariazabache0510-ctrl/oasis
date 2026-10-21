import { Float } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"

const bubbles = [
  { position: [-2.15, 0.7, 0] as [number, number, number], color: "#f6cdb6", scale: 1.25 },
  { position: [2.2, 0.35, -0.2] as [number, number, number], color: "#e4d4f4", scale: 1.05 },
  { position: [-1.7, -1.25, 0.2] as [number, number, number], color: "#c9e4f5", scale: 0.78 },
  { position: [1.65, -1.15, 0.1] as [number, number, number], color: "#c9dcc8", scale: 0.72 },
  { position: [0.1, 1.7, -0.4] as [number, number, number], color: "#f8e7b0", scale: 0.62 },
]

export default function SoftScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5.2], fov: 42 }} dpr={[1, 1.5]}>
      <ambientLight intensity={1.15} />
      <directionalLight position={[2, 3, 4]} intensity={0.35} />
      {bubbles.map((bubble) => (
        <Float key={bubble.color} speed={1.1} rotationIntensity={0.25} floatIntensity={0.7}>
          <mesh position={bubble.position} scale={bubble.scale}>
            <sphereGeometry args={[0.72, 40, 40]} />
            <meshStandardMaterial color={bubble.color} roughness={0.58} metalness={0.02} />
          </mesh>
        </Float>
      ))}
    </Canvas>
  )
}
