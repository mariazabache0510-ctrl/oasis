import { Hono } from "hono"
import { toKpi } from "../metrics/aggregate.js"
import { listPublished, recordKpi } from "../metrics/store.js"
import { listEvents, parseDay } from "./catalog.js"

const MEMORY = ["directory_open", "call_click", "help_offer"] as const
type MemoryName = (typeof MEMORY)[number]

const counts: Record<MemoryName, number> = {
  directory_open: 0,
  call_click: 0,
  help_offer: 0,
}

export function eventsRoutes(): Hono {
  const routes = new Hono()
  routes.get("/", (c) => c.json({ counts, note: "Conteos anónimos de este servidor. No identifican a nadie." }))
  routes.get("/agenda", async (c) => {
    const today = c.req.query("today") ?? ""
    const anchor = /^\d{4}-\d{2}-\d{2}$/.test(today) ? parseDay(today) : new Date()
    const extra = await listPublished()
    const events = listEvents(anchor, extra)
    return c.json({
      events,
      sample: events.every((event) => event.sample),
      note: "Los eventos marcados como ejemplo no son actividades reales.",
    })
  })
  routes.post("/", async (c) => {
    const body = await c.req.json().catch(() => ({}))
    const type = body && typeof body === "object" ? body.type : undefined
    const tone = body && typeof body === "object" ? body.tone : undefined
    const kpi = toKpi(type, tone)
    const memory = typeof type === "string" && MEMORY.includes(type as MemoryName)
    if (!kpi && !memory) return c.json({ ok: false }, 400)
    if (memory) counts[type as MemoryName] += 1
    if (kpi) void recordKpi(kpi.kind, kpi.tone).catch(() => undefined)
    return c.json({ ok: true })
  })
  return routes
}
