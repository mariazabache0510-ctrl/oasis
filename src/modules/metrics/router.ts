import { Hono } from "hono"
import { adminConfigured, adminTokenOk, loginAdmin } from "../admin/gate.js"
import { aggregateKpis, syntheticKpiEvents } from "./aggregate.js"
import { opsModeLive, publishActivity, readSummary } from "./store.js"

export function metricsRoutes(): Hono {
  const routes = new Hono()
  routes.get("/semilla", (c) =>
    c.json({
      source: "sintetica",
      kpis: aggregateKpis(syntheticKpiEvents),
      note: "Semilla sintética. No son visitas de personas reales y no identifican a nadie.",
    }),
  )
  return routes
}

export function adminRoutes(): Hono {
  const routes = new Hono()

  routes.post("/entrar", async (c) => {
    if (!adminConfigured()) {
      return c.json({ ok: false, error: "ADMIN_PASSWORD no está configurada." }, 503)
    }
    const body = await c.req.json().catch(() => ({}))
    const password = body && typeof body === "object" && typeof body.password === "string" ? body.password : ""
    const token = loginAdmin(password)
    if (!token) return c.json({ ok: false, error: "La clave no coincide." }, 401)
    return c.json({ ok: true, token })
  })

  routes.get("/resumen", async (c) => {
    if (!adminTokenOk(c.req.header("authorization"))) {
      return c.json({ ok: false, error: "Hace falta entrar a la sala." }, 401)
    }
    const ops = await opsModeLive()
    if (ops !== "postgres") {
      return c.json({
        source: "no-disponible",
        kpis: null,
        note: "Postgres no responde. La semilla sintética sigue en la otra tarjeta. No hay perfiles de personas.",
      })
    }
    const summary = await readSummary()
    if (summary.source !== "postgres") {
      return c.json({
        source: "no-disponible",
        kpis: null,
        note: "Postgres no responde. La semilla sintética sigue en la otra tarjeta. No hay perfiles de personas.",
      })
    }
    return c.json({
      source: "postgres",
      kpis: summary.kpis,
      note: "Agregados anónimos de esta base, incluida la semilla cargada al crearla. Sin nombres, sin diarios y sin diagnósticos.",
    })
  })

  routes.post("/actividades", async (c) => {
    if (!adminTokenOk(c.req.header("authorization"))) {
      return c.json({ ok: false, error: "Hace falta entrar a la sala." }, 401)
    }
    const body = await c.req.json().catch(() => ({}))
    const result = await publishActivity(body)
    if (!result.ok) return c.json({ ok: false, error: result.error }, result.status)
    return c.json({ ok: true, event: result.event })
  })

  return routes
}
