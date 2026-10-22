export type ServiceCard = {
  id: string
  name: string
  channel: string
  phone: string
  phoneHref: string
  whatsapp: string | null
  hours: string
  summary: string
  whatHappens: string[]
  script: string
  source: string
  sourceDate: string
}

export const SOURCE =
  "Directorio de salud mental y prevención del suicidio, MinSalud"
export const SOURCE_DATE = "19 oct 2026"

const whatHappens = [
  "Contesta una persona de esa línea.",
  "Puedes decir tu nombre si quieres. También puedes no decirlo.",
  "Si no sabes cómo empezar, puedes leer en voz alta la frase de esta ficha.",
  "Puedes colgar cuando quieras.",
]

export const services: ServiceCard[] = [
  {
    id: "yo-te-escucho",
    name: "Yo Te Escucho Villavicencio",
    channel: "Llamada y WhatsApp",
    phone: "316 390 7010",
    phoneHref: "tel:+573163907010",
    whatsapp: "573163907010",
    hours: "24 horas, todos los días",
    summary: "Línea de la Alcaldía de Villavicencio para hablar con una persona.",
    whatHappens,
    script:
      "Hola. Estoy en Villavicencio y quiero hablar con alguien. No sé bien cómo explicarlo, pero necesitaba llamar.",
    source: SOURCE,
    sourceDate: SOURCE_DATE,
  },
  {
    id: "linea-106",
    name: "Línea 106",
    channel: "Llamada nacional",
    phone: "106",
    phoneHref: "tel:106",
    whatsapp: null,
    hours: "24 horas, todos los días",
    summary: "Línea nacional de salud mental.",
    whatHappens,
    script:
      "Hola. Quiero hablar con alguien de la línea 106. Me cuesta explicar cómo estoy, así que voy a leer esto: necesito que me escuchen.",
    source: SOURCE,
    sourceDate: SOURCE_DATE,
  },
  {
    id: "linea-018000",
    name: "Línea 01 8000 931 089",
    channel: "Llamada gratuita",
    phone: "01 8000 931 089",
    phoneHref: "tel:018000931089",
    whatsapp: null,
    hours: "Según el directorio consultado",
    summary: "Línea gratuita del directorio nacional.",
    whatHappens,
    script:
      "Hola. Estoy llamando a esta línea porque quiero hablar con una persona. Puedo ir despacio.",
    source: SOURCE,
    sourceDate: SOURCE_DATE,
  },
]

export const VILLAVICENCIO = { lat: 4.142, lng: -73.6266, label: "Villavicencio" }

export type ExamplePoint = {
  id: string
  lat: number
  lng: number
  label: string
  note: string
  sample: true
}

/** Puntos ficticios. No son consultorios ni canales verificados. */
export const examplePoints: ExamplePoint[] = [
  {
    id: "ejemplo-parque",
    lat: 4.1522,
    lng: -73.637,
    label: "Parque de ejemplo",
    note: "Punto ficticio para orientar el mapa. No es un servicio de salud ni un lugar confirmado.",
    sample: true,
  },
  {
    id: "ejemplo-biblioteca",
    lat: 4.135,
    lng: -73.618,
    label: "Biblioteca de ejemplo",
    note: "Punto ficticio. No es un canal verificado.",
    sample: true,
  },
]

export function inactiveChannelNote(service: ServiceCard, observedOn: string): string {
  return [
    "Aviso de canal inactivo",
    `Línea: ${service.name}`,
    `Teléfono publicado: ${service.phone}`,
    `Fuente: ${service.source}`,
    `Fecha de consulta de la fuente: ${service.sourceDate}`,
    `Observación: no respondió el ${observedOn}.`,
    "Sin datos de una persona. No reemplazar el número sin una fuente nueva y su fecha.",
  ].join("\n")
}

export function listServices(): ServiceCard[] {
  return services
}

export function getService(id: string): ServiceCard | undefined {
  return services.find((service) => service.id === id)
}
