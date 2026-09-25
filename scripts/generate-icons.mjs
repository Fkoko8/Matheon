/**
 * Generator ikon PWA dla MATHEON.
 *
 * Ikony są rysowane proceduralnie i zapisywane jako PNG (własny enkoder na `zlib`),
 * bo repozytorium nie ma narzędzia do rasteryzacji SVG — a instalacja PWA wymaga
 * rastrowych ikon 192 px i 512 px. Znak jest ten sam co w aplikacji: kwadrat
 * z gradientem fiolet → błękit i litera „M”.
 *
 * Uruchomienie: `pnpm icons:generate`
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

/* ------------------------------- enkoder PNG ------------------------------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buffer) {
  let crc = -1
  for (let index = 0; index < buffer.length; index += 1) crc = CRC_TABLE[(crc ^ buffer[index]) & 0xff] ^ (crc >>> 8)
  return (crc ^ -1) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([length, body, crc])
}

function encodePng(width, height, rgba) {
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0 // filtr 0 (None)
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // 8 bitów na kanał
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* -------------------------------- rysowanie -------------------------------- */

const VIOLET = [139, 92, 246]
const BLUE = [59, 130, 246]
const WHITE = [255, 255, 255]
const SAMPLES = 4 // supersampling 4×4 — wygładzone krawędzie

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function insideRoundedRect(x, y, size, radius) {
  if (radius <= 0) return x >= 0 && y >= 0 && x <= size && y <= size
  const cx = Math.min(Math.max(x, radius), size - radius)
  const cy = Math.min(Math.max(y, radius), size - radius)
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const lengthSquared = dx * dx + dy * dy
  const t = lengthSquared === 0 ? 0 : Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

/** Cztery kreski litery „M” w układzie 0–1, skalowane do boksu o środku (0,5; 0,5). */
function letterSegments(scale) {
  const shift = (value) => 0.5 + (value - 0.5) * scale
  const x1 = shift(0.3)
  const x2 = shift(0.7)
  const xm = 0.5
  const top = shift(0.3)
  const mid = shift(0.54)
  const bottom = shift(0.7)
  return [
    [x1, bottom, x1, top],
    [x1, top, xm, mid],
    [xm, mid, x2, top],
    [x2, top, x2, bottom],
  ]
}

function renderIcon(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4)
  const radius = maskable ? 0 : size * 0.19
  const strokeHalf = size * 0.031
  const segments = letterSegments(maskable ? 0.72 : 0.86).map(([ax, ay, bx, by]) => [ax * size, ay * size, bx * size, by * size])

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let shapeCoverage = 0
      let letterCoverage = 0

      for (let sy = 0; sy < SAMPLES; sy += 1) {
        for (let sx = 0; sx < SAMPLES; sx += 1) {
          const x = px + (sx + 0.5) / SAMPLES
          const y = py + (sy + 0.5) / SAMPLES
          if (insideRoundedRect(x, y, size, radius)) shapeCoverage += 1
          const distance = Math.min(...segments.map(([ax, ay, bx, by]) => distanceToSegment(x, y, ax, ay, bx, by)))
          if (distance <= strokeHalf) letterCoverage += 1
        }
      }

      const total = SAMPLES * SAMPLES
      const shape = shapeCoverage / total
      const letter = letterCoverage / total
      const gradient = mix(VIOLET, BLUE, (px + py) / (2 * (size - 1)))
      const [r, g, b] = mix(gradient, WHITE, letter)
      const offset = (py * size + px) * 4
      rgba[offset] = Math.round(r)
      rgba[offset + 1] = Math.round(g)
      rgba[offset + 2] = Math.round(b)
      rgba[offset + 3] = Math.round(shape * 255)
    }
  }

  return encodePng(size, size, rgba)
}

const outputs = [
  ['public/icon-192.png', 192, { maskable: false }],
  ['public/icon-512.png', 512, { maskable: false }],
  ['public/icon-maskable-512.png', 512, { maskable: true }],
  ['public/apple-touch-icon.png', 180, { maskable: true }],
]

for (const [path, size, options] of outputs) {
  const png = renderIcon(size, options)
  writeFileSync(path, png)
  console.log(`zapisano ${path} (${size}×${size}, ${(png.length / 1024).toFixed(1)} kB)`)
}
