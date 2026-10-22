import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { TRUST_MESSAGE, officialWhatsappHref, whatsappHref } from "@modules/bridge/whatsapp"
import { examplePoints, listServices, type ServiceCard } from "@modules/directory/catalog"
import { useOasis } from "../local-data/OasisProvider"
import { track } from "../shell/track"
import { OasisCard, type CardTone } from "../shell/OasisCard"
import { PageHead } from "../shell/PageHead"
import { CallIcon, ChatIcon, CopyGlyph, PhoneGlyph } from "../home/Icons"
import { CompanionChat } from "./CompanionChat"

const AVATARS = [
  ["#f3a283", "#c789c9"],
  ["#8fcdb0", "#7fb5dd"],
  ["#b394e0", "#f0a58a"],
  ["#f2b95f", "#e58b6d"],
  ["#84b8dd", "#b394e0"],
]

function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
  return letters || "·"
}

function toneOf(service: ServiceCard): CardTone {
  if (service.id === "yo-te-escucho") return "peach"
  return service.id === "linea-106" ? "sky" : "mint"
}

function prefersCalm(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Ventana de vista previa: cierra con Escape y deja el foco atrapado adentro. */
function PreviewModal({ name, phone, message, onMessage, onClose }: { name: string; phone: string; message: string; onMessage: (value: string) => void; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  const href = whatsappHref(phone, message)

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null
    const scroll = document.body.style.overflow
    document.body.style.overflow = "hidden"
    box.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    return () => {
      document.body.style.overflow = scroll
      before?.focus?.()
    }
  }, [])

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== "Tab" || !box.current) return
    const items = Array.from(box.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || !box.current.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (active === last || !box.current.contains(active))) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="modal talk-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
      onKeyDown={onKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div ref={box} className="talk-dialog-wrap">
        <OasisCard tone="peach" className="talk-dialog">
          <h2 className="oasis-title" id="preview-title">
            Escribirle a {name}
          </h2>
          <p className="muted">Oasis no envía el mensaje. Se abre WhatsApp para que lo edites y decidas.</p>
          <textarea aria-label="Mensaje para WhatsApp" value={message} onChange={(event) => onMessage(event.target.value)} />
          <div className="talk-actions">
            {href ? (
              <a className="line-btn line-btn--chat" href={href} target="_blank" rel="noopener noreferrer">
                <span className="line-btn-icon" aria-hidden="true">
                  <ChatIcon />
                </span>
                <span>Abrir WhatsApp</span>
              </a>
            ) : (
              <p>Ese número no arma un enlace de WhatsApp.</p>
            )}
            <button className="line-btn line-btn--soft" type="button" onClick={onClose}>
              <span>Volver</span>
            </button>
          </div>
        </OasisCard>
      </div>
    </div>
  )
}

export function Talk() {
  const { contacts, addContact, deleteContact, profile } = useOasis()
  const [chosen, setChosen] = useState<ServiceCard>(listServices()[0])
  const [draft, setDraft] = useState(TRUST_MESSAGE)
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [preview, setPreview] = useState<{ name: string; phone: string } | null>(null)
  const [round, setRound] = useState(0)
  const [leaving, setLeaving] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const featured = useRef<HTMLDivElement>(null)

  function pick(service: ServiceCard) {
    setChosen(service)
    setRound((value) => value + 1)
  }

  // La ficha elegida entra con animación (key) y la pantalla baja hasta ella.
  useEffect(() => {
    if (round === 0) return
    featured.current?.scrollIntoView({ behavior: prefersCalm() ? "auto" : "smooth", block: "start" })
  }, [round])

  const closeModal = useCallback(() => setPreview(null), [])

  async function copy() {
    let text = "Frase copiada ✓"
    try {
      await navigator.clipboard.writeText(chosen.script)
    } catch {
      text = "No pude copiar. Puedes seleccionar la frase y copiarla."
    }
    setToast({ id: Date.now(), text })
  }

  const toastId = toast?.id
  useEffect(() => {
    if (toastId === undefined) return
    const timer = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(timer)
  }, [toastId])

  function remove(id: number) {
    if (prefersCalm()) {
      void deleteContact(id)
      return
    }
    setLeaving((current) => new Set(current).add(id))
    window.setTimeout(() => {
      void deleteContact(id)
      setLeaving((current) => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
    }, 380)
  }

  return (
    <>
      <PageHead
        eyebrow="Hablar con alguien"
        title="Antes de llamar, puedes saber"
        accent="qué pasa."
        icon={<PhoneGlyph className="ph-phone" />}
        lede={
          profile.simpleLanguage
            ? "Miras el número, lees una frase y llamas si quieres."
            : "Esto no es una consulta. Te muestra el canal oficial, qué suele pasar al marcar y una frase por si te quedas en blanco."
        }
      />

      <div className="talk">
        <CompanionChat onService={pick} />

        <div ref={featured} className="talk-anchor">
          <article className="talk-feature-wrap" key={`${chosen.id}-${round}`} aria-labelledby="talk-feature-title">
            <OasisCard tone={toneOf(chosen)} index={0} className="talk-feature">
              <span className="talk-ring" aria-hidden="true" />
              <div className="talk-feature-body">
                <div className="talk-info">
                  <div className="line-top">
                    <span className="line-badge" aria-hidden="true">
                      <CallIcon />
                    </span>
                    <span className="oasis-chip">{chosen.channel}</span>
                  </div>
                  <h2 className="oasis-title talk-title" id="talk-feature-title">
                    {chosen.name}
                  </h2>
                  <p>{chosen.summary}</p>
                  <p className="line-hours">
                    <span className="live-dot" aria-hidden="true" />
                    {chosen.hours}
                  </p>
                  <p className="line-phone" aria-hidden="true">
                    {chosen.phone}
                  </p>
                  <h3 className="talk-sub">Qué pasa si llamo</h3>
                  <ol className="talk-steps">
                    {chosen.whatHappens.map((step, index) => (
                      <li key={step} style={{ "--k": index } as CSSProperties}>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="talk-side">
                  <h3 className="talk-sub">Una frase para leer</h3>
                  <blockquote className="talk-quote">
                    <p>{chosen.script}</p>
                  </blockquote>
                  <div className="talk-actions">
                    <a className="line-btn line-btn--call" href={chosen.phoneHref} onClick={() => track("call_click")}>
                      <PhoneGlyph />
                      <span>Llamar al {chosen.phone}</span>
                    </a>
                    {officialWhatsappHref(chosen) ? (
                      <a className="line-btn line-btn--chat" href={officialWhatsappHref(chosen) ?? undefined} target="_blank" rel="noopener noreferrer">
                        <span className="line-btn-icon" aria-hidden="true">
                          <ChatIcon />
                        </span>
                        <span>Abrir WhatsApp con el guion</span>
                      </a>
                    ) : null}
                    <button className="line-btn line-btn--soft" type="button" onClick={() => void copy()}>
                      <CopyGlyph />
                      <span>Copiar frase</span>
                    </button>
                  </div>
                  <p className="muted line-source">
                    {chosen.source}. Consultado el {chosen.sourceDate}.
                  </p>
                </div>
              </div>
            </OasisCard>
          </article>
        </div>

        <section aria-labelledby="talk-all" className="talk-services">
          <h2 className="oasis-title talk-heading" id="talk-all">
            Todos los canales
          </h2>
          <div className="talk-grid">
            {listServices().map((service, index) => {
              const active = service.id === chosen.id
              return (
                <div className="tile-float" key={service.id}>
                  <OasisCard as="article" tone={toneOf(service)} index={index + 2} className={active ? "svc-card is-active" : "svc-card"}>
                    <div className="line-top">
                      <span className="line-badge" aria-hidden="true">
                        <CallIcon />
                      </span>
                      {active ? <span className="svc-now">Viendo ahora</span> : null}
                    </div>
                    <h3 className="oasis-title svc-title">{service.name}</h3>
                    <p>
                      {service.phone} · {service.hours}
                    </p>
                    <button className="line-btn line-btn--soft svc-btn" type="button" aria-pressed={active} onClick={() => pick(service)}>
                      <span>{active ? "Esta es la ficha" : "Ver esta ficha"}</span>
                    </button>
                  </OasisCard>
                </div>
              )
            })}
          </div>
        </section>

        <OasisCard as="section" tone="butter" index={5} className="trust" aria-labelledby="trust-title">
          <h2 className="oasis-title talk-heading" id="trust-title">
            Red de confianza
          </h2>
          <p className="muted">Hasta dos personas. Antes de escribirles ves el mensaje. Oasis no lo envía solo.</p>
          <div className="trust-inputs">
            <input
              className="field talk-input"
              aria-label="Nombre"
              placeholder="Nombre"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
            />
            <input
              className="field talk-input"
              aria-label="Celular"
              placeholder="Celular"
              inputMode="tel"
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
            />
          </div>
          <button
            className="btn btn-lilac talk-go"
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
          {contacts.length > 0 ? (
            <div className="trust-list">
              {contacts.map((contact, index) => {
                const [from, to] = AVATARS[(contact.id ?? index) % AVATARS.length]
                const gone = contact.id !== undefined && leaving.has(contact.id)
                return (
                  <OasisCard as="article" tone="lilac" key={contact.id} className={gone ? "contact-card is-leaving" : "contact-card"}>
                    <span className="avatar" aria-hidden="true" style={{ "--a1": from, "--a2": to } as CSSProperties}>
                      {initials(contact.name)}
                    </span>
                    <div className="contact-text">
                      <h3>{contact.name}</h3>
                      <p>{contact.phone}</p>
                    </div>
                    <div className="contact-actions">
                      <button
                        className="line-btn line-btn--call"
                        type="button"
                        onClick={() => {
                          setDraft(TRUST_MESSAGE)
                          setPreview({ name: contact.name, phone: contact.phone })
                        }}
                      >
                        <span>Escribirle</span>
                      </button>
                      <button className="line-btn line-btn--soft" type="button" disabled={gone} onClick={() => contact.id && remove(contact.id)}>
                        <span>Quitar</span>
                      </button>
                    </div>
                  </OasisCard>
                )
              })}
            </div>
          ) : null}
        </OasisCard>

        <OasisCard as="section" tone="sky" className="quick-access" aria-labelledby="acceso-rapido">
          <h2 className="oasis-title talk-heading" id="acceso-rapido">
            Acceso rápido en esta página
          </h2>
          <p>
            Un chatbot de WhatsApp necesitaría un proveedor que este prototipo no opera. Este panel es el mismo atajo, dentro de Oasis: el directorio, un punto de ejemplo y el guion. El mensaje no se envía solo.
          </p>
          <ul className="talk-steps">
            {listServices().map((service) => (
              <li key={service.id}>
                <span>
                  {service.name}: {service.phone}
                  {service.whatsapp ? ". Tiene WhatsApp en el catálogo." : ". Sin WhatsApp en el catálogo."}
                </span>
              </li>
            ))}
          </ul>
          <p>
            Ejemplo cercano: {examplePoints[0]?.label}. {examplePoints[0]?.note}
          </p>
          <p className="line-script">Guion de {chosen.name}: {chosen.script}</p>
        </OasisCard>
      </div>

      {preview ? (
        <PreviewModal name={preview.name} phone={preview.phone} message={draft} onMessage={setDraft} onClose={closeModal} />
      ) : null}

      <div className="talk-toast-layer">
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {toast?.text ?? ""}
        </div>
        {toast ? (
          <div className="talk-toast" key={toast.id} aria-hidden="true">
            {toast.text}
          </div>
        ) : null}
      </div>
    </>
  )
}
