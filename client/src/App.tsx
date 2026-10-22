import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Entrance } from "./modules/entrance/Entrance"
import { Home } from "./modules/home/Home"
import { Landing } from "./modules/home/Landing"
import { Nearby } from "./modules/nearby/Nearby"
import { Corner } from "./modules/corner/Corner"
import { Talk } from "./modules/talk/Talk"
import { Memory } from "./modules/memory/Memory"
import { Sala } from "./modules/admin/Sala"
import { OasisProvider, useOasis } from "./modules/local-data/OasisProvider"
import { Shell } from "./modules/shell/Shell"
import { Water } from "./modules/shell/Water"
import { useDevice } from "./modules/shell/device"
import { VoiceProvider } from "./modules/voice/VoiceProvider"

function FrontDoor() {
  const { ready } = useOasis()
  if (!ready) return <div className="boot" />
  return <Landing />
}

function PrivateShell() {
  const { profile, ready } = useOasis()
  if (!ready) return <div className="boot" />
  if (profile.auth === "none") return <Navigate to={profile.returning ? "/entrar" : "/"} replace />
  return <Shell />
}

function DeviceWatcher() {
  useDevice()
  return null
}

export function App() {
  return (
    <OasisProvider>
      <DeviceWatcher />
      <Water />
      <BrowserRouter>
        <VoiceProvider>
        <Routes>
          <Route path="/" element={<FrontDoor />} />
          <Route path="/entrar" element={<Entrance />} />
          <Route path="/sala" element={<Sala />} />
          <Route element={<PrivateShell />}>
            <Route path="/inicio" element={<Home />} />
            <Route path="/cerca" element={<Nearby />} />
            <Route path="/rincon" element={<Corner />} />
            <Route path="/hablar" element={<Talk />} />
            <Route path="/recuerdo" element={<Memory />} />
          </Route>
        </Routes>
        </VoiceProvider>
      </BrowserRouter>
    </OasisProvider>
  )
}
