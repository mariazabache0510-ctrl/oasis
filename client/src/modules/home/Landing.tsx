import { useState } from "react"
import { Link } from "react-router-dom"
import { services, SOURCE, SOURCE_DATE } from "@modules/directory/catalog"
import { toneLabel, type Tone } from "../local-data/db"
import { Leaves } from "./Leaves"

const tones: Tone[] = ["luminoso", "calma", "regular", "bajito", "pesado"]

function speak() {
  const text = document.querySelector("main")?.textContent?.replace(/\s+/g, " ").trim()
  if (!text) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text.slice(0, 700))
  utterance.lang = "es-CO"
  window.speechSynthesis.speak(utterance)
}

export function Landing() {
  const [preview, setPreview] = useState<Tone | null>(null)

  return (
    <div className="app-frame landing">
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <header className="topbar">
        <a className="brand" href="#inicio">
          Oasis
        </a>
        <nav className="top-links" aria-label="Secciones">
          <a href="#inicio">Inicio</a>
          <a href="#cerca">Cerca</a>
          <a href="#rincon">Rincón</a>
          <a href="#hablar">Hablar</a>
        </nav>
        <div className="top-actions">
          <button className="btn btn-ghost" type="button" onClick={speak}>
            Escuchar
          </button>
          <a className="btn btn-peach" href="#hablar">
            Hablar con alguien
          </a>
          <Link className="btn btn-sage btn-register" to="/entrar">
            Registrarse
          </Link>
        </div>
      </header>
      <main id="contenido">
        <section className="hero" id="inicio">
          <p className="eyebrow">Un espacio tuyo</p>
          <h1>Qué bueno que estés aquí.</h1>
          <p className="lede">
            Aquí está la información de Oasis, sin cuenta. Si te registras, el espacio se parte en secciones y guarda solo en este celular tu nombre, tu marca del día, el diario y tus contactos.
          </p>
        </section>

        <section className="panel mood-panel" aria-label="Cómo vas hoy">
          <Leaves />
          <h2>¿Cómo vas hoy?</h2>
          <p className="muted">
            Es una marca de un segundo, solo para ti. No es una evaluación y no la ve nadie. Si eliges bajito o pesado, Oasis puede ofrecerte, una sola vez en el día, ver a quién llamar. Para guardarla, regístrate.
          </p>
          <div className="row">
            {tones.map((tone) => (
              <button
                key={tone}
                className="choice"
                type="button"
                aria-pressed={preview === tone}
                onClick={() => setPreview(tone)}
              >
                {toneLabel[tone]}
              </button>
            ))}
          </div>
          {preview ? (
            <p className="muted">
              Marcaste {toneLabel[preview]}. Eso todavía no se guarda. El registro lo deja en este celular y abre el resto de Oasis.
            </p>
          ) : null}
        </section>

        <section className="doors" aria-label="Qué hay en Oasis">
          <div className="door-float">
            <a className="door door-sky" href="#cerca">
              <small>01</small>
              <h2>Qué hay cerca</h2>
              <p>Líneas oficiales, con fuente y fecha, y planes de esta semana.</p>
            </a>
          </div>
          <div className="door-float">
            <a className="door door-lilac" href="#rincon">
              <small>02</small>
              <h2>Mi rincón</h2>
              <p>Escribir, distraerte o dejarle una nota a tu yo de después.</p>
            </a>
          </div>
          <div className="door-float">
            <a className="door door-peach" href="#hablar">
              <small>03</small>
              <h2>Hablar con alguien</h2>
              <p>Qué va a pasar, una frase para leer y el número.</p>
            </a>
          </div>
        </section>

        <section className="info-block" id="cerca">
          <p className="eyebrow">Cerca</p>
          <h2>Líneas oficiales</h2>
          <p className="muted">
            Fuente: {SOURCE}. Consultado el {SOURCE_DATE}. Son teléfonos, no puntos en un mapa inventado.
          </p>
          <div className="info-grid">
            {services.map((service) => (
              <article className="card" key={service.id}>
                <h3>{service.name}</h3>
                <p>{service.summary}</p>
                <p className="muted">{service.channel}. {service.hours}.</p>
                <a className="btn btn-sky" href={service.phoneHref}>
                  Llamar {service.phone}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="info-block" id="rincon">
          <p className="eyebrow">Rincón</p>
          <h2>Lo que se abre con el registro</h2>
          <div className="info-grid">
            <article className="card">
              <h3>Diario</h3>
              <p>Un lugar para escribir. El texto se queda en este celular.</p>
            </article>
            <article className="card">
              <h3>Distracción</h3>
              <p>Una lectura corta, burbujas sin puntaje y música, si está conectada.</p>
            </article>
            <article className="card">
              <h3>Cápsula</h3>
              <p>Una nota para tu yo de después. Tú eliges el día en que se abre.</p>
            </article>
          </div>
          <Link className="btn btn-sage btn-register" to="/entrar">
            Registrarse para usar el rincón
          </Link>
        </section>

        <section className="info-block" id="hablar">
          <p className="eyebrow">Hablar</p>
          <h2>Qué pasa si llamas</h2>
          <p className="muted">Puedes llamar sin cuenta. El registro solo añade una red de una o dos personas de tu confianza y una frase lista para WhatsApp.</p>
          {services.map((service) => (
            <article className="card" key={service.id}>
              <h3>{service.name}</h3>
              <ul>
                {service.whatHappens.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
              <p>Frase para leer: {service.script}</p>
              <a className="btn btn-peach" href={service.phoneHref}>
                Llamar {service.phone}
              </a>
            </article>
          ))}
        </section>
      </main>
      <footer className="legal">Prototipo académico. No es un servicio de salud.</footer>
    </div>
  )
}
