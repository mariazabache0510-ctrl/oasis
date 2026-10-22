type Look = "loto" | "isla" | "gota" | "bruma"

export function CompanionFace({ look, className }: { look: Look; className?: string }) {
  return (
    <svg className={className ?? "companion-face"} viewBox="0 0 80 80" aria-hidden="true">
      {look === "loto" ? (
        <>
          <ellipse cx="40" cy="58" rx="26" ry="8" fill="#C9E4F5" />
          <path d="M40 54c-6-10-16-14-20-20 8 2 14 8 16 16 3-9 10-14 18-16-5 7-12 12-14 20z" fill="#F6CDB6" />
          <path d="M40 50c-4-8-10-12-14-18 6 3 10 8 12 14 2-7 7-11 13-14-4 6-9 10-11 18z" fill="#E4D4F4" />
          <circle cx="40" cy="40" r="5" fill="#F8E7B0" />
        </>
      ) : null}
      {look === "isla" ? (
        <>
          <ellipse cx="40" cy="50" rx="28" ry="12" fill="#C9E4F5" />
          <ellipse cx="40" cy="46" rx="16" ry="8" fill="#C9DCC8" />
          <circle cx="34" cy="40" r="7" fill="#F8E7B0" />
          <circle cx="46" cy="38" r="5" fill="#F6CDB6" />
        </>
      ) : null}
      {look === "gota" ? (
        <>
          <path d="M40 14c10 14 18 24 18 34a18 18 0 0 1-36 0c0-10 8-20 18-34z" fill="#C9E4F5" />
          <ellipse cx="34" cy="42" rx="5" ry="7" fill="#FBF6EE" opacity="0.85" />
        </>
      ) : null}
      {look === "bruma" ? (
        <>
          <circle cx="30" cy="40" r="16" fill="#E4D4F4" />
          <circle cx="48" cy="36" r="14" fill="#C9E4F5" />
          <circle cx="42" cy="50" r="12" fill="#F6CDB6" />
        </>
      ) : null}
    </svg>
  )
}

export const COMPANION_LOOKS: { id: Look; label: string }[] = [
  { id: "loto", label: "Loto" },
  { id: "isla", label: "Isla" },
  { id: "gota", label: "Gota" },
  { id: "bruma", label: "Bruma" },
]
