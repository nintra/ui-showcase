// Turns a photo into a sticker preview, entirely in the browser (the photo is never uploaded).
// Photo filters keep the real face and only shift colours; illustration styles redraw it.
// All filters work on a small square canvas, so re-rendering while dragging stays fast.

const INK = [29, 27, 47]
const PALETTES = {
  klassik: { paper: [255, 201, 40] },
  popart: { tones: [INK, [232, 67, 46], [255, 143, 177], [255, 214, 74]] },
}

/** Loads a File into a downscaled canvas (max 1200px), respecting EXIF orientation. */
export async function loadPhoto(file, maxSize = 1200) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  return canvas
}

/**
 * Square crop of `source`. zoom ≥ 1; panX/panY in [-1, 1] move the crop within the photo.
 */
export function cropSquare(source, { zoom = 1, panX = 0, panY = 0 }, size) {
  const side = Math.min(source.width, source.height) / zoom
  const maxX = (source.width - side) / 2
  const maxY = (source.height - side) / 2
  const sx = maxX + panX * maxX
  const sy = maxY + panY * maxY
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, sx, sy, side, side, 0, 0, size, size)
  return canvas
}

function luminance(data) {
  const lum = new Float32Array(data.length / 4)
  for (let i = 0, p = 0; p < lum.length; i += 4, p++) {
    lum[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  return lum
}

// Separable box blur on a single channel.
function blur(values, w, h, radius) {
  const tmp = new Float32Array(values.length)
  const out = new Float32Array(values.length)
  const span = radius * 2 + 1
  for (let y = 0; y < h; y++) {
    let sum = 0
    for (let x = -radius; x <= radius; x++) sum += values[y * w + Math.min(w - 1, Math.max(0, x))]
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = sum / span
      sum += values[y * w + Math.min(w - 1, x + radius + 1)] - values[y * w + Math.max(0, x - radius)]
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0
    for (let y = -radius; y <= radius; y++) sum += tmp[Math.min(h - 1, Math.max(0, y)) * w + x]
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum / span
      sum += tmp[Math.min(h - 1, y + radius + 1) * w + x] - tmp[Math.max(0, y - radius) * w + x]
    }
  }
  return out
}

function sobel(lum, w, h) {
  const mag = new Float32Array(lum.length)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const gx = -lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1] + lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1]
      const gy = -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1] + lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1]
      mag[i] = Math.sqrt(gx * gx + gy * gy)
    }
  }
  return mag
}

function percentile(values, q) {
  const sorted = Float32Array.from(values).sort()
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]
}

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function mix(a, b, t) {
  return a + (b - a) * t
}

/** Ink amount per pixel: strong edges and very dark areas become outlines. */
function inkMap(lum, w, h, { edgeQ, darkQ }) {
  const smooth = blur(lum, w, h, 1)
  const edges = sobel(smooth, w, h)
  const edgeT = Math.max(60, percentile(edges, edgeQ))
  const darkT = percentile(smooth, darkQ)
  const ink = new Float32Array(lum.length)
  for (let i = 0; i < ink.length; i++) {
    const e = smoothstep(edgeT * 0.75, edgeT * 1.25, edges[i])
    const d = darkQ > 0 ? 1 - smoothstep(darkT - 10, darkT + 10, smooth[i]) : 0
    ink[i] = Math.max(e, d)
  }
  return { ink, smooth }
}

function klassik(img) {
  const { data, width: w, height: h } = img
  const { ink } = inkMap(luminance(data), w, h, { edgeQ: 0.86, darkQ: 0.2 })
  const [pr, pg, pb] = PALETTES.klassik.paper
  for (let p = 0, i = 0; p < ink.length; p++, i += 4) {
    data[i] = mix(pr, INK[0], ink[p])
    data[i + 1] = mix(pg, INK[1], ink[p])
    data[i + 2] = mix(pb, INK[2], ink[p])
  }
}

function comic(img) {
  const { data, width: w, height: h } = img
  const n = w * h
  const channels = [0, 1, 2].map((c) => {
    const values = new Float32Array(n)
    for (let p = 0; p < n; p++) values[p] = data[p * 4 + c]
    return blur(values, w, h, 2)
  })
  const { ink } = inkMap(luminance(data), w, h, { edgeQ: 0.9, darkQ: 0.06 })
  const levels = 5
  const step = 255 / (levels - 1)
  for (let p = 0, i = 0; p < n; p++, i += 4) {
    const r = channels[0][p]
    const g = channels[1][p]
    const b = channels[2][p]
    const l = 0.299 * r + 0.587 * g + 0.114 * b
    // Boost saturation, then posterize each channel.
    const out = [r, g, b].map((c) => {
      const saturated = Math.min(255, Math.max(0, l + (c - l) * 1.45 + 8))
      return Math.round(saturated / step) * step
    })
    data[i] = mix(out[0], INK[0], ink[p])
    data[i + 1] = mix(out[1], INK[1], ink[p])
    data[i + 2] = mix(out[2], INK[2], ink[p])
  }
}

function popart(img) {
  const { data, width: w, height: h } = img
  const { ink, smooth } = inkMap(luminance(data), w, h, { edgeQ: 0.93, darkQ: 0 })
  const tones = PALETTES.popart.tones
  const cuts = [percentile(smooth, 0.22), percentile(smooth, 0.5), percentile(smooth, 0.78)]
  for (let p = 0, i = 0; p < smooth.length; p++, i += 4) {
    const v = smooth[p]
    const tone = tones[v < cuts[0] ? 0 : v < cuts[1] ? 1 : v < cuts[2] ? 2 : 3]
    data[i] = mix(tone[0], INK[0], ink[p])
    data[i + 1] = mix(tone[1], INK[1], ink[p])
    data[i + 2] = mix(tone[2], INK[2], ink[p])
  }
}

// --- photo filters: the real face, slightly changed -------------------------

function clamp255(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v
}

/** Runs fn(r, g, b, x, y) -> [r, g, b] for every pixel. */
function eachPixel(img, fn) {
  const { data, width } = img
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const [r, g, b] = fn(data[i], data[i + 1], data[i + 2], p % width, Math.floor(p / width))
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
  }
}

function saturate(r, g, b, amount) {
  const l = 0.299 * r + 0.587 * g + 0.114 * b
  return [l + (r - l) * amount, l + (g - l) * amount, l + (b - l) * amount]
}

function contrast(v, amount) {
  return (v - 128) * amount + 128
}

function original() {}

function leuchtend(img) {
  eachPixel(img, (r, g, b) => saturate(r, g, b, 1.4).map((v) => clamp255(contrast(v, 1.12) + 4)))
}

function warm(img) {
  eachPixel(img, (r, g, b) => {
    const [sr, sg, sb] = saturate(r, g, b, 1.1)
    return [clamp255(sr * 1.06 + 10), clamp255(sg * 1.02 + 4), clamp255(sb * 0.86)]
  })
}

function sw(img) {
  eachPixel(img, (r, g, b) => {
    const l = clamp255(contrast(0.299 * r + 0.587 * g + 0.114 * b, 1.25))
    return [l, l, l]
  })
}

function vintage(img) {
  const half = img.width / 2
  eachPixel(img, (r, g, b, x, y) => {
    const sepia = [0.393 * r + 0.769 * g + 0.189 * b, 0.349 * r + 0.686 * g + 0.168 * b, 0.272 * r + 0.534 * g + 0.131 * b]
    // Slightly faded blacks and a soft vignette.
    const dist = Math.hypot(x - half, y - half) / half
    const vignette = 1 - 0.35 * smoothstep(0.55, 1.1, dist)
    return [r, g, b].map((v, c) => clamp255((18 + mix(v, sepia[c], 0.75) * 0.88) * vignette))
  })
}

// Duotone from ink over minifigure yellow to light cream.
const GELB_STOPS = [INK, [196, 120, 10], [255, 201, 40], [255, 228, 120]]
function gelb(img) {
  eachPixel(img, (r, g, b) => {
    const t = clamp255(contrast(0.299 * r + 0.587 * g + 0.114 * b, 1.1)) / 255
    const pos = t * (GELB_STOPS.length - 1)
    const i = Math.min(GELB_STOPS.length - 2, Math.floor(pos))
    const f = pos - i
    return GELB_STOPS[i].map((v, c) => mix(v, GELB_STOPS[i + 1][c], f))
  })
}

const FILTERS = { original, leuchtend, warm, sw, vintage, gelb, klassik, comic, popart }

/**
 * Returns a data URL of the filtered square crop. `strength` (0–1) blends the
 * filtered result with the untouched photo.
 */
export function renderSticker(source, { style = 'original', strength = 1, zoom = 1, panX = 0, panY = 0, size = 256 } = {}) {
  const canvas = cropSquare(source, { zoom, panX, panY }, size)
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const img = ctx.getImageData(0, 0, size, size)
  const before = strength < 1 ? img.data.slice() : null
  ;(FILTERS[style] ?? original)(img)
  if (before) {
    const { data } = img
    for (let i = 0; i < data.length; i++) data[i] = mix(before[i], data[i], strength)
  }
  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL('image/png')
}
