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
