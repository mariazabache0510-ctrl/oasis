import { Fragment, type CSSProperties, type ReactNode } from "react"
import { usePointerGlow } from "./usePointerGlow"

type Props = {
  eyebrow: string
  title: string
  /** Palabras finales que se resaltan con otro degradado, por ejemplo el nombre. */
  accent?: string
  lede?: string
  /** Convierte el texto pequeño de arriba en el protagonista de la pantalla. */
  featured?: boolean
  /** Subrayado que se dibuja solo bajo el texto grande de arriba. Úsalo con `featured`. */
  underline?: boolean
  /** Ícono pequeño que reemplaza el punto brillante junto al texto de arriba. */
  icon?: ReactNode
}

export function PageHead({ eyebrow, title, accent, lede, featured = false, underline = false, icon }: Props) {
  const glow = usePointerGlow<HTMLElement>()
  const titleWords = [
    ...title.split(" ").filter(Boolean).map((text) => ({ text, accent: false })),
    ...(accent ? accent.split(" ").filter(Boolean).map((text) => ({ text, accent: true })) : []),
  ]
  const eyebrowWords = eyebrow.split(" ").filter(Boolean)

  return (
    <header className={["ph", featured ? "ph--featured" : "", underline ? "ph--underline" : ""].filter(Boolean).join(" ")} {...glow}>
      <p className="ph-eyebrow">
        <span className="ph-glow ph-glow--a" aria-hidden="true" />
        <span className="ph-glow ph-glow--b" aria-hidden="true" />
        <span className={icon ? "ph-spark ph-spark--icon" : "ph-spark"} aria-hidden="true">
          {icon ?? <i />}
        </span>
        <span className="ph-eyebrow-text">
          {eyebrowWords.map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              <span className="oasis-title ph-eyebrow-word" style={{ "--w": index } as CSSProperties}>
                {word}
              </span>{" "}
            </Fragment>
          ))}
        </span>
      </p>
      <h1 className="ph-title">
        {titleWords.map((word, index) => (
          <Fragment key={`${word.text}-${index}`}>
            <span
              className={word.accent ? "oasis-title ph-word ph-accent" : "oasis-title ph-word"}
              style={{ "--w": index + eyebrowWords.length } as CSSProperties}
            >
              {word.text}
            </span>{" "}
          </Fragment>
        ))}
      </h1>
      <span className="ph-bar" aria-hidden="true" />
      {lede ? <p className="ph-lede">{lede}</p> : null}
    </header>
  )
}
