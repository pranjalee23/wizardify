// Renders the wax body of a floating candle (no flame) for components/Candle. Runs in a browser page and
// returns a WebP data URL. The image lines up with the candle's 80x260 SVG box, and runs 12 units below
// it for the curve of the base and the drips hanging from it: the rim's centre sits at (40, 71) and the
// base's at (40, 254). The candle is a cylinder seen from slightly above, lit by its own
// flame (from above, and glowing through the wax) and faintly by the room. Units are the SVG's; `scale`
// sets resolution.
window.renderCandle = function ({ scale = 3, seed = 1, drips = [], melt = [], tint = [0, 0, 0] }) {
  const W = 80 * scale, H = 272 * scale
  const R = 19, top = 71, base = 254
  const el = Math.asin(5 / 19) // viewing angle that makes the rim an ellipse 5 units tall
  const ce = Math.cos(el), se = Math.sin(el)
  const len = (base - top) / ce // body length along the axis

  const hash = (x, y, k) => {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 1274126177) + Math.imul(seed, 1442695041)) | 0
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10)
  const grad = (ix, iy, x, y, k) => { const a = hash(ix, iy, k) * Math.PI * 2; return Math.cos(a) * (x - ix) + Math.sin(a) * (y - iy) }
  const noise = (x, y, k) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = fade(x - ix), fy = fade(y - iy)
    const a = grad(ix, iy, x, y, k), b = grad(ix + 1, iy, x, y, k), c = grad(ix, iy + 1, x, y, k), d = grad(ix + 1, iy + 1, x, y, k)
    const ab = a + (b - a) * fx, cd = c + (d - c) * fx
    return ab + (cd - ab) * fy
  }
  const fbm = (x, y, oct, k) => { let s = 0, amp = 0.5, f = 1; for (let o = 0; o < oct; o++) { s += amp * noise(x * f, y * f, k + o * 17); f *= 2.03; amp *= 0.5 } return s }
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)
  const mix = (a, b, t) => a + (b - a) * t
  const smooth = (a, b, t) => { const x = clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x) }
  const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l] }
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

  // How far the rim has melted down at angle th (0 = facing us); uneven, lower where the drips ran.
  const rimDrop = (th) => {
    let d = 1.2 + 0.9 * fbm(th * 1.3, 0.5, 2, 5)
    for (const m of melt) d += m.depth * Math.exp(-(((th - m.at) / m.width) ** 2))
    return Math.max(0, d)
  }
  // Extra radius from wax drips at angle th, t units down from the rim. Each drip is a ridge that
  // thins as it runs and ends in a rounded bead; one longer than the body hangs below the base.
  const dripAt = (th, t) => {
    let r = 0
    for (const d of drips) {
      const across = ((th - d.at) * R) / d.width
      if (Math.abs(across) > 2.5 || t < 0 || t > d.length + d.width * 1.4) continue
      const body = t <= d.length ? Math.exp(-across * across * 1.6) * d.height * mix(1, 0.72, t / d.length) : 0
      const bead = Math.exp(-across * across * 1.1 - ((t - d.length) / (d.width * 0.8)) ** 2) * d.height * 0.95
      r = Math.max(r, body, bead)
    }
    return r
  }
  const radius = (th, t) => {
    // The base edge is softened, as a real cast candle's is.
    const soft = 1 - 0.035 * smooth(len - 3, len, t)
    return R * soft + dripAt(th, t)
  }

  const Kl = norm([-0.55, 0.3, 0.78]) // faint room light from the front left
  const V = [0, se, ce]
  const flame = [0, 24, 0] // flame centre, above the rim

  // Draw by splatting surface samples into a supersampled buffer with a depth test.
  const S = 4
  const BW = W * S, BH = H * S
  const zbuf = new Float32Array(BW * BH).fill(-1e9)
  const col = new Float32Array(BW * BH * 3)
  const k = scale * S
  const put = (X, Y, Z, rgb) => {
    const sx = Math.round((40 + X) * k)
    const sy = Math.round((top - Y * ce + Z * se) * k)
    if (sx < 0 || sy < 0 || sx >= BW || sy >= BH) return
    const depth = Z * ce + Y * se
    const i = sy * BW + sx
    if (depth <= zbuf[i]) return
    zbuf[i] = depth
    col[i * 3] = rgb[0]; col[i * 3 + 1] = rgb[1]; col[i * 3 + 2] = rgb[2]
  }

  const shade = (P, N, t, inPool) => {
    // Wax colour: warm ivory with faint mottling and fine vertical streaks from pouring
    const mott = fbm(P[0] / 9 + P[2] / 9, P[1] / 14, 3, 21)
    const streak = noise(Math.atan2(P[0], P[2]) * 14, P[1] / 40, 33)
    let alb = [242 + tint[0] + mott * 14, 226 + tint[1] + mott * 12, 200 + tint[2] + mott * 10].map((c) => c + streak * 5)

    const toF = [flame[0] - P[0], flame[1] - P[1], flame[2] - P[2]]
    const dF = Math.hypot(...toF)
    const Lf = [toF[0] / dF, toF[1] / dF, toF[2] / dF]
    const fall = 1 / (1 + (dF / 30) ** 2)
    const direct = Math.max(0, dot(N, Lf)) * fall
    const facing = Math.max(0, dot(N, V))
    // Light carried through the wax from the flame: strong just under the rim and fading down the
    // body, and brighter at the thin edges, where the wax is most translucent.
    const edge = (1 - facing) ** 2
    const sss = Math.exp(-t / 24) * (0.75 + 0.6 * edge) + Math.exp(-t / 95) * (0.2 + 0.25 * edge)
    const key = Math.max(0, dot(N, Kl))
    const light = [0, 1, 2].map((c) => [0.27, 0.22, 0.17][c] + key * [0.46, 0.42, 0.36][c])
    const H = norm([Kl[0] + V[0], Kl[1] + V[1], Kl[2] + V[2]])
    const Hf = norm([Lf[0] + V[0], Lf[1] + V[1], Lf[2] + V[2]])
    const spec = Math.pow(Math.max(0, dot(N, H)), 18) * 0.2 + Math.pow(Math.max(0, dot(N, Hf)), 36) * fall * 1.1
    const glowCol = [255, 176, 92]
    let out
    if (inPool) {
      // Molten wax: golden, lit from just above, with the flame mirrored in it
      const molten = [255, 206, 136]
      out = [0, 1, 2].map((c) => molten[c] * (0.7 + direct * 0.6) + 255 * spec * 0.9)
    } else {
      out = [0, 1, 2].map((c) => alb[c] * (light[c] + direct * 1.6) + glowCol[c] * sss * 0.75 + 255 * spec * [1, 0.95, 0.82][c])
    }
    // Darker towards the base, which the flame barely reaches
    const dim = mix(1, 0.74, smooth(len * 0.3, len, t))
    return out.map((c) => c * dim)
  }

  // Side surface
  const nTh = Math.round(Math.PI * R * k * 1.6), nT = Math.round(len * k * 1.6)
  for (let i = 0; i <= nTh; i++) {
    const th = -Math.PI / 2 + (Math.PI * i) / nTh
    const drop = rimDrop(th)
    for (let j = 0; j <= nT; j++) {
      const t = drop + ((len + 8 - drop) * j) / nT
      const r = radius(th, t)
      if (t > len) continue // drips hanging below the base are drawn separately
      const X = r * Math.sin(th), Z = r * Math.cos(th), Y = -t
      // Normal from the slopes of the radius around and along the surface
      const e = 0.05
      const drTh = (radius(th + e, t) - radius(th - e, t)) / (2 * e)
      const drT = (radius(th, t + e) - radius(th, t - e)) / (2 * e)
      const radial = [Math.sin(th), 0, Math.cos(th)]
      const tangent = [Math.cos(th), 0, -Math.sin(th)]
      let N = norm([radial[0] - (drTh / r) * tangent[0], drT, radial[2] - (drTh / r) * tangent[2]])
      // Tiny bumps so highlights break up like real wax
      const b = 0.08 * noise(th * 30, t / 1.5, 51)
      N = norm([N[0] + b * tangent[0], N[1] + b * 0.5, N[2] + b * tangent[2]])
      put(X, Y, Z, shade([X, Y, Z], N, t, false))
    }
  }

  // Drips longer than the body hang from the base as tapering strands that end in a teardrop bead.
  for (const d of drips) {
    if (d.length <= len) continue
    const cx = (R - 0.4) * Math.sin(d.at), cz = (R - 0.4) * Math.cos(d.at)
    const w = d.width
    const rho = (t) => {
      const u = clamp((t - len) / (d.length - len), 0, 1)
      const strand = t <= d.length ? w * 0.5 * mix(1, 0.5, smooth(0, 1, u)) : 0
      const b = (t - d.length) / (w * 0.8)
      const bead = Math.abs(b) < 1 ? w * 0.62 * Math.sqrt(1 - b * b) : 0
      return Math.max(strand, bead)
    }
    const t0 = len - 1.5, t1 = d.length + w * 0.8
    const nA = Math.round(2 * Math.PI * w * k * 1.6), nL = Math.round((t1 - t0) * k * 1.6)
    for (let j = 0; j <= nL; j++) {
      const t = t0 + ((t1 - t0) * j) / nL
      const r = rho(t)
      if (r <= 0) continue
      const dr = (rho(t + 0.05) - rho(t - 0.05)) / 0.1
      for (let i = 0; i < nA; i++) {
        const a = (2 * Math.PI * i) / nA
        const X = cx + r * Math.sin(a), Z = cz + r * Math.cos(a), Y = -t
        const N = norm([Math.sin(a), dr, Math.cos(a)])
        put(X, Y, Z, shade([X, Y, Z], N, t, false))
      }
    }
  }

  // Top: a shallow melt pool inside a raised, uneven lip
  const nR = Math.round(R * k * 1.4), nP = Math.round(2 * Math.PI * R * k * 1.4)
  for (let i = 0; i <= nR; i++) {
    const rho = (R * i) / nR
    for (let j = 0; j < nP; j++) {
      const phi = (2 * Math.PI * j) / nP
      const X = rho * Math.sin(phi), Z = rho * Math.cos(phi)
      const lip = rimDrop(phi)
      const dish = 2.6 * (1 - (rho / R) ** 2) // pool dips in the middle
      const edge = smooth(R - 3, R, rho) * lip // the rim falls away where it melted
      const Y = -dish - edge - 0.6
      const e = 0.2
      const hAt = (x, z) => { const rr = Math.hypot(x, z), p = Math.atan2(x, z); return -(2.6 * (1 - (rr / R) ** 2)) - smooth(R - 3, R, rr) * rimDrop(p) }
      const gx = (hAt(X + e, Z) - hAt(X - e, Z)) / (2 * e)
      const gz = (hAt(X, Z + e) - hAt(X, Z - e)) / (2 * e)
      const N = norm([-gx, 1, -gz])
      put(X, Y, Z, shade([X, Y, Z], N, 0.5 + edge, true))
    }
  }

  // Resolve the supersampled buffer, with coverage as alpha
  const img = new ImageData(W, H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let r = 0, g = 0, bl = 0, n = 0
    for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
      const i = (y * S + sy) * BW + x * S + sx
      if (zbuf[i] === -1e9) continue
      r += col[i * 3]; g += col[i * 3 + 1]; bl += col[i * 3 + 2]; n++
    }
    const o = (y * W + x) * 4
    if (n) { img.data[o] = clamp(r / n, 0, 255); img.data[o + 1] = clamp(g / n, 0, 255); img.data[o + 2] = clamp(bl / n, 0, 255); img.data[o + 3] = (n / (S * S)) * 255 }
  }
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  c.getContext('2d').putImageData(img, 0, 0)
  return c.toDataURL('image/webp', 0.92)
}
