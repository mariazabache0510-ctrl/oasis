import { useEffect, useRef } from "react"

export function Water() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = root.current
    if (!node) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let frame = 0
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        node.style.setProperty("--mx", `${event.clientX}px`)
        node.style.setProperty("--my", `${event.clientY}px`)
      })
    }
    const onFocus = () => node.classList.add("is-focus")
    const onBlur = () => node.classList.remove("is-focus")
    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("focusin", onFocus)
    document.addEventListener("focusout", onBlur)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("focusin", onFocus)
      document.removeEventListener("focusout", onBlur)
    }
  }, [])

  return (
    <div className="lagoon" ref={root} aria-hidden="true">
      <div className="lagoon-glow" />
      <svg className="wave wave-high" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path d="M0 110C200 60 360 170 580 112C820 48 980 168 1220 108C1340 78 1400 140 1440 100V220H0Z" />
      </svg>
      <svg className="wave wave-back" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path d="M0 120C160 80 280 170 480 130C700 86 820 170 1040 124C1220 86 1320 150 1440 110V220H0Z" />
      </svg>
      <svg className="wave wave-mid" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path d="M0 140C180 90 340 180 560 128C780 76 940 176 1160 120C1300 86 1380 150 1440 128V220H0Z" />
      </svg>
      <svg className="wave wave-front" viewBox="0 0 1440 180" preserveAspectRatio="none">
        <path d="M0 90C150 140 320 40 520 96C740 158 900 48 1120 100C1260 136 1360 70 1440 96V180H0Z" />
      </svg>
    </div>
  )
}
