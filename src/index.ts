import "dotenv/config"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import { directoryRoutes } from "./modules/directory/router.js"
import { eventsRoutes } from "./modules/events/router.js"
import { adminRoutes, metricsRoutes } from "./modules/metrics/router.js"
import { opsModeLive } from "./modules/metrics/store.js"
import { musicRoutes } from "./modules/music/router.js"
import { companionRoutes } from "./modules/companion/router.js"
import { orientadorRoutes } from "./modules/orientador/router.js"

const app = new Hono()

app.get("/api/health", async (c) => {
  const ops = await opsModeLive()
  return c.json({ ok: true, ops })
})
app.route("/api/directory", directoryRoutes())
app.route("/api/music", musicRoutes())
app.route("/api/orientador", orientadorRoutes())
app.route("/api/companion", companionRoutes())
app.route("/api/events", eventsRoutes())
app.route("/api/metrics", metricsRoutes())
app.route("/api/admin", adminRoutes())

app.use("/*", serveStatic({
  root: "./client/dist",
  onFound(path, c) {
    if (path.endsWith(".html") || path.endsWith("sw.js") || path.endsWith("registerSW.js")) {
      c.header("Cache-Control", "no-cache")
    }
  },
}))
app.get("*", async (c, next) => {
  c.header("Cache-Control", "no-cache")
  await next()
}, serveStatic({ path: "./client/dist/index.html" }))

const port = Number(process.env.PORT) || 3000

serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (info) => {
  console.log(`Oasis escuchando en http://${info.address}:${info.port}`)
})
