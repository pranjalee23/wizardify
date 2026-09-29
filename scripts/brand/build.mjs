// Builds the site's logo and icons from the brand artwork in designs/brand.
// Usage: node scripts/brand/build.mjs   (needs Google Chrome installed)
//   public/images/logo.webp the wordmark in gilded gold, trimmed, for the dark header and footer
//   app/favicon.ico         the hat at 16, 32 and 48 px
//   app/icon.png            the hat at 192 px
//   app/apple-icon.png      the hat at 180 px for iOS home screens
// The icons lift the hat out of its circle and set it as large as it fits on a dark tile of the
// circle's colour, so it reads as big as possible in a browser tab, on light and dark tab bars alike.
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const src = (name) => `data:image/png;base64,${readFileSync(join(root, 'designs/brand', name)).toString('base64')}`
const png = (url) => Buffer.from(url.split(',')[1], 'base64')

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()

// Wordmark: keep the artwork's shape (its alpha), trim the empty margin, and fill it with gold that
// runs from pale at the top to deeper at the bottom.
const logo = await page.evaluate(async ({ data, width, stops }) => {
  const img = new Image()
  img.src = data
  await img.decode()
  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  const g = c.getContext('2d')
  g.drawImage(img, 0, 0)
  const d = g.getImageData(0, 0, c.width, c.height).data
  let x0 = c.width, x1 = 0, y0 = c.height, y1 = 0
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    if (d[(y * c.width + x) * 4 + 3] < 16) continue
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y)
  }
  const pad = 4
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(c.width - 1, x1 + pad); y1 = Math.min(c.height - 1, y1 + pad)
  const w = width, h = Math.round(((y1 - y0 + 1) * width) / (x1 - x0 + 1))
  const o = document.createElement('canvas')
  o.width = w
  o.height = h
  const og = o.getContext('2d')
  og.imageSmoothingQuality = 'high'
  og.drawImage(c, x0, y0, x1 - x0 + 1, y1 - y0 + 1, 0, 0, w, h)
  // Paint gold only where the artwork is, keeping its edges' softness
  og.globalCompositeOperation = 'source-in'
  const grad = og.createLinearGradient(0, 0, 0, h)
  for (const [at, colour] of stops) grad.addColorStop(at, colour)
  og.fillStyle = grad
  og.fillRect(0, 0, w, h)
  return { url: o.toDataURL('image/webp', 0.95), w, h }
}, { data: src('wordmark.png'), width: 720, stops: [[0, '#FBEFD2'], [0.45, '#EFD59C'], [1, '#CFA65C']] })
writeFileSync(join(root, 'public/images/logo.webp'), png(logo.url))
console.log(`logo.webp  ${logo.w}x${logo.h}`)

const TILE = '#130C08' // the artwork's circle colour

// `margin` is the space around the hat as a share of the icon; `radius` rounds the tile's corners.
// Everything is drawn large, then halved step by step to the final size, which keeps small icons crisp.
const icon = async (size, { margin, radius }) =>
  png(
    await page.evaluate(async ({ data, size, margin, radius, tile }) => {
      const img = new Image()
      img.src = data
      await img.decode()
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      const g = c.getContext('2d')
      g.drawImage(img, 0, 0)
      const im = g.getImageData(0, 0, c.width, c.height)
      const d = im.data
      // The hat is the light part of the artwork: keep it as white, with its strength as alpha, and
      // measure its bounds. Its dark fold lines stay see-through, so the tile shows in them.
      let x0 = c.width, x1 = 0, y0 = c.height, y1 = 0
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4
        const lum = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]
        const a = Math.min(1, Math.max(0, (lum - 70) / 150)) * (d[i + 3] / 255)
        d[i] = d[i + 1] = d[i + 2] = 255
        d[i + 3] = Math.round(a * 255)
        if (a > 0.2) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) }
      }
      g.putImageData(im, 0, 0)

      const big = 1024
      const hw = x1 - x0 + 1, hh = y1 - y0 + 1
      const fit = (big * (1 - 2 * margin)) / Math.max(hw, hh)
      let cur = document.createElement('canvas')
      cur.width = cur.height = big
      const bg = cur.getContext('2d')
      bg.fillStyle = tile
      bg.beginPath()
      bg.roundRect(0, 0, big, big, big * radius)
      bg.fill()
      bg.imageSmoothingQuality = 'high'
      bg.drawImage(c, x0, y0, hw, hh, (big - hw * fit) / 2, (big - hh * fit) / 2, hw * fit, hh * fit)

      let w = big
      while (w / 2 > size) {
        w = Math.round(w / 2)
        const step = document.createElement('canvas')
        step.width = step.height = w
        const sg = step.getContext('2d')
        sg.imageSmoothingQuality = 'high'
        sg.drawImage(cur, 0, 0, w, w)
        cur = step
      }
      const out = document.createElement('canvas')
      out.width = out.height = size
      const og = out.getContext('2d')
      og.imageSmoothingQuality = 'high'
      og.drawImage(cur, 0, 0, size, size)
      return out.toDataURL('image/png')
    }, { data: src('hat-icon.png'), size, margin, radius, tile: TILE }),
  )

// An .ico file can hold PNG images directly: a 6-byte header, a 16-byte entry per image, then the images.
const ico = (images) => {
  const head = Buffer.alloc(6 + 16 * images.length)
  head.writeUInt16LE(0, 0)
  head.writeUInt16LE(1, 2)
  head.writeUInt16LE(images.length, 4)
  let offset = head.length
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i
    head.writeUInt8(size >= 256 ? 0 : size, e)
    head.writeUInt8(size >= 256 ? 0 : size, e + 1)
    head.writeUInt16LE(1, e + 4)
    head.writeUInt16LE(32, e + 6)
    head.writeUInt32LE(data.length, e + 8)
    head.writeUInt32LE(offset, e + 12)
    offset += data.length
  })
  return Buffer.concat([head, ...images.map((im) => im.data)])
}

// The brim runs almost edge to edge, and the corners are softly rounded
const tab = { margin: 0.04, radius: 0.16 }
const sizes = [16, 32, 48]
writeFileSync(join(root, 'app/favicon.ico'), ico(await Promise.all(sizes.map(async (size) => ({ size, data: await icon(size, tab) })))))
writeFileSync(join(root, 'app/icon.png'), await icon(192, tab))
// iOS rounds the corners itself and wants a full square, so leave more room for its curve
writeFileSync(join(root, 'app/apple-icon.png'), await icon(180, { margin: 0.12, radius: 0 }))
console.log('favicon.ico, icon.png, apple-icon.png')

await browser.close()
