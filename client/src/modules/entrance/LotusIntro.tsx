import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { prefersReducedMotion, revealHome, webglAvailable } from "./lotusMotion"

const LotusStage = lazy(() => import("./LotusStage"))

type IntroProps = { onDone: () => void }

function LotusHold() {
  return (
    <div className="lotus-screen" role="status" aria-label="Abriendo Oasis">
      <div className="lotus-backdrop is-shown" />
      <p className="lotus-mark is-in">Oasis</p>
    </div>
  )
}

function LotusFade({ onDone, delay = 680 }: IntroProps & { delay?: number }) {
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const once = useRef(false)

  const finish = () => {
    if (once.current) return
    once.current = true
    revealHome(() => onDoneRef.current(), 420)
  }

  useEffect(() => {
    const id = window.setTimeout(finish, delay)
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" && event.key !== "Enter") return
      event.preventDefault()
      finish()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener("keydown", onKey)
    }
  }, [delay])

  return (
    <div className="lotus-screen lotus-fade" role="status" aria-label="Abriendo Oasis">
      <p className="lotus-mark is-in">Oasis</p>
      <p className="lotus-note">Versión liviana</p>
      <div className="lotus-controls">
        <button className="lotus-skip" type="button" onClick={finish}>
          Saltar
        </button>
        <Link className="lotus-skip lotus-back" to="/">
          Volver
        </Link>
      </div>
    </div>
  )
}

class IntroBoundary extends Component<IntroProps & { children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return <LotusFade onDone={this.props.onDone} delay={280} />
    return this.props.children
  }
}

export default function LotusIntro({ onDone }: IntroProps) {
  const [cinematic] = useState(() => !prefersReducedMotion() && webglAvailable())
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  if (!cinematic) return <LotusFade onDone={onDone} />

  return (
    <IntroBoundary onDone={onDone}>
      <Suspense fallback={<LotusHold />}>
        <LotusStage onDone={() => revealHome(() => onDoneRef.current())} />
      </Suspense>
    </IntroBoundary>
  )
}
