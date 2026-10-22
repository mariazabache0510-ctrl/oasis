import { Hono } from "hono"
import { listEvents, parseDay } from "./catalog.js"

const ALLOWED = ["directory_open", "call_click", "help_offer"] as const
type EventName = (typeof ALLOWED)[number]

const counts: Record<EventName, number> = {
  directory_open: 0,
  call_click: 0,
  help_offer: 0,
}

export function eventsRoutes(): Hono {
  const routes = new Hono()
  routes.get("/", (c) => c.json({ counts, note: "Conteos anónimos de este servidor. No identifican a nadie." }))
  routes.get("/agenda", (c) => {
    // La semana se ancla en el día de quien pregunta (?today=AAAA-MM-DD) para no depender de la zona horaria del servidor.
    const today = c.req.query("today") ?? ""
    const anchor = /^\d{4}-\d{2}-\d{2}$/.test(today) ? parseDay(today) : new Date()
    const events = listEvents(anchor)
    return c.json({
      events,
      sample: events.every((event) => event.sample),
      note: "Los eventos marcados como ejemplo no son actividades reales.",
    })
  })
  routes.post("/", async (c) => {
    const body = await c.req.json().catch(() => ({}))
    const type = body.type
    if (!ALLOWED.includes(type)) return c.json({ ok: false }, 400)
    counts[type as EventName] += 1
    return c.json({ ok: true })
  })
  return routes
}
