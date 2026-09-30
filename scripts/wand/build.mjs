// Cuts the cursor wand out of its artwork (designs/brand/wand-artwork.png, on black) and writes
// public/images/wand.png for components/WandCursor.
// Usage: node scripts/wand/build.mjs   (needs Google Chrome installed)
// Prints where the tip lands in the output, which WandCursor.module.css uses to put it on the pointer.
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const data = `data:image/png;base64,${readFileSync(join(root, 'designs/brand/wand-artwork.png')).toString('base64')}`

// The wand's length on screen, tip to pommel, in CSS pixels; drawn at 3x for sharp screens
const LENGTH = 128
const SCALE = 3

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
const out = await page.evaluate(async ({ data, LENGTH, SCALE }) => {
  const img = new Image()
  img.src = data
  await img.decode()
  const W = img.width, H = img.height
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  g.drawImage(img, 0, 0)
  const im = g.getImageData(0, 0, W, H)
  const d = im.data
  const lum = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) lum[i] = 0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]

  // Background: the black reachable from the image's edges. Dark engraving inside the handle is
  // walled in by brighter metal, so it isn't reached and stays solid.
  const bg = new Uint8Array(W * H)
  const stack = []
  const seed = (i) => { if (!bg[i] && lum[i] <= 16) { bg[i] = 1; stack.push(i) } }
  for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x) }
  for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1) }
  while (stack.length) {
    const i = stack.pop(), x = i % W, y = (i / W) | 0
    if (x > 0) seed(i - 1)
    if (x < W - 1) seed(i + 1)
    if (y > 0) seed(i - W)
    if (y < H - 1) seed(i + W)
  }

  // Pixels on or near the background's edge fade with their brightness, since there the wand was
  // blended into black; everything else is solid.
  const near = new Uint8Array(W * H)
  const R = 3
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!bg[y * W + x]) continue
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const xx = x + dx, yy = y + dy
      if (xx >= 0 && yy >= 0 && xx < W && yy < H) near[yy * W + xx] = 1
    }
  }
  const smooth = (a, b, t) => { const x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x) }
  let x0 = W, x1 = 0, y0 = H, y1 = 0
  for (let i = 0; i < W * H; i++) {
    const a = near[i] ? smooth(4, 40, lum[i]) : 1
    if (a > 0) {
      // Undo the blend with black, so edges keep the wand's colour instead of a dark fringe
      const k = 1 / Math.max(a, 0.35)
      d[i * 4] = Math.min(255, d[i * 4] * k)
      d[i * 4 + 1] = Math.min(255, d[i * 4 + 1] * k)
      d[i * 4 + 2] = Math.min(255, d[i * 4 + 2] * k)
    }
    d[i * 4 + 3] = Math.round(a * 255)
    if (a > 0.02) { const x = i % W, y = (i / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) }
  }
  g.putImageData(im, 0, 0)

  // The tip and the pommel: the solid pixels furthest along the wand, which points up and to the left
  const ux = 0.77, uy = 0.64
  let tip = null, end = null
  for (let i = 0; i < W * H; i++) {
    if (d[i * 4 + 3] < 128) continue
    const x = i % W, y = (i / W) | 0, s = x * ux + y * uy
    if (!tip || s < tip.s) tip = { x, y, s }
    if (!end || s > end.s) end = { x, y, s }
  }
  const scale = LENGTH / Math.hypot(end.x - tip.x, end.y - tip.y)

  // Crop, scale down in halving steps (which keeps the thin tip crisp), and report the tip's position
  const pad = 4
  x0 -= pad; y0 -= pad; x1 += pad; y1 += pad
  const cw = Math.round((x1 - x0) * scale * SCALE), ch = Math.round((y1 - y0) * scale * SCALE)
  let cur = document.createElement('canvas')
  cur.width = x1 - x0
  cur.height = y1 - y0
  cur.getContext('2d').drawImage(c, x0, y0, cur.width, cur.height, 0, 0, cur.width, cur.height)
  while (cur.width / 2 > cw) {
    const step = document.createElement('canvas')
    step.width = Math.round(cur.width / 2)
    step.height = Math.round(cur.height / 2)
    const sg = step.getContext('2d')
    sg.imageSmoothingQuality = 'high'
    sg.drawImage(cur, 0, 0, step.width, step.height)
    cur = step
  }
  const o = document.createElement('canvas')
  o.width = cw
  o.height = ch
  const og = o.getContext('2d')
  og.imageSmoothingQuality = 'high'
  og.drawImage(cur, 0, 0, cw, ch)
  return {
    url: o.toDataURL('image/png'),
    size: [cw / SCALE, ch / SCALE],
    tip: [(tip.x - x0) * scale, (tip.y - y0) * scale],
  }
}, { data, LENGTH, SCALE })

const buf = Buffer.from(out.url.split(',')[1], 'base64')
writeFileSync(join(root, 'public/images/wand.png'), buf)
console.log(`wand.png  ${(buf.length / 1024).toFixed(0)} KB  ${out.size.map((v) => v.toFixed(1)).join('x')} CSS px  tip at (${out.tip.map((v) => v.toFixed(1)).join(', ')})`)
await browser.close()
