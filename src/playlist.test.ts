import assert from "node:assert/strict"
import test from "node:test"
import { spotifyEmbedUrl, spotifyPlaylistId, youtubeEmbedUrl, youtubePlaylistId } from "./playlist.js"
import { emptyPlaylist, publicPlaylist } from "./modules/music/public-card.js"
import { matchService } from "./modules/orientador/match.js"

test("acepta id o url pública de Spotify", () => {
  assert.equal(spotifyPlaylistId("37i9dQZF1DXcBWIGoYBM5M"), "37i9dQZF1DXcBWIGoYBM5M")
  assert.equal(
    spotifyPlaylistId("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc"),
    "37i9dQZF1DXcBWIGoYBM5M",
  )
  assert.equal(spotifyPlaylistId("spotify:playlist:37i9dQZF1DXcBWIGoYBM5M"), "37i9dQZF1DXcBWIGoYBM5M")
})

test("acepta id o url pública de YouTube y rechaza una llave", () => {
  const id = "PLabcdefghijklmnop1234567890"
  assert.equal(youtubePlaylistId(id), id)
  assert.equal(youtubePlaylistId(`https://www.youtube.com/playlist?list=${id}`), id)
  assert.equal(youtubePlaylistId("AIzaSyDummyKeyNotAPlaylist"), null)
})

test("la respuesta pública no arrastra secretos", () => {
  const secret = "AIzaSySuperSecretKey"
  const card = publicPlaylist({
    name: "Calma",
    cover: "https://i.ytimg.com/vi/example/default.jpg",
    embedUrl: youtubeEmbedUrl("PLabcdefghijklmnop1234567890"),
  })
  const encoded = JSON.stringify(card)
  assert.equal(encoded.includes(secret), false)
  assert.equal(encoded.includes("access_token"), false)
  assert.deepEqual(Object.keys(card).sort(), ["available", "cover", "embedUrl", "name"])
  assert.equal(JSON.stringify(emptyPlaylist()).includes(secret), false)
  assert.equal(spotifyEmbedUrl("37i9dQZF1DXcBWIGoYBM5M").includes("secret"), false)
})

test("el orientador elige Yo Te Escucho para Villavicencio", () => {
  assert.equal(matchService("quiero hablar con alguien aquí").id, "yo-te-escucho")
  assert.equal(matchService("la línea nacional 106").id, "linea-106")
})
