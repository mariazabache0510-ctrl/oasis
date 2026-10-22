import { useState } from "react"

type Playlist = { available: boolean; name: string | null; embedUrl: string | null }

const tracks = [
  { id: "lluvia", name: "Lluvia en el patio", hz: 196 },
  { id: "tarde", name: "Tarde lenta", hz: 262 },
  { id: "ventana", name: "Ventana abierta", hz: 330 },
]

function playTone(hz: number): boolean {
  const Ctx = window.AudioContext
  if (!Ctx) return false
  const ctx = new Ctx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = "sine"
  osc.frequency.value = hz
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + 0.08)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 1.85)
  osc.onended = () => void ctx.close()
  return true
}

export function Listening({ spotify, youtube }: { spotify: Playlist | null; youtube: Playlist | null }) {
  const [current, setCurrent] = useState<string | null>(null)
  const [note, setNote] = useState("Elige un sonido. No hay puntaje.")
  const online = [spotify, youtube].filter((card) => card?.available && card.embedUrl)

  function listen(id: string, hz: number, name: string) {
    const ok = playTone(hz)
    setCurrent(id)
    setNote(ok ? `Suena ${name}. Se genera en este navegador.` : "Este navegador no generó el sonido. Puedes quedarte con la lectura.")
    window.setTimeout(() => setCurrent((value) => (value === id ? null : value)), 1800)
  }

  return (
    <div className={current ? "listen is-playing" : "listen"}>
      {online.length === 0 ? (
        <p className="listen-flag">Escucha de ejemplo, sin playlist externa. Sirve aunque falten las llaves o no haya internet.</p>
      ) : (
        online.map((card) =>
          card?.embedUrl ? (
            <div className="stack" key={card.embedUrl}>
              <h3 className="oasis-title">{card.name || "Playlist"}</h3>
              <iframe className="player" title={card.name || "Playlist"} src={card.embedUrl} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" />
            </div>
          ) : null,
        )
      )}
      {online.length === 0 ? (
        <>
          <div className="listen-bars" aria-hidden="true">
            {tracks.map((track, index) => (
              <i key={track.id} style={{ animationDelay: `${index * 0.15}s` }} />
            ))}
          </div>
          <ul className="listen-list">
            {tracks.map((track) => (
              <li key={track.id}>
                <button
                  className="btn btn-sage listen-track"
                  type="button"
                  aria-pressed={current === track.id}
                  onClick={() => listen(track.id, track.hz, track.name)}
                >
                  <span>{track.name}</span>
                  <span>{current === track.id ? "Sonando" : "Escuchar"}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="muted" role="status">
            {note}
          </p>
        </>
      ) : null}
    </div>
  )
}
