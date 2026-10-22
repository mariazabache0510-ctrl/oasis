import { COMMANDS, useVoiceNav } from "./useVoiceNav"
import "./voice.css"

function MicIcon() {
  return (
    <svg className="voice-mic" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Botón flotante para moverte por Oasis hablando. Si el navegador no lo permite, no aparece. */
export function VoiceButton() {
  const { supported, listening, toast, start, stop, dismiss } = useVoiceNav()
  if (!supported) return null

  const announce = listening ? "Te escucho" : (toast?.text ?? "")

  return (
    <div className="voice">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announce}
      </div>

      {toast ? (
        <div className="voice-toast" data-kind={toast.kind} key={toast.id}>
          <p className="voice-toast-text" aria-hidden="true">
            {toast.text}
          </p>
          {toast.kind === "unclear" ? (
            <ul className="voice-cmds" aria-label="Comandos que entiendo">
              {COMMANDS.map((command) => (
                <li key={command.to}>{command.example}</li>
              ))}
            </ul>
          ) : null}
          {toast.kind === "opening" ? null : (
            <button className="voice-x" type="button" aria-label="Cerrar aviso" onClick={dismiss}>
              ×
            </button>
          )}
        </div>
      ) : null}

      {listening ? (
        <div className="voice-panel">
          <span className="voice-wave" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="voice-listening" aria-hidden="true">
            Te escucho…
          </span>
          <button className="voice-stop" type="button" onClick={stop}>
            Detener
          </button>
        </div>
      ) : null}

      <button
        className="voice-fab"
        type="button"
        aria-pressed={listening}
        aria-label={listening ? "Dejar de escuchar" : "Navegar con la voz. Di, por ejemplo: abre mi rincón"}
        title={listening ? "Dejar de escuchar" : "Navegar con la voz"}
        onClick={listening ? stop : start}
      >
        <MicIcon />
      </button>
    </div>
  )
}
