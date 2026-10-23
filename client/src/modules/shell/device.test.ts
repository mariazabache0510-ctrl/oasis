import assert from "node:assert/strict"
import test from "node:test"
import { classifyDevice, type DeviceSignals } from "./device.ts"

function signals(partial: Partial<DeviceSignals>): DeviceSignals {
  return {
    ua: "",
    maxTouchPoints: 0,
    coarse: false,
    fine: true,
    hover: true,
    viewportShort: 800,
    screenShort: 800,
    ...partial,
  }
}

test("un iPhone es celular aunque el navegador diga que hay hover", () => {
  const info = classifyDevice(signals({
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    maxTouchPoints: 5,
    coarse: true,
    fine: false,
    hover: true,
    viewportShort: 390,
    screenShort: 390,
  }))
  assert.equal(info.kind, "phone")
  assert.equal(info.here, "este celular")
})

test("Android con Mobile y userAgentData.mobile es celular", () => {
  const info = classifyDevice(signals({
    ua: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    mobileHint: true,
    maxTouchPoints: 5,
    coarse: true,
    fine: false,
    hover: false,
    viewportShort: 412,
    screenShort: 412,
  }))
  assert.equal(info.kind, "phone")
})

test("un WebView Android sin la palabra Mobile sigue siendo celular si la pantalla es chica", () => {
  const info = classifyDevice(signals({
    ua: "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Safari/537.36",
    mobileHint: false,
    maxTouchPoints: 5,
    coarse: true,
    fine: false,
    hover: false,
    viewportShort: 360,
    screenShort: 360,
  }))
  assert.equal(info.kind, "phone")
})

test("Firefox Android con Mobile antes de Android es celular", () => {
  const info = classifyDevice(signals({
    ua: "Mozilla/5.0 (Mobile; Android 13; rv:109.0) Gecko/109.0 Firefox/115.0",
    maxTouchPoints: 5,
    coarse: true,
    fine: false,
    hover: false,
    viewportShort: 412,
    screenShort: 412,
  }))
  assert.equal(info.kind, "phone")
})

test("un iPhone en modo escritorio no se trata como iPad", () => {
  const info = classifyDevice(signals({
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    maxTouchPoints: 5,
    coarse: true,
    fine: false,
    hover: false,
    viewportShort: 980,
    screenShort: 390,
  }))
  assert.equal(info.kind, "phone")
})

test("un iPad sigue en el riel de tablet", () => {
  const info = classifyDevice(signals({
    ua: "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    maxTouchPoints: 5,
    coarse: true,
    fine: false,
    hover: false,
    viewportShort: 1024,
    screenShort: 768,
  }))
  assert.equal(info.kind, "tablet")
})

test("la emulación con puntero grueso y viewport de celular es celular aunque el monitor sea grande", () => {
  const info = classifyDevice(signals({
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    coarse: true,
    fine: false,
    hover: false,
    viewportShort: 390,
    screenShort: 1440,
  }))
  assert.equal(info.kind, "phone")
})

test("encoger la ventana de escritorio no basta para mostrar el menú de celular", () => {
  const info = classifyDevice(signals({
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    coarse: false,
    fine: true,
    hover: true,
    viewportShort: 390,
    screenShort: 1440,
  }))
  assert.equal(info.kind, "desktop")
  assert.equal(info.here, "este computador")
})

test("un escritorio a 1280 sigue en la barra de escritorio", () => {
  const info = classifyDevice(signals({
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewportShort: 1280,
    screenShort: 1440,
  }))
  assert.equal(info.kind, "desktop")
})
