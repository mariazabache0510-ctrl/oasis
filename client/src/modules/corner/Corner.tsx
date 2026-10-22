import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { todayKey, toneLabel, type Tone } from "../local-data/db"
import { useOasis } from "../local-data/OasisProvider"
import { useDevice } from "../shell/device"
import { OasisCard } from "../shell/OasisCard"
import { PageHead } from "../shell/PageHead"
import { BubblesIcon, CapsuleIcon, JournalIcon, LockIcon, MarkIcon } from "../home/Icons"
import { CAPSULE_CHEER, Celebration, nextNoteCheer, type Cheer } from "./Celebration"
import { Listening } from "./Listening"
import { track } from "../shell/track"

const tones: Tone[] = ["luminoso", "calma", "regular", "bajito", "pesado"]
const heights: Record<Tone, string> = {
  luminoso: "100%",
  calma: "78%",
  regular: "56%",
  bajito: "36%",
  pesado: "20%",
}
const noteTones = ["butter", "peach", "mint", "sky", "lilac"] as const
const reading = `La tarde en Villavicencio baja despacio. Si hoy no quieres resolver nada, puedes quedarte con esto: una ventana, un vaso de agua, el ruido de la calle un poco más lejos. No es una tarea. Es un rato.`

type Tab = "escribir" | "distraer" | "capsula" | "marca"

const tabs: { id: Tab; label: string; icon: ReactElement }[] = [
  { id: "escribir", label: "Escribir", icon: <JournalIcon /> },
  { id: "distraer", label: "Distraerme", icon: <BubblesIcon /> },
  { id: "capsula", label: "Cápsula", icon: <CapsuleIcon /> },
  { id: "marca", label: "Mi marca", icon: <MarkIcon /> },
]

function stamp(time: number): string {
  const date = new Date(time)
  const day = date.toLocaleDateString("es-CO", { day: "numeric", month: "short" })
  const hour = date.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" })
  return `${day} · ${hour}`
}

function daysUntil(day: string): number {
  const [year, month, date] = day.split("-").map(Number)
  const target = new Date(year, month - 1, date).getTime()
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.max(0, Math.round((target - start) / 86_400_000))
}

function pieceFrom(value: string | null): Tab | null {
  if (value === "escribir" || value === "distraer" || value === "capsula" || value === "marca") return value
  return null
}

export function Corner() {
  const oasis = useOasis()
  const { here } = useDevice()
  const [params] = useSearchParams()
  const [tab, setTab] = useState<Tab>(() => pieceFrom(params.get("pieza")) ?? "escribir")
  const [note, setNote] = useState("")
  const [capsule, setCapsule] = useState("")
  const [openOn, setOpenOn] = useState(todayKey())
  const [bubbles, setBubbles] = useState(() => makeBubbles())
  const [music, setMusic] = useState<{ spotify: { available: boolean; name: string | null; embedUrl: string | null } | null; youtube: { available: boolean; name: string | null; embedUrl: string | null } | null }>({ spotify: null, youtube: null })
  const [cheer, setCheer] = useState<Cheer | null>(null)
  const days = useMemo(() => lastDays(oasis.marks), [oasis.marks])
  const tabIndex = tabs.findIndex((item) => item.id === tab)
  const closeCheer = useCallback(() => setCheer(null), [])
  // "plegando": la carta se dobla un momento mientras se guarda. Evita guardar dos veces seguidas.
  const [folding, setFolding] = useState<"note" | "capsule" | null>(null)
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  useEffect(() => {
    const next = pieceFrom(params.get("pieza"))
    if (next) setTab(next)
  }, [params])

  useEffect(() => {
    if (tab !== "distraer") return
    track("distraction")
    const controller = new AbortController()
    void Promise.all([
      fetch("/api/music/spotify", { signal: controller.signal }).then((response) => response.json()),
      fetch("/api/music/youtube", { signal: controller.signal }).then((response) => response.json()),
    ])
      .then(([spotify, youtube]) => setMusic({ spotify, youtube }))
      .catch(() => setMusic({ spotify: null, youtube: null }))
    return () => controller.abort()
  }, [tab])

  function celebrate(base: Omit<Cheer, "id">) {
    setCheer({ ...base, id: Date.now() })
  }

  /** Pliega el papel, borra el texto a mitad de la animación y lo vuelve a abrir. */
  function fold(kind: "note" | "capsule", clear: () => void) {
    setFolding(kind)
    timers.current.push(window.setTimeout(clear, 450), window.setTimeout(() => setFolding(null), 1050))
  }

  async function saveNote() {
    const text = note.trim()
    if (!text || folding) return
    await oasis.addNote(text)
    celebrate(nextNoteCheer())
    fold("note", () => setNote(""))
  }

  async function saveCapsule() {
    const text = capsule.trim()
    if (!text || folding) return
    await oasis.addCapsule(text, openOn)
    celebrate(CAPSULE_CHEER)
    fold("capsule", () => setCapsule(""))
  }

  return (
    <>
      <Celebration cheer={cheer} onDone={closeCheer} />

      <div className="corner">
      <PageHead
        featured
        underline
        eyebrow="Mi rincón"
        title="Esto es"
        accent="tuyo."
        lede={`Nadie del equipo lee lo que escribes. Vive en ${here}.`}
      />

      <div className="rtabs" role="tablist" aria-label="Secciones de mi rincón" style={{ "--n": tabs.length, "--at": tabIndex } as CSSProperties}>
        <span className="rtabs-pill" aria-hidden="true" />
        {tabs.map((item) => (
          <button
            key={item.id}
            className="rtab"
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls="rincon-panel"
            onClick={() => setTab(item.id)}
          >
            <span className="rtab-icon">{item.icon}</span>
            <span className="rtab-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="rpanel" id="rincon-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} key={tab}>
        {tab === "escribir" ? (
          <section className="rp-stack">
            <div className="tile-float">
              <OasisCard tone="lilac" className="rp-card">
                {folding === "note" ? <span className="rp-seal" aria-hidden="true" /> : null}
                <div className="rp-head">
                  <span className="tile-badge">
                    <JournalIcon />
                  </span>
                  <div>
                    <h2 className="oasis-title">Una nota</h2>
                    <p className="muted">Escribe lo que quieras. Nadie más lo ve.</p>
                  </div>
                </div>
                <textarea
                  className={folding === "note" ? "rp-area is-folding" : "rp-area"}
                  readOnly={folding === "note"}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Puedes soltarlo aquí."
                  aria-label="Tu nota"
                />
                <div className="rp-foot">
                  <span className="rp-count" aria-hidden="true">
                    {note.trim() ? `${note.trim().length} caracteres` : "Sin prisa"}
                  </span>
                  <button className="btn btn-lilac rp-save" type="button" disabled={!note.trim()} onClick={() => void saveNote()}>
                    Guardar en {here}
                  </button>
                </div>
              </OasisCard>
            </div>

            <div className="rp-list-head">
              <h2 className="oasis-title">Tus notas</h2>
              <span className="rp-pill">{oasis.notes.length}</span>
            </div>
            {oasis.notes.length === 0 ? (
              <div className="rp-empty">
                <span className="rp-empty-orb" aria-hidden="true" />
                <p>Aquí van a aparecer tus notas. La primera siempre es la más difícil, y también la que más se celebra.</p>
              </div>
            ) : (
              <div className="rp-grid">
                {oasis.notes.map((item, index) => (
                  <OasisCard as="article" tone={noteTones[index % noteTones.length]} index={Math.min(index, 6)} className="note-card" key={item.id}>
                    <p className="note-date">{stamp(item.createdAt)}</p>
                    <p className="note-text">{item.text}</p>
                    <button className="btn btn-ghost" type="button" onClick={() => item.id && void oasis.deleteNote(item.id)}>
                      Borrar
                    </button>
                  </OasisCard>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {tab === "distraer" ? (
          <>
          <section className="rp-grid rp-grid-3">
            <div className="tile-float">
              <OasisCard as="article" tone="butter" className="rp-card">
                <div className="rp-head">
                  <span className="tile-badge">
                    <JournalIcon />
                  </span>
                  <h2 className="oasis-title">Un rato de lectura</h2>
                </div>
                <p className="rp-reading">{reading}</p>
              </OasisCard>
            </div>
            <div className="tile-float" style={{ "--i": 1 } as CSSProperties}>
              <OasisCard as="article" tone="sky" index={1} className="rp-card">
                <div className="rp-head">
                  <span className="tile-badge">
                    <BubblesIcon />
                  </span>
                  <div>
                    <h2 className="oasis-title">Burbujas</h2>
                    <p className="muted">Sin puntaje. Si se acaban, sueltas otras.</p>
                  </div>
                </div>
                <div className="bubbles">
                  {bubbles.map((bubble) => (
                    <button
                      key={bubble.id}
                      className="bubble"
                      type="button"
                      aria-label="Soltar burbuja"
                      style={{ left: bubble.left, top: bubble.top, width: bubble.size, height: bubble.size, "--bubble": bubble.color, animationDelay: bubble.delay } as CSSProperties}
                      onClick={() => setBubbles((items) => items.filter((item) => item.id !== bubble.id))}
                    />
                  ))}
                  {bubbles.length === 0 ? <p className="bubbles-done">Todas sueltas. Respira y suelta otras cuando quieras.</p> : null}
                </div>
                <button className="btn btn-sky" type="button" onClick={() => setBubbles(makeBubbles())}>
                  Soltar otras
                </button>
              </OasisCard>
            </div>
            <div className="tile-float" style={{ "--i": 2 } as CSSProperties}>
              <OasisCard as="article" tone="mint" index={2} className="rp-card">
                <div className="rp-head">
                  <span className="tile-badge">
                    <BubblesIcon />
                  </span>
                  <div>
                    <h2 className="oasis-title">Escucha</h2>
                    <p className="muted">Sin evaluación. Si hay playlist, aparece aquí. Si no, suena un ejemplo.</p>
                  </div>
                </div>
                <Listening spotify={music.spotify} youtube={music.youtube} />
              </OasisCard>
            </div>
          </section>
          <p className="muted distraction-help">Si quieres hablar con alguien, la puerta sigue abierta. No hace falta para quedarte aquí.</p>
          <Link className="btn btn-ghost" to="/hablar">
            Hablar con alguien
          </Link>
          </>
        ) : null}

        {tab === "capsula" ? (
          <section className="rp-stack">
            <div className="tile-float">
              <OasisCard tone="peach" className="rp-card">
                {folding === "capsule" ? <span className="rp-seal" aria-hidden="true" /> : null}
                <div className="rp-head">
                  <span className="tile-badge">
                    <CapsuleIcon />
                  </span>
                  <div>
                    <h2 className="oasis-title">Para tu yo de después</h2>
                    <p className="muted">Escribe hoy, elige el día y se abre solo cuando llegue.</p>
                  </div>
                </div>
                <textarea
                  className={folding === "capsule" ? "rp-area is-folding" : "rp-area"}
                  readOnly={folding === "capsule"}
                  value={capsule}
                  onChange={(event) => setCapsule(event.target.value)}
                  placeholder="Algo que quieras leer más adelante."
                  aria-label="Tu cápsula"
                />
                <label className="rp-date">
                  <span>¿Cuándo se abre?</span>
                  <input className="field" type="date" value={openOn} min={todayKey()} onChange={(event) => setOpenOn(event.target.value)} />
                </label>
                <button className="btn btn-peach rp-save" type="button" disabled={!capsule.trim()} onClick={() => void saveCapsule()}>
                  Guardar cápsula
                </button>
              </OasisCard>
            </div>

            <div className="rp-list-head">
              <h2 className="oasis-title">Tus cápsulas</h2>
              <span className="rp-pill">{oasis.capsules.length}</span>
            </div>
            {oasis.capsules.length === 0 ? (
              <div className="rp-empty">
                <span className="rp-empty-orb" aria-hidden="true" />
                <p>Todavía no hay cápsulas. Deja un mensaje bonito para quien vas a ser más adelante.</p>
              </div>
            ) : (
              <div className="rp-grid">
                {oasis.capsules.map((item, index) => {
                  const open = item.openOn <= todayKey()
                  const left = daysUntil(item.openOn)
                  return (
                    <OasisCard as="article" tone={open ? "butter" : "lilac"} index={Math.min(index, 6)} className="capsule-card" key={item.id}>
                      <span className="tile-badge capsule-lock">
                        <LockIcon open={open} />
                      </span>
                      <p className="note-date">{open ? "Ya se abrió" : left === 1 ? "Se abre mañana" : `Se abre en ${left} días`}</p>
                      <p className="note-text">{open ? item.text : `Se abre el ${item.openOn}. Todavía no puedes leerla.`}</p>
                      <button className="btn btn-ghost" type="button" onClick={() => item.id && void oasis.deleteCapsule(item.id)}>
                        Borrar
                      </button>
                    </OasisCard>
                  )
                })}
              </div>
            )}
          </section>
        ) : null}

        {tab === "marca" ? (
          <section className="rp-stack">
            <div className="tile-float">
              <OasisCard tone="sky" className="rp-card">
                <div className="rp-head">
                  <span className="tile-badge">
                    <MarkIcon />
                  </span>
                  <div>
                    <h2 className="oasis-title">Tu registro</h2>
                    <p className="muted">Esto es tu registro. No es una evaluación.</p>
                  </div>
                </div>
                <div className="marks" aria-hidden="true">
                  {days.map((day, index) => (
                    <div className="marks-col" key={day.day} title={day.tone ? toneLabel[day.tone] : "sin marca"}>
                      <div className="marks-track">
                        <div
                          className="marks-bar"
                          data-tone={day.tone ?? "none"}
                          style={{ height: day.tone ? heights[day.tone] : "8%", "--k": index } as CSSProperties}
                        />
                      </div>
                      <span className={day.day === todayKey() ? "marks-day is-today" : "marks-day"}>{day.label}</span>
                    </div>
                  ))}
                </div>
                <p className="muted rp-mark-title">¿Cómo vas hoy?</p>
                <div className="mood-row">
                  {tones.map((tone, index) => (
                    <button
                      key={tone}
                      className="mood"
                      data-tone={tone}
                      style={{ "--k": index } as CSSProperties}
                      type="button"
                      aria-pressed={oasis.todayMark?.tone === tone}
                      onClick={() => void oasis.saveMark(tone)}
                    >
                      {toneLabel[tone]}
                    </button>
                  ))}
                </div>
              </OasisCard>
            </div>
          </section>
        ) : null}
      </div>
      </div>
    </>
  )
}

function makeBubbles() {
  const colors = ["#f6cdb6", "#e4d4f4", "#c9e4f5", "#f8e7b0", "#c9dcc8"]
  return colors.flatMap((color, index) => [
    { id: `${color}-a`, color, left: `${8 + index * 16}%`, top: `${14 + (index % 3) * 20}%`, size: 54 + index * 6, delay: `${index * 0.4}s` },
    { id: `${color}-b`, color, left: `${14 + index * 15}%`, top: `${54 + (index % 2) * 12}%`, size: 36, delay: `${index * 0.3}s` },
  ])
}

const DAY_LETTERS = ["D", "L", "M", "M", "J", "V", "S"]

function lastDays(marks: { day: string; tone: Tone }[]) {
  const byDay = new Map(marks.map((mark) => [mark.day, mark.tone]))
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const key = `${date.getFullYear()}-${month}-${day}`
    return { day: key, tone: byDay.get(key), label: DAY_LETTERS[date.getDay()] }
  })
}
