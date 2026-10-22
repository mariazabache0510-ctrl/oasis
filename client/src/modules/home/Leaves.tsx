import type { CSSProperties } from "react"

/**
 * Hojas de fondo del panel "¿Cómo vas hoy?". Cada hoja se mece sola con un
 * transform suave (ver .leaf en pages.css), con un desfase distinto para que
 * no se muevan todas a la vez.
 */
export function Leaves() {
  return (
    <svg className="leaves" viewBox="0 0 640 220" aria-hidden="true">
      <g fill="none" strokeLinecap="round">
        <g className="leaf" style={{ "--s": 0 } as CSSProperties}>
          <path d="M40 150c40-70 90-90 140-70-30 40-70 70-140 70z" fill="#d7efe4" stroke="#b7d8c4" />
          <path d="M78 148c28-36 62-46 92-34" stroke="#9fc8b2" />
        </g>
        <g className="leaf" style={{ "--s": 1 } as CSSProperties}>
          <path d="M470 70c50-40 110-30 140 20-50 10-90 10-140-20z" fill="#c9e4f5" stroke="#b7d4ea" />
          <path d="M520 78c36-8 70 2 96 24" stroke="#9ec4de" />
        </g>
        <g className="leaf" style={{ "--s": 2 } as CSSProperties}>
          <path d="M250 40c36-48 88-48 124-8-40 28-80 36-124 8z" fill="#c9dcc8" stroke="#a9c9b4" />
          <path d="M286 48c28-16 60-12 86 8" stroke="#8fb89a" />
        </g>
        <g className="leaf" style={{ "--s": 3 } as CSSProperties}>
          <path d="M80 48c28-30 70-28 96 4-34 16-66 16-96-4z" fill="#e7f6ef" stroke="#b7d8c4" />
        </g>
      </g>
    </svg>
  )
}
