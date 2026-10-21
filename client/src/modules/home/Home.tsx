import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { todayKey, toneLabel, type Tone } from "../local-data/db"
import { useOasis } from "../local-data/OasisProvider"
import { track } from "../shell/track"

const phrases = [
  "Puedes entrar sin explicar cómo estás.",
  "Qué bueno que entraste.",
  "Esto se queda en tu celular.",
  "Si quieres hablar con alguien, el paso es corto.",
  "No tienes que estar bien para estar aquí.",
]

const tones: Tone[] = ["luminoso", "calma", "regular", "bajito", "pesado"]

export function Home() {
  const { profile, todayMark, saveMark, setOfferDay } = useOasis()
  const [index, setIndex] = useState(0)
  const [install, setInstall] = useState<BeforeInstallPromptEvent | null>(null)
  const low = todayMark && (todayMark.tone === "bajito" || todayMark.tone === "pesado")
  const showOffer = Boolean(low && profile.lastOfferDay !== todayKey())
  const lead = profile.simpleLanguage
    ? "Aquí están los teléfonos oficiales. No tienes que contar cómo estás."
    : "Si no sabes a quién llamar en Villavicencio, aquí está el dato oficial. Sin cuenta y sin que tengas que explicar cómo estás."

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % phrases.length), 5000)
    return () => window.clearInterval(timer)
  }, [])

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

      <section className="panel" aria-label="Cómo vas hoy">
        <h2>¿Cómo vas hoy?</h2>
        <p className="muted">Un toque. Solo tú lo ves. No es una evaluación.</p>
        <div className="row">
          {tones.map((tone) => (
            <button
              key={tone}
              className="choice"
              type="button"
              aria-pressed={todayMark?.tone === tone}
              onClick={() => void saveMark(tone)}
            >
              {toneLabel[tone]}
            </button>
          ))}
        </div>
        {showOffer ? (
          <div className="row">
            <Link className="btn btn-peach" to="/hablar" onClick={() => { track("help_offer"); void setOfferDay(todayKey()) }}>
              ¿Quieres ver a quién puedes llamar?
            </Link>
            <button className="btn btn-ghost" type="button" onClick={() => void setOfferDay(todayKey())}>
              Ahora no
            </button>
          </div>
        ) : null}
      </section>

      <section className="panel carousel" aria-roledescription="carrusel">
        <p className="slide">{phrases[index]}</p>
        <div className="dots">
          {phrases.map((phrase, dot) => (
            <button key={phrase} type="button" aria-label={`Frase ${dot + 1}`} aria-current={dot === index ? "true" : undefined} onClick={() => setIndex(dot)} />
          ))}
        </div>
      </section>

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
