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
            }
          }
        }
      }).google
      if (!google) return
      google.accounts.id.initialize({
        client_id: googleId,
        callback: (response) => onGoogle.current(response.credential),
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
        <p>Lo que escribes se queda en este celular.</p>
        <label className="stack">
          <span>¿Cómo te llamo? Si quieres.</span>
          <input className="field" value={name} maxLength={40} onChange={(event) => setLocalName(event.target.value)} />
        </label>
        <button className="btn btn-peach" type="button" onClick={() => void enterWithoutAccount()}>
          Entrar sin cuenta
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => {
            const google = (window as unknown as { google?: { accounts: { id: { prompt: () => void } } } }).google
            if (googleId && google) google.accounts.id.prompt()
            else setGoogleNote("El inicio con Google aparece aquí. Falta conectar el identificador en Render para que abra tu cuenta.")
          }}
        >
          Continuar con Google
        </button>
        {googleNote ? <p className="muted">{googleNote}</p> : null}
      </div>
    </section>
  )
}
