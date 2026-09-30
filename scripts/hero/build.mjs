// Builds the home hero's scene from the artwork in designs/hero:
//   room.png     the room, with no candles or owl
//   candles.png  candle cut-outs on a transparent sheet
//   owl.png      the snowy owl, cut out
//   room-lit.png the same room with its candles lit, for the inner pages' backgrounds
// Usage: node scripts/hero/build.mjs   (needs Google Chrome installed)
// Writes:
//   public/images/room-lit.webp     the lit room, for the inner pages (components/NightSky); its flames
//                                   flicker from lib/flames.ts
//   public/images/hero-room.webp    the room with each candle's wax set into its holder, and warm light
//                                   around the flames; the flames themselves are left out
//   public/images/hero-flames.webp  every flame, side by side, to be set swaying on the page
//   public/images/owl.webp          the owl, cropped and sized for the page
//   public/images/owl-rig.png       how much each part of the owl moves, for components/HeroOwl, which
//                                   bends the one image rather than moving cut-out pieces, so the neck
//                                   and wing flex with no seams. Red is the wing, green the head and
//                                   neck, blue the face; each fades smoothly to nothing
//   lib/hero-scene.ts               where it all goes, for components/HeroScene
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const png = (name) => `data:image/png;base64,${readFileSync(join(root, 'designs/hero', name)).toString('base64')}`
const save = (path, url) => writeFileSync(join(root, path), Buffer.from(url.split(',')[1], 'base64'))

// Candles, in room.png pixels. `sprite` is the candle's box on candles.png. `candle` keeps just the
// candle, to stand in one of the room's own empty candlesticks; `whole` keeps its holder too. `base` is
// where the bottom of the kept part stands, and `width` the width of the wax there. Candles in the
// foreground are out of focus, so they're blurred and keep their flames baked in.
const candles = [
  // Left: the tall, medium and short candlesticks
  { sprite: [25, 20, 215, 640], keep: 'candle', base: [259, 460], width: 42 },
  { sprite: [530, 200, 720, 610], keep: 'candle', base: [193, 525], width: 40 },
  { sprite: [630, 715, 760, 980], keep: 'candle', base: [142, 574], width: 36 },
  // Beside the scroll on the mantel
  { sprite: [280, 80, 465, 625], keep: 'candle', base: [711, 583], width: 32 },
  // Right: the two candlesticks beside the owl; the second stands partly behind it
  { sprite: [1340, 120, 1505, 610], keep: 'candle', base: [1404, 519], width: 34 },
  { sprite: [785, 580, 965, 990], keep: 'candle', base: [1444, 528], width: 30 },
  // The top shelf of the bookcase
  { sprite: [820, 270, 1005, 575], keep: 'candle', base: [1624, 224], width: 44 },
  // Out of focus in the foreground corners
  { sprite: [45, 660, 380, 975], keep: 'whole', base: [96, 1000], width: 100, blur: 4 },
  { sprite: [405, 715, 575, 965], keep: 'whole', base: [1646, 1002], width: 62, blur: 4 },
]

// The owl, in owl.png pixels: where its feet grip, and where they stand in the room
const owl = {
  feet: [515, 1000],
  stand: [1500, 598],
  height: 250, // from the top of its head to its feet, in room pixels
  crop: [180, 35, 1160, 1200],
  // The head turns fully above `neck[0]`, the chest stays still below `neck[1]`, and the neck bends
  // smoothly between; the wing is held still, so the head never drags its top edge
  neck: [300, 455],
  headPivot: [440, 380],
  wing: [
    [470, 355], [537, 330], [612, 318], [680, 322], [750, 352], [822, 402], [890, 482], [942, 575],
    [995, 690], [1035, 792], [1085, 905], [1135, 1030], [1150, 1140], [1105, 1172], [1050, 1195],
    [1000, 1125], [925, 1062], [850, 1000], [762, 950], [700, 900], [625, 825], [562, 750], [512, 675],
    [481, 587], [465, 487], [462, 400],
  ],
  wingPivot: [560, 360],
  // The face slides across the head when the owl looks aside: eyes and beak fully, fading out to the rim
  face: [436, 222, 205, 150],
  eyes: [[361, 192, 32, 29], [510, 188, 32, 29]],
}
const RIG_SCALE = 0.25 // rig pixels per owl.png pixel; the weights are smooth, so this is plenty

const ROOM_Q = 0.9
const FLAME_RES = 3 // flame image pixels per room pixel
const OWL_RES = 2.6 // owl image pixels per room pixel; it's resampled as it bends, so a little extra

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
await page.addScriptTag({ content: readFileSync(join(root, 'scripts/owl/rig.js'), 'utf8') })
const out = await page.evaluate(
  async ({ roomData, sheetData, owlData, litData, candles, owl, ROOM_Q, FLAME_RES, OWL_RES, RIG_SCALE }) => {
    const load = async (u) => {
      const img = new Image()
      img.src = u
      await img.decode()
      return img
    }
    const canvas = (w, h) => {
      const c = document.createElement('canvas')
      c.width = Math.max(1, Math.round(w))
      c.height = Math.max(1, Math.round(h))
      return c
    }
    const pixels = (img) => {
      const c = canvas(img.width, img.height)
      const g = c.getContext('2d')
      g.drawImage(img, 0, 0)
      return g.getImageData(0, 0, c.width, c.height)
    }
    const smooth = (a, b, t) => {
      const x = Math.min(1, Math.max(0, (t - a) / (b - a)))
      return x * x * (3 - 2 * x)
    }
    // Scale a canvas down in halving steps, then to size, which keeps fine detail crisp
    const resize = (src, w, h) => {
      let cur = src
      while (cur.width / 2 > w && cur.height / 2 > h) {
        const step = canvas(cur.width / 2, cur.height / 2)
        const g = step.getContext('2d')
        g.imageSmoothingQuality = 'high'
        g.drawImage(cur, 0, 0, step.width, step.height)
        cur = step
      }
      const o = canvas(w, h)
      const g = o.getContext('2d')
      g.imageSmoothingQuality = 'high'
      g.drawImage(cur, 0, 0, o.width, o.height)
      return o
    }

    const [room, sheet, owlImg, litImg] = await Promise.all([load(roomData), load(sheetData), load(owlData), load(litData)])
    const RW = room.width, RH = room.height
    const S = pixels(sheet)

    // Measure a candle sprite: its flame, the top of its wax, the wax's width and where a holder starts
    const measure = ([x0, y0, x1, y1]) => {
      const rows = []
      for (let y = y0; y < y1; y++) {
        let n = 0, l = -1, r = -1
        for (let x = x0; x < x1; x++) {
          if (S.data[(y * S.width + x) * 4 + 3] > 128) {
            n++
            if (l < 0) l = x
            r = x
          }
        }
        rows.push({ y, n, l, r })
      }
      const lit = rows.filter((q) => q.n)
      const top = lit[0].y, bottom = lit[lit.length - 1].y
      const maxUpper = Math.max(...lit.filter((q) => q.y < (top + bottom) / 2).map((q) => q.n))
      const wax = rows.find((q) => q.n > maxUpper * 0.6)
      const body = rows.filter((q) => q.y > wax.y + 12 && q.y < wax.y + 52)
      const widths = body.map((q) => q.n).sort((a, b) => a - b)
      const bodyW = widths[widths.length >> 1]
      const cx = body.reduce((s, q) => s + (q.l + q.r) / 2, 0) / body.length
      const holder = rows.find((q) => q.y > wax.y + 30 && q.n > bodyW * 1.28)
      // The flame: down from its tip, until the rows widen suddenly where the wax begins
      const flameRows = []
      let widest = 0
      for (const q of rows) {
        if (!q.n) continue
        const span = q.r - q.l + 1
        if (q.y >= wax.y || (flameRows.length > 5 && span > widest * 1.5 + 4)) break
        flameRows.push(q)
        widest = Math.max(widest, span)
      }
      // Its width comes from the upper rows, which are pure flame; the last few can catch the wax's rim
      const core = flameRows.slice(0, Math.floor(flameRows.length * 0.85))
      const flameCx = core.reduce((s, q) => s + (q.l + q.r) / 2, 0) / core.length
      const flameHalf = Math.max(...core.map((q) => (q.r - q.l + 1) / 2)) + 3
      const flameBottom = flameRows[flameRows.length - 1].y
      return { top, bottom, waxTop: wax.y, bodyW, cx, holderRim: holder ? holder.y : bottom, flameCx, flameHalf, flameBottom }
    }

    // ---- Candles: wax into the room, flames into their own images ----
    const R = canvas(RW, RH)
    const rg = R.getContext('2d')
    rg.drawImage(room, 0, 0)
    const flames = []
    const flameCanvases = []
    for (const c of candles) {
      const m = measure(c.sprite)
      const [x0, , x1] = c.sprite
      const yEnd = c.keep === 'candle' ? m.holderRim + 2 : m.bottom + 1
      const w = x1 - x0, h = yEnd - m.top
      const s = c.width / m.bodyW
      // The flame ends where the wax begins; its dim base fades out over the last few rows
      const split = m.flameBottom
      const body = new ImageData(w, h)
      const flame = new ImageData(w, h)
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const si = ((m.top + y) * S.width + x0 + x) * 4
        const o = (y * w + x) * 4
        // The flame is what rises above the wax, in a column around the wick
        const inColumn = Math.abs(x0 + x - m.flameCx) <= m.flameHalf
        const f = c.blur ? 0 : inColumn ? 1 - smooth(split - 3, split + 1, m.top + y) : 0
        // The kept part's bottom edge fades over a pixel, so it sits into its holder softly
        const edge = c.keep === 'candle' ? 1 - smooth(yEnd - 3, yEnd, m.top + y) : 1
        for (let k = 0; k < 3; k++) body.data[o + k] = flame.data[o + k] = S.data[si + k]
        body.data[o + 3] = S.data[si + 3] * (1 - f) * edge
        flame.data[o + 3] = S.data[si + 3] * f
      }
      const bc = canvas(w, h)
      bc.getContext('2d').putImageData(body, 0, 0)
      const left = c.base[0] - (m.cx - x0) * s
      const top = c.base[1] - h * s
      rg.save()
      rg.filter = `${c.blur ? `blur(${c.blur}px) ` : ''}brightness(0.93)`
      rg.drawImage(resize(bc, w * s, h * s), left, top)
      rg.restore()

      const fx = m.flameCx - x0
      if (!c.blur) {
        // The flame's box: from its tip down to just below the split, as wide as its column
        const fw = m.flameHalf * 2, fh = split + 2 - m.top
        const fc = canvas(fw, fh)
        const fg = fc.getContext('2d')
        const tmp = canvas(w, h)
        tmp.getContext('2d').putImageData(flame, 0, 0)
        fg.drawImage(tmp, fx - m.flameHalf, 0, fw, fh, 0, 0, fw, fh)
        const scaled = resize(fc, fw * s * FLAME_RES, fh * s * FLAME_RES)
        flameCanvases.push(scaled)
        flames.push({
          x: left + (fx - m.flameHalf) * s,
          y: top,
          w: fw * s,
          h: fh * s,
          // It sways from its base, at the wick
          baseY: (m.flameBottom + 1 - m.top) / fh,
          atlas: scaled,
        })
      }
      // Warm light on the room around every flame, sharp or blurred
      const lx = left + fx * s, ly = top + ((m.waxTop - m.top) * 0.55) * s
      const lr = (m.waxTop - m.top) * s * (c.blur ? 4 : 3.4)
      rg.save()
      rg.globalCompositeOperation = 'screen'
      const grad = rg.createRadialGradient(lx, ly, 0, lx, ly, lr)
      grad.addColorStop(0, 'rgba(255, 182, 96, 0.34)')
      grad.addColorStop(0.35, 'rgba(255, 150, 60, 0.12)')
      grad.addColorStop(1, 'rgba(255, 140, 50, 0)')
      rg.fillStyle = grad
      rg.fillRect(lx - lr, ly - lr, lr * 2, lr * 2)
      rg.restore()
    }

    // Flames side by side in one image
    const pad = 4
    const atlasW = flameCanvases.reduce((s, c) => s + c.width + pad, pad)
    const atlasH = Math.max(...flameCanvases.map((c) => c.height)) + pad * 2
    const A = canvas(atlasW, atlasH)
    let ax = pad
    flames.forEach((f, i) => {
      const c = flameCanvases[i]
      A.getContext('2d').drawImage(c, ax, pad)
      f.atlas = { x: ax, y: pad, w: c.width, h: c.height }
      ax += c.width + pad
    })

    // ---- Owl ----
    const [cx0, cy0, cx1, cy1] = owl.crop
    const CW = cx1 - cx0, CH = cy1 - cy0
    const s = owl.height / (owl.feet[1] - 62)
    const box = { x: owl.stand[0] - (owl.feet[0] - cx0) * s, y: owl.stand[1] - (owl.feet[1] - cy0) * s, w: CW * s, h: CH * s }
    const crop = canvas(CW, CH)
    crop.getContext('2d').drawImage(owlImg, -cx0, -cy0)
    const owlUrl = resize(crop, box.w * OWL_RES, box.h * OWL_RES).toDataURL('image/webp', 0.86)

    // The rig, over the same crop (scripts/owl/rig.js). Beside the lower head the wing's top edge is
    // near, so the head's pull stops at its own right edge.
    const rigUrl = window.buildOwlRig({
      origin: [cx0, cy0],
      size: [CW, CH],
      scale: RIG_SCALE,
      neck: owl.neck,
      wing: owl.wing,
      face: owl.face,
      holds: [{ x: [650, 720], y: [200, 290] }],
    })

    const inCrop = ([x, y]) => [x - cx0, y - cy0]

    return {
      room: R.toDataURL('image/webp', ROOM_Q),
      lit: (() => {
        const c = canvas(litImg.width, litImg.height)
        c.getContext('2d').drawImage(litImg, 0, 0)
        return c.toDataURL('image/webp', ROOM_Q)
      })(),
      atlas: A.toDataURL('image/webp', 0.92),
      atlasSize: [A.width, A.height],
      flames: flames.map((f) => ({ x: f.x, y: f.y, w: f.w, h: f.h, baseY: f.baseY, atlas: f.atlas })),
      owl: {
        url: owlUrl,
        rig: rigUrl,
        box,
        size: [CW, CH],
        head: inCrop(owl.headPivot),
        wing: inCrop(owl.wingPivot),
        face: inCrop(owl.face),
        feet: owl.feet[1] - cy0,
        eyes: owl.eyes.map(([x, y, rx, ry]) => [...inCrop([x, y]), rx, ry]),
      },
      size: [RW, RH],
    }
  },
  { roomData: png('room.png'), sheetData: png('candles.png'), owlData: png('owl.png'), litData: png('room-lit.png'), candles, owl, ROOM_Q, FLAME_RES, OWL_RES, RIG_SCALE },
)
await browser.close()

save('public/images/hero-room.webp', out.room)
save('public/images/room-lit.webp', out.lit)
save('public/images/hero-flames.webp', out.atlas)
save('public/images/owl.webp', out.owl.url)
save('public/images/owl-rig.png', out.owl.rig)

const r = (v, d = 2) => Number(v.toFixed(d))
const ts = `// Generated by scripts/hero/build.mjs; don't edit by hand. Positions are in hero-room.webp's pixels,
// except the owl's rig, which is in its own image's pixels at full size (\`size\`).
import type { OwlRig } from '@/components/LivingOwl'

export const heroRoom = { src: '/images/hero-room.webp', w: ${out.size[0]}, h: ${out.size[1]} }

export const heroFlames = {
  src: '/images/hero-flames.webp',
  w: ${out.atlasSize[0]},
  h: ${out.atlasSize[1]},
  // x, y, w, h on the room; the flame's base, as a share of its height; its box in the image
  flames: [
${out.flames.map((f) => `    { x: ${r(f.x)}, y: ${r(f.y)}, w: ${r(f.w)}, h: ${r(f.h)}, base: ${r(f.baseY, 3)}, atlas: [${f.atlas.x}, ${f.atlas.y}, ${f.atlas.w}, ${f.atlas.h}] },`).join('\n')}
  ],
}

// Where the owl stands in the room (x, y, w, h), and its rig
export const heroOwl: OwlRig & { x: number; y: number; w: number; h: number } = {
  src: '/images/owl.webp',
  rig: '/images/owl-rig.png',
  x: ${r(out.owl.box.x)},
  y: ${r(out.owl.box.y)},
  w: ${r(out.owl.box.w)},
  h: ${r(out.owl.box.h)},
  size: [${out.owl.size.join(', ')}],
  headPivot: [${out.owl.head.join(', ')}],
  wingPivot: [${out.owl.wing.join(', ')}],
  faceCentre: [${out.owl.face.slice(0, 2).join(', ')}],
  feetY: ${out.owl.feet},
  look: 30,
  wingTurn: 1,
  wingAmp: 1,
  // centre x, centre y, half width, half height of each eye
  eyes: [
${out.owl.eyes.map((e) => `    [${e.join(', ')}],`).join('\n')}
  ],
}
`
writeFileSync(join(root, 'lib/hero-scene.ts'), ts)
console.log(`hero-room.webp ${out.size.join('x')}, ${out.flames.length} flames, owl box ${Math.round(out.owl.box.w)}x${Math.round(out.owl.box.h)}`)
