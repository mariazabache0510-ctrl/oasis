import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useOasis } from "../local-data/OasisProvider"

const LotusOpening = lazy(() => import("./LotusOpening"))

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
  const [opening, setOpening] = useState(false)
  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const onGoogle = useRef<(credential: string) => void>(() => undefined)

  useEffect(() => setLocalName(profile.auth === "guest" ? profile.name : ""), [profile.auth, profile.name])

  onGoogle.current = (credential) => {
    const person = readGoogleName(credential)
    void signInGoogle(person.given_name || person.name || "", person.email || "").then(() => setOpening(true))
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
    setOpening(true)
  }

  return (
    <section className="entrance">
      {opening ? (
        <Suspense fallback={<div className="lotus-screen" role="status" aria-label="Abriendo Oasis" />}>
          <LotusOpening onDone={() => navigate("/inicio")} />
        </Suspense>
      ) : null}
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
          <p className="muted rise d6">Iniciar sesión es con Google. El correo se queda en este celular.</p>
          {googleNote ? <p className="muted">{googleNote}</p> : null}
        </div>
        <p className="phrase-slot phrase-east rise d3"><span className="phrase-chip floaty d4"><span className="phrase-text">El futuro pertenece a quienes creen en la belleza de sus sueños.</span></span></p>
      </div>
    </section>
  )
}
