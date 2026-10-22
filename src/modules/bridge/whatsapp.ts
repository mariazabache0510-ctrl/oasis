/**
 * Puente hacia WhatsApp. Solo arma un enlace wa.me.
 * No llama a la red, no usa la API de WhatsApp Business y no envía el mensaje.
 */

export const TRUST_MESSAGE =
  "Hola. Soy yo. Quería escribirte. Yo elegí enviarte este mensaje."

/**
 * Devuelve null si el número no es un celular (línea corta o 01 8000).
 * Un celular de 10 dígitos se completa con el indicativo 57.
 */
export function whatsappHref(phone: string, text: string): string | null {
  const digits = phone.replace(/\D/g, "")
  if (!digits) return null
  const normalized = digits.length === 10 ? `57${digits}` : digits
  if (normalized.length < 11 || normalized.length > 15) return null
  if (normalized.startsWith("018")) return null
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`
}

export function officialWhatsappHref(service: { whatsapp: string | null; script: string }): string | null {
  if (!service.whatsapp) return null
  return whatsappHref(service.whatsapp, service.script)
}
