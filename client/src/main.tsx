import "@fontsource/fraunces/600.css"
import "@fontsource/nunito/500.css"
import "@fontsource/nunito/700.css"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./styles.css"
import "./pages.css"
import "./home.css"
import "./nearby.css"
import "./corner.css"
import "./memory.css"
import "./talk.css"
import "./responsive.css"
import "./lived.css"
import "./chrome.css"

try {
  const saved = localStorage.getItem("oasis-theme")
  if (saved === "noche" || saved === "dia") document.documentElement.dataset.theme = saved
  else if (window.matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.dataset.theme = "noche"
} catch {
  /* la preferencia queda en claro */
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
