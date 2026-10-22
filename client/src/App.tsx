import { Navigate, BrowserRouter, Route, Routes } from "react-router-dom"
import { Entrance } from "./modules/entrance/Entrance"
import { Home } from "./modules/home/Home"
import { Landing } from "./modules/landing/Landing"
import { Nearby } from "./modules/nearby/Nearby"
import { Corner } from "./modules/corner/Corner"
import { Talk } from "./modules/talk/Talk"
import { Memory } from "./modules/memory/Memory"
import { OasisProvider, useOasis } from "./modules/local-data/OasisProvider"
import { Lagoon } from "./modules/shell/Lagoon"
import { Shell } from "./modules/shell/Shell"

function Boot() {
  return <div className="boot" aria-hidden="true" />
}

function Root() {
  const { ready, profile } = useOasis()
  if (!ready) return <Boot />
  if (profile.auth !== "none") return <Navigate to="/inicio" replace />
  if (profile.hasSignedIn) return <Entrance />
  return <Landing />
}

function LoginRoute() {
  const { ready, profile } = useOasis()
  if (!ready) return <Boot />
  if (profile.auth !== "none") return <Navigate to="/inicio" replace />
  return <Entrance />
}

function Private() {
  const { ready, profile } = useOasis()
  if (!ready) return <Boot />
  if (profile.auth === "none") return <Navigate to="/" replace />
  return <Shell />
}

export function App() {
  return (
    <OasisProvider>
      <Lagoon />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/entrar" element={<LoginRoute />} />
          <Route element={<Private />}>
            <Route path="/inicio" element={<Home />} />
            <Route path="/cerca" element={<Nearby />} />
            <Route path="/rincon" element={<Corner />} />
            <Route path="/hablar" element={<Talk />} />
            <Route path="/recuerdo" element={<Memory />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </OasisProvider>
  )
}
