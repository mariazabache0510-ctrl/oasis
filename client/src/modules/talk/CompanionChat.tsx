import { useEffect, useRef, useState } from "react"
import { getService, type ServiceCard } from "@modules/directory/catalog"
import { localCompanionReply, type CompanionReply } from "@modules/companion/local"
import { defaultCompanion, type ChatLine } from "../local-data/db"
import { useOasis } from "../local-data/OasisProvider"
import { useVoice } from "../voice/VoiceProvider"
import { CompanionFace } from "./CompanionFace"

type Props = { onService?: (service: ServiceCard) => void }

export function CompanionChat({ onService }: Props) {
  const { profile, messages, addMessage } = useOasis()
  const voice = useVoice()
  const companion = { ...defaultCompanion, ...profile.companion }
  const [draft, setDraft] = useState("")
  const [pending, setPending] = useState(false)
  const [dictating, setDictating] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" })
  }, [messages.length, pending])

  const messagesRef = useRef(messages)
  messagesRef.current = messages
  useEffect(() => {
    voice.setBridge({
      focusChat: () => box.current?.focus(),
      explain: () => {
        const last = [...messagesRef.current].reverse().find((message) => message.serviceId)
        const service = last?.serviceId ? getService(last.serviceId) : undefined
        if (!service) return "Puedes escribirle a tu compañero. Si pides ayuda, aparece el canal oficial con fuente y fecha."
        return `${service.name}. ${service.summary} Fuente: ${service.source}, consultado el ${service.sourceDate}.`
      },
    })
    return () => voice.setBridge({})
  }, [voice.setBridge])

  async function send(text: string) {
    const message = text.trim()
    if (!message || pending) return
    setDraft("")
    setPending(true)
    const person: ChatLine = { role: "person", text: message, createdAt: Date.now() }
    await addMessage(person)
    const history = messages.slice(-8).map((turn) => ({ role: turn.role, text: turn.text }))
    let reply: CompanionReply
    try {
      const response = await fetch("/api/companion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message,
          companionName: companion.name,
          note: companion.note,
          history,
        }),
      })
      if (!response.ok) throw new Error("fallback")
      reply = (await response.json()) as CompanionReply
      if (!reply?.reply) throw new Error("fallback")
    } catch {
      reply = localCompanionReply(message, companion.name)
    }
    if (reply.service) onService?.(reply.service)
    await addMessage({
      role: "companion",
      text: reply.reply,
      createdAt: Date.now(),
      serviceId: reply.service?.id,
    })
    setPending(false)
  }

  function dictate() {
    if (dictating) return
    setDictating(true)
    voice.dictate((text) => {
      setDraft((current) => (current ? `${current} ${text}` : text))
      setDictating(false)
      box.current?.focus()
    })
    window.setTimeout(() => setDictating(false), 12000)
  }

  return (
    <section className="companion-chat" aria-labelledby="companion-chat-title">
      <header className="companion-chat-head">
        <CompanionFace look={companion.look} />
        <div>
          <h2 id="companion-chat-title">{companion.name || "Loto"}</h2>
          <p>No soy un profesional. No diagnostico ni recomiendo tratamientos.</p>
        </div>
      </header>
      <div className="companion-log" ref={scroller} aria-live="polite">
        {messages.length === 0 ? <p className="muted">Escríbeme o dicta. Si preguntas por ayuda, dejo el canal oficial aquí mismo.</p> : null}
        {messages.map((message) => {
          const service = message.serviceId ? getService(message.serviceId) : undefined
          return (
            <article key={message.id ?? message.createdAt} className={message.role === "person" ? "bubble bubble-person" : "bubble bubble-companion"}>
              <p>{message.text}</p>
              {service ? <ServiceSlip service={service} /> : null}
            </article>
          )
        })}
        {pending ? <p className="muted">Estoy aquí…</p> : null}
      </div>
      <form
        className="companion-compose"
        onSubmit={(event) => {
          event.preventDefault()
          void send(draft)
        }}
      >
        <label className="sr-only" htmlFor="companion-input">Mensaje para {companion.name || "tu compañero"}</label>
        <textarea
          id="companion-input"
          ref={box}
          rows={2}
          maxLength={400}
          value={draft}
          placeholder={`Escríbele a ${companion.name || "Loto"}`}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              void send(draft)
            }
          }}
        />
        <div className="companion-compose-actions">
          <button className="btn btn-ghost" type="button" onClick={dictate} disabled={!voice.supported || dictating}>
            {voice.supported ? (dictating ? "Escuchando…" : "Dictar") : "Sin dictado en este navegador"}
          </button>
          <button className="btn btn-sage" type="submit" disabled={pending || !draft.trim()}>
            Enviar
          </button>
        </div>
      </form>
    </section>
  )
}

function ServiceSlip({ service }: { service: ServiceCard }) {
  return (
    <div className="chat-card">
      <p className="chat-card-name">{service.name}</p>
      <p>{service.summary}</p>
      <p>{service.phone} · {service.hours}</p>
      <p className="muted">{service.source}. Consultado el {service.sourceDate}.</p>
      <a className="btn btn-peach" href={service.phoneHref}>Llamar al {service.phone}</a>
    </div>
  )
}
