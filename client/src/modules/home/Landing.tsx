import { useEffect, useRef, useState, type CSSProperties } from "react"
import { Link } from "react-router-dom"
import { services, SOURCE, SOURCE_DATE } from "@modules/directory/catalog"
import { toneLabel, type Tone } from "../local-data/db"
import { Leaves } from "./Leaves"
import { useDevice } from "../shell/device"
import { BubblesIcon, CapsuleIcon, HugIcon, JournalIcon, PhoneIcon } from "./Icons"

const tones: Tone[] = ["luminoso", "calma", "regular", "bajito", "pesado"]

function speak() {
  const text = document.querySelector("main")?.textContent?.replace(/\s+/g, " ").trim()
  if (!text) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text.slice(0, 700))
  utterance.lang = "es-CO"
  window.speechSynthesis.speak(utterance)
}

type Service = (typeof services)[number]

function ServiceBackdrop({ service }: { service: Service }) {
  if (service.id === "yo-te-escucho") return <HugIcon />
  return <PhoneIcon tone={service.id === "linea-106" ? "sky" : "mint"} />
}

function tileTone(service: Service) {
  if (service.id === "yo-te-escucho") return "tile-peach"
  return service.id === "linea-106" ? "tile-sky" : "tile-mint"
}

function SectionTitle({ eyebrow, children, as: Tag = "h2" }: { eyebrow: string; children: string; as?: "h1" | "h2" }) {
  return (
    <div className="section-head reveal">
      <p className="eyebrow eyebrow-pill">{eyebrow}</p>
      <Tag className="section-title">{children}</Tag>
    </div>
  )
}

export function Landing() {
  const [preview, setPreview] = useState<Tone | null>(null)
  const { here } = useDevice()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = root.current
    if (!node) return
    const targets = Array.from(node.querySelectorAll<HTMLElement>(".reveal"))
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((target) => target.classList.add("is-in"))
      return
    }
    node.classList.add("reveal-on")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add("is-in")
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    )
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="app-frame landing" ref={root}>
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
          <SectionTitle eyebrow="Un espacio tuyo" as="h1">Qué bueno que estés aquí.</SectionTitle>
          <p className="lede">
            Aquí está la información de Oasis, sin cuenta. Si te registras, el espacio se parte en secciones y guarda solo en {here} tu nombre, tu marca del día, el diario y tus contactos.
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
              Marcaste {toneLabel[preview]}. Eso todavía no se guarda. El registro lo deja en {here} y abre el resto de Oasis.
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
          <SectionTitle eyebrow="Cerca">Líneas oficiales</SectionTitle>
          <p className="muted reveal">
            Fuente: {SOURCE}. Consultado el {SOURCE_DATE}. Son teléfonos, no puntos en un mapa inventado.
          </p>
          <div className="info-grid">
            {services.map((service, index) => (
              <div className="tile-float reveal" style={{ "--i": index } as CSSProperties} key={service.id}>
                <article className={`tile ${tileTone(service)}`}>
                  <ServiceBackdrop service={service} />
                  <span className="tile-chip">{service.channel}</span>
                  <h3>{service.name}</h3>
                  <p>{service.summary}</p>
                  <p className="tile-hours">{service.hours}</p>
                  <a className="btn btn-sky" href={service.phoneHref}>
                    Llamar {service.phone}
                  </a>
                </article>
              </div>
            ))}
          </div>
        </section>

        <section className="info-block" id="rincon">
          <SectionTitle eyebrow="Rincón">Lo que se abre con el registro</SectionTitle>
          <div className="info-grid">
            {[
              { key: "diario", cls: "tile-mintleaf", icon: <JournalIcon />, title: "Diario", text: `Un lugar para escribir. El texto se queda en ${here}.` },
              { key: "distraccion", cls: "tile-butter", icon: <BubblesIcon />, title: "Distracción", text: "Una lectura corta, burbujas sin puntaje y música, si está conectada." },
              { key: "capsula", cls: "tile-lilac", icon: <CapsuleIcon />, title: "Cápsula", text: "Una nota para tu yo de después. Tú eliges el día en que se abre." },
            ].map((item, index) => (
              <div className="tile-float reveal" style={{ "--i": index } as CSSProperties} key={item.key}>
                <article className={`tile tile-feature ${item.cls}`} tabIndex={0}>
                  <span className="tile-orb" aria-hidden="true" />
                  <span className="tile-badge">{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              </div>
            ))}
          </div>
          <Link className="btn btn-sage btn-register" to="/entrar">
            Registrarse para usar el rincón
          </Link>
        </section>

        <section className="info-block" id="hablar">
          <SectionTitle eyebrow="Hablar">Qué pasa si llamas</SectionTitle>
          <p className="muted reveal">Puedes llamar sin cuenta. El registro solo añade una red de una o dos personas de tu confianza y una frase lista para WhatsApp.</p>
          <div className="info-grid">
            {services.map((service, index) => (
              <div className="tile-float reveal" style={{ "--i": index } as CSSProperties} key={service.id}>
                <article className={`tile tile-call ${tileTone(service)}`}>
                  <ServiceBackdrop service={service} />
                  <h3>{service.name}</h3>
                  <ul className="steps">
                    {service.whatHappens.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                  <p className="tile-script">Frase para leer: {service.script}</p>
                  <a className="btn btn-peach" href={service.phoneHref}>
                    Llamar {service.phone}
                  </a>
                </article>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="legal">Prototipo académico. No es un servicio de salud.</footer>
    </div>
  )
}
