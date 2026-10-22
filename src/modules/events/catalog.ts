export type EventType = "alcaldia" | "universidad" | "casa-cultura" | "entidad-publica" | "organizacion"

export const eventTypes: { id: EventType; label: string }[] = [
  { id: "alcaldia", label: "Alcaldía" },
  { id: "universidad", label: "Universidad" },
  { id: "casa-cultura", label: "Casa de la Cultura" },
  { id: "entidad-publica", label: "Entidad pública" },
  { id: "organizacion", label: "Organización" },
]

export type ActivityCategory = "distraccion" | "bienestar" | "ludica"

export const activityCategories: { id: ActivityCategory; label: string }[] = [
  { id: "distraccion", label: "Distracción" },
  { id: "bienestar", label: "Bienestar" },
  { id: "ludica", label: "Lúdicas" },
]

export type WellnessEvent = {
  id: string
  title: string
  summary: string
  /** Quién organiza (nombre propio de la entidad). */
  organizer: string
  type: EventType
  /** Filtro de la agenda: distracción, bienestar o lúdicas. */
  category: ActivityCategory
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
    id: "ejemplo-pausas-activas", offset: 1, time: "17:30", minutes: 45, type: "alcaldia", category: "ludica",
    title: "Pausas activas en el parque",
    summary: "Evento de ejemplo: estiramientos suaves y respiración guiada.",
    organizer: "Alcaldía de Villavicencio (ejemplo)", place: "Lugar por confirmar", free: true,
  },
  {
    id: "ejemplo-taller-estres", offset: 2, time: "15:00", minutes: 75, type: "universidad", category: "bienestar",
    title: "Taller para bajar el estrés",
    summary: "Evento de ejemplo: herramientas sencillas para los días de muchas entregas.",
    organizer: "Bienestar universitario (ejemplo)", place: "Lugar por confirmar", free: true,
  },
  {
    id: "ejemplo-autocuidado", offset: 3, time: "09:00", minutes: 60, type: "entidad-publica", category: "bienestar",
    title: "Charla de autocuidado",
    summary: "Evento de ejemplo: hábitos que ayudan y a quién acudir cuando pesa.",
    organizer: "Entidad pública (ejemplo)", place: "Lugar por confirmar", free: true,
  },
  {
    id: "ejemplo-pintura-libre", offset: 4, time: "15:00", minutes: 120, type: "casa-cultura", category: "distraccion",
    title: "Taller de pintura libre",
    summary: "Evento de ejemplo: colores y pinceles, sin notas ni resultados.",
    organizer: "Casa de la Cultura (ejemplo)", place: "Lugar por confirmar", free: true,
  },
  {
    id: "ejemplo-circulo-escucha", offset: 5, time: "16:00", minutes: 90, type: "organizacion", category: "bienestar",
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

export function listEvents(anchor: Date = new Date(), extra: WellnessEvent[] = []): WellnessEvent[] {
  const base = realEvents.length > 0 ? realEvents : sampleEvents(anchor)
  const seen = new Set<string>()
  const merged: WellnessEvent[] = []
  for (const event of [...base, ...extra]) {
    if (seen.has(event.id)) continue
    seen.add(event.id)
    merged.push(event)
  }
  return merged.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
}

/** Sin categorías seleccionadas, la agenda muestra todo. */
export function filterByCategory(events: WellnessEvent[], categories: ActivityCategory[]): WellnessEvent[] {
  if (categories.length === 0) return events
  return events.filter((event) => categories.includes(event.category))
}

const CLINICAL = /diagn[oó]st|tratamient|medicament|receta|dosis|suicid|prescri/i

export type ActivityDraft = {
  title: string
  summary: string
  organizer: string
  type: EventType
  category: ActivityCategory
  date: string
  time: string
  minutes?: number
  place: string
}

export type ExampleActivityResult = { ok: true; event: WellnessEvent } | { ok: false; error: string }

/** Una publicación de la sala siempre queda como ejemplo, sin fuente y sin verificación. */
export function asExampleActivity(draft: ActivityDraft, id: string): ExampleActivityResult {
  const title = draft.title.trim()
  const summary = draft.summary.trim()
  const place = draft.place.trim()
  const organizerRaw = draft.organizer.trim()
  if (title.length < 3 || title.length > 120) return { ok: false, error: "El título necesita entre 3 y 120 caracteres." }
  if (summary.length < 3 || summary.length > 400) return { ok: false, error: "El resumen necesita entre 3 y 400 caracteres." }
  if (place.length < 2 || place.length > 120) return { ok: false, error: "Falta el lugar, marcado como ejemplo." }
  if (organizerRaw.length < 2 || organizerRaw.length > 120) return { ok: false, error: "Falta quién organiza." }
  if (!eventTypes.some((item) => item.id === draft.type)) return { ok: false, error: "El tipo de organizador no es válido." }
  if (!activityCategories.some((item) => item.id === draft.category)) return { ok: false, error: "La categoría debe ser distracción, bienestar o lúdicas." }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date) || dayKey(parseDay(draft.date)) !== draft.date) {
    return { ok: false, error: "La fecha va en formato AAAA-MM-DD." }
  }
  if (!/^\d{2}:\d{2}$/.test(draft.time)) return { ok: false, error: "La hora va en formato HH:MM." }
  const [hour, minute] = draft.time.split(":").map(Number)
  if (hour > 23 || minute > 59) return { ok: false, error: "La hora no es válida." }
  if (CLINICAL.test(`${title} ${summary} ${place} ${organizerRaw}`)) {
    return { ok: false, error: "La actividad no puede usar lenguaje clínico. Oasis no diagnostica." }
  }
  const minutes = draft.minutes && draft.minutes > 0 && draft.minutes <= 480 ? Math.round(draft.minutes) : 60
  return {
    ok: true,
    event: {
      id,
      title: /^ejemplo\b/i.test(title) ? title : `Ejemplo: ${title}`,
      summary: /ejemplo/i.test(summary) ? summary : `${summary} Actividad de ejemplo, sin confirmar.`,
      organizer: /ejemplo/i.test(organizerRaw) ? organizerRaw : `${organizerRaw} (ejemplo)`,
      type: draft.type,
      category: draft.category,
      date: draft.date,
      time: draft.time,
      minutes,
      place,
      free: true,
      sourceUrl: null,
      verifiedAt: null,
      sample: true,
    },
  }
}
