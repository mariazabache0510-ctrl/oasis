import { Link } from "react-router-dom"
import { listServices, SOURCE, SOURCE_DATE } from "@modules/directory/catalog"
import { MoodPanel } from "../home/MoodPanel"

const doors = [
  { href: "#cerca", index: "01", title: "Qué hay cerca", text: "Líneas oficiales, con fuente y fecha, y planes de esta semana.", tone: "door-sky" },
  { href: "#rincon", index: "02", title: "Mi rincón", text: "Escribir, distraerte o dejarle una nota a tu yo de después.", tone: "door-lilac" },
  { href: "#hablar", index: "03", title: "Hablar con alguien", text: "Qué va a pasar, una frase para leer y el número.", tone: "door-peach" },
]

export function Landing() {
  const services = listServices()

  return (
    <div className="landing">
      <a className="skip" href="#contenido">Saltar al contenido</a>
      <header className="topbar landing-bar">
        <a className="brand" href="#inicio">Oasis</a>
        <nav className="top-links" aria-label="En esta página">
          <a href="#inicio">Inicio</a>
          <a href="#cerca">Cerca</a>
          <a href="#rincon">Rincón</a>
          <a href="#hablar">Hablar</a>
        </nav>
        <Link className="btn btn-peach register-cta" to="/entrar">
          Registrarse
        </Link>
      </header>
      <main id="contenido">
        <section className="hero" id="inicio">
          <p className="eyebrow">Un espacio tuyo</p>
          <h1>Qué bueno verte.</h1>
          <p className="lede">
            Si no sabes a quién llamar en Villavicencio, aquí está el dato oficial. Puedes leerlo sin cuenta.
            Al registrarte se abren las secciones y lo que escribes sigue solo en este celular.
          </p>
        </section>

        <MoodPanel offerHref="#hablar" />

        <section className="doors" aria-label="Puertas">
          {doors.map((door) => (
            <a key={door.href} className={`door ${door.tone}`} href={door.href}>
              <small>{door.index}</small>
              <h2>{door.title}</h2>
              <p>{door.text}</p>
            </a>
          ))}
        </section>

        <section className="panel info-block" id="cerca">
          <p className="eyebrow">Qué hay cerca</p>
          <h2>Líneas oficiales</h2>
          <p className="muted">Fuente: {SOURCE}. Consultado el {SOURCE_DATE}. Son teléfonos, no puntos inventados en el mapa.</p>
          <div className="info-grid">
            {services.map((service) => (
              <article key={service.id} className="card">
                <h3>{service.name}</h3>
                <p>{service.summary}</p>
                <p className="muted">{service.channel} · {service.hours}</p>
                <a className="btn btn-sky" href={service.phoneHref}>{service.phone}</a>
              </article>
            ))}
          </div>
        </section>

        <section className="panel info-block" id="rincon">
          <p className="eyebrow">Mi rincón</p>
          <h2>Un lugar para quedarte un momento</h2>
          <p>Escribir, distraerte con una lectura o con burbujas, escuchar una lista y dejarle una nota a tu yo de después.</p>
          <p className="muted">Esas piezas se guardan en este celular cuando entras. Desde aquí puedes conocerlas. Al registrarte quedan en sus secciones.</p>
        </section>

        <section className="panel info-block" id="hablar">
          <p className="eyebrow">Hablar con alguien</p>
          <h2>Si llamas, sabes qué va a pasar</h2>
          <ol className="steps">
            {services[0]?.whatHappens.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <p className="muted">Al entrar puedes leer una frase, ver el número y escribirle a una o dos personas de tu confianza. El mensaje no se envía solo.</p>
        </section>
      </main>
      <footer className="legal">Prototipo académico. No es un servicio de salud.</footer>
    </div>
  )
}
