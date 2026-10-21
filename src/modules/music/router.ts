import { Hono } from "hono"
import {
  spotifyEmbedUrl,
  spotifyPlaylistId,
  youtubeEmbedUrl,
  youtubePlaylistId,
} from "../../playlist.js"
import { emptyPlaylist, publicPlaylist } from "./public-card.js"

function envValue(name: string): string {
  return process.env[name]?.trim() ?? ""
}

async function spotifyCard() {
  const clientId = envValue("SPOTIFY_CLIENT_ID")
  const clientSecret = envValue("SPOTIFY_CLIENT_SECRET")
  const playlistId = spotifyPlaylistId(envValue("SPOTIFY_PLAYLIST_ID"))
  if (!clientId || !clientSecret || !playlistId) return emptyPlaylist()

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  })
  if (!tokenResponse.ok) return emptyPlaylist()
  const tokenPayload = (await tokenResponse.json()) as { access_token?: string }
  if (!tokenPayload.access_token) return emptyPlaylist()

  const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: { authorization: `Bearer ${tokenPayload.access_token}` },
  })
  if (!playlistResponse.ok) {
    return publicPlaylist({ name: "Playlist", cover: null, embedUrl: spotifyEmbedUrl(playlistId) })
  }
  const playlist = (await playlistResponse.json()) as {
    name?: string
    images?: { url?: string }[]
  }
  return publicPlaylist({
    name: playlist.name ?? "Playlist",
    cover: playlist.images?.[0]?.url ?? null,
    embedUrl: spotifyEmbedUrl(playlistId),
  })
}

async function youtubeCard() {
  const apiKey = envValue("YOUTUBE_API_KEY")
  const playlistId = youtubePlaylistId(envValue("YOUTUBE_PLAYLIST_ID"))
  if (!apiKey || !playlistId) return emptyPlaylist()

  const url = new URL("https://www.googleapis.com/youtube/v3/playlists")
  url.searchParams.set("part", "snippet")
  url.searchParams.set("id", playlistId)
  url.searchParams.set("key", apiKey)
  const response = await fetch(url)
  if (!response.ok) {
    return publicPlaylist({ name: "Playlist", cover: null, embedUrl: youtubeEmbedUrl(playlistId) })
  }
  const payload = (await response.json()) as {
    items?: { snippet?: { title?: string; thumbnails?: { medium?: { url?: string }; default?: { url?: string } } } }[]
  }
  const snippet = payload.items?.[0]?.snippet
  return publicPlaylist({
    name: snippet?.title ?? "Playlist",
    cover: snippet?.thumbnails?.medium?.url ?? snippet?.thumbnails?.default?.url ?? null,
    embedUrl: youtubeEmbedUrl(playlistId),
  })
}

export function musicRoutes(): Hono {
  const routes = new Hono()
  routes.get("/spotify", async (c) => {
    try {
      return c.json(await spotifyCard())
    } catch {
      return c.json(emptyPlaylist())
    }
  })
  routes.get("/youtube", async (c) => {
    try {
      return c.json(await youtubeCard())
    } catch {
      return c.json(emptyPlaylist())
    }
  })
  return routes
}
