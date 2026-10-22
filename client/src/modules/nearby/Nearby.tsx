import { useEffect, useState, type CSSProperties } from "react"
import { MapContainer, CircleMarker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet"
import { officialWhatsappHref } from "@modules/bridge/whatsapp"
import { examplePoints, inactiveChannelNote, listServices, VILLAVICENCIO, type ServiceCard } from "@modules/directory/catalog"
import { todayKey } from "../local-data/db"
import { track } from "../shell/track"
import { useDevice } from "../shell/device"
import { OasisCard } from "../shell/OasisCard"
import { PageHead } from "../shell/PageHead"
import { CallIcon, ChatIcon, PhoneGlyph } from "../home/Icons"
import { WeekAgenda } from "./WeekAgenda"
import "leaflet/dist/leaflet.css"

function Recenter({ position }: { position: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(position, 13)
  }, [map, position])
  return null
}

function toneOf(service: ServiceCard): "peach" | "sky" | "mint" {
  if (service.id === "yo-te-escucho") return "peach"
  return service.id === "linea-106" ? "sky" : "mint"
}

export function Nearby() {
  const { here } = useDevice()
  const services = listServices()
  const [position, setPosition] = useState<[number, number]>([VILLAVICENCIO.lat, VILLAVICENCIO.lng])
  const [located, setLocated] = useState(false)
  const [message, setMessage] = useState("El mapa abre en Villavicencio. La ubicación se usa solo ahora y no se guarda.")
  const [copied, setCopied] = useState("")

  useEffect(() => {
    track("directory_open")
  }, [])

  async function report(service: ServiceCard) {
    const note = inactiveChannelNote(service, todayKey())
    try {
      await navigator.clipboard.writeText(note)
      setCopied(`Anoté el aviso de ${service.name}. No se envió a ningún servidor.`)
    } catch {
      setCopied("No pude copiar. El aviso queda en la ficha: no cambies el número por tu cuenta.")
    }
  }

  function locate() {
    if (!navigator.geolocation) {
      setMessage(`${here.charAt(0).toUpperCase()}${here.slice(1)} no compartió la ubicación. Las líneas siguen aquí.`)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (point) => {
        setPosition([point.coords.latitude, point.coords.longitude])
        setLocated(true)
        setMessage("Listo. El punto es donde estás ahora. No lo guardamos.")
      },
      () => setMessage("Sin permiso de ubicación igual puedes llamar. Las líneas no dependen del mapa."),
      { enableHighAccuracy: false, maximumAge: 0, timeout: 8000 },
    )
  }

  return (
    <>
      <PageHead
        eyebrow="Qué hay cerca"
        title="Líneas para llamar,"
        accent="con fecha."
        lede="Estas fichas son teléfonos, no sedes. No inventamos consultorios en el mapa."
      />

      <section className="split near-split">
        <div className="tile-float near-map-float">
          <OasisCard tone="sky" className="near-map">
            <h2 className="oasis-title">Tu mapa</h2>
            <div className="map-wrap">
              <MapContainer center={position} zoom={12} scrollWheelZoom={false}>
                <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <CircleMarker center={position} radius={located ? 12 : 8} pathOptions={{ color: "#3d3a46", fillColor: "#f6cdb6", fillOpacity: 0.9 }}>
                  <Tooltip>{located ? "Donde estás ahora. No se guarda." : "Villavicencio"}</Tooltip>
                </CircleMarker>
                {examplePoints.map((point) => (
                  <CircleMarker key={point.id} center={[point.lat, point.lng]} radius={8} pathOptions={{ color: "#6d6778", fillColor: "#c9dcc8", fillOpacity: 0.9, dashArray: "4 3" }}>
                    <Tooltip permanent direction="top">
                      Ejemplo
                    </Tooltip>
                    <Popup>
                      <strong>Ejemplo. {point.label}</strong>
                      <p>{point.note}</p>
                    </Popup>
                  </CircleMarker>
                ))}
                <Recenter position={position} />
              </MapContainer>
            </div>
            <p className="muted map-legend">El punto durazno es Villavicencio, o donde estás si lo pides. Los puntos salvia dicen Ejemplo: son ficticios y no son servicios verificados.</p>
            <p className="muted" role="status">
              {message}
              {copied ? ` ${copied}` : ""}
            </p>
            <button className="btn btn-sky near-locate" type="button" onClick={locate}>
              Usar donde estoy
            </button>
          </OasisCard>
        </div>

        <div className="near-lines">
          {services.map((service, index) => (
            <div className="tile-float" style={{ "--i": index + 1 } as CSSProperties} key={service.id}>
              <OasisCard as="article" tone={toneOf(service)} index={index + 1} className="line-card" aria-labelledby={`line-${service.id}`}>
                <div className="line-top">
                  <span className="line-badge" aria-hidden="true">
                    <CallIcon />
                  </span>
                  <span className="oasis-chip">{service.channel}</span>
                </div>
                <h2 className="oasis-title" id={`line-${service.id}`}>
                  {service.name}
                </h2>
                <p className="line-summary">{service.summary}</p>
                <p className="line-hours">
                  <span className="live-dot" aria-hidden="true" />
                  {service.hours}
                </p>
                <p className="line-phone">{service.phone}</p>
                <h3 className="talk-sub">Qué pasa si llamo</h3>
                <ol className="talk-steps">
                  {service.whatHappens.map((step) => (
                    <li key={step}>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="line-script">{service.script}</p>
                <div className="line-actions">
                  <a className="line-btn line-btn--call" href={service.phoneHref} onClick={() => track("call_click")}>
                    <PhoneGlyph />
                    <span>Llamar al {service.phone}</span>
                  </a>
                  {officialWhatsappHref(service) ? (
                    <a className="line-btn line-btn--chat" href={officialWhatsappHref(service) ?? undefined} target="_blank" rel="noopener noreferrer">
                      <span className="line-btn-icon" aria-hidden="true">
                        <ChatIcon />
                      </span>
                      <span>WhatsApp con el guion</span>
                    </a>
                  ) : null}
                  <button className="btn btn-ghost" type="button" onClick={() => void report(service)}>
                    Anotar que no contestó
                  </button>
                </div>
                <p className="muted line-source">
                  {service.source}. Consultado el {service.sourceDate}.
                </p>
              </OasisCard>
            </div>
          ))}
        </div>
      </section>

      <WeekAgenda />
    </>
  )
}
