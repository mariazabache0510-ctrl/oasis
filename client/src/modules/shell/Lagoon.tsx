import { useEffect, useRef } from "react"

const bands = ["rgba(201, 228, 245, 0.22)", "rgba(186, 216, 230, 0.16)", "rgba(201, 220, 200, 0.14)"]

export function Lagoon() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!canvas || reduce) return
    const context = canvas.getContext("2d")
    if (!context) return
    const pointer = { x: 0.5, y: 0.62 }
    let frame = 0
    let running = true

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas!.width = Math.floor(window.innerWidth * ratio)
      canvas!.height = Math.floor(window.innerHeight * ratio)
      context!.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    function draw(time: number) {
      if (!running) return
      const width = window.innerWidth
      const height = window.innerHeight
      context!.clearRect(0, 0, width, height)
      bands.forEach((color, layer) => {
        context!.beginPath()
        const crest = height * (0.42 + layer * 0.16)
        for (let x = 0; x <= width; x += 10) {
          const across = x / width - pointer.x
          const touch = Math.exp(-across * across * 7) * 16 * (0.5 - pointer.y)
          const y = crest + Math.sin(x * 0.007 + time * 0.00055 + layer * 1.4) * (12 + layer * 5) + touch
          if (x === 0) context!.moveTo(x, y)
          else context!.lineTo(x, y)
        }
        context!.lineTo(width, height)
        context!.lineTo(0, height)
        context!.closePath()
        context!.fillStyle = color
        context!.fill()
      })
      frame = window.requestAnimationFrame(draw)
    }

    function onMove(event: PointerEvent) {
      pointer.x = event.clientX / window.innerWidth
      pointer.y = event.clientY / window.innerHeight
    }

    function onVisibility() {
      if (document.hidden) {
        running = false
        window.cancelAnimationFrame(frame)
        return
      }
      if (!running) {
        running = true
        frame = window.requestAnimationFrame(draw)
      }
    }

    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("pointermove", onMove)
    document.addEventListener("visibilitychange", onVisibility)
    frame = window.requestAnimationFrame(draw)
    return () => {
      running = false
      window.cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <div className="lagoon" aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="wave wave-1" />
      <div className="wave wave-2" />
      <div className="wave wave-3" />
    </div>
  )
}
