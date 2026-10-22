import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { EffectComposer, ToneMapping } from "@react-three/postprocessing"
import gsap from "gsap"
import { BloomEffect, ToneMappingMode } from "postprocessing"
import { Component, Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react"
import type { PerspectiveCamera, PointLight } from "three"
import { createLotusGarden, poseLotus, type LotusGarden } from "./lotusGarden"
import {
  LOTUS_DURATION,
  LOTUS_SKIP_AT,
  lotusQuality,
  lotusSceneTime,
  setLotusLightPreferred,
  type LotusQuality,
} from "./lotusMotion"
import type { PetalDirection } from "./petalDirection"

function Stage({
  garden,
  quality,
  flashRef,
  glowRef,
  markRef,
  onFinish,
  skipRef,
  directionRef,
}: {
  garden: LotusGarden
  quality: LotusQuality
  flashRef: MutableRefObject<HTMLDivElement | null>
  glowRef: MutableRefObject<HTMLDivElement | null>
  markRef: MutableRefObject<HTMLParagraphElement | null>
  onFinish: () => void
  skipRef: MutableRefObject<() => void>
  directionRef: MutableRefObject<PetalDirection>
}) {
  const core = useRef<PointLight>(null)
  const glow = useRef(0)
  const bloom = useMemo(
    () =>
      quality === "full"
        ? new BloomEffect({
            intensity: 0.2,
            luminanceThreshold: 0.72,
            luminanceSmoothing: 0.32,
            mipmapBlur: true,
            radius: 0.68,
            levels: 5,
          })
        : null,
    [quality],
  )
  const finished = useRef(false)
  const warmed = useRef(0)
  const anchored = useRef(false)
  const clock = useRef({ t: 0 })
  const tween = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    skipRef.current = () => {
      clock.current.t = LOTUS_SKIP_AT
      if (tween.current) tween.current.progress(LOTUS_SKIP_AT / LOTUS_DURATION)
    }
  }, [skipRef])

  useEffect(() => () => {
    tween.current?.kill()
    bloom?.dispose()
  }, [bloom])

  useFrame(({ camera }) => {
    if (finished.current) return
    if (warmed.current < 5) {
      warmed.current += 1
      poseLotus(garden, 0, camera as PerspectiveCamera, core.current)
      return
    }
    if (!anchored.current) {
      const from = clock.current.t
      const left = Math.max(0.05, LOTUS_DURATION - from)
      tween.current = gsap.fromTo(clock.current, { t: from }, { t: LOTUS_DURATION, duration: left, ease: "none" })
      anchored.current = true
    }
    const scene = lotusSceneTime(clock.current.t)
    const pose = poseLotus(garden, scene, camera as PerspectiveCamera, core.current, directionRef.current)
    glow.current = pose.glow
    if (bloom) bloom.intensity = 0.18 + pose.glow * pose.glow * 2.5
    if (glowRef.current) glowRef.current.style.opacity = String(pose.glow * (quality === "light" ? 0.9 : 0.35))
    if (flashRef.current) flashRef.current.style.opacity = String(pose.flash)
    if (markRef.current) {
      markRef.current.style.opacity = String(pose.mark)
      markRef.current.style.transform = `translateY(${(1 - Math.min(1, pose.mark + 0.15)) * 10}px)`
    }
    if (clock.current.t >= LOTUS_DURATION - 0.02) {
      finished.current = true
      onFinish()
    }
  })

  return (
    <>
      <color attach="background" args={["#f4ece1"]} />
      <fog attach="fog" args={["#f4ece1", 6.5, 17]} />
      <hemisphereLight args={["#fff6ea", "#c9e4f5", quality === "light" ? 1.55 : 1.25]} />
      <directionalLight position={[3.2, 6.4, 3.6]} intensity={quality === "light" ? 2.4 : 2.15} color="#fff3e2" />
      {quality === "full" ? <directionalLight position={[-4.4, 2.2, -3]} intensity={0.85} color="#e4d4f4" /> : null}
      {quality === "full" ? <directionalLight position={[0.2, 1.4, -4.2]} intensity={0.4} color="#fff6ea" /> : null}
      <pointLight ref={core} position={[0, 0.46, 0]} color="#ffe7a8" intensity={0.45} distance={4} decay={2} />
      <primitive object={garden.root} />
      {bloom ? (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <primitive object={bloom} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      ) : null}
      <ContextGuard onFinish={onFinish} />
    </>
  )
}

function ContextGuard({ onFinish }: { onFinish: () => void }) {
  const gl = useThree((state) => state.gl)
  useEffect(() => {
    const canvas = gl.domElement
    canvas.setAttribute("aria-hidden", "true")
    const onLost = (event: Event) => {
      event.preventDefault()
      onFinish()
    }
    canvas.addEventListener("webglcontextlost", onLost)
    return () => canvas.removeEventListener("webglcontextlost", onLost)
  }, [gl, onFinish])
  return null
}

class StageBoundary extends Component<{ onDone: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return <FailedBloom onDone={this.props.onDone} />
    return this.props.children
  }
}

function FailedBloom({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 280)
    return () => window.clearTimeout(id)
  }, [onDone])
  return null
}

export default function LotusStage({ onDone }: { onDone: () => void }) {
  const [direction, setDirection] = useState<PetalDirection>("outward")
  const [quality, setQuality] = useState<LotusQuality>(lotusQuality)
  const directionRef = useRef(direction)
  directionRef.current = direction
  const garden = useMemo(() => createLotusGarden(quality), [quality])
  const flashRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLParagraphElement>(null)
  const skipButton = useRef<HTMLButtonElement>(null)
  const skipRef = useRef<() => void>(() => undefined)
  const finish = useRef(onDone)
  finish.current = onDone

  useEffect(() => () => garden.dispose(), [garden])

  useEffect(() => {
    skipButton.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" && event.key !== "Enter") return
      event.preventDefault()
      skipRef.current()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const finishOnce = useRef(false)
  const complete = () => {
    if (finishOnce.current) return
    finishOnce.current = true
    if (flashRef.current) flashRef.current.style.opacity = "1"
    window.setTimeout(() => finish.current(), 90)
  }

  return (
    <div className="lotus-screen" role="status" aria-label="Abriendo Oasis">
      <div className="lotus-backdrop" />
      <div className="lotus-stage">
        <StageBoundary onDone={() => finish.current()}>
          <Suspense fallback={null}>
            <Canvas
              dpr={quality === "light" ? 0.5 : [1, 1.2]}
              camera={{ fov: 38, near: 0.06, far: 60, position: [4.02, 2.72, 3.84] }}
              gl={{
                antialias: quality === "full",
                alpha: false,
                stencil: false,
                powerPreference: quality === "light" ? "low-power" : "high-performance",
              }}
              onCreated={({ gl }) => gl.setClearColor("#f4ece1", 1)}
            >
              <Stage
                garden={garden}
                quality={quality}
                flashRef={flashRef}
                glowRef={glowRef}
                markRef={markRef}
                onFinish={complete}
                skipRef={skipRef}
                directionRef={directionRef}
              />
            </Canvas>
          </Suspense>
        </StageBoundary>
      </div>
      <p ref={markRef} className="lotus-mark">
        Oasis
      </p>
      <div ref={glowRef} className="lotus-glow" />
      <div ref={flashRef} className="lotus-flash" />
      <div className="lotus-controls">
        <button ref={skipButton} className="lotus-skip" type="button" onClick={() => skipRef.current()}>
          Saltar
        </button>
        <button
          className="lotus-skip"
          type="button"
          aria-pressed={direction === "outward"}
          onClick={() => setDirection((current) => (current === "outward" ? "inward" : "outward"))}
        >
          {direction === "outward" ? "Pétalos desde el centro" : "Pétalos desde afuera"}
        </button>
        <button
          className="lotus-skip"
          type="button"
          aria-pressed={quality === "light"}
          onClick={() => {
            const next = quality === "light" ? "full" : "light"
            setLotusLightPreferred(next === "light")
            setQuality(next)
          }}
        >
          {quality === "light" ? "Versión liviana" : "Versión completa"}
        </button>
      </div>
    </div>
  )
}
