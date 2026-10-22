export function HugIcon() {
  return (
    <svg className="bg-icon bg-hug" viewBox="0 0 240 200" aria-hidden="true">
      <defs>
        <linearGradient id="hugA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2a98c" />
          <stop offset="1" stopColor="#b79ad8" />
        </linearGradient>
        <linearGradient id="hugB" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8cc3e6" />
          <stop offset="1" stopColor="#9ccdb0" />
        </linearGradient>
        <radialGradient id="hugGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="hug-halo" cx="120" cy="104" r="86" fill="url(#hugGlow)" />
      <g className="hug-people">
        <g className="hug-left">
          <circle cx="84" cy="52" r="22" fill="url(#hugA)" stroke="#fff" strokeWidth="3" />
          <path d="M52 168c-4-46 8-78 36-78 20 0 34 14 40 34l-18 12-10-4c-6 12-6 24-4 36z" fill="url(#hugA)" stroke="#fff" strokeWidth="3" />
          <path className="hug-arm" d="M92 112c22-6 46 0 62 14" fill="none" stroke="#f2a98c" strokeWidth="11" strokeLinecap="round" />
        </g>
        <g className="hug-right">
          <circle cx="156" cy="52" r="22" fill="url(#hugB)" stroke="#fff" strokeWidth="3" />
          <path d="M188 168c4-46-8-78-36-78-20 0-34 14-40 34l18 12 10-4c6 12 6 24 4 36z" fill="url(#hugB)" stroke="#fff" strokeWidth="3" />
          <path className="hug-arm" d="M148 112c-22-6-46 0-62 14" fill="none" stroke="#8cc3e6" strokeWidth="11" strokeLinecap="round" />
        </g>
      </g>
      <path
        className="hug-heart"
        d="M120 118c-10-10-22-2-16 8 4 6 16 14 16 14s12-8 16-14c6-10-6-18-16-8z"
        fill="#ef8f8a" stroke="#fff" strokeWidth="2"
      />
    </svg>
  )
}

export function PhoneIcon({ tone }: { tone: "sky" | "mint" }) {
  const from = tone === "sky" ? "#c9e4f5" : "#c9dcc8"
  const to = tone === "sky" ? "#e4d4f4" : "#c9e4f5"
  const id = `phone-${tone}`
  return (
    <svg className="bg-icon bg-phone" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <circle className="ring ring-a" cx="100" cy="100" r="46" fill="none" stroke={`url(#${id})`} strokeWidth="3" />
      <circle className="ring ring-b" cx="100" cy="100" r="46" fill="none" stroke={`url(#${id})`} strokeWidth="3" />
      <circle className="ring ring-c" cx="100" cy="100" r="46" fill="none" stroke={`url(#${id})`} strokeWidth="3" />
      <circle className="phone-orbit" cx="100" cy="100" r="82" fill="none" stroke={`url(#${id})`} strokeWidth="2" strokeDasharray="4 12" strokeLinecap="round" />
      <g className="phone-body">
        <path
          d="M72 66c-6 0-10 6-8 14 6 26 26 50 52 62 8 4 14 0 14-6l-1-10c0-3-2-5-5-6l-12-4c-3-1-5 0-7 2l-4 4c-12-7-20-16-24-28l5-3c3-2 4-4 3-7l-4-12c-1-3-4-5-7-5z"
          fill={`url(#${id})`}
        />
      </g>
    </svg>
  )
}

export function JournalIcon() {
  return (
    <svg className="tile-icon" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="14" y="10" width="34" height="44" rx="7" fill="#fff" fillOpacity="0.85" stroke="#9fc8b2" strokeWidth="2" />
      <path d="M22 24h18M22 32h18M22 40h10" stroke="#9fc8b2" strokeWidth="3" strokeLinecap="round" />
      <path className="pen" d="M44 46l12-18 5 3-12 18-7 3z" fill="#f6cdb6" stroke="#d79f86" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function BubblesIcon() {
  return (
    <svg className="tile-icon" viewBox="0 0 64 64" aria-hidden="true">
      <circle className="b1" cx="24" cy="38" r="14" fill="#c9e4f5" fillOpacity="0.9" stroke="#fff" strokeWidth="2" />
      <circle className="b2" cx="44" cy="22" r="9" fill="#e4d4f4" fillOpacity="0.95" stroke="#fff" strokeWidth="2" />
      <circle className="b3" cx="46" cy="46" r="6" fill="#f8e7b0" stroke="#fff" strokeWidth="2" />
      <circle cx="20" cy="33" r="3" fill="#fff" fillOpacity="0.8" />
    </svg>
  )
}

export function CapsuleIcon() {
  return (
    <svg className="tile-icon" viewBox="0 0 64 64" aria-hidden="true">
      <g className="capsule-body" transform="rotate(-35 32 32)">
        <rect x="8" y="22" width="48" height="20" rx="10" fill="#fff" stroke="#c0a9de" strokeWidth="2" />
        <path d="M32 22h14a10 10 0 0 1 0 20H32z" fill="#e4d4f4" />
      </g>
      <circle className="spark" cx="50" cy="14" r="3" fill="#f8e7b0" />
      <circle className="spark spark-b" cx="12" cy="50" r="2.5" fill="#f6cdb6" />
    </svg>
  )
}

export function PinIcon() {
  return (
    <svg className="tile-icon" viewBox="0 0 64 64" aria-hidden="true">
      <ellipse className="pin-shadow" cx="32" cy="55" rx="12" ry="3.5" fill="#3d3a46" fillOpacity="0.14" />
      <g className="pin-body">
        <path d="M32 8c-10 0-18 7.6-18 17.4C14 38 32 54 32 54s18-16 18-28.6C50 15.6 42 8 32 8z" fill="#c9e4f5" stroke="#8cb8d6" strokeWidth="2" />
        <circle cx="32" cy="25" r="7" fill="#fff" />
      </g>
    </svg>
  )
}

export function HeartIcon() {
  return (
    <svg className="tile-icon" viewBox="0 0 64 64" aria-hidden="true">
      <path
        className="heart-beat"
        d="M32 54C14 40 8 30 8 22c0-8 6-13 12-13 5 0 9 3 12 8 3-5 7-8 12-8 6 0 12 5 12 13 0 8-6 18-24 32z"
        fill="#f6cdb6"
        stroke="#e09a86"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle className="spark" cx="48" cy="12" r="3" fill="#f8e7b0" />
    </svg>
  )
}

export function MarkIcon() {
  return (
    <svg className="tile-icon" viewBox="0 0 64 64" aria-hidden="true">
      <rect className="mark-bar mk1" x="12" y="34" width="9" height="20" rx="4.5" fill="#c9e4f5" stroke="#fff" strokeWidth="1.5" />
      <rect className="mark-bar mk2" x="27" y="22" width="9" height="32" rx="4.5" fill="#e4d4f4" stroke="#fff" strokeWidth="1.5" />
      <rect className="mark-bar mk3" x="42" y="12" width="9" height="42" rx="4.5" fill="#f6cdb6" stroke="#fff" strokeWidth="1.5" />
    </svg>
  )
}

export function LockIcon({ open }: { open?: boolean }) {
  return (
    <svg className="tile-icon" viewBox="0 0 64 64" aria-hidden="true">
      <path
        className={open ? "lock-shackle is-open" : "lock-shackle"}
        d="M22 28v-7a10 10 0 0 1 20 0v7"
        fill="none"
        stroke="#b79ad8"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="14" y="28" width="36" height="26" rx="8" fill={open ? "#f8e7b0" : "#e4d4f4"} stroke="#fff" strokeWidth="2" />
      <circle cx="32" cy="40" r="3.5" fill="#fff" />
    </svg>
  )
}

/** Teléfono con ondas: suena más rápido al pasar el cursor por la card. */
export function CallIcon() {
  return (
    <svg className="tile-icon line-icon icon-call" viewBox="0 0 64 64" aria-hidden="true">
      <path className="call-wave cw1" d="M40 14c6 2 10 6 12 12" fill="none" stroke="#8a63d9" strokeWidth="3" strokeLinecap="round" />
      <path className="call-wave cw2" d="M38 5c10 3 17 10 20 20" fill="none" stroke="#b79ad8" strokeWidth="3" strokeLinecap="round" />
      <g className="call-handset">
        <path
          d="M17 14c-3 0-6 3-5 7 3 14 14 26 28 32 4 2 8-1 8-4l-.5-6c0-2-1-3-3-3.5l-7-2c-2-.5-3 0-4 1l-2 2c-6-3-10-8-12-14l3-2c2-1 2-2 1.5-4l-2-7c-.5-2-2-3.5-4-3.5z"
          fill="#e4d4f4" stroke="#8a63d9" strokeWidth="2" strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

/** Burbuja de chat: salta y deja ver los tres puntos al pasar el cursor. */
export function ChatIcon() {
  return (
    <svg className="tile-icon line-icon icon-chat" viewBox="0 0 64 64" aria-hidden="true">
      <g className="chat-bubble">
        <path d="M32 9C18 9 8 18 8 29c0 6 3 11 8 14l-2 11 11-6c2 .5 4 1 7 1 14 0 24-9 24-20S46 9 32 9z" fill="#c4e0cc" stroke="#4f9a78" strokeWidth="2" strokeLinejoin="round" />
        <circle className="chat-dot cd1" cx="22" cy="29" r="3" fill="#fff" />
        <circle className="chat-dot cd2" cx="32" cy="29" r="3" fill="#fff" />
        <circle className="chat-dot cd3" cx="42" cy="29" r="3" fill="#fff" />
      </g>
    </svg>
  )
}

/** Calendario con una hoja que se dobla al pasar el cursor. */
export function CalendarIcon() {
  return (
    <svg className="tile-icon line-icon icon-cal" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="9" y="14" width="46" height="42" rx="10" fill="#fff" fillOpacity="0.9" stroke="#8cb8d6" strokeWidth="2" />
      <path d="M9 26h46" stroke="#8cb8d6" strokeWidth="2" />
      <rect x="20" y="8" width="5" height="12" rx="2.5" fill="#b79ad8" />
      <rect x="39" y="8" width="5" height="12" rx="2.5" fill="#b79ad8" />
      <g className="cal-tick">
        <rect x="19" y="34" width="8" height="8" rx="3" fill="#f6cdb6" />
        <rect x="31" y="34" width="8" height="8" rx="3" fill="#e4d4f4" />
        <rect x="43" y="34" width="6" height="8" rx="3" fill="#c4e0cc" />
        <rect x="19" y="46" width="8" height="6" rx="3" fill="#c9e4f5" />
      </g>
    </svg>
  )
}

/** Teléfono sólido de un solo trazo. Toma el color del texto (currentColor). */
export function PhoneGlyph({ className = "line-btn-icon line-btn-phone" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Dos hojas superpuestas: copiar. */
export function CopyGlyph() {
  return (
    <svg className="line-btn-icon line-btn-copy" viewBox="0 0 24 24" aria-hidden="true">
      <rect className="copy-back" x="8" y="3" width="12" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect className="copy-front" x="4" y="7" width="12" height="14" rx="3" fill="#fff" fillOpacity="0.7" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
