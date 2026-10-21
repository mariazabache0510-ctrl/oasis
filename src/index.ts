import "dotenv/config"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import { directoryRoutes } from "./modules/directory/router.js"
import { eventsRoutes } from "./modules/events/router.js"
import { musicRoutes } from "./modules/music/router.js"
import { orientadorRoutes } from "./modules/orientador/router.js"

const app = new Hono()

app.get("/api/health", (c) => c.json({ ok: true }))
app.route("/api/directory", directoryRoutes())
app.route("/api/music", musicRoutes())
app.route("/api/orientador", orientadorRoutes())
app.route("/api/events", eventsRoutes())

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
