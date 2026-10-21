import type { PlaylistCard } from "../../playlist.js"

export type PublicPlaylist = {
  available: boolean
  name: string | null
  cover: string | null
  embedUrl: string | null
}

export function emptyPlaylist(): PublicPlaylist {
  return { available: false, name: null, cover: null, embedUrl: null }
}

export function publicPlaylist(card: PlaylistCard): PublicPlaylist {
  return {
    available: true,
    name: card.name,
    cover: card.cover,
    embedUrl: card.embedUrl,
  }
}
