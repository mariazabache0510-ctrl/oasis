import { Link } from "react-router-dom"
import { todayKey, toneLabel, type Tone } from "../local-data/db"
import { useOasis } from "../local-data/OasisProvider"
import { track } from "../shell/track"

const tones: Tone[] = ["luminoso", "calma", "regular", "bajito", "pesado"]

export function MoodPanel({ offerHref }: { offerHref: string }) {
  const { profile, todayMark, saveMark, setOfferDay } = useOasis()
  const low = todayMark && (todayMark.tone === "bajito" || todayMark.tone === "pesado")
  const showOffer = Boolean(low && profile.lastOfferDay !== todayKey())
  const offerClass = "btn btn-peach"

  return (
    <section className="panel mood-panel" aria-label="Cómo vas hoy">
      <svg className="mood-leaves" viewBox="0 0 720 240" aria-hidden="true">
        <g className="leaf leaf-a">
          <ellipse cx="78" cy="168" rx="54" ry="18" transform="rotate(-32 78 168)" />
          <ellipse cx="118" cy="186" rx="36" ry="12" transform="rotate(18 118 186)" />
        </g>
        <g className="leaf leaf-b">
          <ellipse cx="620" cy="58" rx="62" ry="20" transform="rotate(24 620 58)" />
          <ellipse cx="664" cy="92" rx="34" ry="12" transform="rotate(-20 664 92)" />
        </g>
        <g className="leaf leaf-c">
          <ellipse cx="250" cy="36" rx="40" ry="13" transform="rotate(-12 250 36)" />
        </g>
      </svg>
      <div className="mood-copy">
        <h2>¿Cómo vas hoy?</h2>
        <p className="muted">
          Un toque para dejar cómo te sientes hoy. Solo tú lo ves y se queda en este celular. No es una evaluación ni un diagnóstico.
          Si marcas bajito o pesado, Oasis te ofrece una sola vez, ese día, ver a quién puedes llamar.
        </p>
        <div className="row">
          {tones.map((tone) => (
            <button
              key={tone}
              className="choice"
              type="button"
              aria-pressed={todayMark?.tone === tone}
              onClick={() => void saveMark(tone)}
            >
              {toneLabel[tone]}
            </button>
          ))}
        </div>
        {showOffer ? (
          <div className="row">
            {offerHref.startsWith("#") ? (
              <a className={offerClass} href={offerHref} onClick={() => { track("help_offer"); void setOfferDay(todayKey()) }}>
                ¿Quieres ver a quién puedes llamar?
              </a>
            ) : (
              <Link className={offerClass} to={offerHref} onClick={() => { track("help_offer"); void setOfferDay(todayKey()) }}>
                ¿Quieres ver a quién puedes llamar?
              </Link>
            )}
            <button className="btn btn-ghost" type="button" onClick={() => void setOfferDay(todayKey())}>
              Ahora no
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
