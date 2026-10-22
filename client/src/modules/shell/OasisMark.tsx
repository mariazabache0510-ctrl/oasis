import { Link } from "react-router-dom"

/** Marca propia: loto, agua e isla. Sin personajes. */
export function OasisMark({ className }: { className?: string }) {
  return (
    <svg className={className ?? "brand-mark"} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#FBF6EE" />
      <ellipse cx="32" cy="47" rx="22" ry="7" fill="#C9E4F5" />
      <ellipse cx="32" cy="45" rx="12" ry="4.2" fill="#C9DCC8" />
      <path d="M32 43c-3.4-6.2-8.4-8.4-11.4-12.4 4.4 1.4 7.6 4.4 9.4 9 1.8-4.8 5.2-7.8 9.8-9.2-2.8 4.2-7 6.6-7.8 12.6z" fill="#F6CDB6" />
      <path d="M32 41.2c-2.4-5.2-5.6-7.6-8.2-11.2 3.2 1.6 5.4 4.4 6.6 8 1.4-3.8 3.8-6.4 7.2-8-2.4 3.8-5 6.2-5.6 11.2z" fill="#E4D4F4" />
      <circle cx="32" cy="32.5" r="3" fill="#F8E7B0" />
    </svg>
  )
}

export function BrandLockup({ to, hero = false }: { to: string; hero?: boolean }) {
  return (
    <Link to={to} className={hero ? "brand brand-hero" : "brand"}>
      <OasisMark />
      <span className="brand-name">Oasis</span>
    </Link>
  )
}
