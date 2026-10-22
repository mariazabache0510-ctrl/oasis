import { useEffect, useState } from "react"
import { MapContainer, CircleMarker, TileLayer, useMap } from "react-leaflet"
import { listServices, VILLAVICENCIO } from "@modules/directory/catalog"
import { track } from "../shell/track"
import { useDevice } from "../shell/device"
import "leaflet/dist/leaflet.css"

const plans = [
  { title: "Cine al aire libre", when: "Sábado · Parque de los Fundadores" },
  { title: "Tarde de lectura", when: "Miércoles · biblioteca" },
  { title: "Fútbol en el barrio", when: "Domingo en la mañana" },
]

function Recenter({ position }: { position: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(position, 13)
  }, [map, position])
  return null
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
      <section className="hero">
        <p className="eyebrow">Qué hay cerca</p>
        <h1>Líneas para llamar, con fecha.</h1>
        <p className="lede">Estas fichas son teléfonos, no sedes. No inventamos consultorios en el mapa.</p>
      </section>
      <section className="split">
        <div className="panel">
          <div className="map-wrap">
            <MapContainer center={position} zoom={12} scrollWheelZoom={false}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <CircleMarker center={position} radius={located ? 12 : 8} pathOptions={{ color: "#3d3a46", fillColor: "#f6cdb6", fillOpacity: 0.9 }} />
              <Recenter position={position} />
            </MapContainer>
          </div>
          <p className="muted">{message}</p>
          <button className="btn btn-sky" type="button" onClick={locate}>
            Usar donde estoy
          </button>
        </div>
        <div className="stack">
          {services.map((service) => (
            <article className="card" key={service.id}>
              <h2>{service.name}</h2>
              <p>{service.summary}</p>
              <p>{service.hours}</p>
              <p className="muted">
                {service.source}. Consultado el {service.sourceDate}.
              </p>
              <a className="btn btn-peach" href={service.phoneHref} onClick={() => track("call_click")}>
                Llamar al {service.phone}
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>Qué hay esta semana</h2>
        <p className="muted">Texto de prototipo. Son ejemplos para mostrar la puerta, no una agenda real.</p>
        <div className="stack">
          {plans.map((plan) => (
            <article key={plan.title}>
              <h3>{plan.title}</h3>
              <p>{plan.when}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
