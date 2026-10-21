import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { useOasis } from "../local-data/OasisProvider"

const SoftScene = lazy(() => import("./SoftScene"))

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return <div className="scene-fallback" />
    return this.props.children
  }
}

type GoogleName = { given_name?: string; name?: string; email?: string }

function readGoogleName(credential: string): GoogleName {
  const payload = credential.split(".")[1] ?? ""
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
  return JSON.parse(json) as GoogleName
}

export function Entrance() {
  const navigate = useNavigate()
  const { profile, signInGuest, signInGoogle } = useOasis()
  const [name, setLocalName] = useState(profile.name)
  const [motionOk, setMotionOk] = useState(true)
  const [googleNote, setGoogleNote] = useState("")
  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const onGoogle = useRef<(credential: string) => void>(() => undefined)

  useEffect(() => setLocalName(profile.auth === "guest" ? profile.name : ""), [profile.auth, profile.name])
  useEffect(() => {
    setMotionOk(!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  onGoogle.current = (credential) => {
    const person = readGoogleName(credential)
    void signInGoogle(person.given_name || person.name || "", person.email || "").then(() => navigate("/inicio"))
  }

  useEffect(() => {
    if (!googleId) return
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.onload = () => {
      const google = (window as unknown as {
        google?: {
          accounts: {
            id: {
              initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void
              renderButton: (element: HTMLElement, options: object) => void
            }
          }
        }
      }).google
      const slot = document.getElementById("google-slot")
      if (!google || !slot) return
      google.accounts.id.initialize({
        client_id: googleId,
        callback: (response) => onGoogle.current(response.credential),
      })
      google.accounts.id.renderButton(slot, {
        theme: "outline",
        shape: "pill",
        size: "large",
        text: "continue_with",
        width: 320,
      })
    }
    script.onerror = () => setGoogleNote("Google no cargó. Puedes entrar sin cuenta.")
    document.body.appendChild(script)
    return () => script.remove()
  }, [googleId])

  async function enterWithoutAccount() {
    await signInGuest(name)
    navigate("/inicio")
  }

  return (
    <section className="entrance">
      <div className="scene" aria-hidden="true">
        {motionOk ? (
          <SceneBoundary>
            <Suspense fallback={<div className="scene-fallback" />}>
              <SoftScene />
            </Suspense>
          </SceneBoundary>
        ) : (
          <div className="scene-fallback" />
        )}
      </div>
      <div className="enter-card">
        <p className="eyebrow">Villavicencio</p>
        <h1>Un espacio tuyo. Sin nadie mirando.</h1>
        <p>Hay dos formas de entrar. En las dos, lo que escribes se queda en este celular.</p>

        <div className="stack">
          <h2>Sin cuenta</h2>
          <label className="stack">
            <span>¿Cómo te llamo? Si quieres.</span>
            <input className="field" value={name} maxLength={40} onChange={(event) => setLocalName(event.target.value)} />
          </label>
          <button className="btn btn-peach" type="button" onClick={() => void enterWithoutAccount()}>
            Entrar sin cuenta
          </button>
        </div>

        <p className="or">o</p>

        <div className="stack">
          <h2>Con Google</h2>
          <p className="muted">Sirve para saludarte por tu nombre. Oasis no envía tu correo ni tu diario a un servidor.</p>
          {googleId ? <div id="google-slot" /> : (
            <button className="btn btn-ghost" type="button" onClick={() => setGoogleNote("El botón de Google se enciende cuando el equipo pega el identificador en Render y vuelve a publicar. Mientras, entra sin cuenta.")}>
              Continuar con Google
            </button>
          )}
          {googleNote ? <p className="muted">{googleNote}</p> : null}
        </div>
      </div>
    </section>
  )
}
