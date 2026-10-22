import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useOasis } from "../local-data/OasisProvider"
import { explainFor, interpret, type SpokenAuth } from "./assistant"
import "./voice.css"

type Alternative = { transcript: string }
type SpeechResult = ArrayLike<Alternative> & { isFinal?: boolean }
type RecognitionEvent = { resultIndex?: number; results: ArrayLike<SpeechResult> }
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

export type VoiceBridge = {
  applyAuth?: (auth: SpokenAuth) => void
  explain?: () => string
  focusChat?: () => void
}

type Phase = "idle" | "wake" | "once" | "fallback"
type ListenKind = "wake" | "once" | "dictate"

type VoiceContextValue = {
  supported: boolean
  phase: Phase
  toast: string | null
  arm: () => void
  pushToTalk: () => void
  stop: () => void
  dictate: (onText: (text: string) => void) => void
  setBridge: (bridge: VoiceBridge) => void
}

const VoiceContext = createContext<VoiceContextValue | null>(null)

const HONEST = "El navegador puede enviar el audio a su proveedor de reconocimiento. Oasis no guarda lo que dices."
const NOTICE_KEY = "oasis-voice-notice"

function noticeSeen(): boolean {
  try {
    return localStorage.getItem(NOTICE_KEY) === "1"
  } catch {
    return false
  }
}

function rememberNotice() {
  try {
    localStorage.setItem(NOTICE_KEY, "1")
  } catch {
    /* el aviso igual se cierra en esta visita */
  }
}

export function VoiceProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useOasis()
  const supported = recognitionCtor() !== null
  const [phase, setPhase] = useState<Phase>("idle")
  const [toast, setToast] = useState<string | null>(null)
  const bridge = useRef<VoiceBridge>({})
  const follow = useRef(false)
  const armed = useRef(false)
  const mode = useRef<ListenKind>("wake")
  const recRef = useRef<Recognition | null>(null)
  const rapid = useRef(0)
  const startedAt = useRef(0)
  const ignoreUntil = useRef(0)
  const dictateCb = useRef<((text: string) => void) | null>(null)
  const fallbackRef = useRef(false)
  const pathRef = useRef(location.pathname)
  const authRef = useRef(profile.auth)
  const navigateRef = useRef(navigate)
  const startRef = useRef<(kind: ListenKind) => void>(() => undefined)
  pathRef.current = location.pathname
  authRef.current = profile.auth
  navigateRef.current = navigate

  const show = useCallback((text: string) => setToast(text), [])

  const speak = useCallback((text: string) => {
    const synth = window.speechSynthesis
    if (!synth) return
    ignoreUntil.current = performance.now() + 900 + text.length * 55
    synth.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = "es-CO"
    synth.speak(utter)
  }, [])

  const stopRec = useCallback(() => {
    const rec = recRef.current
    recRef.current = null
    try {
      rec?.abort()
    } catch {
      /* ya estaba cerrado */
    }
  }, [])

  const act = useCallback((heard: string) => {
    if (performance.now() < ignoreUntil.current) return
    const requireWake = mode.current === "wake" && !follow.current
    const action = interpret(heard, { requireWake, onEntrance: pathRef.current === "/entrar" })
    if (action.type === "unknown") {
      if (requireWake) return
      const text = "No te entendí. Prueba: Oasis, abre mi rincón."
      show(text)
      speak(text)
      return
    }
    if (action.type === "listen") {
      follow.current = true
      show("Te escucho.")
      speak("Te escucho.")
      return
    }
    follow.current = false
    if (action.type === "auth") {
      bridge.current.applyAuth?.(action.auth)
      const parts = [action.auth.name ? "el nombre" : "", action.auth.email ? "el correo" : "", action.auth.password ? "la clave" : ""].filter(Boolean)
      const text = parts.length ? `Dejé ${parts.join(" y ")} en el formulario.` : "Listo."
      show(action.auth.password ? "Clave escrita solo en el formulario." : text)
      speak(text)
      return
    }
    if (action.type === "explain") {
      const text = bridge.current.explain?.() || explainFor(pathRef.current)
      show(text)
      speak(text)
      return
    }
    if (action.type === "chat") {
      if (authRef.current === "none") {
        const text = "El chat está adentro. Puedes registrarte o entrar."
        show(text)
        speak(text)
        return
      }
      navigateRef.current("/hablar")
      window.setTimeout(() => bridge.current.focusChat?.(), 400)
      show("Abro el chat.")
      speak("Abro el chat.")
      return
    }
    if (authRef.current === "none") {
      const anchors: Record<string, string> = { "/inicio": "inicio", "/cerca": "cerca", "/rincon": "rincon", "/hablar": "hablar" }
      const hash = anchors[action.command.to]
      if (!hash) {
        show("Eso se abre cuando entras.")
        speak("Eso se abre cuando entras.")
        return
      }
      navigateRef.current({ pathname: "/", hash })
      show(`Te llevo a ${action.command.label}.`)
      speak(`Te llevo a ${action.command.label}.`)
      return
    }
    navigateRef.current(action.command.to)
    show(`Abro ${action.command.label}.`)
    speak(`Abro ${action.command.label}.`)
  }, [show, speak])

  const startLoop = useCallback((kind: ListenKind) => {
    const Ctor = recognitionCtor()
    if (!Ctor) return
    stopRec()
    const rec = new Ctor()
    rec.lang = "es-CO"
    rec.interimResults = true
    rec.continuous = kind === "wake"
    rec.maxAlternatives = 1
    mode.current = kind
    recRef.current = rec
    startedAt.current = performance.now()
    rec.onresult = (event) => {
      const index = event.resultIndex ?? Math.max(0, event.results.length - 1)
      const result = event.results[index]
      if (!result || result.isFinal === false) return
      const text = result[0]?.transcript?.trim() ?? ""
      if (!text) return
      if (mode.current === "dictate") {
        dictateCb.current?.(text)
        dictateCb.current = null
        return
      }
      act(text)
    }
    rec.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        armed.current = false
        setPhase("idle")
        show("No pude usar el micrófono. Si lo permites en el navegador, Oasis puede escuchar.")
      }
    }
    rec.onend = () => {
      if (recRef.current !== rec) return
      recRef.current = null
      if (!armed.current) {
        setPhase("idle")
        return
      }
      if (kind !== "wake") {
        if (!fallbackRef.current) startRef.current("wake")
        else setPhase("fallback")
        return
      }
      const elapsed = performance.now() - startedAt.current
      if (elapsed < 900) {
        rapid.current += 1
        if (rapid.current >= 3) {
          fallbackRef.current = true
          setPhase("fallback")
          show("En este navegador la escucha no se queda abierta. Usa el botón para hablar.")
          return
        }
      } else rapid.current = 0
      window.setTimeout(() => {
        if (armed.current && !fallbackRef.current) startRef.current("wake")
      }, 280)
    }
    try {
      rec.start()
      setPhase(kind === "wake" ? (fallbackRef.current ? "fallback" : "wake") : "once")
    } catch {
      fallbackRef.current = true
      setPhase(armed.current ? "fallback" : "idle")
      show("En este navegador la escucha no se queda abierta. Usa el botón para hablar.")
    }
  }, [act, show, stopRec])

  useEffect(() => {
    startRef.current = startLoop
  }, [startLoop])

  const arm = useCallback(() => {
    if (!recognitionCtor()) return
    armed.current = true
    fallbackRef.current = false
    rapid.current = 0
    follow.current = false
    startLoop("wake")
    show("Di Oasis cuando quieras que te escuche.")
  }, [show, startLoop])

  const pushToTalk = useCallback(() => {
    if (!recognitionCtor()) return
    if (!armed.current) {
      arm()
      return
    }
    follow.current = false
    startLoop("once")
    show("Te escucho.")
  }, [arm, show, startLoop])

  const stop = useCallback(() => {
    armed.current = false
    follow.current = false
    dictateCb.current = null
    stopRec()
    setPhase("idle")
    window.speechSynthesis?.cancel()
  }, [stopRec])

  const dictate = useCallback((onText: (text: string) => void) => {
    if (!recognitionCtor()) return
    dictateCb.current = onText
    startLoop("dictate")
    show("Dictando. Oasis no guarda el audio.")
  }, [show, startLoop])

  const setBridge = useCallback((next: VoiceBridge) => {
    bridge.current = next
  }, [])

  useEffect(() => () => stopRec(), [stopRec])

  const value: VoiceContextValue = { supported, phase, toast, arm, pushToTalk, stop, dictate, setBridge }

  return (
    <VoiceContext.Provider value={value}>
      {children}
      <VoiceDock />
    </VoiceContext.Provider>
  )
}

export function useVoice(): VoiceContextValue {
  const value = useContext(VoiceContext)
  if (!value) throw new Error("VoiceProvider falta en el árbol")
  return value
}

function MicIcon() {
  return (
    <svg className="voice-mic" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function VoiceControls() {
  const voice = useVoice()
  const listening = voice.phase === "wake" || voice.phase === "once"
  if (!voice.supported) {
    return <p className="voice-hint">Este navegador no ofrece reconocimiento de voz. El menú sigue disponible.</p>
  }
  if (voice.phase === "idle") {
    return (
      <button className="voice-arm" type="button" onClick={voice.arm}>
        Oasis puede escucharte
      </button>
    )
  }
  return (
    <div className="voice-panel">
      {listening ? (
        <span className="voice-wave" aria-hidden="true">
          <i /><i /><i /><i />
        </span>
      ) : null}
      {voice.phase === "wake" ? <span className="voice-listening">Escuchando</span> : null}
      {voice.phase === "fallback" ? <span className="voice-listening">Usa el botón</span> : null}
      <button className="voice-stop" type="button" onClick={voice.pushToTalk}>
        Hablar
      </button>
      <button className="voice-stop" type="button" onClick={voice.stop}>
        Detener
      </button>
    </div>
  )
}

function VoiceDock() {
  const voice = useVoice()
  const [open, setOpen] = useState(() => !noticeSeen())
  const [toastOpen, setToastOpen] = useState(false)
  const listening = voice.phase === "wake" || voice.phase === "once"

  useEffect(() => {
    if (!voice.toast) {
      setToastOpen(false)
      return
    }
    setToastOpen(true)
    const timer = window.setTimeout(() => setToastOpen(false), 4200)
    return () => window.clearTimeout(timer)
  }, [voice.toast])

  function closeSheet() {
    setOpen(false)
    rememberNotice()
  }

  const showToast = Boolean(voice.toast) && toastOpen && !open
  const showLiveBar = !open && voice.supported && voice.phase !== "idle"

  return (
    <div className="voice">
      <div className="sr-only" role="status" aria-live="polite">
        {voice.toast ?? ""}
      </div>
      {open ? (
        <section className="voice-sheet" aria-label="Aviso de voz">
          <button className="voice-x" type="button" aria-label="Cerrar aviso de voz" onClick={closeSheet}>
            ×
          </button>
          <p className="voice-note">{HONEST}</p>
          <p className="voice-hint">Di Oasis cuando quieras que te escuche.</p>
          <VoiceControls />
        </section>
      ) : null}
      {showToast ? (
        <p className="voice-toast">
          <button className="voice-x" type="button" aria-label="Cerrar mensaje" onClick={() => setToastOpen(false)}>
            ×
          </button>
          <span className="voice-toast-text">{voice.toast}</span>
        </p>
      ) : null}
      {showLiveBar ? <VoiceControls /> : null}
      <button
        className="voice-fab"
        type="button"
        aria-pressed={open || listening}
        aria-expanded={open}
        aria-label={open ? "Cerrar aviso de voz" : "Abrir voz de Oasis"}
        onClick={() => (open ? closeSheet() : setOpen(true))}
      >
        <MicIcon />
      </button>
    </div>
  )
}
