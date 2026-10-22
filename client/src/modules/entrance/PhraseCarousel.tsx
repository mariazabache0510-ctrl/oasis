import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

const phrases = [
  "Cada día es una nueva oportunidad para construir la versión de ti que deseas ser.",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "El futuro pertenece a quienes creen en la belleza de sus sueños.",
]

export const SLIDE_MS = 6500

export function PhraseCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const card = useRef<HTMLDivElement>(null)
  const frame = useRef(0)

  const go = (next: number) => setIndex((next + phrases.length) % phrases.length)

  function onMove(event: PointerEvent<HTMLDivElement>) {
    const node = card.current
    if (!node) return
    const { clientX, clientY } = event
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const box = node.getBoundingClientRect()
      const x = (clientX - box.left) / box.width
      const y = (clientY - box.top) / box.height
      node.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`)
      node.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`)
      node.style.setProperty("--ry", `${((x - 0.5) * 7).toFixed(2)}deg`)
      node.style.setProperty("--rx", `${((0.5 - y) * 6).toFixed(2)}deg`)
    })
  }

  function onLeave() {
    const node = card.current
    if (!node) return
    cancelAnimationFrame(frame.current)
    node.style.setProperty("--rx", "0deg")
    node.style.setProperty("--ry", "0deg")
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      go(index + 1)
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      go(index - 1)
    }
  }

  return (
    <div
      className="c3"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Frases para ti"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKey}
    >
      <div
        className="c3-card"
        ref={card}
        tabIndex={0}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        aria-label={`Frase ${index + 1} de ${phrases.length}`}
      >
        <span className="c3-quote" aria-hidden="true">
          “
        </span>
        <p className="c3-text" key={index} aria-live={paused ? "polite" : "off"}>
          {phrases[index]}
        </p>
        <span className="c3-track" aria-hidden="true">
          <span
            className="c3-bar"
            key={index}
            style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
            onAnimationEnd={() => go(index + 1)}
          />
        </span>
      </div>
      <div className="c3-controls">
        <button className="c3-btn" type="button" aria-label="Frase anterior" onClick={() => go(index - 1)}>
          ‹
        </button>
        <div className="c3-dots">
          {phrases.map((phrase, dot) => (
            <button
              key={phrase}
              className="c3-dot"
              type="button"
              aria-label={`Ir a la frase ${dot + 1}`}
              aria-current={dot === index ? "true" : undefined}
              onClick={() => go(dot)}
            />
          ))}
        </div>
        <button className="c3-btn" type="button" aria-label="Frase siguiente" onClick={() => go(index + 1)}>
          ›
        </button>
      </div>
    </div>
  )
}
