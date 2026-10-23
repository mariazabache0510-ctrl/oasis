import type { ReactNode } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useOasis } from "../local-data/OasisProvider"
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
  { href: "/#inicio", label: "Inicio" },
  { href: "/#cerca", label: "Cerca" },
  { href: "/#rincon", label: "Rincón" },
  { href: "/#hablar", label: "Hablar" },
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

function MenuSlots({ desktop, tablet, phone }: { desktop: ReactNode; tablet: ReactNode; phone: ReactNode }) {
  return (
    <>
      <div className="menu-slot menu-slot-desktop">{desktop}</div>
      <div className="menu-slot menu-slot-tablet">{tablet}</div>
      <div className="menu-slot menu-slot-phone">{phone}</div>
    </>
  )
}

function useInteriorHandlers() {
  const navigate = useNavigate()
  const { profile, setTheme, signOut } = useOasis()
  const night = profile.theme === "noche"
  function onNight() {
    void setTheme(night ? "dia" : "noche")
  }
  function onLeave() {
    void signOut().then(() => navigate("/"))
  }
  return { onLeave, night, onNight }
}

export function InteriorNav() {
  const handlers = useInteriorHandlers()
  return (
    <MenuSlots
      desktop={<DesktopInterior {...handlers} />}
      tablet={<TabletInterior {...handlers} />}
      phone={<PhoneInterior {...handlers} />}
    />
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
        <Link key={item.href} className="menu-place" to={item.href}>
          {item.label}
        </Link>
      ))}
    </>
  )
}

function NightButton() {
  const { profile, setTheme } = useOasis()
  const night = profile.theme === "noche"
  return (
    <button className="menu-quiet" type="button" aria-pressed={night} onClick={() => void setTheme(night ? "dia" : "noche")}>
      {night ? "Día" : "Noche"}
    </button>
  )
}

function PhonePublic() {
  return (
    <>
      <header className="phone-brand">
        <BrandLockup to="/" />
      </header>
      <nav className="phone-menu" aria-label="Secciones públicas">
        <LandingPlaces />
        <LandingEnter />
        <Link className="menu-help" to="/hablar">Ayuda</Link>
        <NightButton />
        <AssistButton short />
      </nav>
    </>
  )
}

export function LandingNav() {
  return (
    <MenuSlots
      desktop={
        <header className="desk-bar">
          <BrandLockup to="/" />
          <nav className="desk-places" aria-label="Secciones públicas">
            <LandingPlaces />
          </nav>
          <div className="desk-gap" aria-hidden="true" />
          <div className="menu-actions">
            <LandingEnter />
            <AssistButton />
          </div>
        </header>
      }
      tablet={
        <aside className="tablet-rail" aria-label="Menú público">
          <BrandLockup to="/" />
          <p className="menu-kicker">Para mirar</p>
          <nav className="rail-places" aria-label="Secciones">
            <LandingPlaces />
          </nav>
          <p className="menu-kicker">Entrar</p>
          <div className="menu-actions">
            <LandingEnter />
            <AssistButton />
          </div>
        </aside>
      }
      phone={<PhonePublic />}
    />
  )
}

/** Menú de celular en páginas que en escritorio no llevan la barra. */
export function PhonePublicNav() {
  return (
    <div className="menu-slot menu-slot-phone">
      <PhonePublic />
    </div>
  )
}

/** En la sala: el menú de adentro si ya entraste, el público si no. */
export function PhoneContextNav() {
  const { profile } = useOasis()
  const handlers = useInteriorHandlers()
  if (profile.auth === "none") return <PhonePublicNav />
  return (
    <div className="menu-slot menu-slot-phone">
      <PhoneInterior {...handlers} />
    </div>
  )
}
