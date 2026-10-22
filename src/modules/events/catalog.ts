export type EventType = "alcaldia" | "universidad" | "casa-cultura" | "entidad-publica" | "organizacion"

export const eventTypes: { id: EventType; label: string }[] = [
  { id: "alcaldia", label: "Alcaldía" },
  { id: "universidad", label: "Universidad" },
  { id: "casa-cultura", label: "Casa de la Cultura" },
  { id: "entidad-publica", label: "Entidad pública" },
  { id: "organizacion", label: "Organización" },
]

export type WellnessEvent = {
  id: string
  title: string
  summary: string
  /** Quién organiza (nombre propio de la entidad). */
  organizer: string
  type: EventType
  /** Fecha local en formato AAAA-MM-DD. */
  date: string
  /** Hora local de inicio, "HH:MM" en 24 horas. */
  time: string
  minutes: number
  place: string
  free: boolean
  /** Enlace a la fuente oficial del evento. null mientras sea un ejemplo. */
  sourceUrl: string | null
  /** Día (AAAA-MM-DD) en que alguien confirmó el evento en la fuente. null si no está verificado. */
  verifiedAt: string | null
  /** true = evento de ejemplo, no es una actividad real. */
  sample: boolean
}

/**
 * EVENTOS REALES. Cuando tengas la programación confirmada, agrégala aquí con
 * su `sourceUrl`, su `verifiedAt` y `sample: false`. Mientras esta lista esté
 * vacía, la agenda muestra los eventos de ejemplo de más abajo, marcados como tal.
 */
export const realEvents: WellnessEvent[] = []

export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

/** Lee "AAAA-MM-DD" como fecha local (sin saltos por zona horaria). */
export function parseDay(value: string): Date {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function mondayOf(date: Date): Date {
  const lead = (date.getDay() + 6) % 7
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - lead)
}

type SampleSeed = Omit<WellnessEvent, "date" | "sourceUrl" | "verifiedAt" | "sample"> & {
  /** 0 = lunes ... 6 = domingo, dentro de la semana de referencia. */
  offset: number
}

const seeds: SampleSeed[] = [
  {
    id: "ejemplo-pausas-activas", offset: 1, time: "17:30", minutes: 45, type: "alcaldia",
    title: "Pausas activas en el parque",
    summary: "Evento de ejemplo: estiramientos suaves y respiración guiada.",
    organizer: "Alcaldía de Villavicencio (ejemplo)", place: "Lugar por confirmar", free: true,
  },
  {
    id: "ejemplo-taller-estres", offset: 2, time: "15:00", minutes: 75, type: "universidad",
    title: "Taller para bajar el estrés",
    summary: "Evento de ejemplo: herramientas sencillas para los días de muchas entregas.",
    organizer: "Bienestar universitario (ejemplo)", place: "Lugar por confirmar", free: true,
  },
  {
    id: "ejemplo-autocuidado", offset: 3, time: "09:00", minutes: 60, type: "entidad-publica",
    title: "Charla de autocuidado",
    summary: "Evento de ejemplo: hábitos que ayudan y a quién acudir cuando pesa.",
    organizer: "Entidad pública (ejemplo)", place: "Lugar por confirmar", free: true,
  },
  {
    id: "ejemplo-pintura-libre", offset: 4, time: "15:00", minutes: 120, type: "casa-cultura",
    title: "Taller de pintura libre",
    summary: "Evento de ejemplo: colores y pinceles, sin notas ni resultados.",
    organizer: "Casa de la Cultura (ejemplo)", place: "Lugar por confirmar", free: true,
  },
  {
    id: "ejemplo-circulo-escucha", offset: 5, time: "16:00", minutes: 90, type: "organizacion",
    title: "Círculo de escucha",
    summary: "Evento de ejemplo: un grupo pequeño para hablar y escuchar.",
    organizer: "Organización comunitaria (ejemplo)", place: "Lugar por confirmar", free: true,
  },
]

/** Eventos de ejemplo ubicados dentro de la semana de `anchor`, para que la agenda siempre muestre algo. */
export function sampleEvents(anchor: Date): WellnessEvent[] {
  const monday = mondayOf(anchor)
  return seeds.map(({ offset, ...seed }) => ({
    ...seed,
    date: dayKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset)),
    sourceUrl: null,
    verifiedAt: null,
    sample: true,
  }))
}

export function listEvents(anchor: Date = new Date()): WellnessEvent[] {
  const events = realEvents.length > 0 ? realEvents : sampleEvents(anchor)
  return [...events].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
}
