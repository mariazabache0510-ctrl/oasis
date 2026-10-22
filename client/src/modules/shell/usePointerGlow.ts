import { useCallback, useEffect, useRef, type PointerEvent } from "react"

/** Inclinación máxima de una card, en grados. */
export const MAX_TILT = 6

/**
 * Seguimiento del cursor para cualquier elemento.
 * Actualiza variables CSS en el propio nodo, sin pasar por el estado de React:
 *   --mx / --my  posición del puntero dentro del elemento, en px
 *   --tx / --ty  inclinación en grados (rotateX / rotateY), máximo MAX_TILT
 * El CSS decide qué hacer con ellas (ver .oasis-card en pages.css).
 * No hace nada con pantallas táctiles ni si la persona pidió menos movimiento.
 */
export function usePointerGlow<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)
  const frame = useRef(0)
  const calm = useRef(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => {
      calm.current = query.matches
    }
    update()
    query.addEventListener("change", update)
    return () => {
      query.removeEventListener("change", update)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  const onPointerMove = useCallback((event: PointerEvent<T>) => {
    if (event.pointerType === "touch" || calm.current) return
    const node = ref.current
    if (!node) return
    const { clientX, clientY } = event
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const box = node.getBoundingClientRect()
      if (!box.width || !box.height) return
      const x = clientX - box.left
      const y = clientY - box.top
      node.style.setProperty("--mx", `${Math.round(x)}px`)
      node.style.setProperty("--my", `${Math.round(y)}px`)
      node.style.setProperty("--tx", `${(-(y / box.height - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`)
      node.style.setProperty("--ty", `${((x / box.width - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`)
    })
  }, [])

  const onPointerLeave = useCallback(() => {
    cancelAnimationFrame(frame.current)
    const node = ref.current
    if (!node) return
    node.style.removeProperty("--mx")
    node.style.removeProperty("--my")
    node.style.removeProperty("--tx")
    node.style.removeProperty("--ty")
  }, [])

  return { ref, onPointerMove, onPointerLeave }
}
