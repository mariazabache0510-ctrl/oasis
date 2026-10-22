import { randomBytes } from "node:crypto"
import { Pool } from "pg"
import { asExampleActivity, dayKey, mondayOf, type ActivityDraft, type WellnessEvent } from "../events/catalog.js"
import { aggregateKpis, syntheticKpiEvents, toKpi, type KpiSummary } from "./aggregate.js"

export type OpsMode = "sin-configurar" | "postgres" | "no-disponible"

let pool: Pool | null = null
let state: "idle" | "ready" | "down" = "idle"
let pending: Promise<boolean> | null = null
let downUntil = 0
let warned = false

export function databaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim()
  return url || undefined
}

export async function opsModeLive(): Promise<OpsMode> {
  if (!databaseUrl()) return "sin-configurar"
  return (await ensureOps()) ? "postgres" : "no-disponible"
}

export async function ensureOps(): Promise<boolean> {
  if (!databaseUrl()) return false
  if (state === "ready" && pool) return true
  if (Date.now() < downUntil) return false
  if (!pending) {
    pending = connect().finally(() => {
      pending = null
    })
  }
  return pending
}

async function connect(): Promise<boolean> {
  const url = databaseUrl()
  if (!url) return false
  const next = new Pool({ connectionString: url, max: 3, connectionTimeoutMillis: 1500 })
  next.on("error", () => {
    state = "down"
    downUntil = Date.now() + 15_000
  })
  try {
    await next.query("SELECT 1")
    await migrate(next)
    await seed(next)
    if (pool && pool !== next) await pool.end().catch(() => undefined)
    pool = next
    state = "ready"
    return true
  } catch {
    state = "down"
    downUntil = Date.now() + 15_000
    await next.end().catch(() => undefined)
    if (!warned) {
      warned = true
      console.warn("Oasis: Postgres no disponible. La experiencia local sigue en el navegador.")
    }
    return false
  }
}

async function migrate(target: Pool): Promise<void> {
  await target.query(`
    CREATE TABLE IF NOT EXISTS kpi_events (
      id bigserial PRIMARY KEY,
      kind text NOT NULL CHECK (kind IN ('visit', 'mood', 'help', 'distraction', 'agenda')),
      tone text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `)
  await target.query(`
    CREATE TABLE IF NOT EXISTS published_activities (
      id text PRIMARY KEY,
      title text NOT NULL,
      summary text NOT NULL,
      organizer text NOT NULL,
      type text NOT NULL,
      category text NOT NULL,
      date text NOT NULL,
      time text NOT NULL,
      minutes integer NOT NULL,
      place text NOT NULL,
      free boolean NOT NULL DEFAULT true,
      sample boolean NOT NULL DEFAULT true,
      source_url text,
      verified_at text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `)
}

function seedDrafts(): ActivityDraft[] {
  const monday = mondayOf(new Date())
  const on = (offset: number) => dayKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset))
  return [
    {
      title: "Tarde de juegos en el patio",
      summary: "Juegos de mesa sin puntaje, publicados por el canal de un colegio.",
      organizer: "Colegio de ejemplo",
      type: "organizacion",
      category: "ludica",
      date: on(1),
      time: "16:00",
      minutes: 90,
      place: "Patio de ejemplo",
    },
    {
      title: "Círculo de respiración",
      summary: "Un rato sentados, sin evaluación.",
      organizer: "Bienestar escolar (ejemplo)",
      type: "organizacion",
      category: "bienestar",
      date: on(3),
      time: "10:00",
      minutes: 45,
      place: "Aula de ejemplo",
    },
    {
      title: "Lectura en voz baja",
      summary: "Alguien lee un cuento corto. Se puede solo escuchar.",
      organizer: "Biblioteca de ejemplo",
      type: "casa-cultura",
      category: "distraccion",
      date: on(4),
      time: "15:30",
      minutes: 40,
      place: "Sala de ejemplo",
    },
  ]
}

async function seed(target: Pool): Promise<void> {
  const kpis = await target.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM kpi_events")
  if (kpis.rows[0]?.count === "0") {
    const values = syntheticKpiEvents.map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`).join(", ")
    const params = syntheticKpiEvents.flatMap((event) => [event.kind, event.tone])
    await target.query(`INSERT INTO kpi_events (kind, tone) VALUES ${values}`, params)
  }
  const activities = await target.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM published_activities")
  if (activities.rows[0]?.count !== "0") return
  const ids = ["semilla-juegos", "semilla-respiracion", "semilla-lectura"]
  for (const [index, draft] of seedDrafts().entries()) {
    const built = asExampleActivity(draft, ids[index] ?? `semilla-${index}`)
    if (!built.ok) continue
    await insertActivity(target, built.event)
  }
}

async function insertActivity(target: Pool, event: WellnessEvent): Promise<void> {
  await target.query(
    `INSERT INTO published_activities
      (id, title, summary, organizer, type, category, date, time, minutes, place, free, sample, source_url, verified_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     ON CONFLICT (id) DO NOTHING`,
    [
      event.id,
      event.title,
      event.summary,
      event.organizer,
      event.type,
      event.category,
      event.date,
      event.time,
      event.minutes,
      event.place,
      event.free,
      event.sample,
      event.sourceUrl,
      event.verifiedAt,
    ],
  )
}

type ActivityRow = {
  id: string
  title: string
  summary: string
  organizer: string
  type: WellnessEvent["type"]
  category: WellnessEvent["category"]
  date: string
  time: string
  minutes: number
  place: string
  free: boolean
  sample: boolean
  source_url: string | null
  verified_at: string | null
}

function fromRow(row: ActivityRow): WellnessEvent {
  const confirmed = row.sample === false && Boolean(row.source_url) && Boolean(row.verified_at)
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    organizer: row.organizer,
    type: row.type,
    category: row.category,
    date: row.date,
    time: row.time,
    minutes: Number(row.minutes),
    place: row.place,
    free: row.free,
    sample: !confirmed,
    sourceUrl: confirmed ? row.source_url : null,
    verifiedAt: confirmed ? row.verified_at : null,
  }
}

export async function listPublished(): Promise<WellnessEvent[]> {
  const ready = await ensureOps()
  if (!ready || !pool) return []
  try {
    const result = await pool.query<ActivityRow>(
      `SELECT id, title, summary, organizer, type, category, date, time, minutes, place, free, sample, source_url, verified_at
       FROM published_activities`,
    )
    return result.rows.map(fromRow)
  } catch {
    return []
  }
}

export async function recordKpi(kind: string, tone: string | null): Promise<void> {
  const event = toKpi(kind, tone)
  if (!event) return
  const ready = await ensureOps()
  if (!ready || !pool) return
  try {
    await pool.query("INSERT INTO kpi_events (kind, tone) VALUES ($1, $2)", [event.kind, event.tone])
  } catch {
    state = "down"
    downUntil = Date.now() + 15_000
  }
}

export async function readSummary(): Promise<{ source: "postgres"; kpis: KpiSummary } | { source: "no-disponible"; kpis: null }> {
  const ready = await ensureOps()
  if (!ready || !pool) return { source: "no-disponible", kpis: null }
  try {
    const result = await pool.query<{ kind: string; tone: string | null }>("SELECT kind, tone FROM kpi_events")
    const events = result.rows.flatMap((row) => {
      const event = toKpi(row.kind, row.tone)
      return event ? [event] : []
    })
    return { source: "postgres", kpis: aggregateKpis(events) }
  } catch {
    return { source: "no-disponible", kpis: null }
  }
}

export async function publishActivity(
  input: unknown,
): Promise<{ ok: true; event: WellnessEvent } | { ok: false; error: string; status: 400 | 503 }> {
  const body = input && typeof input === "object" ? (input as Record<string, unknown>) : {}
  const built = asExampleActivity(
    {
      title: typeof body.title === "string" ? body.title : "",
      summary: typeof body.summary === "string" ? body.summary : "",
      organizer: typeof body.organizer === "string" ? body.organizer : "",
      type: body.type as ActivityDraft["type"],
      category: body.category as ActivityDraft["category"],
      date: typeof body.date === "string" ? body.date : "",
      time: typeof body.time === "string" ? body.time : "",
      minutes: typeof body.minutes === "number" ? body.minutes : 60,
      place: typeof body.place === "string" ? body.place : "",
    },
    `pub-${randomBytes(8).toString("hex")}`,
  )
  if (!built.ok) return { ok: false, error: built.error, status: 400 }
  const ready = await ensureOps()
  if (!ready || !pool) {
    return {
      ok: false,
      error: "Postgres no está disponible. No se publicó. La agenda de ejemplos sigue visible.",
      status: 503,
    }
  }
  try {
    await insertActivity(pool, built.event)
    return { ok: true, event: built.event }
  } catch {
    return { ok: false, error: "No se pudo guardar la actividad de ejemplo.", status: 503 }
  }
}

export async function closeOps(): Promise<void> {
  const current = pool
  pool = null
  state = "idle"
  pending = null
  downUntil = 0
  if (current) await current.end().catch(() => undefined)
}
