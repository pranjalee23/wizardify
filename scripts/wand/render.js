// Renders a photorealistic wand for the cursor. Runs in a browser page; returns a PNG data URL.
// The wand is a surface of revolution (a turned rod) lit from the top left, drawn with its
// tip at (tipX, tipY) and pointing up and to the left. Units are CSS pixels; `scale` sets resolution.
window.renderWand = function ({ size = 100, scale = 3, tipX = 2.7, tipY = 2.7, angle = Math.PI / 4, length = 118, seed = 3 }) {
  const W = Math.round(size * scale), H = W

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
  const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l] }
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

  // Profile along the axis: u = 0 at the tip, u = length at the pommel.
  const collar = [72, 77]
  const grooves = [85, 92.5, 100]
  const woodR = (u) => {
    if (u < 0) return 0
    let r
    if (u < 1.3) r = Math.sqrt(Math.max(0, 1.3 * 1.3 - (1.3 - u) ** 2)) // rounded tip
    else if (u < 68) r = mix(1.3, 2.5, (u - 1.3) / (68 - 1.3)) + 0.07 * Math.sin(u * 0.35) // tapered shaft
    else if (u < collar[0]) r = mix(2.5, 3.0, smooth(68, collar[0], u)) // flare into the collar
    else if (u < collar[1]) r = 3.0
    else if (u < 107) r = mix(3.3, 3.9, smooth(collar[1], 100, u)) - mix(0, 0.4, smooth(102, 107, u)) // carved handle
    else if (u < 111) r = mix(3.5, 2.5, smooth(107, 111, u)) // neck under the pommel
    else return 0
    for (const g of grooves) r -= 0.75 * Math.exp(-(((u - g) / 1.05) ** 2))
    return r
  }
  const collarR = (u) => (u >= collar[0] && u <= collar[1] ? 3.35 - 0.35 * Math.pow(Math.abs((u - (collar[0] + collar[1]) / 2) / ((collar[1] - collar[0]) / 2)), 6) : 0)
  const ballC = 113.8, ballR = 3.9
  const ballRof = (u) => Math.sqrt(Math.max(0, ballR * ballR - (u - ballC) ** 2))
  const parts = [
    { r: woodR, mat: 'wood' },
    { r: collarR, mat: 'brass' },
    { r: ballRof, mat: 'brass' },
  ]

  const ax = Math.cos(angle), ay = Math.sin(angle)
  const e1 = [-ay, ax, 0]
  const A = [ax, ay, 0]
  const Lk = norm([-0.45, -0.7, 0.62])       // key light, top left
  const V = [0, 0, 1]
  const Hk = norm([Lk[0] + V[0], Lk[1] + V[1], Lk[2] + V[2]])
  const Lf = norm([0.6, 0.3, 0.5])           // soft fill from the right

  const img = new ImageData(W, H)
  const px = img.data
  const S = 4 // supersamples per axis
  for (let py = 0; py < H; py++) for (let pxl = 0; pxl < W; pxl++) {
    let R = 0, G = 0, B = 0, Acc = 0
    for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
      const x = (pxl + (sx + 0.5) / S) / scale, y = (py + (sy + 0.5) / S) / scale
      const dx = x - tipX, dy = y - tipY
      const u = dx * ax + dy * ay, v = dx * e1[0] + dy * e1[1]
      if (u < -1 || u > length + 1) continue
      // Pick the part whose surface is outermost here
      let best = null, r = 0
      for (const p of parts) { const pr = p.r(u); if (pr > r) { r = pr; best = p } }
      if (!best || Math.abs(v) >= r) continue
      const dr = (best.r(u + 0.04) - best.r(u - 0.04)) / 0.08
      const c = v / r, sn = Math.sqrt(Math.max(0, 1 - c * c))
      let N = norm([c * e1[0] - dr * A[0], c * e1[1] - dr * A[1], sn])

      let alb, specS, shin, specCol
      const around = Math.atan2(sn, c) * r
      if (best.mat === 'wood') {
        // Pale oiled ash, near bone white, so the wand stands out on the site's dark pages: creamy
        // wood with fine, slightly darker grain lines running its length
        const tone = clamp(0.55 + 0.7 * fbm(u / 40, around / 3, 2, 11), 0, 1)
        const lines = fbm(u / 22, around / 0.28 + 3 * fbm(u / 30, around, 2, 7), 3, 13)
        const t = clamp(tone + lines * 0.8, 0, 1)
        alb = [mix(186, 238, t), mix(164, 228, t), mix(128, 206, t)]
        // Slightly darker grooves (ambient occlusion)
        let occ = 0
        for (const gu of grooves) occ = Math.max(occ, Math.exp(-(((u - gu) / 1.3) ** 2)))
        if (u > collar[1] - 0.6 && u < collar[1] + 1.2) occ = Math.max(occ, 0.6)
        if (u > collar[0] - 1.2 && u < collar[0] + 0.6) occ = Math.max(occ, 0.6)
        alb = alb.map((ch) => ch * (1 - 0.55 * occ))
        // Tiny bump from the grain so highlights break up like a real oiled finish
        const bump = 0.18 * noise(u / 1.6, around / 0.5, 23)
        N = norm([N[0] + bump * e1[0], N[1] + bump * e1[1], N[2]])
        specS = 0.55; shin = 45; specCol = [255, 246, 228]
      } else {
        // Brass: warm, reflective, faintly worn, with fine turned rings
        const wear = fbm(u / 2, around / 1.2, 3, 41)
        const ring = best.r === collarR ? 0.85 + 0.15 * Math.cos(u * 9) : 1
        alb = [(200 + wear * 30) * ring, (150 + wear * 24) * ring, (70 + wear * 10) * ring]
        if (best.r === collarR && (u - collar[0] < 0.45 || collar[1] - u < 0.45)) alb = alb.map((ch) => ch * 0.45)
        specS = 1.6; shin = 90; specCol = [255, 236, 180]
      }

      const diff = Math.max(0, dot(N, Lk))
      const fill = Math.max(0, dot(N, Lf)) * 0.22
      const spec = Math.pow(Math.max(0, dot(N, Hk)), shin) * specS
      const rim = Math.pow(1 - Math.max(0, N[2]), 3) * 0.35
      // Warm light spilling from the glowing tip
      const tipGlow = Math.exp(-u / 10) * (0.55 + 0.45 * Math.max(0, dot(N, [-A[0], -A[1], 0.3])))
      let col
      if (best.mat === 'brass') {
        // Fake environment: brighter facing up, dark facing down
        const env = smooth(-0.3, 0.85, -N[1] * 0.75 + N[2] * 0.45)
        const horizon = Math.exp(-(((N[2] - 0.35) / 0.12) ** 2)) * 0.5 // dark band reflected across the metal
        col = [0, 1, 2].map((k) => alb[k] * (0.06 + 0.5 * diff + fill) * (0.25 + 1.05 * env) * (1 - horizon) + specCol[k] * spec)
      } else {
        const sheen = Math.pow(Math.max(0, dot(N, Hk)), 8) * 0.12 // broad soft sheen under the sharp highlight
        // Pale wood would blow out under full light, so it takes a little less, keeping its shaded side dark
        col = [0, 1, 2].map((k) => alb[k] * (0.22 + 0.7 * diff + fill) + specCol[k] * (spec * 0.6 + sheen))
      }
      const glowCol = [255, 196, 110]
      col = col.map((ch, k) => ch + glowCol[k] * (tipGlow * 0.55 + rim * 0.35 * Math.exp(-u / 40)))
      // The very tip is lit from within
      const hot = Math.exp(-u / 2.2)
      col = col.map((ch, k) => mix(ch, [255, 244, 214][k], hot))

      R += clamp(col[0], 0, 255); G += clamp(col[1], 0, 255); B += clamp(col[2], 0, 255); Acc++
    }
    const i = (py * W + pxl) * 4
    if (Acc) { px[i] = R / Acc; px[i + 1] = G / Acc; px[i + 2] = B / Acc; px[i + 3] = (Acc / (S * S)) * 255 }
  }

  const c = document.createElement('canvas')
  c.width = W; c.height = H
  c.getContext('2d').putImageData(img, 0, 0)
  return c.toDataURL('image/png')
}
