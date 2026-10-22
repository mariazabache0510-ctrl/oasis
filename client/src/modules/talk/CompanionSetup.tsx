import { COMPANION_LOOKS, CompanionFace } from "./CompanionFace"
import { defaultCompanion, type CompanionLook } from "../local-data/db"
import { useOasis } from "../local-data/OasisProvider"
import { OasisCard } from "../shell/OasisCard"
import { useDevice } from "../shell/device"

export function CompanionSetup() {
  const { profile, setCompanion } = useOasis()
  const { here } = useDevice()
  const companion = { ...defaultCompanion, ...profile.companion }

  return (
    <OasisCard as="section" tone="lilac" className="companion-setup" aria-labelledby="companion-setup-title">
      <h2 className="oasis-title" id="companion-setup-title">Tu compañero</h2>
      <p className="muted">Elige un nombre, una forma de Oasis y cómo quieres que te acompañe. Se queda en {here}. No es una ficha clínica.</p>
      <label className="companion-field">
        <span>Cómo quieres llamarle</span>
        <input
          className="field"
          maxLength={32}
          value={companion.name}
          onChange={(event) => void setCompanion({ name: event.target.value })}
        />
      </label>
      <div className="companion-looks" role="radiogroup" aria-label="Apariencia">
        {COMPANION_LOOKS.map((look) => (
          <button
            key={look.id}
            className="companion-look"
            type="button"
            role="radio"
            aria-checked={companion.look === look.id}
            onClick={() => void setCompanion({ look: look.id as CompanionLook })}
          >
            <CompanionFace look={look.id} />
            <span>{look.label}</span>
          </button>
        ))}
      </div>
      <label className="companion-field">
        <span>Cómo quieres que te acompañe</span>
        <textarea
          maxLength={180}
          value={companion.note}
          placeholder="Por ejemplo: despacio, sin preguntas de más"
          onChange={(event) => void setCompanion({ note: event.target.value })}
        />
      </label>
    </OasisCard>
  )
}
