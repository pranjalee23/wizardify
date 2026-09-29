// Renders the floating candles' wax bodies to public/images/candle-{a,b,c}.webp.
// Usage: node scripts/candle/build.mjs   (needs Google Chrome installed)
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const variants = JSON.parse(readFileSync(join(here, 'variants.json'), 'utf8'))

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
await page.addScriptTag({ content: readFileSync(join(here, 'render.js'), 'utf8') })
for (const v of variants) {
  const url = await page.evaluate((opts) => window.renderCandle(opts), v)
  const buf = Buffer.from(url.split(',')[1], 'base64')
  writeFileSync(join(here, '../../public/images', v.name), buf)
  console.log(`${v.name}  ${(buf.length / 1024).toFixed(0)} KB`)
}
await browser.close()
