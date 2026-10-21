import { useState } from "react"
import { listServices, type ServiceCard } from "@modules/directory/catalog"
import { orient } from "@modules/orientador/match"
import { useOasis } from "../local-data/OasisProvider"
import { track } from "../shell/track"

export function Talk() {
  const { contacts, addContact, deleteContact, profile } = useOasis()
  const [question, setQuestion] = useState("")
  const [chosen, setChosen] = useState<ServiceCard>(listServices()[0])
  const [intro, setIntro] = useState<string | null>(null)
  const [limit, setLimit] = useState(orient("").limit)
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [preview, setPreview] = useState<{ name: string; phone: string } | null>(null)
  const message = "Hola. Soy yo. Quería escribirte. Yo elegí enviarte este mensaje."

  async function ask(event: React.FormEvent) {
    event.preventDefault()
    const local = orient(question)
    try {
      const response = await fetch("/api/orientador", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      })
      if (!response.ok) throw new Error("offline")
      const payload = (await response.json()) as { service: ServiceCard; limit: string; intro: string | null }
      setChosen(payload.service)
      setLimit(payload.limit)
      setIntro(payload.intro)
    } catch {
      setChosen(local.service)
      setLimit(local.limit)
      setIntro(null)
    }
  }

  function whatsapp(phone: string, text: string) {
    const digits = phone.replace(/\D/g, "")
    const withCountry = digits.startsWith("57") ? digits : `57${digits}`
    window.open(`https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`, "_blank", "noopener")
  }

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Hablar con alguien</p>
        <h1>Antes de llamar, puedes saber qué pasa.</h1>
        <p className="lede">
          {profile.simpleLanguage
            ? "Miras el número, lees una frase y llamas si quieres."
            : "Esto no es una consulta. Te muestra el canal oficial, qué suele pasar al marcar y una frase por si te quedas en blanco."}
        </p>
      </section>

      <form className="panel" onSubmit={(event) => void ask(event)}>
        <label className="stack">
          <span>¿Qué quieres saber antes de llamar?</span>
          <input className="field" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Por ejemplo: estoy en Villavicencio" />
        </label>
        <button className="btn btn-sage" type="submit">Ver un canal</button>
        {intro ? <p>{intro}</p> : null}
        <p className="muted">{limit}</p>
      </form>

      <article className="card">
        <h2>{chosen.name}</h2>
        <p>{chosen.summary}</p>
        <p>{chosen.channel} · {chosen.hours}</p>
        <h3>Qué pasa si llamo</h3>
        <ul>
          {chosen.whatHappens.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
        <h3>Una frase para leer</h3>
        <p>{chosen.script}</p>
        <div className="row">
          <a className="btn btn-peach" href={chosen.phoneHref} onClick={() => track("call_click")}>
            Llamar al {chosen.phone}
          </a>
          {chosen.whatsapp ? (
            <button className="btn btn-sage" type="button" onClick={() => whatsapp(chosen.whatsapp!, chosen.script)}>
              Abrir WhatsApp
            </button>
          ) : null}
          <button className="btn btn-ghost" type="button" onClick={() => void navigator.clipboard.writeText(chosen.script)}>
            Copiar frase
          </button>
        </div>
        <p className="muted">{chosen.source}. Consultado el {chosen.sourceDate}.</p>
      </article>

      <section className="stack">
        {listServices().filter((service) => service.id !== chosen.id).map((service) => (
          <article className="card" key={service.id}>
            <h2>{service.name}</h2>
            <p>{service.phone} · {service.hours}</p>
            <button className="btn btn-ghost" type="button" onClick={() => setChosen(service)}>Ver esta ficha</button>
          </article>
        ))}
      </section>

      <section className="panel">
        <h2>Red de confianza</h2>
        <p className="muted">Hasta dos personas. Antes de escribirles ves el mensaje. Oasis no lo envía solo.</p>
        <div className="row">
          <input className="field" placeholder="Nombre" value={contactName} onChange={(event) => setContactName(event.target.value)} />
          <input className="field" placeholder="Celular" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} />
        </div>
        <button
          className="btn btn-lilac"
          type="button"
          disabled={contacts.length >= 2 || !contactName.trim() || contactPhone.replace(/\D/g, "").length < 7}
          onClick={() => {
            void addContact(contactName.trim(), contactPhone.trim())
            setContactName("")
            setContactPhone("")
          }}
        >
          Agregar contacto
        </button>
        {contacts.map((contact) => (
          <article className="card" key={contact.id}>
            <h3>{contact.name}</h3>
            <p>{contact.phone}</p>
            <div className="row">
              <button className="btn btn-peach" type="button" onClick={() => setPreview({ name: contact.name, phone: contact.phone })}>
                Ver mensaje
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => contact.id && void deleteContact(contact.id)}>
                Quitar
              </button>
            </div>
          </article>
        ))}
      </section>

      {preview ? (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="preview-title">
          <div className="card">
            <h2 id="preview-title">{preview.name} recibiría esto</h2>
            <p>{message}</p>
            <div className="row">
              <button className="btn btn-peach" type="button" onClick={() => { whatsapp(preview.phone, message); setPreview(null) }}>
                Enviar por WhatsApp
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setPreview(null)}>
                Volver
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
