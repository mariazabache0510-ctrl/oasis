import { useEffect, useState } from "react"

export type DeviceKind = "phone" | "tablet" | "desktop"

export type DeviceInfo = {
  kind: DeviceKind
  touch: boolean
  /** "este computador", "esta tablet" o "este celular" */
  here: string
  /** Verbo para invitar a interactuar según el tipo de entrada */
  point: string
}

export type DeviceSignals = {
  ua: string
  /** navigator.userAgentData.mobile, cuando el navegador lo expone */
  mobileHint?: boolean
  maxTouchPoints: number
  coarse: boolean
  fine: boolean
  hover: boolean
  /** Lado corto de la ventana o del visualViewport */
  viewportShort: number
  /** Lado corto de screen, en píxeles CSS */
  screenShort: number
}

const WORDS: Record<DeviceKind, string> = {
  desktop: "este computador",
  tablet: "esta tablet",
  phone: "este celular",
}

const PHONE_MAX = 700

type UaData = { mobile?: boolean; platform?: string }

/** Último valor que escribió esta app. Si el atributo cambia desde fuera, se respeta. */
let appliedKind: DeviceKind | null = null

export function classifyDevice(signals: DeviceSignals): DeviceInfo {
  const ua = signals.ua || ""
  const phoneUa = /iPhone|iPod|Windows Phone|IEMobile|BlackBerry|Opera Mini|webOS/i.test(ua) || (/Android/i.test(ua) && /Mobi/i.test(ua))
  const macintoshTouch = /Macintosh/i.test(ua) && signals.maxTouchPoints > 1 && !/iPhone|iPod/i.test(ua)
  const namedTablet = /iPad|Tablet|PlayBook|Silk/i.test(ua) || macintoshTouch
  const android = /Android/i.test(ua)
  const screenPhone = signals.screenShort > 0 && signals.screenShort < PHONE_MAX
  const viewportPhone = signals.viewportShort > 0 && signals.viewportShort < PHONE_MAX
  const touch = signals.coarse || signals.maxTouchPoints > 0

  // Un celular real gana antes que el atajo de tablet. Android sin la palabra
  // "Mobile" (WebView o "sitio de escritorio") y un iPhone en modo escritorio
  // (UA Macintosh + touch) se estaban clasificando como tablet o escritorio.
  if (signals.mobileHint === true || phoneUa) return build("phone", true)
  if ((namedTablet || android) && (screenPhone || (signals.coarse && viewportPhone))) return build("phone", true)
  if (namedTablet || android) return build("tablet", true)

  // Emulación: puntero grueso y viewport chico, aunque el UA y la pantalla del
  // monitor sigan siendo de escritorio. Una ventana de escritorio angosta con
  // puntero fino no cambia de menú.
  if (signals.coarse && (viewportPhone || screenPhone)) return build("phone", true)
  if (signals.coarse && !signals.hover && !signals.fine) return build("tablet", true)
  return build("desktop", touch && signals.coarse)
}

function build(kind: DeviceKind, touch: boolean): DeviceInfo {
  return { kind, touch, here: WORDS[kind], point: touch ? "Toca" : "Pasa el cursor sobre" }
}

export function detectDevice(): DeviceInfo {
  if (typeof window === "undefined") return build("desktop", false)
  const nav = navigator as Navigator & { userAgentData?: UaData }
  const visual = window.visualViewport
  const viewportShort = Math.min(window.innerWidth || 0, window.innerHeight || 0, visual?.width ?? Infinity, visual?.height ?? Infinity)
  const screenShort = Math.min(window.screen?.width || 0, window.screen?.height || 0)
  return classifyDevice({
    ua: navigator.userAgent || "",
    mobileHint: nav.userAgentData?.mobile,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    coarse: window.matchMedia("(pointer: coarse)").matches,
    fine: window.matchMedia("(pointer: fine)").matches,
    hover: window.matchMedia("(hover: hover)").matches,
    viewportShort: Number.isFinite(viewportShort) ? viewportShort : 0,
    screenShort,
  })
}

function pinnedKind(): DeviceKind | null {
  const value = document.documentElement.dataset.device
  if (value !== "phone" && value !== "tablet" && value !== "desktop") return null
  if (appliedKind && value !== appliedKind) return value
  return null
}

export function applyDevice(info: DeviceInfo) {
  const root = document.documentElement
  const input = info.touch ? "touch" : "mouse"
  if (appliedKind === info.kind && root.dataset.device === info.kind && root.dataset.input === input) return
  appliedKind = info.kind
  root.dataset.device = info.kind
  root.dataset.input = input
}

export function useDevice(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>(() => detectDevice())

  useEffect(() => {
    const update = () => {
      const pinned = pinnedKind()
      const next = pinned ? build(pinned, pinned !== "desktop") : detectDevice()
      if (!pinned) applyDevice(next)
      setInfo((current) => (current.kind === next.kind && current.touch === next.touch ? current : next))
    }
    update()
    const queries = [window.matchMedia("(pointer: coarse)"), window.matchMedia("(pointer: fine)"), window.matchMedia("(hover: hover)"), window.matchMedia("(hover: none)")]
    queries.forEach((query) => query.addEventListener("change", update))
    window.addEventListener("resize", update)
    window.addEventListener("orientationchange", update)
    window.visualViewport?.addEventListener("resize", update)
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-device"] })
    return () => {
      queries.forEach((query) => query.removeEventListener("change", update))
      window.removeEventListener("resize", update)
      window.removeEventListener("orientationchange", update)
      window.visualViewport?.removeEventListener("resize", update)
      observer.disconnect()
    }
  }, [])

  return info
}
