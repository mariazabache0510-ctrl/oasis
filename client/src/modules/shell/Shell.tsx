import { useEffect } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useOasis } from "../local-data/OasisProvider"
import { InteriorNav } from "./menus"

export function Shell() {
  const { profile, ready, setLastDoor } = useOasis()
  const location = useLocation()

  useEffect(() => {
    if (!ready) return
    if (profile.lastDoor !== location.pathname) void setLastDoor(location.pathname)
  }, [ready, location.pathname, profile.lastDoor, setLastDoor])

  return (
    <div className="app-frame lived">
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <InteriorNav />
      <p className="lived-ribbon">Adentro hay música, notas y un mapa. Hablar con alguien es una puerta, no la única.</p>
      <main id="contenido">{<Outlet />}</main>
      <footer className="legal">
        Prototipo académico. No es un servicio de salud. <Link to="/sala">Sala de colegio</Link>
      </footer>
    </div>
  )
}
