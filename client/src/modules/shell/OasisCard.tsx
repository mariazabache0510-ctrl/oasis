import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode } from "react"
import { usePointerGlow } from "./usePointerGlow"

export type CardTone = "sky" | "lilac" | "peach" | "mint" | "butter"

type Props<T extends ElementType> = {
  as?: T
  tone?: CardTone
  /** Posición en la entrada escalonada: cada número retrasa la aparición un poco. */
  index?: number
  className?: string
  style?: CSSProperties
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, "as" | "tone" | "index" | "className" | "style" | "children">

/**
 * La card de Oasis: fondo animado, vidrio, brillo y tilt que siguen al cursor,
 * elevación al pasar el mouse y anillo de foco. Todo el estilo vive en .oasis-card.
 * `as` permite usarla como <article>, <section> o incluso como <Link>.
 */
export function OasisCard<T extends ElementType = "div">({ as, tone = "sky", index = 0, className, style, children, ...rest }: Props<T>) {
  const Tag: ElementType = as ?? "div"
  const glow = usePointerGlow<HTMLElement>()
  return (
    <Tag
      {...rest}
      {...glow}
      data-tone={tone}
      className={className ? `oasis-card ${className}` : "oasis-card"}
      style={{ "--i": index, ...style } as CSSProperties}
    >
      <span className="oasis-card__orb" aria-hidden="true" />
      {children}
    </Tag>
  )
}
