import { useEffect, useState, type CSSProperties } from "react"
import { Link } from "react-router-dom"
import { todayKey, toneLabel, type Tone } from "../local-data/db"
import { useOasis } from "../local-data/OasisProvider"
import { track } from "../shell/track"
import { useDevice } from "../shell/device"
import { OasisCard } from "../shell/OasisCard"
import { PageHead } from "../shell/PageHead"
import { CompanionSetup } from "../talk/CompanionSetup"
import { BubblesIcon, HeartIcon, PinIcon } from "./Icons"
import { Leaves } from "./Leaves"

const tones: Tone[] = ["luminoso", "calma", "regular", "bajito", "pesado"]

const patio = [
  { to: "/rincon?pieza=distraer", tone: "butter", title: "Un sonido", text: "Tres piezas cortas, o la playlist si el servidor la tiene." },
  { to: "/rincon?pieza=distraer", tone: "sky", title: "Burbujas", text: "Un juego sin puntaje. No mide cómo estás." },
  { to: "/rincon?pieza=capsula", tone: "lilac", title: "Nota al futuro", text: "Escríbete algo para abrir otro día." },
] as const

const doors = [
  { to: "/rincon?pieza=distraer", tone: "lilac", index: "01", title: "Distraerme", text: "Música, burbujas sin puntaje y una lectura corta.", icon: <BubblesIcon /> },
  { to: "/cerca", tone: "sky", index: "02", title: "Por la zona", text: "La agenda de ejemplo y las líneas oficiales, cuando quieras mirarlas.", icon: <PinIcon /> },
  { to: "/hablar", tone: "peach", index: "03", title: "Si quieres hablar", text: "Una puerta más. El guion y el número, sin convertir esto en una consulta.", icon: <HeartIcon /> },
] as const

export function Home() {
  const { profile, todayMark, saveMark, setOfferDay } = useOasis()
  const { here } = useDevice()
  const [install, setInstall] = useState<BeforeInstallPromptEvent | null>(null)
  const low = todayMark && (todayMark.tone === "bajito" || todayMark.tone === "pesado")
  const showOffer = Boolean(low && profile.lastOfferDay !== todayKey())
  const lead = profile.simpleLanguage
    ? "Puedes escuchar, jugar o escribir. Si quieres hablar con alguien, también puedes."
    : "Entrar abre otro lugar: música, un juego sin puntaje y una nota para después. Pedir ayuda está siempre, y no es todo el espacio."

  useEffect(() => {
    track("visit")
  }, [])

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setInstall(event as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    return () => window.removeEventListener("beforeinstallprompt", onPrompt)
  }, [])

  return (
    <>
      <PageHead
        featured
        eyebrow="Adentro"
        title={profile.name ? "Este lugar es" : "Este lugar es"}
        accent={profile.name ? `de ${profile.name}.` : "tuyo."}
        lede={lead}
      />

      <CompanionSetup />

      <section className="patio" aria-label="Para quedarte">
        {patio.map((item, index) => (
          <div className="tile-float" style={{ "--i": index } as CSSProperties} key={item.title}>
            <OasisCard as={Link} to={item.to} tone={item.tone} index={index} className="door-card">
              <h2 className="oasis-title">{item.title}</h2>
              <p>{item.text}</p>
              <span className="oasis-go">
                Entrar <i aria-hidden="true">→</i>
              </span>
            </OasisCard>
          </div>
        ))}
      </section>

      <div className="tile-float">
        <OasisCard as="section" tone="mint" index={2} className="mood-card" aria-label="Cómo vas hoy">
          <Leaves />
          <h2 className="oasis-title">¿Cómo vas hoy?</h2>
          <p className="muted">
            Un toque para que tú recuerdes cómo iba el día. Solo se guarda en {here}. No es una evaluación y no la ve nadie. Si marcas bajito o pesado, Oasis te ofrece una sola vez ver a quién llamar.
          </p>
          <div className="mood-row">
            {tones.map((tone, index) => (
              <button
                key={tone}
                className="mood"
                data-tone={tone}
                style={{ "--k": index } as CSSProperties}
                type="button"
                aria-pressed={todayMark?.tone === tone}
                onClick={() => void saveMark(tone)}
              >
                {toneLabel[tone]}
              </button>
            ))}
          </div>
          {todayMark ? (
            <p className="mood-saved" role="status" key={todayMark.tone}>
              Hoy marcaste <strong>{toneLabel[todayMark.tone]}</strong>. Quedó guardado en {here}.
            </p>
          ) : null}
          {showOffer ? (
            <div className="row">
              <Link className="btn btn-peach" to="/hablar" onClick={() => { track("help_offer"); void setOfferDay(todayKey()) }}>
                ¿Quieres ver a quién puedes llamar?
              </Link>
              <button className="btn btn-ghost" type="button" onClick={() => void setOfferDay(todayKey())}>
                Ahora no
              </button>
            </div>
          ) : null}
        </OasisCard>
      </div>

      <section className="doors home-doors" aria-label="Qué hay en Oasis">
        {doors.map((door, index) => (
          <div className="tile-float" style={{ "--i": index } as CSSProperties} key={door.to}>
            <OasisCard as={Link} to={door.to} tone={door.tone} index={index + 3} className="door-card">
              <span className="tile-badge">{door.icon}</span>
              <small className="oasis-index">{door.index}</small>
              <h2 className="oasis-title">{door.title}</h2>
              <p>{door.text}</p>
              <span className="oasis-go">
                Entrar <i aria-hidden="true">→</i>
              </span>
            </OasisCard>
          </div>
        ))}
      </section>

      {install ? (
        <button className="btn btn-sage" type="button" onClick={() => void install.prompt()}>
          Instalar Oasis en {here}
        </button>
      ) : null}
    </>
  )
}
