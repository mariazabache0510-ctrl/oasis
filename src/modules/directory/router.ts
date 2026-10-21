import { Hono } from "hono"
import { listServices } from "./catalog.js"

export function directoryRoutes(): Hono {
  const routes = new Hono()
  routes.get("/", (c) => c.json({ services: listServices() }))
  return routes
}
