// Finds candle flames in images under public/images, as a starting point for lib/flames.ts.
// Usage: node scripts/flames/detect.mjs <out-dir> sky-chamber.jpg sky-study.jpg ...   (needs Google Chrome)
// Prints each candidate as index:x,y,w,h (the box around its white-hot core) and writes a copy of each
// image with the candidates boxed and numbered to <out-dir>. Brass and glass glints also get through,
// so check the boxes by eye and keep only real flames.
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const images = join(dirname(fileURLToPath(import.meta.url)), '../../public/images')
const [outDir, ...names] = process.argv.slice(2)

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
for (const name of names) {
  const data = `data:image/${name.endsWith('png') ? 'png' : 'jpeg'};base64,${readFileSync(join(images, name)).toString('base64')}`
  const { boxes, png } = await page.evaluate(async (data) => {
    const img = new Image()
    img.src = data
    await img.decode()
    const W = img.naturalWidth, H = img.naturalHeight
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const g = c.getContext('2d')
    g.drawImage(img, 0, 0)
    const px = g.getImageData(0, 0, W, H).data
    // Flame cores are near-white and warm, brighter than almost anything else in these scenes.
    const core = new Uint8Array(W * H)
    for (let i = 0; i < W * H; i++) {
      const R = px[i * 4], G = px[i * 4 + 1], B = px[i * 4 + 2]
      if (px[i * 4 + 3] > 200 && R >= 247 && G >= 222 && 0.3 * R + 0.59 * G + 0.11 * B >= 236 && R - B > 25) core[i] = 1
    }
    // Grow each core pixel so the fragments of one flame join up, then label the joined regions.
    const D = 4
    const grown = new Uint8Array(W * H)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!core[y * W + x]) continue
      for (let yy = Math.max(0, y - D); yy <= Math.min(H - 1, y + D); yy++)
        for (let xx = Math.max(0, x - D); xx <= Math.min(W - 1, x + D); xx++) grown[yy * W + xx] = 1
    }
    const seen = new Uint8Array(W * H)
    const boxes = []
    for (let i = 0; i < W * H; i++) {
      if (!grown[i] || seen[i]) continue
      let minx = W, maxx = 0, miny = H, maxy = 0, n = 0, hot = 0
      const stack = [i]
      seen[i] = 1
      while (stack.length) {
        const j = stack.pop(), x = j % W, y = (j / W) | 0
        if (core[j]) {
          n++
          minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y)
          if (px[j * 4] >= 252 && px[j * 4 + 1] >= 244 && px[j * 4 + 2] >= 196) hot++
        }
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const xx = x + dx, yy = y + dy
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue
          const k = yy * W + xx
          if (grown[k] && !seen[k]) { seen[k] = 1; stack.push(k) }
        }
      }
      // A flame has a white-hot centre; most brass glints are too yellow to have one.
      if (n >= 4 && hot >= 3 && maxy - miny >= 4) boxes.push([minx, miny, maxx - minx + 1, maxy - miny + 1])
    }
    g.lineWidth = 1.5
    g.font = 'bold 12px sans-serif'
    boxes.forEach(([x, y, w, h], i) => {
      g.strokeStyle = '#00ff66'
      g.strokeRect(x - 2, y - 2, w + 4, h + 4)
      g.fillStyle = '#00ffcc'
      g.fillText(String(i), x + w + 3, y + 8)
    })
    return { boxes, png: c.toDataURL('image/png') }
  }, data)
  writeFileSync(join(outDir, name.replace(/\.\w+$/, '.boxes.png')), Buffer.from(png.split(',')[1], 'base64'))
  console.log(name, boxes.map((b, i) => `${i}:${b.join(',')}`).join(' '))
}
await browser.close()
