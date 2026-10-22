import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useOasis } from "../local-data/OasisProvider"
import { MoodPanel } from "./MoodPanel"

export function Home() {
  const { profile } = useOasis()
  const [install, setInstall] = useState<BeforeInstallPromptEvent | null>(null)
  const lead = profile.simpleLanguage
    ? "Aquí están los teléfonos oficiales. No tienes que contar cómo estás."
    : "Si no sabes a quién llamar en Villavicencio, aquí está el dato oficial. Sin cuenta y sin que tengas que explicar cómo estás."

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setInstall(event as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    return () => window.removeEventListener("beforeinstallprompt", onPrompt)
  }, [])

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Un espacio tuyo</p>
        <h1>Qué bueno verte{profile.name ? `, ${profile.name}` : ""}.</h1>
        <p className="lede">{lead}</p>
      </section>

      <MoodPanel offerHref="/hablar" />

      <section className="doors">
        <Link className="door door-sky" to="/cerca">
          <small>01</small>
          <h2>Qué hay cerca</h2>
          <p>Líneas oficiales, con fuente y fecha, y planes de esta semana.</p>
        </Link>
        <Link className="door door-lilac" to="/rincon">
          <small>02</small>
          <h2>Mi rincón</h2>
          <p>Escribir, distraerte o dejarle una nota a tu yo de después.</p>
        </Link>
        <Link className="door door-peach" to="/hablar">
          <small>03</small>
          <h2>Hablar con alguien</h2>
          <p>Qué va a pasar, una frase para leer y el número.</p>
        </Link>
      </section>

      {install ? (
        <button className="btn btn-sage" type="button" onClick={() => void install.prompt()}>
          Instalar Oasis en este celular
        </button>
      ) : null}
    </>
  )
}
