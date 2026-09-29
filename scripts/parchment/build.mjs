// Regenerates the crumpled parchment textures in public/images.
// Usage: node scripts/parchment/build.mjs   (needs Google Chrome installed)
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '../../public/images')
const jobs = JSON.parse(readFileSync(join(here, 'textures.json'), 'utf8'))

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
await page.addScriptTag({ content: readFileSync(join(here, 'generate.js'), 'utf8') })
for (const job of jobs) {
  const url = await page.evaluate((o) => window.generateParchment(o), job)
  const buf = Buffer.from(url.split(',')[1], 'base64')
  writeFileSync(join(out, job.name), buf)
  console.log(`${job.name}  ${job.W}x${job.H}  ${(buf.length / 1024).toFixed(0)} KB`)
}
await browser.close()
