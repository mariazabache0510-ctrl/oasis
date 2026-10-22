import { useEffect, useRef, useState } from "react"
import { audioReady, isMuted, playPop, setMuted, unlockAudio } from "./popSound"
import { useDevice } from "../shell/device"

type Tint = [number, number, number]

const TINTS: Tint[] = [
  [246, 205, 182],
  [228, 212, 244],
  [201, 228, 245],
  [201, 220, 200],
  [248, 231, 176],
]

type Bubble = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  phase: number
  tint: Tint
  squish: number
  born: number
  alive: boolean
  respawnAt: number
}

type Particle = { x: number; y: number; vx: number; vy: number; life: number; r: number; tint: Tint }
type Ring = { x: number; y: number; r: number; life: number; tint: Tint }

const MIN_R = 18
const MAX_R = 54

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export function PopField() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const { touch, kind } = useDevice()
  const [silent, setSilent] = useState(() => isMuted())
  const [ready, setReady] = useState(false)
  const [popped, setPopped] = useState(0)
  const touchRef = useRef(touch)
  touchRef.current = touch

  useEffect(() => {
    const element = canvas.current
    const context = element?.getContext("2d")
    if (!element || !context) return
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dprCap = kind === "phone" ? 1.5 : 2
    let width = 0
    let height = 0
    let dpr = 1
    let bubbles: Bubble[] = []
    const particles: Particle[] = []
    const rings: Ring[] = []
    const pointer = { x: -999, y: -999, active: false }
    let frame = 0
    let last = performance.now()
    let count = 0

    function spawn(index: number, anywhere: boolean): Bubble {
      const small = kind === "phone" ? 0.65 : 1
      const r = rand(MIN_R, MAX_R) * small
      return {
        x: rand(r, Math.max(r + 1, width - r)),
        y: anywhere ? rand(r, Math.max(r + 1, height - r)) : height + r + rand(0, 60),
        r,
        vx: rand(-6, 6),
        vy: calm ? 0 : -rand(5, 16),
        phase: rand(0, Math.PI * 2),
        tint: TINTS[index % TINTS.length],
        squish: 0,
        born: performance.now(),
        alive: true,
        respawnAt: 0,
      }
    }

    function resize() {
      const element2 = canvas.current
      if (!element2) return
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, dprCap)
      element2.width = Math.floor(width * dpr)
      element2.height = Math.floor(height * dpr)
      element2.style.width = `${width}px`
      element2.style.height = `${height}px`
      context?.setTransform(dpr, 0, 0, dpr, 0, 0)
      const wanted = Math.max(10, Math.min(34, Math.round((width * height) / 52000)))
      if (wanted !== count) {
        count = wanted
        bubbles = Array.from({ length: wanted }, (_, index) => spawn(index, true))
      }
    }

    function pop(bubble: Bubble) {
      bubble.alive = false
      bubble.respawnAt = performance.now() + rand(2200, 4800)
      playPop((bubble.r - MIN_R) / (MAX_R - MIN_R))
      setPopped((value) => value + 1)
      if (calm) return
      rings.push({ x: bubble.x, y: bubble.y, r: bubble.r, life: 1, tint: bubble.tint })
      for (let index = 0; index < 11; index += 1) {
        const angle = (index / 11) * Math.PI * 2 + rand(-0.2, 0.2)
        const speed = rand(60, 190)
        particles.push({
          x: bubble.x + Math.cos(angle) * bubble.r * 0.7,
          y: bubble.y + Math.sin(angle) * bubble.r * 0.7,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 20,
          life: 1,
          r: rand(2, 5.5) * (bubble.r / 36),
          tint: bubble.tint,
        })
      }
    }

    function onMove(event: PointerEvent) {
      const target = event.target as Element | null
      const blocked = Boolean(target?.closest?.(".enter-card, .c3, button, a, input, label, .pop-toggle"))
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = !blocked
    }

    function onDown(event: PointerEvent) {
      if (unlockAudio()) setReady(true)
      const target = event.target as Element | null
      if (target?.closest?.(".enter-card, .c3, button, a, input, label, .pop-toggle")) return
      for (const bubble of bubbles) {
        if (!bubble.alive) continue
        if (Math.hypot(bubble.x - event.clientX, bubble.y - event.clientY) < bubble.r * 1.05) pop(bubble)
      }
    }

    function onKey() {
      if (unlockAudio()) setReady(true)
    }

    function onLeave() {
      pointer.active = false
    }

    function drawBubble(bubble: Bubble, now: number) {
      if (!context) return
      const grow = Math.min(1, (now - bubble.born) / 700)
      const eased = 1 - (1 - grow) ** 3
      const sx = (1 + bubble.squish * 0.12) * eased
      const sy = (1 - bubble.squish * 0.2) * eased
      const [red, green, blue] = bubble.tint
      context.save()
      context.translate(bubble.x, bubble.y)
      context.scale(sx, sy)
      const body = context.createRadialGradient(-bubble.r * 0.32, -bubble.r * 0.36, bubble.r * 0.08, 0, 0, bubble.r)
      body.addColorStop(0, "rgba(255,255,255,0.95)")
      body.addColorStop(0.5, `rgba(${red},${green},${blue},0.55)`)
      body.addColorStop(1, `rgba(${Math.max(0, red - 28)},${Math.max(0, green - 26)},${Math.max(0, blue - 22)},0.72)`)
      context.beginPath()
      context.arc(0, 0, bubble.r, 0, Math.PI * 2)
      context.fillStyle = body
      context.fill()
      context.lineWidth = 1.5
      context.strokeStyle = "rgba(255,255,255,0.85)"
      context.stroke()
      context.beginPath()
      context.arc(0, 0, bubble.r * 0.62, 0, Math.PI * 2)
      context.lineWidth = 1
      context.strokeStyle = `rgba(255,255,255,${0.25 + bubble.squish * 0.3})`
      context.stroke()
      context.beginPath()
      context.ellipse(-bubble.r * 0.34, -bubble.r * 0.42, bubble.r * 0.2, bubble.r * 0.11, -0.6, 0, Math.PI * 2)
      context.fillStyle = "rgba(255,255,255,0.8)"
      context.fill()
      context.restore()
    }

    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!context) return
      context.clearRect(0, 0, width, height)

      bubbles.forEach((bubble, index) => {
        if (!bubble.alive) {
          if (now >= bubble.respawnAt) {
            const fresh = spawn(index, calm)
            bubbles[index] = fresh
          }
          return
        }
        if (!calm) {
          bubble.x += (bubble.vx + Math.sin(now / 1700 + bubble.phase) * 9) * dt
          bubble.y += bubble.vy * dt
          bubble.vx *= 0.985
          if (bubble.y < -bubble.r * 1.5) {
            bubble.y = height + bubble.r
            bubble.x = rand(bubble.r, Math.max(bubble.r + 1, width - bubble.r))
          }
          if (bubble.x < -bubble.r) bubble.x = width + bubble.r
          if (bubble.x > width + bubble.r) bubble.x = -bubble.r
        }
        let press = 0
        if (pointer.active && !touchRef.current) {
          const dx = bubble.x - pointer.x
          const dy = bubble.y - pointer.y
          const distance = Math.hypot(dx, dy) || 1
          const reach = bubble.r + 70
          if (distance < reach && !calm) {
            const push = (1 - distance / reach) * 90 * dt
            bubble.vx += (dx / distance) * push
            bubble.y += (dy / distance) * push * 0.6
          }
          press = Math.max(0, 1 - distance / (bubble.r * 1.15))
          if (distance < bubble.r * 0.62) {
            pop(bubble)
            return
          }
        }
        bubble.squish += (press - bubble.squish) * Math.min(1, dt * 14)
        drawBubble(bubble, now)
      })

      for (let index = rings.length - 1; index >= 0; index -= 1) {
        const ring = rings[index]
        ring.life -= dt * 2.4
        if (ring.life <= 0) {
          rings.splice(index, 1)
          continue
        }
        context.beginPath()
        context.arc(ring.x, ring.y, ring.r * (1 + (1 - ring.life) * 0.9), 0, Math.PI * 2)
        context.lineWidth = 2.5 * ring.life
        context.strokeStyle = `rgba(${ring.tint[0]},${ring.tint[1]},${ring.tint[2]},${ring.life * 0.9})`
        context.stroke()
      }
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const piece = particles[index]
        piece.life -= dt * 1.8
        if (piece.life <= 0) {
          particles.splice(index, 1)
          continue
        }
        piece.x += piece.vx * dt
        piece.y += piece.vy * dt
        piece.vy += 160 * dt
        piece.vx *= 0.97
        context.beginPath()
        context.arc(piece.x, piece.y, piece.r * piece.life, 0, Math.PI * 2)
        context.fillStyle = `rgba(${piece.tint[0]},${piece.tint[1]},${piece.tint[2]},${piece.life * 0.95})`
        context.fill()
      }
      frame = requestAnimationFrame(tick)
    }

    resize()
    frame = requestAnimationFrame(tick)
    window.addEventListener("resize", resize)
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerdown", onDown, { passive: true })
    window.addEventListener("keydown", onKey)
    document.addEventListener("pointerleave", onLeave)
    window.addEventListener("blur", onLeave)
    if (audioReady()) setReady(true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerdown", onDown)
      window.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerleave", onLeave)
      window.removeEventListener("blur", onLeave)
    }
  }, [kind])

  function toggle() {
    const next = !silent
    setSilent(next)
    setMuted(next)
    if (!next && unlockAudio()) setReady(true)
  }

  return (
    <>
      <canvas className="pop-field" ref={canvas} aria-hidden="true" />
      <button className="pop-toggle" type="button" aria-pressed={!silent} onClick={toggle}>
        <span className="pop-toggle-dot" aria-hidden="true" />
        <span>
          {silent ? "Sonido apagado" : "Sonido activo"}
          {!silent && !ready ? (touch ? " · toca una burbuja" : " · haz clic para activarlo") : ""}
        </span>
        {popped > 0 ? <strong aria-label={`${popped} burbujas explotadas`}>{popped}</strong> : null}
      </button>
    </>
  )
}
