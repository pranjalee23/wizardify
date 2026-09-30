// Converts the page backgrounds in designs/backgrounds (PNG) to WebP in public/images.
// Usage: node scripts/backgrounds/build.mjs   (needs Google Chrome installed)
import { chromium } from 'playwright'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const dir = join(root, 'designs/backgrounds')

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
for (const name of readdirSync(dir).filter((f) => f.endsWith('.png'))) {
  const data = `data:image/png;base64,${readFileSync(join(dir, name)).toString('base64')}`
  const url = await page.evaluate(async (data) => {
    const img = new Image()
    img.src = data
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    c.getContext('2d').drawImage(img, 0, 0)
    // High quality: these are shown larger than their own size on wide screens
    return c.toDataURL('image/webp', 0.9)
  }, data)
  const out = name.replace(/\.png$/, '.webp')
  const buf = Buffer.from(url.split(',')[1], 'base64')
  writeFileSync(join(root, 'public/images', out), buf)
  console.log(`${out}  ${(buf.length / 1024).toFixed(0)} KB`)
}
await browser.close()
