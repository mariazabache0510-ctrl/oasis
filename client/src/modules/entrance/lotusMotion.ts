/** Reloj y ayudas de la introducción. Sin Three, para poder precargar el resto aparte. */

const SEEN_KEY = "oasis.lotusIntro"

const clock = {
  startedAt: 0,
  handedOff: false,
}

export type LotusQuality = "full" | "light"

export function lotusSeenThisSession(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1"
  } catch {
    return false
  }
}

export function markLotusSeen(): void {
  try {
    sessionStorage.setItem(SEEN_KEY, "1")
  } catch {
    /* modo privado: la intro igual puede verse, solo no se recuerda */
  }
}

export function resetLotusClock(): void {
  clock.startedAt = 0
  clock.handedOff = false
}

export function anchorLotusClock(): void {
  if (!clock.startedAt) clock.startedAt = performance.now()
}

export function lotusElapsed(now = performance.now()): number {
  if (!clock.startedAt) clock.startedAt = now
  return (now - clock.startedAt) / 1000
}

/** Adelanta el reloj (botón Saltar) sin reiniciar la escena. */
export function advanceLotusClock(toSeconds: number): void {
  const elapsed = lotusElapsed()
  if (elapsed < toSeconds) clock.startedAt = performance.now() - toSeconds * 1000
}

export function takeLotusHandoff(): boolean {
  if (clock.handedOff) return false
  clock.handedOff = true
  return true
}

/** Cubre la pantalla y deja ver el inicio cuando la ruta ya cambió. */
export function revealHome(onDone: () => void, fadeMs = 620): void {
  if (!takeLotusHandoff()) return
  const veil = document.createElement("div")
  veil.className = "lotus-veil"
  veil.setAttribute("aria-hidden", "true")
  veil.style.opacity = "1"
  document.body.appendChild(veil)
  const reduce = prefersReducedMotion()
  if (!reduce) document.documentElement.classList.add("oasis-arriving")
  onDone()
  window.setTimeout(() => {
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / fadeMs)
      veil.style.opacity = String((1 - t) ** 2)
      if (t < 1) {
        requestAnimationFrame(step)
        return
      }
      veil.remove()
      document.documentElement.classList.remove("oasis-arriving")
    }
    requestAnimationFrame(step)
  }, reduce ? 30 : 120)
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

export function easeInOutCubic(t: number): number {
  const x = clamp01(t)
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

export function easeOutCubic(t: number): number {
  const x = clamp01(t)
  return 1 - (1 - x) ** 3
}

export function easeInCubic(t: number): number {
  const x = clamp01(t)
  return x * x * x
}

/** Un poco de rebote al asentarse, para que el capullo no aparezca rígido. */
export function easeOutBack(t: number): number {
  const x = clamp01(t)
  const c1 = 1.45
  const c3 = c1 + 1
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
}

export function span(time: number, start: number, end: number, ease: (t: number) => number): number {
  if (time <= start) return 0
  if (time >= end) return ease(1)
  return ease((time - start) / (end - start))
}

export const LOTUS_DURATION = 4.62
export const LOTUS_SKIP_AT = 3.92

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    return false
  }
}

function softwareRenderer(): boolean {
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl")
    if (!gl) return false
    const debug = gl.getExtension("WEBGL_debug_renderer_info")
    if (!debug) return false
    const name = String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
    return /swiftshader|llvmpipe|softpipe|software/i.test(name)
  } catch {
    return false
  }
}

export function lotusQuality(): LotusQuality {
  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean }
  }
  const memory = nav.deviceMemory
  const cores = navigator.hardwareConcurrency ?? 8
  const saveData = Boolean(nav.connection?.saveData)
  const small = Math.min(window.innerWidth, window.innerHeight) < 760
  const coarse = window.matchMedia("(pointer: coarse)").matches
  const phone = /iPhone|iPod|Android.+Mobile|Windows Phone/i.test(navigator.userAgent) || (coarse && small)
  if (saveData || phone || softwareRenderer() || (memory !== undefined && memory <= 4) || cores <= 2) return "light"
  return "full"
}
