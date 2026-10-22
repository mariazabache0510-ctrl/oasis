import { useMemo, useState } from "react"
import { todayKey, toneLabel, type Tone } from "../local-data/db"
import { useOasis } from "../local-data/OasisProvider"
import { useDevice } from "../shell/device"

const tones: Tone[] = ["luminoso", "calma", "regular", "bajito", "pesado"]
const heights: Record<Tone, string> = {
  luminoso: "100%",
  calma: "78%",
  regular: "56%",
  bajito: "36%",
  pesado: "20%",
}
const reading = `La tarde en Villavicencio baja despacio. Si hoy no quieres resolver nada, puedes quedarte con esto: una ventana, un vaso de agua, el ruido de la calle un poco más lejos. No es una tarea. Es un rato.`

type Tab = "escribir" | "distraer" | "capsula" | "marca"

export function Corner() {
  const oasis = useOasis()
  const { here } = useDevice()
  const [tab, setTab] = useState<Tab>("escribir")
  const [note, setNote] = useState("")
  const [capsule, setCapsule] = useState("")
  const [openOn, setOpenOn] = useState(todayKey())
  const [bubbles, setBubbles] = useState(() => makeBubbles())
  const [music, setMusic] = useState<{ spotify: Playlist | null; youtube: Playlist | null }>({ spotify: null, youtube: null })
  const days = useMemo(() => lastDays(oasis.marks), [oasis.marks])

  function openMusic() {
    void Promise.all([
      fetch("/api/music/spotify").then((response) => response.json()),
      fetch("/api/music/youtube").then((response) => response.json()),
    ])
      .then(([spotify, youtube]) => setMusic({ spotify, youtube }))
      .catch(() => setMusic({ spotify: null, youtube: null }))
  }

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Mi rincón</p>
        <h1>Esto es tuyo.</h1>
        <p className="lede">Nadie del equipo lee lo que escribes. Vive en este navegador.</p>
      </section>
      <div className="tabs" role="tablist">
        {(
          [
            ["escribir", "Escribir"],
            ["distraer", "Distraerme"],
            ["capsula", "Cápsula"],
            ["marca", "Mi marca"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} className="btn btn-ghost" type="button" role="tab" aria-selected={tab === id} onClick={() => { setTab(id); if (id === "distraer") openMusic() }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "escribir" ? (
        <section className="panel">
          <h2>Una nota</h2>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Puedes soltarlo aquí." />
          <button
            className="btn btn-lilac"
            type="button"
            disabled={!note.trim()}
            onClick={() => {
              void oasis.addNote(note.trim())
              setNote("")
            }}
          >
            Guardar en {here}
          </button>
          {oasis.notes.map((item) => (
            <article className="card" key={item.id}>
              <p>{item.text}</p>
              <button className="btn btn-ghost" type="button" onClick={() => item.id && void oasis.deleteNote(item.id)}>
                Borrar
              </button>
            </article>
          ))}
        </section>
      ) : null}

      {tab === "distraer" ? (
        <section className="stack">
          <article className="panel">
            <h2>Un rato de lectura</h2>
            <p>{reading}</p>
          </article>
          <article className="panel">
            <h2>Burbujas</h2>
            <p className="muted">Sin puntaje. Si se acaban, sueltas otras.</p>
            <div className="bubbles">
              {bubbles.map((bubble) => (
                <button
                  key={bubble.id}
                  className="bubble"
                  type="button"
                  aria-label="Soltar burbuja"
                  style={{ left: bubble.left, top: bubble.top, width: bubble.size, height: bubble.size, background: bubble.color, animationDelay: bubble.delay }}
                  onClick={() => setBubbles((items) => items.filter((item) => item.id !== bubble.id))}
                />
              ))}
            </div>
            <button className="btn btn-sky" type="button" onClick={() => setBubbles(makeBubbles())}>
              Soltar otras
            </button>
          </article>
          <article className="panel">
            <h2>Playlist</h2>
            <Player title="Spotify" card={music.spotify} />
            <Player title="YouTube" card={music.youtube} />
            <p className="muted">Si el servidor todavía no tiene las llaves, esta puerta espera. Leer y las burbujas siguen aquí.</p>
          </article>
        </section>
      ) : null}

      {tab === "capsula" ? (
        <section className="panel">
          <h2>Para tu yo de después</h2>
          <textarea value={capsule} onChange={(event) => setCapsule(event.target.value)} placeholder="Algo que quieras leer más adelante." />
          <input className="field" type="date" value={openOn} min={todayKey()} onChange={(event) => setOpenOn(event.target.value)} />
          <button
            className="btn btn-butter"
            type="button"
            disabled={!capsule.trim()}
            onClick={() => {
              void oasis.addCapsule(capsule.trim(), openOn)
              setCapsule("")
            }}
          >
            Guardar cápsula
          </button>
          {oasis.capsules.map((item) => {
            const open = item.openOn <= todayKey()
            return (
              <article className="card" key={item.id}>
                <p>{open ? item.text : `Se abre el ${item.openOn}.`}</p>
                <button className="btn btn-ghost" type="button" onClick={() => item.id && void oasis.deleteCapsule(item.id)}>
                  Borrar
                </button>
              </article>
            )
          })}
        </section>
      ) : null}

      {tab === "marca" ? (
        <section className="panel">
          <h2>Tu registro</h2>
          <p>Esto es tu registro. No es una evaluación.</p>
          <div className="bars" aria-hidden="true">
            {days.map((day) => (
              <div key={day.day} className="bar" style={{ height: day.tone ? heights[day.tone] : "8%", background: day.tone ? "#e4d4f4" : "#f4ece1" }} title={day.tone ? toneLabel[day.tone] : "sin marca"} />
            ))}
          </div>
          <div className="row">
            {tones.map((tone) => (
              <button key={tone} className="choice" type="button" aria-pressed={oasis.todayMark?.tone === tone} onClick={() => void oasis.saveMark(tone)}>
                {toneLabel[tone]}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}

type Playlist = { available: boolean; name: string | null; embedUrl: string | null }

function Player({ title, card }: { title: string; card: Playlist | null }) {
  if (!card?.available || !card.embedUrl) return <p className="muted">{title} se conecta cuando el servidor tiene la playlist.</p>
  return (
    <div className="stack">
      <h3>{card.name || title}</h3>
      <iframe className="player" title={title} src={card.embedUrl} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" />
    </div>
  )
}

function makeBubbles() {
  const colors = ["#f6cdb6", "#e4d4f4", "#c9e4f5", "#f8e7b0", "#c9dcc8"]
  return colors.flatMap((color, index) => [
    { id: `${color}-a`, color, left: `${8 + index * 18}%`, top: `${20 + (index % 3) * 18}%`, size: 54 + index * 6, delay: `${index * 0.4}s` },
    { id: `${color}-b`, color, left: `${14 + index * 16}%`, top: `${48 + (index % 2) * 10}%`, size: 36, delay: `${index * 0.3}s` },
  ])
}

function lastDays(marks: { day: string; tone: Tone }[]) {
  const byDay = new Map(marks.map((mark) => [mark.day, mark.tone]))
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const key = `${date.getFullYear()}-${month}-${day}`
    return { day: key, tone: byDay.get(key) }
  })
}
