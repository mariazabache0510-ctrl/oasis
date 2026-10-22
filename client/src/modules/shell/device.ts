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

const WORDS: Record<DeviceKind, string> = {
  desktop: "este computador",
  tablet: "esta tablet",
  phone: "este celular",
}

type UaData = { mobile?: boolean; platform?: string }

export function detectDevice(): DeviceInfo {
  if (typeof window === "undefined") return build("desktop", false)
  const nav = navigator as Navigator & { userAgentData?: UaData }
  const ua = navigator.userAgent
  const coarse = window.matchMedia("(pointer: coarse)").matches
  const canHover = window.matchMedia("(hover: hover)").matches
  const shortSide = Math.min(window.screen.width, window.screen.height)
  const iPadOs = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
  const isTablet = /iPad|Tablet|PlayBook|Silk/.test(ua) || iPadOs || (/Android/.test(ua) && !/Mobile/.test(ua))
  const isPhone = nav.userAgentData?.mobile === true || /iPhone|iPod|Android.+Mobile|Windows Phone/.test(ua)

  if (isTablet) return build("tablet", true)
  if (isPhone) return build("phone", true)
  if (coarse && !canHover) return build(shortSide >= 600 ? "tablet" : "phone", true)
  return build("desktop", navigator.maxTouchPoints > 0 && coarse)
}

function build(kind: DeviceKind, touch: boolean): DeviceInfo {
  return { kind, touch, here: WORDS[kind], point: touch ? "Toca" : "Pasa el cursor sobre" }
}

export function applyDevice(info: DeviceInfo) {
  const root = document.documentElement
  root.dataset.device = info.kind
  root.dataset.input = info.touch ? "touch" : "mouse"
}

export function useDevice(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>(() => detectDevice())

  useEffect(() => {
    const update = () => {
      const next = detectDevice()
      applyDevice(next)
      setInfo((current) => (current.kind === next.kind && current.touch === next.touch ? current : next))
    }
    update()
    const queries = [window.matchMedia("(pointer: coarse)"), window.matchMedia("(hover: hover)")]
    queries.forEach((query) => query.addEventListener("change", update))
    window.addEventListener("orientationchange", update)
    return () => {
      queries.forEach((query) => query.removeEventListener("change", update))
      window.removeEventListener("orientationchange", update)
    }
  }, [])

  return info
}
