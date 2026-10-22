import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useOasis } from "../local-data/OasisProvider"

const LotusBloom = lazy(() => import("./LotusBloom"))

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
  const [googleNote, setGoogleNote] = useState("")
  const [bloom, setBloom] = useState(false)
  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const onGoogle = useRef<(credential: string) => void>(() => undefined)
  const pending = useRef(0)

  useEffect(() => setLocalName(profile.auth === "guest" ? profile.name : ""), [profile.auth, profile.name])

  function openOasis(enter: () => Promise<void>) {
    window.clearTimeout(pending.current)
    const go = () => {
      void enter().then(() => navigate("/inicio"))
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      go()
      return
    }
    setBloom(true)
    pending.current = window.setTimeout(go, 2600)
  }

  onGoogle.current = (credential) => {
    const person = readGoogleName(credential)
    openOasis(() => signInGoogle(person.given_name || person.name || "", person.email || ""))
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

  useEffect(() => () => window.clearTimeout(pending.current), [])

  async function enterWithoutAccount() {
    openOasis(() => signInGuest(name))
  }

  return (
    <section className="entrance">
      <div className="scene" aria-hidden="true">
        <span className="oval-float oval-peach"><span className="oval" /></span>
        <span className="oval-float oval-lilac"><span className="oval" /></span>
        <span className="oval-float oval-sky"><span className="oval" /></span>
        <span className="oval-float oval-sage"><span className="oval" /></span>
        <span className="oval-float oval-butter"><span className="oval" /></span>
      </div>
      <div className="login-stage">
        <div className="login-halo" aria-hidden="true" />
        <p className="phrase-slot phrase-lead rise"><span className="phrase-chip phrase-lead-chip floaty"><span className="phrase-text">Cada día es una nueva oportunidad para construir la versión de ti que deseas ser.</span></span></p>
        <p className="phrase-slot phrase-west rise d2"><span className="phrase-chip floaty"><span className="phrase-text">El éxito es la suma de pequeños esfuerzos repetidos día tras día.</span></span></p>
        <div className="enter-card">
          <p className="eyebrow rise d1">Villavicencio</p>
          <h1 className="rise d2">Un espacio tuyo. Sin nadie mirando.</h1>
          <p className="rise d3">Lo que escribes se queda en este celular.</p>
          <label className="stack rise d4">
            <span>¿Cómo te llamo? Si quieres.</span>
            <input className="field" value={name} maxLength={40} onChange={(event) => setLocalName(event.target.value)} />
          </label>
          <div className="enter-actions rise d5">
            <button className="btn btn-peach" type="button" onClick={() => void enterWithoutAccount()}>
              Entrar sin cuenta
            </button>
            <button
              className="btn btn-lilac"
              type="button"
              onClick={() => {
                const google = (window as unknown as { google?: { accounts: { id: { prompt: () => void } } } }).google
                if (googleId && google) google.accounts.id.prompt()
                else setGoogleNote("Iniciar sesión usa tu cuenta de Google. Falta conectar el identificador en Render para que abra la cuenta. Mientras, puedes entrar sin cuenta.")
              }}
            >
              Iniciar sesión
            </button>
          </div>
          <p className="muted rise d6">Al entrar se abren las secciones. El nombre y lo que escribes se quedan en este celular.</p>
          {googleNote ? <p className="muted">{googleNote}</p> : null}
        </div>
        <p className="phrase-slot phrase-east rise d3"><span className="phrase-chip floaty d4"><span className="phrase-text">El futuro pertenece a quienes creen en la belleza de sus sueños.</span></span></p>
      </div>
      {bloom ? (
        <div className="lotus-overlay" role="status">
          <p className="lotus-caption">Tu oasis se abre.</p>
          <Suspense fallback={null}>
            <LotusBloom />
          </Suspense>
        </div>
      ) : null}
    </section>
  )
}
