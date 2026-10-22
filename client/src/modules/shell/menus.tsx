import type { ReactNode } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useOasis } from "../local-data/OasisProvider"
import { useDevice, type DeviceKind } from "./device"
import { BrandLockup } from "./OasisMark"
import { useVoice } from "../voice/VoiceProvider"

type Item = { to: string; label: string; end?: boolean }

const places: Item[] = [
  { to: "/inicio", label: "Inicio", end: true },
  { to: "/cerca", label: "Cerca" },
  { to: "/rincon", label: "Rincón" },
  { to: "/hablar", label: "Hablar" },
  { to: "/recuerdo", label: "Tuyo" },
]

const landingPlaces = [
  { href: "#inicio", label: "Inicio" },
  { href: "#cerca", label: "Cerca" },
  { href: "#rincon", label: "Rincón" },
  { href: "#hablar", label: "Hablar" },
]

function AssistButton({ short = false }: { short?: boolean }) {
  const voice = useVoice()
  const label = voice.phase === "idle" ? (short ? "Voz" : "Oasis puede escucharte") : short ? "Voz" : "Hablar"
  return (
    <button className="menu-assist" type="button" onClick={voice.phase === "idle" ? voice.arm : voice.pushToTalk}>
      {label}
    </button>
  )
}

function PlaceLinks() {
  return (
    <>
      {places.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className="menu-place">
          {item.label}
        </NavLink>
      ))}
    </>
  )
}

function InteriorActions({ onLeave, night, onNight, short = false }: { onLeave: () => void; night: boolean; onNight: () => void; short?: boolean }) {
  return (
    <div className="menu-actions">
      <Link className="menu-help" to="/hablar">
        {short ? "Ayuda" : "Hablar con alguien"}
      </Link>
      <button className="menu-quiet" type="button" aria-pressed={night} onClick={onNight}>
        {night ? "Día" : "Noche"}
      </button>
      <button className="menu-quiet" type="button" onClick={onLeave}>
        Salir
      </button>
      <AssistButton short={short} />
    </div>
  )
}

function DesktopInterior({ onLeave, night, onNight }: { onLeave: () => void; night: boolean; onNight: () => void }) {
  return (
    <header className="desk-bar">
      <BrandLockup to="/inicio" />
      <nav className="desk-places" aria-label="Lugares">
        <PlaceLinks />
      </nav>
      <div className="desk-gap" aria-hidden="true" />
      <InteriorActions onLeave={onLeave} night={night} onNight={onNight} />
    </header>
  )
}

function TabletInterior({ onLeave, night, onNight }: { onLeave: () => void; night: boolean; onNight: () => void }) {
  return (
    <aside className="tablet-rail" aria-label="Menú">
      <BrandLockup to="/inicio" />
      <p className="menu-kicker">Lugares</p>
      <nav className="rail-places" aria-label="Lugares">
        <PlaceLinks />
      </nav>
      <p className="menu-kicker">Acciones</p>
      <InteriorActions onLeave={onLeave} night={night} onNight={onNight} />
    </aside>
  )
}

function PhoneInterior({ onLeave, night, onNight }: { onLeave: () => void; night: boolean; onNight: () => void }) {
  return (
    <>
      <header className="phone-brand">
        <BrandLockup to="/inicio" />
      </header>
      <nav className="phone-menu" aria-label="Secciones">
        <PlaceLinks />
        <Link className="menu-help" to="/hablar">Ayuda</Link>
        <button className="menu-quiet" type="button" aria-pressed={night} onClick={onNight}>
          {night ? "Día" : "Noche"}
        </button>
        <button className="menu-quiet" type="button" onClick={onLeave}>Salir</button>
        <AssistButton short />
      </nav>
    </>
  )
}

function byDevice(kind: DeviceKind, desktop: ReactNode, tablet: ReactNode, phone: ReactNode) {
  if (kind === "phone") return phone
  if (kind === "tablet") return tablet
  return desktop
}

export function InteriorNav() {
  const { kind } = useDevice()
  const navigate = useNavigate()
  const { profile, setTheme, signOut } = useOasis()
  const night = profile.theme === "noche"
  function onNight() {
    void setTheme(night ? "dia" : "noche")
  }
  function onLeave() {
    void signOut().then(() => navigate("/"))
  }
  return byDevice(
    kind,
    <DesktopInterior onLeave={onLeave} night={night} onNight={onNight} />,
    <TabletInterior onLeave={onLeave} night={night} onNight={onNight} />,
    <PhoneInterior onLeave={onLeave} night={night} onNight={onNight} />,
  )
}

function LandingEnter() {
  const { profile } = useOasis()
  if (profile.auth !== "none") return <Link className="menu-enter" to="/inicio">Volver adentro</Link>
  return <Link className="menu-enter" to="/entrar">{profile.returning ? "Entrar" : "Registrarse"}</Link>
}

function LandingPlaces() {
  return (
    <>
      {landingPlaces.map((item) => (
        <a key={item.href} className="menu-place" href={item.href}>
          {item.label}
        </a>
      ))}
    </>
  )
}

export function LandingNav() {
  const { kind } = useDevice()
  const placesNav = <LandingPlaces />
  const enter = <LandingEnter />
  if (kind === "phone") {
    return (
      <>
        <header className="phone-brand">
          <BrandLockup to="/" />
        </header>
        <nav className="phone-menu" aria-label="Secciones públicas">
          {placesNav}
          {enter}
          <AssistButton short />
        </nav>
      </>
    )
  }
  if (kind === "tablet") {
    return (
      <aside className="tablet-rail" aria-label="Menú público">
        <BrandLockup to="/" />
        <p className="menu-kicker">Para mirar</p>
        <nav className="rail-places" aria-label="Secciones">
          {placesNav}
        </nav>
        <p className="menu-kicker">Entrar</p>
        <div className="menu-actions">
          {enter}
          <AssistButton />
        </div>
      </aside>
    )
  }
  return (
    <header className="desk-bar">
      <BrandLockup to="/" />
      <nav className="desk-places" aria-label="Secciones públicas">
        {placesNav}
      </nav>
      <div className="desk-gap" aria-hidden="true" />
      <div className="menu-actions">
        {enter}
        <AssistButton />
      </div>
    </header>
  )
}
