// Renders the cursor wand to public/images/wand.png.
// Usage: node scripts/wand/build.mjs   (needs Google Chrome installed)
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '../../public/images/wand.png')

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
await page.addScriptTag({ content: readFileSync(join(here, 'render.js'), 'utf8') })
const url = await page.evaluate(() => window.renderWand({}))
const buf = Buffer.from(url.split(',')[1], 'base64')
writeFileSync(out, buf)
console.log(`wand.png  ${(buf.length / 1024).toFixed(0)} KB`)
await browser.close()
