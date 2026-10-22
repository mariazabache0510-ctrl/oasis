import Dexie, { type Table } from "dexie"

export type Tone = "luminoso" | "calma" | "regular" | "bajito" | "pesado"
export type FontScale = "md" | "lg" | "xl"
export type ThemeMode = "dia" | "noche"

export type AuthMode = "none" | "guest" | "google" | "local"

export type LocalAccount = { name: string; email: string; salt: string; hash: string; createdAt: number }

export type CompanionLook = "loto" | "isla" | "gota" | "bruma"

export type CompanionSettings = {
  name: string
  look: CompanionLook
  note: string
}

export type ChatLine = {
  id?: number
  role: "person" | "companion"
  text: string
  createdAt: number
  serviceId?: string
}

export const defaultCompanion: CompanionSettings = {
  name: "Loto",
  look: "loto",
  note: "",
}

export type Profile = {
  id: "me"
  name: string
  email: string
  auth: AuthMode
  fontScale: FontScale
  theme: ThemeMode
  simpleLanguage: boolean
  lastOfferDay: string
  lastDoor: string
  returning: boolean
  account?: LocalAccount
  companion?: CompanionSettings
}

export type Mark = { id?: number; day: string; tone: Tone }
export type Note = { id?: number; text: string; createdAt: number }
export type Capsule = { id?: number; text: string; openOn: string; createdAt: number }
export type TrustContact = { id?: number; name: string; phone: string }

class OasisDB extends Dexie {
  profile!: Table<Profile, string>
  marks!: Table<Mark, number>
  notes!: Table<Note, number>
  capsules!: Table<Capsule, number>
  contacts!: Table<TrustContact, number>
  messages!: Table<ChatLine, number>

  constructor() {
    super("oasis")
    this.version(1).stores({
      profile: "id",
      marks: "++id, day",
      notes: "++id, createdAt",
      capsules: "++id, openOn",
      contacts: "++id",
    })
    this.version(2).stores({
      profile: "id",
      marks: "++id, day",
      notes: "++id, createdAt",
      capsules: "++id, openOn",
      contacts: "++id",
      messages: "++id, createdAt",
    })
  }
}

export const db = new OasisDB()

export const emptyProfile: Profile = {
  id: "me",
  name: "",
  email: "",
  auth: "none",
  fontScale: "md",
  theme: "dia",
  simpleLanguage: false,
  lastOfferDay: "",
  lastDoor: "",
  returning: false,
}

export function todayKey(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

export const toneLabel: Record<Tone, string> = {
  luminoso: "luminoso",
  calma: "en calma",
  regular: "regular",
  bajito: "bajito",
  pesado: "pesado",
}
