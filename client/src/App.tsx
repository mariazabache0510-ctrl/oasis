import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Entrance } from "./modules/entrance/Entrance"
import { Home } from "./modules/home/Home"
import { Nearby } from "./modules/nearby/Nearby"
import { Corner } from "./modules/corner/Corner"
import { Talk } from "./modules/talk/Talk"
import { Memory } from "./modules/memory/Memory"
import { OasisProvider } from "./modules/local-data/OasisProvider"
import { Shell } from "./modules/shell/Shell"

export function App() {
  return (
    <OasisProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Entrance />} />
          <Route element={<Shell />}>
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
