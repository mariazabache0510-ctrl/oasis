import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Oasis",
        short_name: "Oasis",
        description: "Un espacio tuyo. Sin nadie mirando.",
        lang: "es",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#FBF6EE",
        theme_color: "#FBF6EE",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
  resolve: {
    alias: {
      "@modules": path.resolve(root, "../src/modules"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:3000",
    },
  },
})
