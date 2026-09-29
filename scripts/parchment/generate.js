// Crumpled parchment generator. Runs in a browser page; returns a WebP data URL.
// Feature sizes are in texture pixels (textures are made at 2x their CSS size).
window.generateParchment = function (opts) {
  const {
    W, H, seed = 1,
    cell = 230,          // spacing of the big crumple facets
    slope = 0.1,         // how steeply facets tilt (crumple strength)
    crease = 1.1,        // depth of the sharp crease lines
    creaseShare = 0.4,   // share of facet edges that carry a visible crease
    soften = 3,          // blur radius that rounds the folds
    bend = 14,           // how much crease lines bow instead of running dead straight
    wrinkle = 3,         // fine wrinkles inside facets
    swell = 16,          // broad bulges across the sheet
    folds = [],          // long fold lines: [{ x, y, angle, depth, width }]
    margin = 10,         // how far the torn edge sits inside the image
    tear = 20,           // how far the torn edge wanders in and out
    jag = 8,             // mid-size ragged bites along the edge
    fibre = 4,           // fine fibrous fringe on the edge
    notches = 3,         // small torn-out notches per 1000px of edge
    notchDepth = 28,     // how deep those notches go
    cornerCut = 36,      // how much of each corner is torn away
    torn = true,         // false: plain full-bleed sheet with no torn or darkened edge (for buttons)
    burn = 70,           // width of the darkened, aged border
    light = 0.85,        // lighting contrast
    spots = 60,          // foxing spots
    quality = 0.86,
  } = opts

  const hash = (x, y, k) => {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 1274126177) + Math.imul(seed, 1442695041)) | 0
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10)
  const grad = (ix, iy, x, y, k) => {
    const a = hash(ix, iy, k) * Math.PI * 2
    return Math.cos(a) * (x - ix) + Math.sin(a) * (y - iy)
  }
  const noise = (x, y, k) => {
    const ix = Math.floor(x), iy = Math.floor(y)
    const fx = fade(x - ix), fy = fade(y - iy)
    const a = grad(ix, iy, x, y, k), b = grad(ix + 1, iy, x, y, k)
    const c = grad(ix, iy + 1, x, y, k), d = grad(ix + 1, iy + 1, x, y, k)
    const ab = a + (b - a) * fx, cd = c + (d - c) * fx
    return ab + (cd - ab) * fy
  }
  const fbm = (x, y, oct, k) => {
    let s = 0, amp = 0.5, f = 1
    for (let o = 0; o < oct; o++) { s += amp * noise(x * f, y * f, k + o * 17); f *= 2.03; amp *= 0.5 }
    return s
  }
  let rs = (seed * 2654435761) >>> 0
  const rand = () => { rs = (Math.imul(rs ^ (rs >>> 15), 2246822519) + 0x9E3779B9) >>> 0; rs ^= rs >>> 13; return (rs >>> 0) / 4294967296 }
  const mix = (a, b, t) => a + (b - a) * t
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)

  // Delaunay triangulation (Bowyer-Watson) of scattered points.
  const delaunay = (pts) => {
    const big = 1e5
    const P = pts.concat([[-big, -big], [big, -big], [0, big]])
    const n = pts.length
    let tris = [[n, n + 1, n + 2]]
    const circ = (t) => {
      const [ax, ay] = P[t[0]], [bx, by] = P[t[1]], [cx, cy] = P[t[2]]
      const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
      const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d
      const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d
      return [ux, uy, (ax - ux) ** 2 + (ay - uy) ** 2]
    }
    let circs = tris.map(circ)
    for (let i = 0; i < n; i++) {
      const [px, py] = P[i]
      const bad = [], keep = [], keepC = []
      tris.forEach((t, j) => { const c = circs[j]; if ((px - c[0]) ** 2 + (py - c[1]) ** 2 < c[2]) bad.push(t); else { keep.push(t); keepC.push(c) } })
      const edges = new Map()
      for (const t of bad) for (const [u, v] of [[t[0], t[1]], [t[1], t[2]], [t[2], t[0]]]) {
        const key = u < v ? u + ',' + v : v + ',' + u
        edges.set(key, edges.has(key) ? null : [u, v])
      }
      for (const e of edges.values()) if (e) { const t = [e[0], e[1], i]; keep.push(t); keepC.push(circ(t)) }
      tris = keep; circs = keepC
    }
    return tris.filter((t) => t[0] < n && t[1] < n && t[2] < n)
  }

  // One crumple layer: flat triangles between scattered points, each vertex at a random height.
  // Facet heights go into F; thin crease valleys (fading out toward their ends) go into C.
  const layer = (F, C, spacing, Z, depthMax) => {
    const pts = []
    const pad = spacing * 1.5
    const tries = Math.ceil(((W + 2 * pad) * (H + 2 * pad)) / (spacing * spacing)) * 4
    const minD2 = (spacing * 0.62) ** 2
    for (let i = 0; i < tries; i++) {
      const p = [-pad + rand() * (W + 2 * pad), -pad + rand() * (H + 2 * pad)]
      if (pts.every((q) => (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 > minD2)) pts.push(p)
    }
    const z = pts.map(() => (rand() * 2 - 1) * Z)
    const depth = new Map()
    const edgeDepth = (u, v) => {
      const key = u < v ? u + ',' + v : v + ',' + u
      if (!depth.has(key)) depth.set(key, rand() < creaseShare ? depthMax * (0.35 + rand() * 0.65) : 0)
      return depth.get(key)
    }
    for (const [i0, i1, i2] of delaunay(pts)) {
      const [x0, y0] = pts[i0], [x1, y1] = pts[i1], [x2, y2] = pts[i2]
      const det = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
      if (Math.abs(det) < 1e-9) continue
      const len = [Math.hypot(x1 - x2, y1 - y2), Math.hypot(x2 - x0, y2 - y0), Math.hypot(x0 - x1, y0 - y1)]
      const ed = [edgeDepth(i1, i2), edgeDepth(i2, i0), edgeDepth(i0, i1)]
      const area2 = Math.abs(det)
      const minX = Math.max(0, Math.floor(Math.min(x0, x1, x2))), maxX = Math.min(W - 1, Math.ceil(Math.max(x0, x1, x2)))
      const minY = Math.max(0, Math.floor(Math.min(y0, y1, y2))), maxY = Math.min(H - 1, Math.ceil(Math.max(y0, y1, y2)))
      for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
        const b = [
          ((y1 - y2) * (x - x2) + (x2 - x1) * (y - y2)) / det,
          ((y2 - y0) * (x - x2) + (x0 - x2) * (y - y2)) / det,
        ]
        b[2] = 1 - b[0] - b[1]
        if (b[0] < -1e-6 || b[1] < -1e-6 || b[2] < -1e-6) continue
        const i = y * W + x
        F[i] = b[0] * z[i0] + b[1] * z[i1] + b[2] * z[i2]
        let c = 0
        for (let e = 0; e < 3; e++) if (ed[e]) {
          const dist = (b[e] * area2) / len[e]
          if (dist < 2.4) {
            const j = (e + 1) % 3, k = (e + 2) % 3
            const along = b[j] + b[k] > 0 ? b[j] / (b[j] + b[k]) : 0.5
            c -= ed[e] * (1 - dist / 2.4) * Math.sin(Math.PI * along)
          }
        }
        C[i] = c
      }
    }
  }

  const boxBlur = (src, r) => {
    if (r < 1) return src
    const tmp = new Float32Array(W * H), out = new Float32Array(W * H), n = 2 * r + 1
    for (let y = 0; y < H; y++) {
      let s = 0
      for (let x = -r; x <= r; x++) s += src[y * W + clamp(x, 0, W - 1)]
      for (let x = 0; x < W; x++) {
        tmp[y * W + x] = s / n
        s += src[y * W + clamp(x + r + 1, 0, W - 1)] - src[y * W + clamp(x - r, 0, W - 1)]
      }
    }
    for (let x = 0; x < W; x++) {
      let s = 0
      for (let y = -r; y <= r; y++) s += tmp[clamp(y, 0, H - 1) * W + x]
      for (let y = 0; y < H; y++) {
        out[y * W + x] = s / n
        s += tmp[clamp(y + r + 1, 0, H - 1) * W + x] - tmp[clamp(y - r, 0, H - 1) * W + x]
      }
    }
    return out
  }
  const sample = (A, x, y) => {
    x = clamp(x, 0, W - 1.001); y = clamp(y, 0, H - 1.001)
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, i = iy * W + ix
    return mix(mix(A[i], A[i + 1], fx), mix(A[i + W], A[i + W + 1], fx), fy)
  }

  // 1. Height field
  const F1 = new Float32Array(W * H), C1 = new Float32Array(W * H)
  const F2 = new Float32Array(W * H), C2 = new Float32Array(W * H)
  layer(F1, C1, cell, cell * slope, crease)
  layer(F2, C2, cell * 0.45, cell * 0.45 * slope * 0.6, crease * 0.5)
  let facets = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) facets[i] = F1[i] + F2[i]
  facets = boxBlur(boxBlur(facets, soften), soften)
  const creases = boxBlur(new Float32Array(C1.map((v, i) => v + C2[i])), 1)

  const h = new Float32Array(W * H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    // Bow the crease lines a little, with a slight wobble, so they look folded by hand.
    const wx = x + bend * fbm(x / 260, y / 260, 2, 5) + 1.2 * noise(x / 18, y / 18, 13)
    const wy = y + bend * fbm(x / 260, y / 260, 2, 9) + 1.2 * noise(x / 18, y / 18, 15)
    let v = sample(facets, wx, wy) + sample(creases, wx, wy)
    v += wrinkle * fbm(x / 90, y / 90, 3, 31) + swell * fbm(x / 420, y / 420, 2, 77)
    for (const f of folds) {
      const nx = -Math.sin(f.angle), ny = Math.cos(f.angle)
      const d = (x - f.x) * nx + (y - f.y) * ny
      v -= f.depth * Math.min(Math.abs(d), f.width)
    }
    h[y * W + x] = v
  }

  // 2. Torn outline: every side wanders at three scales, with a few torn-out notches.
  const tornSide = (n, k) => {
    const off = new Float32Array(n)
    const cuts = []
    const count = Math.round((n / 1000) * notches + rand())
    for (let i = 0; i < count; i++) cuts.push({ at: rand() * n, half: notchDepth * (0.5 + rand() * 0.9), depth: notchDepth * (0.4 + rand() * 0.6) })
    for (let t = 0; t < n; t++) {
      let o = margin
      o += tear * clamp(fbm(t / 120, k * 3.7, 3, 71 + k) + 0.5, 0, 1)
      o += jag * clamp(fbm(t / 22, k * 5.3, 3, 81 + k) + 0.5, 0, 1)
      o += fibre * clamp(noise(t / 3.2, k * 9.1, 91 + k) + 0.5, 0, 1)
      for (const c of cuts) { const u = 1 - Math.abs(t - c.at) / c.half; if (u > 0) o += c.depth * Math.pow(u, 1.6) }
      off[t] = o
    }
    return off
  }
  const offL = tornSide(H, 1), offR = tornSide(H, 2), offT = tornSide(W, 3), offB = tornSide(W, 4)
  // Torn-away corners, each a slightly ragged diagonal
  const corner = [0, 1, 2, 3].map(() => cornerCut * (0.35 + rand() * 0.65))
  const cornerDist = (x, y) => {
    const j = jag * 0.6 * noise(x / 9, y / 9, 131)
    const r2 = Math.SQRT2
    return Math.min(
      (x + y) / r2 - (margin * r2 + corner[0]) + j,
      (W - x + y) / r2 - (margin * r2 + corner[1]) + j,
      (x + H - y) / r2 - (margin * r2 + corner[2]) + j,
      (W - x + H - y) / r2 - (margin * r2 + corner[3]) + j,
    )
  }

  const L = [-0.5, -0.62, 0.6]
  const ln = Math.hypot(...L); L[0] /= ln; L[1] /= ln; L[2] /= ln
  const img = new ImageData(W, H)
  const px = img.data

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x
    const d = torn ? Math.min(x - offL[y], W - offR[y] - x, y - offT[x], H - offB[x] - y, cornerDist(x, y)) : Infinity
    const alpha = clamp(d + 0.5, 0, 1)
    if (alpha <= 0) { px[i * 4 + 3] = 0; continue }

    // Lighting from the height gradient
    const xl = Math.max(x - 1, 0), xr = Math.min(x + 1, W - 1), yu = Math.max(y - 1, 0), yd = Math.min(y + 1, H - 1)
    let gx = (h[y * W + xr] - h[y * W + xl]) / (xr - xl)
    let gy = (h[yd * W + x] - h[yu * W + x]) / (yd - yu)
    gx += 0.05 * noise(x / 1.6, y / 1.6, 101); gy += 0.05 * noise(x / 1.6, y / 1.6, 103) // paper fibre grain
    const nl = Math.hypot(gx, gy, 1)
    const shade = ((-gx * L[0] - gy * L[1] + L[2]) / nl) / L[2]
    const m = clamp(1 + (shade - 1) * light, 0.55, 1.3)

    // Albedo: aged, blotchy parchment
    const blot = fbm(x / 300, y / 300, 4, 41)
    const t = clamp((blot + 0.35) / 0.8, 0, 1)
    let cr = mix(238, 208, t), cg = mix(216, 172, t), cb = mix(164, 104, t)
    const stain = fbm(x / 160 + 40, y / 160, 4, 53)
    if (stain > 0.12) { const s = Math.min((stain - 0.12) * 1.6, 0.35); cr = mix(cr, 176, s); cg = mix(cg, 122, s); cb = mix(cb, 56, s) }

    // Darkened, burnt edges
    const bw = burn * (0.65 + 0.7 * (fbm(x / 110, y / 110, 3, 61) + 0.5))
    const age = Math.exp(-Math.max(d, 0) / bw)
    cr = mix(cr, 120, 0.72 * age); cg = mix(cg, 74, 0.72 * age); cb = mix(cb, 26, 0.72 * age)
    const rim = Math.exp(-Math.max(d, 0) / 3.5)
    cr = mix(cr, 58, 0.85 * rim); cg = mix(cg, 33, 0.85 * rim); cb = mix(cb, 12, 0.85 * rim)

    // Shade warm: shadows fall toward brown, highlights toward cream.
    const vx = (x / W) * 2 - 1, vy = (y / H) * 2 - 1
    const v = 1 - 0.12 * (vx * vx + vy * vy)
    let r = cr * v, g = cg * v, bl = cb * v
    if (m < 1) { r *= Math.pow(m, 0.9); g *= Math.pow(m, 1.2); bl *= Math.pow(m, 1.65) }
    else { const k = (m - 1) * 0.55; r = mix(r, 255, k); g = mix(g, 246, k); bl = mix(bl, 220, k) }
    px[i * 4] = clamp(r, 0, 255)
    px[i * 4 + 1] = clamp(g, 0, 255)
    px[i * 4 + 2] = clamp(bl, 0, 255)
    px[i * 4 + 3] = alpha * 255
  }

  // Foxing: small age spots
  for (let n = 0; n < spots; n++) {
    const sx = rand() * W, sy = rand() * H, rad = 1.5 + rand() * rand() * 7, a = 0.08 + rand() * 0.22
    const R = Math.ceil(rad * 2.5)
    for (let y = Math.max(0, Math.floor(sy - R)); y < Math.min(H, sy + R); y++)
      for (let x = Math.max(0, Math.floor(sx - R)); x < Math.min(W, sx + R); x++) {
        const i = (y * W + x) * 4
        if (!px[i + 3]) continue
        const k = a * Math.exp(-((x - sx) ** 2 + (y - sy) ** 2) / (rad * rad))
        px[i] = mix(px[i], 128, k); px[i + 1] = mix(px[i + 1], 82, k); px[i + 2] = mix(px[i + 2], 34, k)
      }
  }

  const c = document.createElement('canvas')
  c.width = W; c.height = H
  c.getContext('2d').putImageData(img, 0, 0)
  return c.toDataURL('image/webp', quality)
}
