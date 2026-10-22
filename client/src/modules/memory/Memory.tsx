import { useNavigate } from "react-router-dom"
import { useOasis } from "../local-data/OasisProvider"
import type { FontScale } from "../local-data/db"
import { useDevice } from "../shell/device"
import { OasisCard } from "../shell/OasisCard"
import { PageHead } from "../shell/PageHead"
import { CompanionSetup } from "../talk/CompanionSetup"
import { CapsuleIcon, HeartIcon, JournalIcon, LockIcon } from "../home/Icons"

const doors: Record<string, string> = {
  "/inicio": "Inicio",
  "/cerca": "Cerca",
  "/rincon": "Mi rincón",
  "/hablar": "Hablar",
  "/recuerdo": "Lo que recuerdo",
}

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

  const stats = [
    { label: "Notas guardadas aquí", value: oasis.notes.length, tone: "peach", icon: <JournalIcon /> },
    { label: "Cápsulas", value: oasis.capsules.length, tone: "lilac", icon: <CapsuleIcon /> },
    { label: "Contactos", value: oasis.contacts.length, tone: "mint", icon: <HeartIcon /> },
  ] as const

  return (
    <>
      <PageHead
        eyebrow="Lo que recuerdo de ti"
        title="Puedes verlo y"
        accent="puedes borrarlo."
        lede={`El nombre, la letra y la última puerta. El diario no sale de ${here} y no lo leo yo.`}
      />

      <CompanionSetup />

      <div className="mem-grid">
        <div className="tile-float mem-wide">
          <OasisCard as="section" tone="sky" index={0} className="mem-card" aria-labelledby="mem-session">
            <div className="rp-head">
              <span className="tile-badge">
                <LockIcon />
              </span>
              <div>
                <h2 className="oasis-title" id="mem-session">
                  Tu entrada
                </h2>
                <p>{session}</p>
              </div>
            </div>
            <dl className="mem-facts">
              <div>
                <dt>Nombre</dt>
                <dd>{oasis.profile.name || "todavía no me dijiste"}</dd>
              </div>
              <div>
                <dt>Última puerta</dt>
                <dd>{doors[oasis.profile.lastDoor] ?? (oasis.profile.lastDoor || "esta")}</dd>
              </div>
            </dl>
          </OasisCard>
        </div>

        <div className="mem-stats mem-wide">
          {stats.map((stat, index) => (
            <div className="tile-float" key={stat.label}>
              <OasisCard as="article" tone={stat.tone} index={index + 1} className="mem-stat">
                <span className="tile-badge mem-stat-icon">{stat.icon}</span>
                <p className="mem-num">{stat.value}</p>
                <p className="mem-label">{stat.label}</p>
              </OasisCard>
            </div>
          ))}
        </div>

        <div className="tile-float">
          <OasisCard as="section" tone="butter" index={4} className="mem-card" aria-labelledby="mem-read">
            <h2 className="oasis-title" id="mem-read">
              Cómo lo lees
            </h2>
            <p className="muted">Elige el tamaño de letra que se te haga más fácil.</p>
            <div className="mem-scales" role="group" aria-label="Tamaño de letra">
              {scales.map((scale) => (
                <button key={scale.id} className="mem-choice" type="button" aria-pressed={oasis.profile.fontScale === scale.id} onClick={() => void oasis.setFontScale(scale.id)}>
                  {scale.label}
                </button>
              ))}
            </div>
            <button className="btn btn-butter" type="button" aria-pressed={oasis.profile.simpleLanguage} onClick={() => void oasis.setSimpleLanguage(!oasis.profile.simpleLanguage)}>
              {oasis.profile.simpleLanguage ? "Lenguaje sencillo activo" : "Usar lenguaje sencillo"}
            </button>
            <button className="btn btn-ghost" type="button" aria-pressed={oasis.profile.theme === "noche"} onClick={() => void oasis.setTheme(oasis.profile.theme === "noche" ? "dia" : "noche")}>
              {oasis.profile.theme === "noche" ? "Modo noche activo" : "Usar modo noche"}
            </button>
          </OasisCard>
        </div>

        <div className="tile-float">
          <OasisCard as="section" tone="lilac" index={5} className="mem-card" aria-labelledby="mem-care">
            <h2 className="oasis-title" id="mem-care">
              Cuidar lo que hay aquí
            </h2>
            <p className="muted">Puedes salir de esta entrada o borrar todo lo que guardé en {here}. Tú decides.</p>
            <div className="mem-actions">
              <button className="btn btn-ghost" type="button" onClick={() => void oasis.signOut().then(() => navigate("/"))}>
                Cerrar esta entrada
              </button>
              <button className="btn btn-ghost mem-danger" type="button" onClick={() => void oasis.clearLocal()}>
                Borrar lo que está en {here}
              </button>
            </div>
          </OasisCard>
        </div>
      </div>
    </>
  )
}
