const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/
const YOUTUBE_PLAYLIST_ID = /^(PL|UU|LL|FL|RD|OL)[A-Za-z0-9_-]{10,}$/

export function spotifyPlaylistId(value: string): string | null {
  const trimmed = value.trim()
  if (SPOTIFY_ID.test(trimmed)) return trimmed

  if (trimmed.startsWith("spotify:playlist:")) {
    const id = trimmed.slice("spotify:playlist:".length).split("?")[0]
    return SPOTIFY_ID.test(id) ? id : null
  }

  try {
    const url = new URL(trimmed)
    const parts = url.pathname.split("/").filter(Boolean)
    const index = parts.lastIndexOf("playlist")
    const id = index >= 0 ? parts[index + 1] : undefined
    return id && SPOTIFY_ID.test(id) ? id : null
  } catch {
    return null
  }
}

export function youtubePlaylistId(value: string): string | null {
  const trimmed = value.trim()
  if (YOUTUBE_PLAYLIST_ID.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    const id = url.searchParams.get("list")?.trim() ?? ""
    return YOUTUBE_PLAYLIST_ID.test(id) ? id : null
  } catch {
    return null
  }
}

export type PlaylistCard = {
  name: string
  cover: string | null
  embedUrl: string
}

export function spotifyEmbedUrl(id: string): string {
  return `https://open.spotify.com/embed/playlist/${id}`
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(id)}`
}
