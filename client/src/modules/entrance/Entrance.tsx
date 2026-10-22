import { Component, lazy, Suspense, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { useOasis } from "../local-data/OasisProvider"
import { PhraseCarousel } from "./PhraseCarousel"
import { PopField } from "./PopField"
import { useDevice } from "../shell/device"
import { lotusSeenThisSession, markLotusSeen, prefersReducedMotion, resetLotusClock, webglAvailable } from "./lotusMotion"

const LotusIntro = lazy(() => import("./LotusIntro"))
const IslandScene = lazy(() => import("./IslandScene"))

class SceneBoundary extends Component<{ children: ReactNode; onFail?: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail?.()
  }
  render() {
    if (this.state.failed) {
      return this.props.onFail ? <div className="lotus-screen lotus-fade" role="status" aria-label="Abriendo Oasis" /> : null
    }
    return this.props.children
  }
}

type GoogleApi = {
  accounts: {
    id: {
      initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void
      renderButton: (element: HTMLElement, options: Record<string, string | number>) => void
    }
  }
}

type Mode = "register" | "login"

function strength(password: string): number {
  let score = 0
  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

const STRENGTH_LABEL = ["Muy corta", "Puede mejorar", "Va bien", "Buena", "Muy buena"]
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type GoogleName = { given_name?: string; name?: string; email?: string }

function readGoogleName(credential: string): GoogleName {
  const payload = credential.split(".")[1] ?? ""
  const binary = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return JSON.parse(new TextDecoder("utf-8").decode(bytes)) as GoogleName
}

export function Entrance() {
  const navigate = useNavigate()
  const { here } = useDevice()
  const { profile, signInGuest, signInGoogle, register, login, clearLocal } = useOasis()
  const hasAccount = Boolean(profile.account)
  const [mode, setMode] = useState<Mode>(hasAccount ? "login" : "register")
  const [name, setName] = useState("")
  const [email, setEmail] = useState(profile.account?.email ?? "")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [googleNote, setGoogleNote] = useState("")
  const [googleReady, setGoogleReady] = useState(false)
  const [opening, setOpening] = useState(false)
  const [motionOk] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const onGoogle = useRef<(credential: string) => void>(() => undefined)
  const googleSlot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (lotusSeenThisSession()) return
    void import("./LotusIntro")
    if (!prefersReducedMotion() && webglAvailable()) void import("./LotusStage")
  }, [])

  function openHome() {
    if (lotusSeenThisSession()) {
      window.setTimeout(() => navigate("/inicio"), 0)
      return
    }
    markLotusSeen()
    resetLotusClock()
    setOpening(true)
  }

  onGoogle.current = (credential) => {
    const person = readGoogleName(credential)
    void signInGoogle(person.given_name || person.name || "", person.email || "").then(() => openHome())
  }

  useEffect(() => {
    if (!googleId) return
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.onload = () => {
      const google = (window as unknown as { google?: GoogleApi }).google
      if (!google) return
      google.accounts.id.initialize({
        client_id: googleId,
        callback: (response) => onGoogle.current(response.credential),
      })
      setGoogleReady(true)
    }
    script.onerror = () => setGoogleNote("Google no cargó. Puedes crear una cuenta aquí o entrar sin cuenta.")
    document.body.appendChild(script)
    return () => script.remove()
  }, [googleId])

  useEffect(() => {
    if (!googleReady || !googleSlot.current) return
    const google = (window as unknown as { google?: GoogleApi }).google
    google?.accounts.id.renderButton(googleSlot.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      logo_alignment: "left",
      locale: "es",
      width: 300,
    })
  }, [googleReady, mode])

  function switchMode(next: Mode) {
    setMode(next)
    setError("")
    setPassword("")
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError("")
    if (mode === "register") {
      if (!name.trim()) return setError("Dime cómo quieres que te llame.")
      if (!EMAIL.test(email.trim())) return setError("Revisa el correo: falta algo, como el @ o el punto.")
      if (password.length < 6) return setError("La clave necesita al menos 6 caracteres.")
    } else {
      if (!EMAIL.test(email.trim())) return setError("Escribe el correo con el que te registraste.")
      if (!password) return setError("Escribe tu clave.")
    }
    setBusy(true)
    const result = mode === "register" ? await register(name, email, password) : await login(email, password)
    setBusy(false)
    if (result.ok) openHome()
    else setError(result.message)
  }

  async function enterWithoutAccount() {
    await signInGuest(name)
    openHome()
  }

  async function forgot() {
    const sure = window.confirm(`Tu clave solo existe en ${here}, así que no se puede recuperar. Puedo borrar la cuenta y lo guardado aquí para que crees una nueva. ¿Lo hago?`)
    if (!sure) return
    await clearLocal()
    setPassword("")
    setEmail("")
    setMode("register")
  }

  const score = strength(password)

  return (
    <section className={opening ? "entrance is-opening" : "entrance"}>
      <PopField />
      {opening ? (
        <SceneBoundary onFail={() => navigate("/inicio")}>
          <Suspense fallback={<div className="lotus-screen" role="status" aria-label="Abriendo Oasis"><p className="lotus-mark is-in">Oasis</p></div>}>
            <LotusIntro onDone={() => navigate("/inicio")} />
          </Suspense>
        </SceneBoundary>
      ) : null}
      <div className="login-split" aria-hidden={opening || undefined} inert={opening || undefined}>
        <div className="login-left">
          <div className="enter-card auth-card">
            <span className="auth-glow" aria-hidden="true" />
            <p className="eyebrow eyebrow-pill rise d1">Villavicencio</p>
            <h2 className="rise d2">{mode === "register" ? "Crea tu espacio." : "Qué bueno verte de nuevo."}</h2>
            <p className="rise d3">
              {mode === "register"
                ? `Solo lo básico. Todo se guarda en ${here}.`
                : `Entra con tu correo y tu clave. Siguen en ${here}.`}
            </p>
            <div className="auth-tabs rise d3" role="tablist" aria-label="Registro o ingreso">
              <span className="auth-tab-pill" data-pos={mode} aria-hidden="true" />
              <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => switchMode("register")}>
                Crear cuenta
              </button>
              <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => switchMode("login")}>
                Ya tengo cuenta
              </button>
            </div>
            <form className="auth-form" onSubmit={(event) => void submit(event)} noValidate>
              {mode === "register" ? (
                <label className="auth-field rise d4">
                  <span>¿Cómo te llamo?</span>
                  <input className="field" autoComplete="given-name" value={name} maxLength={40} onChange={(event) => setName(event.target.value)} />
                </label>
              ) : null}
              <label className="auth-field rise d4">
                <span>Correo</span>
                <input className="field" type="email" inputMode="email" autoComplete="email" value={email} maxLength={80} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="auth-field rise d5">
                <span>Clave</span>
                <span className="auth-password">
                  <input
                    className="field"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    value={password}
                    maxLength={64}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button type="button" className="auth-eye" aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? "Ocultar" : "Ver"}
                  </button>
                </span>
              </label>
              {mode === "register" ? (
                <div className="auth-meter" aria-live="polite">
                  <span className="auth-meter-bar" data-score={password ? score : 0} />
                  <span className="auth-meter-text">{password ? STRENGTH_LABEL[score] : "Mínimo 6 caracteres"}</span>
                </div>
              ) : null}
              {error ? <p className="auth-error" role="alert">{error}</p> : null}
              <button className="btn btn-peach auth-submit rise d6" type="submit" disabled={busy}>
                {busy ? "Un momento…" : mode === "register" ? "Crear mi cuenta" : "Ingresar"}
              </button>
            </form>
            <div className="auth-or" aria-hidden="true"><span>o</span></div>
            {googleId && googleReady ? (
              <div className="auth-google-slot" ref={googleSlot} />
            ) : (
              <button
                className="btn btn-google"
                type="button"
                onClick={() =>
                  setGoogleNote(
                    googleId
                      ? "Google todavía está cargando. Intenta de nuevo en un momento."
                      : "Google no está disponible por ahora. Puedes crear una cuenta aquí o entrar sin cuenta.",
                  )
                }
              >
                <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
                  <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24 24 0 0 0 0 21.56l7.98-6.19z" />
                  <path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.500-5.800c-2.100 1.400-4.800 2.300-8.400 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z" />
                </svg>
                Continuar con Google
              </button>
            )}
            {googleNote ? <p className="muted auth-note" role="status">{googleNote}</p> : null}
            <div className="auth-foot">
              <button className="btn btn-ghost" type="button" onClick={() => void enterWithoutAccount()}>
                Entrar sin cuenta
              </button>
              {mode === "login" ? (
                <button className="auth-link" type="button" onClick={() => void forgot()}>
                  ¿Olvidaste tu clave?
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <aside className="login-right" aria-label="Oasis">
          <div className="login-ring" aria-hidden="true" />
          <header className="login-head">
            <h1 className="login-brand">Oasis</h1>
            <p className="login-tagline">
              Calma para hoy y <strong>a quién llamar</strong> en Villavicencio.
            </p>
          </header>
          <div className="login-scene" aria-hidden="true">
            <div className="login-scene-fallback" />
            {motionOk && !opening ? (
              <SceneBoundary>
                <Suspense fallback={null}>
                  <IslandScene />
                </Suspense>
              </SceneBoundary>
            ) : null}
          </div>
          <PhraseCarousel />
        </aside>
      </div>
    </section>
  )
}
