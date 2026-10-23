import { useEffect, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { activityCategories, eventTypes, type ActivityCategory, type EventType } from "@modules/events/catalog"
import { aggregateKpis, syntheticKpiEvents, type KpiSummary } from "@modules/metrics/aggregate"
import { toneLabel, type Tone } from "../local-data/db"
import { useOasis } from "../local-data/OasisProvider"
import { OasisCard } from "../shell/OasisCard"
import { PhoneContextNav } from "../shell/menus"

const tones: Tone[] = ["luminoso", "calma", "regular", "bajito", "pesado"]

type SeedPayload = { source: string; kpis: KpiSummary; note: string }
type LivePayload = { source: string; kpis: KpiSummary | null; note: string }

const localSeed: SeedPayload = {
  source: "sintetica",
  kpis: aggregateKpis(syntheticKpiEvents),
  note: "Semilla compilada en la aplicación. El servidor no respondió. No identifica a nadie.",
}

function todayInput(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

function Board({ title, payload }: { title: string; payload: { kpis: KpiSummary | null; note: string; source: string } }) {
  if (!payload.kpis) {
    return (
      <OasisCard tone="peach">
        <h2 className="oasis-title">{title}</h2>
        <p>{payload.note}</p>
      </OasisCard>
    )
  }
  const maxMood = Math.max(...tones.map((tone) => payload.kpis?.moodByTone[tone] ?? 0), 1)
  return (
    <OasisCard tone="sky">
      <p className="eyebrow eyebrow-pill">{payload.source === "postgres" ? "Base anónima" : "Semilla sintética"}</p>
      <h2 className="oasis-title">{title}</h2>
      <ul className="sala-kpis">
        <li>
          <b>{payload.kpis.visits}</b>
          <span>visitas al inicio</span>
        </li>
        <li>
          <b>{payload.kpis.helpUses}</b>
          <span>usos del botón de ayuda</span>
        </li>
        <li>
          <b>{payload.kpis.distractionUses}</b>
          <span>usos de distracción</span>
        </li>
        <li>
          <b>{payload.kpis.agendaOpens}</b>
          <span>aperturas de la agenda</span>
        </li>
      </ul>
      <div className="mood-meter" aria-label="Marcas por tono, sin nombres">
        {tones.map((tone) => (
          <div key={tone}>
            <span>{toneLabel[tone]}</span>
            <i style={{ width: `${Math.max(8, ((payload.kpis?.moodByTone[tone] ?? 0) / maxMood) * 100)}%` }} />
            <span>{payload.kpis?.moodByTone[tone] ?? 0}</span>
          </div>
        ))}
      </div>
      <p className="muted">{payload.note}</p>
    </OasisCard>
  )
}

export function Sala() {
  const { profile, setTheme } = useOasis()
  const [seed, setSeed] = useState<SeedPayload>(localSeed)
  const [token, setToken] = useState(() => sessionStorage.getItem("oasis-sala") ?? "")
  const [password, setPassword] = useState("")
  const [gate, setGate] = useState("")
  const [live, setLive] = useState<LivePayload | null>(null)
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [organizer, setOrganizer] = useState("Colegio")
  const [place, setPlace] = useState("Patio de ejemplo")
  const [category, setCategory] = useState<ActivityCategory>("bienestar")
  const [type, setType] = useState<EventType>("organizacion")
  const [date, setDate] = useState(todayInput)
  const [time, setTime] = useState("15:00")
  const [publishNote, setPublishNote] = useState("")

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/metrics/semilla", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: SeedPayload | null) => {
        if (payload?.kpis) setSeed(payload)
      })
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

  async function loadLive(current: string) {
    const response = await fetch("/api/admin/resumen", { headers: { authorization: `Bearer ${current}` } })
    const payload = (await response.json()) as LivePayload
    setLive(payload)
  }

  useEffect(() => {
    if (!token) return
    void loadLive(token).catch(() => setLive({ source: "no-disponible", kpis: null, note: "No se pudo leer la base." }))
  }, [token])

  async function enter(event: FormEvent) {
    event.preventDefault()
    setGate("")
    const response = await fetch("/api/admin/entrar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    })
    const payload = (await response.json()) as { ok?: boolean; token?: string; error?: string }
    setPassword("")
    if (!response.ok || !payload.token) {
      setGate(payload.error || "No se pudo entrar.")
      return
    }
    sessionStorage.setItem("oasis-sala", payload.token)
    setToken(payload.token)
    setGate("Entraste a la sala. Solo verás conteos anónimos.")
  }

  async function publish(event: FormEvent) {
    event.preventDefault()
    setPublishNote("")
    const response = await fetch("/api/admin/actividades", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, summary, organizer, place, category, type, date, time, minutes: 60 }),
    })
    const payload = (await response.json()) as { ok?: boolean; error?: string; event?: { title: string } }
    if (!response.ok || !payload.ok) {
      setPublishNote(payload.error || "No se publicó.")
      return
    }
    setTitle("")
    setSummary("")
    setPublishNote(`${payload.event?.title ?? "La actividad"} quedó en la agenda como ejemplo. Este formulario no puede marcarla como real.`)
  }

  return (
    <div className="sala">
      <PhoneContextNav />
      <a className="skip" href="#sala-contenido">
        Saltar al contenido
      </a>
      <header className="sala-top">
        <p className="eyebrow eyebrow-pill">Canal de un colegio o una comunidad</p>
        <h1 className="oasis-title sala-title">Sala de ejemplo</h1>
        <p>
          Esto no es el espacio personal. No muestra diarios, nombres, correos ni un perfil clínico. Oasis no diagnostica. La idea de una ficha oculta por persona queda fuera de este prototipo.
        </p>
        <div className="sala-links">
          <Link className="btn btn-ghost" to="/">
            Volver a la puerta
          </Link>
          <button className="btn btn-ghost" type="button" aria-pressed={profile.theme === "noche"} onClick={() => void setTheme(profile.theme === "noche" ? "dia" : "noche")}>
            {profile.theme === "noche" ? "Día" : "Noche"}
          </button>
        </div>
      </header>
      <div id="sala-contenido" className="sala-grid">
        <Board title="Cifras de la semilla" payload={seed} />
        {live ? <Board title="Cifras de la base" payload={live} /> : null}
        <OasisCard as="form" tone="butter" onSubmit={(event: FormEvent) => void enter(event)}>
          <h2 className="oasis-title">Entrar a la sala</h2>
          <p className="muted">La clave sale de ADMIN_PASSWORD en el servidor. No está en el código y no abre datos de una persona.</p>
          <label>
            <span className="sr-only">Clave de la sala</span>
            <input className="field" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Clave de la sala" />
          </label>
          <button className="btn btn-butter" type="submit">
            Entrar
          </button>
          {gate ? <p role="status">{gate}</p> : null}
        </OasisCard>
        {token ? (
          <OasisCard as="form" tone="mint" onSubmit={(event: FormEvent) => void publish(event)}>
            <h2 className="oasis-title">Publicar una actividad de ejemplo</h2>
            <p className="muted">El mismo canal que usaría un colegio. Queda con la marca Ejemplo hasta que una persona verificadora la confirme fuera de este formulario.</p>
            <label>
              Título
              <input className="field" value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label>
              Resumen
              <textarea value={summary} onChange={(event) => setSummary(event.target.value)} />
            </label>
            <label>
              Quién organiza
              <input className="field" value={organizer} onChange={(event) => setOrganizer(event.target.value)} />
            </label>
            <label>
              Lugar
              <input className="field" value={place} onChange={(event) => setPlace(event.target.value)} />
            </label>
            <label>
              Categoría
              <select className="field" value={category} onChange={(event) => setCategory(event.target.value as ActivityCategory)}>
                {activityCategories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tipo de organizador
              <select className="field" value={type} onChange={(event) => setType(event.target.value as EventType)}>
                {eventTypes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fecha
              <input className="field" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
            <label>
              Hora
              <input className="field" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </label>
            <button className="btn btn-sage" type="submit">
              Publicar como ejemplo
            </button>
            {publishNote ? <p role="status">{publishNote}</p> : null}
          </OasisCard>
        ) : null}
      </div>
    </div>
  )
}
