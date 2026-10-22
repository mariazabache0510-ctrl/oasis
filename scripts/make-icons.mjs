import { deflateSync } from "node:zlib"
import { writeFileSync } from "node:fs"

function crc32(buffer) {
  let crc = ~0
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return ~crc >>> 0
}

function chunk(type, data) {
  const name = Buffer.from(type)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])))
  return Buffer.concat([length, name, data, crc])
}

function png(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

function draw(size) {
  const data = Buffer.alloc(size * size * 4, 0)
  const set = (x, y, color) => {
    const px = Math.round(x)
    const py = Math.round(y)
    if (px < 0 || py < 0 || px >= size || py >= size) return
    const index = (py * size + px) * 4
    data[index] = color[0]
    data[index + 1] = color[1]
    data[index + 2] = color[2]
    data[index + 3] = 255
  }
  const ellipse = (cx, cy, rx, ry, color) => {
    for (let y = cy - ry; y <= cy + ry; y += 1) {
      for (let x = cx - rx; x <= cx + rx; x += 1) {
        const nx = (x - cx) / rx
        const ny = (y - cy) / ry
        if (nx * nx + ny * ny <= 1) set(x, y, color)
      }
    }
  }
  const cream = [251, 246, 238]
  const sky = [201, 228, 245]
  const sage = [201, 220, 200]
  const peach = [246, 205, 182]
  const lilac = [228, 212, 244]
  const butter = [248, 231, 176]
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const inset = size * 0.08
      const radius = size * 0.18
      const left = x < inset + radius && y < inset + radius && (x - inset - radius) ** 2 + (y - inset - radius) ** 2 > radius ** 2
      const right = x > size - inset - radius && y < inset + radius && (x - (size - inset - radius)) ** 2 + (y - inset - radius) ** 2 > radius ** 2
      const bottomLeft = x < inset + radius && y > size - inset - radius && (x - inset - radius) ** 2 + (y - (size - inset - radius)) ** 2 > radius ** 2
      const bottomRight = x > size - inset - radius && y > size - inset - radius && (x - (size - inset - radius)) ** 2 + (y - (size - inset - radius)) ** 2 > radius ** 2
      if (x < inset || y < inset || x >= size - inset || y >= size - inset || left || right || bottomLeft || bottomRight) continue
      set(x, y, cream)
    }
  }
  const unit = size / 64
  ellipse(32 * unit, 47 * unit, 18 * unit, 6 * unit, sky)
  ellipse(32 * unit, 45 * unit, 10 * unit, 3.6 * unit, sage)
  ellipse(26 * unit, 36 * unit, 8 * unit, 11 * unit, peach)
  ellipse(39 * unit, 34 * unit, 7 * unit, 10 * unit, lilac)
  ellipse(32 * unit, 33 * unit, 3 * unit, 3 * unit, butter)
  return data
}

for (const size of [192, 512]) {
  writeFileSync(new URL(`../client/public/icon-${size}.png`, import.meta.url), png(size, draw(size)))
}
