import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import {
  db,
  emptyProfile,
  todayKey,
  type Capsule,
  type FontScale,
  type Mark,
  type Note,
  type Profile,
  type Tone,
  type TrustContact,
} from "./db"

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
  clearLocal: () => Promise<void>
  signInGuest: (name: string) => Promise<void>
  signInGoogle: (name: string, email: string) => Promise<void>
  signOut: () => Promise<void>
}

const OasisContext = createContext<OasisContextValue | null>(null)

async function loadAll() {
  const [profile, marks, notes, capsules, contacts] = await Promise.all([
    db.profile.get("me"),
    db.marks.orderBy("day").toArray(),
    db.notes.orderBy("createdAt").reverse().toArray(),
    db.capsules.orderBy("openOn").toArray(),
    db.contacts.toArray(),
  ])
  return {
    profile: { ...emptyProfile, ...(profile ?? {}) },
    marks,
    notes,
    capsules,
    contacts,
  }
}

export function OasisProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [profile, setProfile] = useState<Profile>(emptyProfile)
  const [marks, setMarks] = useState<Mark[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [contacts, setContacts] = useState<TrustContact[]>([])
  const profileRef = useRef(emptyProfile)
  const revision = useRef(0)

  async function refresh() {
    const started = revision.current
    const next = await loadAll()
    setMarks(next.marks)
    setNotes(next.notes)
    setCapsules(next.capsules)
    setContacts(next.contacts)
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
      todayMark: marks.find((mark) => mark.day === today),
      setName: (name) => updateProfile({ name: name.trim() }),
      setFontScale: (fontScale) => updateProfile({ fontScale }),
      setSimpleLanguage: (simpleLanguage) => updateProfile({ simpleLanguage }),
      setLastDoor: (lastDoor) => updateProfile({ lastDoor }),
      setOfferDay: (day) => updateProfile({ lastOfferDay: day }),
      saveMark: async (tone) => {
        const existing = await db.marks.where("day").equals(today).first()
        if (existing?.id) await db.marks.update(existing.id, { tone })
        else await db.marks.add({ day: today, tone })
        await refresh()
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
      signInGuest: (name) => updateProfile({ auth: "guest", name: name.trim(), email: "" }),
      signInGoogle: (name, email) => updateProfile({ auth: "google", name: name.trim(), email: email.trim() }),
      signOut: () => updateProfile({ auth: "none", name: "", email: "" }),
      clearLocal: async () => {
        await db.delete()
        await db.open()
        profileRef.current = emptyProfile
        setProfile(emptyProfile)
        setMarks([])
        setNotes([])
        setCapsules([])
        setContacts([])
      },
  }

  return <OasisContext.Provider value={value}>{children}</OasisContext.Provider>
}

export function useOasis(): OasisContextValue {
  const value = useContext(OasisContext)
  if (!value) throw new Error("OasisProvider falta en el árbol")
  return value
}
