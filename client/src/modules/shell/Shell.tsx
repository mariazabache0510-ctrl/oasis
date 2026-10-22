import { useEffect } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useOasis } from "../local-data/OasisProvider"

const links = [
  { to: "/inicio", label: "Inicio" },
  { to: "/cerca", label: "Cerca" },
  { to: "/rincon", label: "Rincón" },
  { to: "/hablar", label: "Hablar" },
]

export function Shell() {
  const { profile, ready, setLastDoor, signOut } = useOasis()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!ready) return
    if (profile.lastDoor !== location.pathname) void setLastDoor(location.pathname)
  }, [ready, location.pathname, profile.lastDoor, setLastDoor])

  function speak() {
    const text = document.querySelector("main")?.textContent?.replace(/\s+/g, " ").trim()
    if (!text) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 700))
    utterance.lang = "es-CO"
    window.speechSynthesis.speak(utterance)
  }

  function leave() {
    window.speechSynthesis.cancel()
    void signOut().then(() => navigate("/"))
  }

  return (
    <div className="app-frame">
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <header className="topbar">
        <Link to="/inicio" className="brand">
          Oasis
        </Link>
        <nav className="top-links" aria-label="Secciones">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="top-actions">
          <Link className="btn btn-ghost" to="/recuerdo">
            Tuyo
          </Link>
          <button className="btn btn-ghost" type="button" onClick={speak}>
            Escuchar
          </button>
          <Link className="btn btn-peach" to="/hablar">
            Hablar con alguien
          </Link>
          <button className="btn btn-ghost" type="button" onClick={leave}>
            Salir
          </button>
        </div>
      </header>
      <main id="contenido">{<Outlet />}</main>
      <footer className="legal">Prototipo académico. No es un servicio de salud.</footer>
      <nav className="tabbar" aria-label="Secciones">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
