import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import {
  db,
  emptyProfile,
  todayKey,
  type Capsule,
  type FontScale,
  type Mark,
  type Note,
  type ChatLine,
  type CompanionSettings,
  type Profile,
  type ThemeMode,
  type Tone,
  type TrustContact,
  defaultCompanion,
} from "./db"
import { hashPassword, newSalt, sameHash } from "./account"
import { track } from "../shell/track"

type OasisContextValue = {
  ready: boolean
  profile: Profile
  marks: Mark[]
  notes: Note[]
  capsules: Capsule[]
  contacts: TrustContact[]
  todayMark?: Mark
  setName: (name: string) => Promise<void>
  setFontScale: (fontScale: FontScale) => Promise<void>
  setTheme: (theme: ThemeMode) => Promise<void>
  setSimpleLanguage: (simpleLanguage: boolean) => Promise<void>
  setLastDoor: (lastDoor: string) => Promise<void>
  setOfferDay: (day: string) => Promise<void>
  saveMark: (tone: Tone) => Promise<void>
  addNote: (text: string) => Promise<void>
  deleteNote: (id: number) => Promise<void>
  addCapsule: (text: string, openOn: string) => Promise<void>
  deleteCapsule: (id: number) => Promise<void>
  addContact: (name: string, phone: string) => Promise<void>
  deleteContact: (id: number) => Promise<void>
  messages: ChatLine[]
  setCompanion: (patch: Partial<CompanionSettings>) => Promise<void>
  addMessage: (line: ChatLine) => Promise<void>
  clearLocal: () => Promise<void>
  signInGuest: (name: string) => Promise<void>
  signInGoogle: (name: string, email: string) => Promise<void>
  signOut: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<AuthResult>
  login: (email: string, password: string) => Promise<AuthResult>
}

export type AuthResult = { ok: true } | { ok: false; message: string }

const OasisContext = createContext<OasisContextValue | null>(null)

function initialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem("oasis-theme")
    if (saved === "noche" || saved === "dia") return saved
  } catch {
    /* el navegador puede bloquear el almacenamiento */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "noche" : "dia"
}

function withTheme(profile: Profile | undefined): Profile {
  const theme = profile?.theme === "noche" || profile?.theme === "dia" ? profile.theme : initialTheme()
  return { ...emptyProfile, ...(profile ?? {}), theme }
}

async function loadAll() {
  const [profile, marks, notes, capsules, contacts, messages] = await Promise.all([
    db.profile.get("me"),
    db.marks.orderBy("day").toArray(),
    db.notes.orderBy("createdAt").reverse().toArray(),
    db.capsules.orderBy("openOn").toArray(),
    db.contacts.toArray(),
    db.messages.orderBy("createdAt").toArray(),
  ])
  return {
    profile: withTheme(profile),
    marks,
    notes,
    capsules,
    contacts,
    messages,
  }
}

export function OasisProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [profile, setProfile] = useState<Profile>(emptyProfile)
  const [marks, setMarks] = useState<Mark[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [contacts, setContacts] = useState<TrustContact[]>([])
  const [messages, setMessages] = useState<ChatLine[]>([])
  const profileRef = useRef(emptyProfile)
  const revision = useRef(0)

  async function refresh() {
    const started = revision.current
    const next = await loadAll()
    setMarks(next.marks)
    setNotes(next.notes)
    setCapsules(next.capsules)
    setContacts(next.contacts)
    setMessages(next.messages)
    if (revision.current !== started) return
    profileRef.current = next.profile
    setProfile(next.profile)
  }

  useEffect(() => {
    refresh()
      .catch(() => undefined)
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    document.documentElement.dataset.font = profile.fontScale
  }, [profile.fontScale])

  useEffect(() => {
    document.documentElement.dataset.theme = profile.theme
    try {
      localStorage.setItem("oasis-theme", profile.theme)
    } catch {
      /* sigue en esta visita */
    }
  }, [profile.theme])

  async function updateProfile(patch: Partial<Profile>) {
    revision.current += 1
    const next = { ...profileRef.current, ...patch, id: "me" as const }
    profileRef.current = next
    setProfile(next)
    await db.profile.put(next)
  }

  const today = todayKey()
  const value: OasisContextValue = {
      ready,
      profile,
      marks,
      notes,
      capsules,
      contacts,
      messages,
      setCompanion: (patch) => updateProfile({ companion: { ...defaultCompanion, ...profileRef.current.companion, ...patch } }),
      addMessage: async (line) => {
        await db.messages.add(line)
        const all = await db.messages.orderBy("createdAt").toArray()
        const overflow = all.length - 40
        if (overflow > 0) {
          await Promise.all(all.slice(0, overflow).map((row) => (row.id ? db.messages.delete(row.id) : Promise.resolve())))
        }
        await refresh()
      },
      todayMark: marks.find((mark) => mark.day === today),
      setName: (name) => updateProfile({ name: name.trim() }),
      setFontScale: (fontScale) => updateProfile({ fontScale }),
      setTheme: (theme) => updateProfile({ theme }),
      setSimpleLanguage: (simpleLanguage) => updateProfile({ simpleLanguage }),
      setLastDoor: (lastDoor) => updateProfile({ lastDoor }),
      setOfferDay: (day) => updateProfile({ lastOfferDay: day }),
      saveMark: async (tone) => {
        const existing = await db.marks.where("day").equals(today).first()
        if (existing?.id) await db.marks.update(existing.id, { tone })
        else await db.marks.add({ day: today, tone })
        await refresh()
        track("mood", { tone })
      },
      addNote: async (text) => {
        await db.notes.add({ text, createdAt: Date.now() })
        await refresh()
      },
      deleteNote: async (id) => {
        await db.notes.delete(id)
        await refresh()
      },
      addCapsule: async (text, openOn) => {
        await db.capsules.add({ text, openOn, createdAt: Date.now() })
        await refresh()
      },
      deleteCapsule: async (id) => {
        await db.capsules.delete(id)
        await refresh()
      },
      addContact: async (name, phone) => {
        if (contacts.length >= 2) return
        await db.contacts.add({ name, phone })
        await refresh()
      },
      deleteContact: async (id) => {
        await db.contacts.delete(id)
        await refresh()
      },
      signInGuest: (name) => updateProfile({ auth: "guest", name: name.trim(), email: "", returning: true }),
      signInGoogle: (name, email) => updateProfile({ auth: "google", name: name.trim(), email: email.trim(), returning: true }),
      signOut: () => updateProfile({ auth: "none", name: "", email: "" }),
      register: async (name, email, password) => {
        const cleanEmail = email.trim().toLowerCase()
        if (profileRef.current.account) return { ok: false, message: "Ya hay una cuenta en este dispositivo. Entra con ella en la pestaña Ya tengo cuenta." }
        try {
          const salt = newSalt()
          const hash = await hashPassword(password, salt)
          const account = { name: name.trim(), email: cleanEmail, salt, hash, createdAt: Date.now() }
          await updateProfile({ auth: "local", name: account.name, email: cleanEmail, returning: true, account })
          return { ok: true }
        } catch {
          return { ok: false, message: "Este navegador no permite guardar la clave de forma segura. Prueba con la dirección https del sitio." }
        }
      },
      login: async (email, password) => {
        const account = profileRef.current.account
        if (!account) return { ok: false, message: "Todavía no hay una cuenta en este dispositivo. Puedes registrarte." }
        try {
          const hash = await hashPassword(password, account.salt)
          if (account.email !== email.trim().toLowerCase() || !sameHash(hash, account.hash)) {
            return { ok: false, message: "El correo o la clave no coinciden." }
          }
          await updateProfile({ auth: "local", name: account.name, email: account.email, returning: true })
          return { ok: true }
        } catch {
          return { ok: false, message: "Este navegador no pudo comprobar la clave. Prueba con la dirección https del sitio." }
        }
      },
      clearLocal: async () => {
        await db.delete()
        await db.open()
        profileRef.current = emptyProfile
        setProfile(emptyProfile)
        setMarks([])
        setNotes([])
        setCapsules([])
        setContacts([])
        setMessages([])
      },
  }

  return <OasisContext.Provider value={value}>{children}</OasisContext.Provider>
}

export function useOasis(): OasisContextValue {
  const value = useContext(OasisContext)
  if (!value) throw new Error("OasisProvider falta en el árbol")
  return value
}
