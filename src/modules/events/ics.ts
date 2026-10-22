import { parseDay, type WellnessEvent } from "./catalog.js"

function text(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

function stamp(date: Date, time: string, plusMinutes = 0): string {
  const [hour, minute] = time.split(":").map(Number)
  const moment = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute + plusMinutes)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${moment.getFullYear()}${pad(moment.getMonth() + 1)}${pad(moment.getDate())}T${pad(moment.getHours())}${pad(moment.getMinutes())}00`
}

/** Archivo .ics de un evento. Los ejemplos se marcan en el título para que nadie crea que son reales. */
export function buildIcs(event: WellnessEvent): string {
  const date = parseDay(event.date)
  const description = [
    event.summary,
    event.sample ? "Evento de ejemplo: no es una actividad confirmada." : `Fuente: ${event.sourceUrl ?? "sin enlace"}`,
    event.verifiedAt ? `Verificado el ${event.verifiedAt}.` : "Sin verificar.",
  ].join("\n")
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Oasis//Agenda de bienestar//ES",
    "BEGIN:VEVENT",
    `UID:${event.id}@oasis`,
    `DTSTAMP:${stamp(new Date(), "00:00")}`,
    `DTSTART:${stamp(date, event.time)}`,
    `DTEND:${stamp(date, event.time, event.minutes)}`,
    `SUMMARY:${text(event.sample ? `[Ejemplo] ${event.title}` : event.title)}`,
    `LOCATION:${text(`${event.place}, Villavicencio`)}`,
    `DESCRIPTION:${text(description)}`,
    ...(event.sourceUrl ? [`URL:${event.sourceUrl}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}
