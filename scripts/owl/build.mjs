// Builds the mask for the owl's wing ruffle in the home hero (components/HeroOwl).
// Usage: node scripts/owl/build.mjs   (needs Google Chrome installed)
// Writes public/images/owl-wing-mask.png: white over the wing, fading to clear at its edge. It covers the
// wing's box in hero-bg.jpg. The outline was traced by hand a few pixels inside the wing's outer edge, so
// the ruffle only ever moves feathers, never the bookshelf behind. Also prints the feather colour around
// each eye, which the eyelids use.
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const data = `data:image/jpeg;base64,${readFileSync(join(root, 'public/images/hero-bg.jpg')).toString('base64')}`

// In hero-bg.jpg pixels; keep the box in step with components/HeroOwl.tsx
const box = { x: 1478, y: 372, w: 190, h: 256 }
const wing = [
  [1504, 402], [1528, 392], [1552, 397], [1568, 405], [1584, 422], [1595, 444], [1603, 468], [1610, 492],
  [1619, 518], [1628, 544], [1634, 566], [1638, 590], [1638, 608], [1630, 612], [1614, 596], [1598, 576],
  [1580, 558], [1560, 544], [1540, 528], [1524, 508], [1512, 482], [1503, 452], [1499, 422],
]
const eyes = [[1463, 346], [1504, 344]]

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
const out = await page.evaluate(async ({ data, box, wing, eyes }) => {
  const img = new Image()
  img.src = data
  await img.decode()

  const c = document.createElement('canvas')
  c.width = box.w
  c.height = box.h
  const g = c.getContext('2d')
  // A soft edge, so the moving feathers blend into the still ones around them
  g.filter = 'blur(3px)'
  g.fillStyle = '#fff'
  g.beginPath()
  wing.forEach(([x, y], i) => (i ? g.lineTo(x - box.x, y - box.y) : g.moveTo(x - box.x, y - box.y)))
  g.closePath()
  g.fill()

  // Feather colour in a ring just outside each eye
  const full = document.createElement('canvas')
  full.width = img.width
  full.height = img.height
  const fg = full.getContext('2d')
  fg.drawImage(img, 0, 0)
  const ring = eyes.map(([cx, cy]) => {
    let r = 0, gg = 0, bb = 0, n = 0
    const d = fg.getImageData(cx - 16, cy - 14, 32, 28).data
    for (let y = 0; y < 28; y++) for (let x = 0; x < 32; x++) {
      const e = ((x - 16) / 13) ** 2 + ((y - 14) / 10) ** 2
      if (e < 1.2 || e > 2.2) continue
      const i = (y * 32 + x) * 4
      r += d[i]; gg += d[i + 1]; bb += d[i + 2]; n++
    }
    return [Math.round(r / n), Math.round(gg / n), Math.round(bb / n)]
  })
  return { url: c.toDataURL('image/png'), ring }
}, { data, box, wing, eyes })

writeFileSync(join(root, 'public/images/owl-wing-mask.png'), Buffer.from(out.url.split(',')[1], 'base64'))
console.log('owl-wing-mask.png', `${box.w}x${box.h}`, 'feathers around the eyes:', JSON.stringify(out.ring))
await browser.close()
