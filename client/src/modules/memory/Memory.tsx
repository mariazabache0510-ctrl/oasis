import { useNavigate } from "react-router-dom"
import { useOasis } from "../local-data/OasisProvider"
import type { FontScale } from "../local-data/db"
import { useDevice } from "../shell/device"

const scales: { id: FontScale; label: string }[] = [
  { id: "md", label: "Letra cómoda" },
  { id: "lg", label: "Letra grande" },
  { id: "xl", label: "Letra muy grande" },
]

export function Memory() {
  const oasis = useOasis()
  const navigate = useNavigate()
  const { here } = useDevice()
  const session = oasis.profile.auth === "google"
    ? `Entraste con Google${oasis.profile.email ? ` · ${oasis.profile.email}` : ""}. Ese dato está solo en ${here}.`
    : oasis.profile.auth === "local"
      ? `Entraste con tu cuenta${oasis.profile.email ? ` · ${oasis.profile.email}` : ""}. La clave solo existe como huella en ${here}.`
      : oasis.profile.auth === "guest"
      ? "Entraste sin cuenta."
      : "Todavía no hay una entrada guardada."
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Lo que recuerdo de ti</p>
        <h1>Puedes verlo y puedes borrarlo.</h1>
        <p className="lede">El nombre, la letra y la última puerta. El diario no sale de {here} y no lo leo yo.</p>
      </section>
      <section className="panel">
        <p>{session}</p>
        <p>Nombre: {oasis.profile.name || "todavía no me dijiste"}.</p>
        <p>Última puerta: {oasis.profile.lastDoor || "esta"}.</p>
        <p>Notas guardadas aquí: {oasis.notes.length}. Cápsulas: {oasis.capsules.length}. Contactos: {oasis.contacts.length}.</p>
        <div className="row">
          {scales.map((scale) => (
            <button key={scale.id} className="choice" type="button" aria-pressed={oasis.profile.fontScale === scale.id} onClick={() => void oasis.setFontScale(scale.id)}>
              {scale.label}
            </button>
          ))}
        </div>
        <button className="btn btn-butter" type="button" onClick={() => void oasis.setSimpleLanguage(!oasis.profile.simpleLanguage)}>
          {oasis.profile.simpleLanguage ? "Lenguaje sencillo activo" : "Usar lenguaje sencillo"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => void oasis.signOut().then(() => navigate("/"))}>
          Cerrar esta entrada
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => void oasis.clearLocal()}>
          Borrar lo que está en {here}
        </button>
      </section>
    </>
  )
}
