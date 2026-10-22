import { useEffect, useState, type CSSProperties } from "react"
import { MapContainer, CircleMarker, TileLayer, useMap } from "react-leaflet"
import { listServices, VILLAVICENCIO, type ServiceCard } from "@modules/directory/catalog"
import { track } from "../shell/track"
import { useDevice } from "../shell/device"
import { OasisCard } from "../shell/OasisCard"
import { PageHead } from "../shell/PageHead"
import { CallIcon, ChatIcon } from "../home/Icons"
import { WeekAgenda } from "./WeekAgenda"
import "leaflet/dist/leaflet.css"

function Recenter({ position }: { position: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(position, 13)
  }, [map, position])
  return null
}

function PhoneGlyph() {
  return (
    <svg className="line-btn-icon line-btn-phone" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        fill="currentColor"
      />
    </svg>
  )
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

  useEffect(() => {
    track("directory_open")
  }, [])

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
                <CircleMarker center={position} radius={located ? 12 : 8} pathOptions={{ color: "#3d3a46", fillColor: "#f6cdb6", fillOpacity: 0.9 }} />
                <Recenter position={position} />
              </MapContainer>
            </div>
            <p className="muted" role="status">
              {message}
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
                <p className="line-phone" aria-hidden="true">
                  {service.phone}
                </p>
                <div className="line-actions">
                  <a className="line-btn line-btn--call" href={service.phoneHref} onClick={() => track("call_click")}>
                    <PhoneGlyph />
                    <span>Llamar al {service.phone}</span>
                  </a>
                  {service.whatsapp ? (
                    <a
                      className="line-btn line-btn--chat"
                      href={`https://wa.me/${service.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="line-btn-icon" aria-hidden="true">
                        <ChatIcon />
                      </span>
                      <span>Escribir por WhatsApp</span>
                    </a>
                  ) : null}
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
