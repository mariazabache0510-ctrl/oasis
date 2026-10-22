import { useEffect, type CSSProperties } from "react"

export type Cheer = { id: number; title: string; sub: string }

/** Cuánto dura el aviso antes de cerrarse solo. */
export const CHEER_MS = 4000

const COLORS = ["#f6cdb6", "#e4d4f4", "#c9e4f5", "#f8e7b0", "#c9dcc8", "#f0b99c"]
const PIECES = Array.from({ length: 22 }, (_, index) => {
  const angle = (index / 22) * Math.PI * 2 + (index % 2 ? 0.15 : 0)
  const distance = 74 + (index % 4) * 22
  return {
    x: Math.round(Math.cos(angle) * distance),
    y: Math.round(Math.sin(angle) * distance) - 8,
    spin: (index % 2 ? 1 : -1) * (160 + (index % 5) * 40),
    color: COLORS[index % COLORS.length],
    delay: (index % 5) * 40,
    round: index % 3 === 0,
  }
})

export const NOTE_CHEERS: Omit<Cheer, "id">[] = [
  { title: "¡Guardado!", sub: "Cada palabra cuenta 🌱" },
  { title: "¡Lo soltaste!", sub: "Ponerlo en palabras ya es avanzar 🌸" },
  { title: "Nota a salvo.", sub: "Hoy hiciste algo bueno por ti ✨" },
  { title: "¡Qué bien, lo escribiste!", sub: "Cada paso cuenta, aunque sea chiquito 🌿" },
  { title: "Guardado con cariño.", sub: "Vas más lejos de lo que crees 🌼" },
]

export const CAPSULE_CHEER: Omit<Cheer, "id"> = {
  title: "Cápsula lista.",
  sub: "Tu yo de después va a agradecer este mensaje 💌",
}

let cheerTurn = Math.floor(Math.random() * NOTE_CHEERS.length)

/** El siguiente mensaje cálido. Rota para que dos notas seguidas no digan lo mismo. */
export function nextNoteCheer(): Omit<Cheer, "id"> {
  const cheer = NOTE_CHEERS[cheerTurn % NOTE_CHEERS.length]
  cheerTurn += 1
  return cheer
}

/**
 * Aviso de éxito. La capa vive siempre en pantalla para que el lector de pantalla
 * anuncie el mensaje cuando aparece. Se cierra solo a los 4 segundos.
 */
export function Celebration({ cheer, onDone }: { cheer: Cheer | null; onDone: () => void }) {
  const id = cheer?.id
  useEffect(() => {
    if (id === undefined) return
    const timer = window.setTimeout(onDone, CHEER_MS)
    return () => window.clearTimeout(timer)
  }, [id, onDone])

  return (
    <div className="cele">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {cheer ? `${cheer.title} ${cheer.sub}` : ""}
      </div>
      {cheer ? (
        <div className="cele-card" key={cheer.id}>
          <div className="cele-burst" aria-hidden="true">
            <svg className="cele-check" viewBox="0 0 52 52">
              <circle className="cele-ring" cx="26" cy="26" r="23" fill="none" />
              <path className="cele-tick" d="M15 27l8 8 14-17" fill="none" />
            </svg>
            {PIECES.map((piece, index) => (
              <i
                key={index}
                className={piece.round ? "cele-bit is-round" : "cele-bit"}
                style={{ "--x": `${piece.x}px`, "--y": `${piece.y}px`, "--r": `${piece.spin}deg`, "--c": piece.color, "--d": `${piece.delay}ms` } as CSSProperties}
              />
            ))}
          </div>
          <div className="cele-text" aria-hidden="true">
            <strong>{cheer.title}</strong>
            <span>{cheer.sub}</span>
          </div>
          <button className="cele-close" type="button" aria-label="Cerrar mensaje" onClick={onDone}>
            ×
          </button>
          <span className="cele-time" aria-hidden="true" />
        </div>
      ) : null}
    </div>
  )
}
