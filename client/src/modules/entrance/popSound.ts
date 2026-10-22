const KEY = "oasis-pop-sound"
// Pentatónica mayor: cualquier mezcla de notas suena bien junta.
const STEPS = [0, 2, 4, 7, 9, 12, 14, 16]

let ctx: AudioContext | null = null
let noise: AudioBuffer | null = null
let step = 0
let lastAt = 0
let muted = false

try {
  muted = window.localStorage.getItem(KEY) === "off"
} catch {
  muted = false
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(next: boolean) {
  muted = next
  try {
    window.localStorage.setItem(KEY, next ? "off" : "on")
  } catch {
    // sin almacenamiento: el estado vive solo en esta visita
  }
}

/** Debe llamarse dentro de un gesto del usuario (clic, toque o tecla). */
export function unlockAudio(): boolean {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return false
      ctx = new Ctor()
    }
    if (ctx.state === "suspended") void ctx.resume()
    return ctx.state !== "closed"
  } catch {
    return false
  }
}

export function audioReady(): boolean {
  return ctx !== null && ctx.state === "running"
}

function noiseBuffer(audio: AudioContext): AudioBuffer {
  if (noise) return noise
  const length = Math.floor(audio.sampleRate * 0.05)
  noise = audio.createBuffer(1, length, audio.sampleRate)
  const data = noise.getChannelData(0)
  for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1
  return noise
}

/** size: 0 (burbuja chica, nota aguda) a 1 (burbuja grande, nota grave). */
export function playPop(size: number) {
  if (muted || !ctx || ctx.state !== "running") return
  const now = ctx.currentTime
  if (now - lastAt < 0.035) return
  lastAt = now

  const semitone = STEPS[step % STEPS.length]
  step += 1 + Math.floor(Math.random() * 2)
  const base = 330 * 2 ** (semitone / 12) * (1.4 - size * 0.55)

  const body = ctx.createOscillator()
  const bodyGain = ctx.createGain()
  body.type = "sine"
  body.frequency.setValueAtTime(base * 0.75, now)
  body.frequency.exponentialRampToValueAtTime(base * 2.1, now + 0.07)
  bodyGain.gain.setValueAtTime(0.0001, now)
  bodyGain.gain.exponentialRampToValueAtTime(0.2, now + 0.006)
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17)
  body.connect(bodyGain).connect(ctx.destination)
  body.start(now)
  body.stop(now + 0.2)

  const ping = ctx.createOscillator()
  const pingGain = ctx.createGain()
  ping.type = "triangle"
  ping.frequency.setValueAtTime(base * 3, now)
  pingGain.gain.setValueAtTime(0.0001, now)
  pingGain.gain.exponentialRampToValueAtTime(0.05, now + 0.004)
  pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)
  ping.connect(pingGain).connect(ctx.destination)
  ping.start(now)
  ping.stop(now + 0.1)

  const click = ctx.createBufferSource()
  const clickFilter = ctx.createBiquadFilter()
  const clickGain = ctx.createGain()
  click.buffer = noiseBuffer(ctx)
  clickFilter.type = "highpass"
  clickFilter.frequency.value = 2200
  clickGain.gain.setValueAtTime(0.09, now)
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035)
  click.connect(clickFilter).connect(clickGain).connect(ctx.destination)
  click.start(now)
}
