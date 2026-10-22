import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { matchCommand } from "./commands"

export { COMMANDS } from "./commands"

type Alternative = { transcript: string }
type RecognitionEvent = { results: ArrayLike<ArrayLike<Alternative>> }
type Recognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  abort: () => void
}
type RecognitionCtor = new () => Recognition

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null
  const scope = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null
}

export type VoiceToast = { id: number; kind: "opening" | "unclear" | "denied" | "error"; text: string }

/** Tiempo para ver "Abriendo…" antes de cambiar de página. */
const OPEN_DELAY = 900
/** Cuánto dura cada aviso. Los que explican algo duran más. */
const TOAST_MS = { opening: 2200, unclear: 8000, denied: 9000, error: 6000 }
/** Si nadie dice nada, se deja de escuchar. */
const LISTEN_MS = 9000

/**
 * Navegación por voz: una frase por toque, sin escucha continua.
 * Todo ocurre en el navegador. Oasis no guarda ni envía lo que se dice;
 * el reconocimiento lo hace el propio navegador.
 */
export function useVoiceNav() {
  const navigate = useNavigate()
  const supported = recognitionCtor() !== null
  const [listening, setListening] = useState(false)
  const [toast, setToast] = useState<VoiceToast | null>(null)
  const recognition = useRef<Recognition | null>(null)
  const timers = useRef<number[]>([])

  const later = useCallback((run: () => void, ms: number) => {
    timers.current.push(window.setTimeout(run, ms))
  }, [])

  const show = useCallback((kind: VoiceToast["kind"], text: string) => {
    const id = Date.now()
    setToast({ id, kind, text })
    later(() => setToast((current) => (current?.id === id ? null : current)), TOAST_MS[kind])
  }, [later])

  const dismiss = useCallback(() => setToast(null), [])

  const stop = useCallback(() => {
    recognition.current?.abort()
    recognition.current = null
    setListening(false)
  }, [])

  const start = useCallback(() => {
    const Ctor = recognitionCtor()
    if (!Ctor || recognition.current) return
    const rec = new Ctor()
    rec.lang = "es-CO"
    rec.interimResults = false
    rec.continuous = false
    rec.maxAlternatives = 3
    let handled = false

    rec.onresult = (event) => {
      handled = true
      const alternatives = Array.from(event.results[0] ?? [])
      for (const alternative of alternatives) {
        const command = matchCommand(alternative.transcript)
        if (command) {
          show("opening", `Abriendo ${command.label}…`)
          later(() => navigate(command.to), OPEN_DELAY)
          return
        }
      }
      show("unclear", "No te entendí. Prueba: abre mi rincón")
    }
    rec.onerror = (event) => {
      handled = true
      if (event.error === "aborted") return
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        show("denied", "No pude usar el micrófono. Si quieres usar la voz, permítelo en tu navegador. Mientras tanto, el menú de siempre funciona igual.")
      } else if (event.error === "no-speech") {
        show("unclear", "No te escuché. Prueba: abre mi rincón")
      } else {
        show("error", "No pude escucharte ahora. Puedes usar el menú.")
      }
    }
    rec.onend = () => {
      // Si la persona tocó "Detener", stop() ya soltó la referencia: no es un fallo.
      const cancelled = recognition.current !== rec
      recognition.current = null
      setListening(false)
      if (!handled && !cancelled) show("unclear", "No te escuché. Prueba: abre mi rincón")
    }

    recognition.current = rec
    setToast(null)
    try {
      rec.start()
      setListening(true)
      later(() => {
        if (recognition.current === rec) rec.abort()
      }, LISTEN_MS)
    } catch {
      recognition.current = null
      show("error", "No pude escucharte ahora. Puedes usar el menú.")
    }
  }, [later, navigate, show])

  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer))
      recognition.current?.abort()
      recognition.current = null
    }
  }, [])

  return { supported, listening, toast, start, stop, dismiss }
}
