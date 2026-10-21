import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react"
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

export function Entrance() {
  const navigate = useNavigate()
  const { profile, setName } = useOasis()
  const [name, setLocalName] = useState(profile.name)
  const [motionOk, setMotionOk] = useState(true)
  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => setLocalName(profile.name), [profile.name])
  useEffect(() => {
    setMotionOk(!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  async function enter(nextName = name) {
    await setName(nextName)
    navigate("/inicio")
  }

  useEffect(() => {
    if (!googleId) return
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.onload = () => {
      const google = (window as unknown as { google?: { accounts: { id: {
        initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void
        renderButton: (element: HTMLElement, options: object) => void
      } } } }).google
      const slot = document.getElementById("google-slot")
      if (!google || !slot) return
      google.accounts.id.initialize({
        client_id: googleId,
        callback: (response) => {
          const payload = response.credential.split(".")[1]
          const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { given_name?: string; name?: string }
          void enter(json.given_name || json.name || "")
        },
      })
      google.accounts.id.renderButton(slot, { theme: "outline", shape: "pill", size: "large", text: "continue_with" })
    }
    document.body.appendChild(script)
    return () => script.remove()
  }, [googleId])

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
        <p>Lo que escribes se queda en este celular. Puedes entrar sin crear una cuenta.</p>
        <label className="stack">
          <span>¿Cómo te llamo? Si quieres.</span>
          <input className="field" value={name} maxLength={40} onChange={(event) => setLocalName(event.target.value)} />
        </label>
        <button className="btn btn-peach" type="button" onClick={() => void enter()}>
          Entrar sin cuenta
        </button>
        {googleId ? <div id="google-slot" /> : null}
      </div>
    </section>
  )
}
