// Builds the image shown when a Wizardify link is shared (WhatsApp, Instagram, iMessage, X…):
// app/opengraph-image.jpg and app/twitter-image.jpg, 1200 × 630. The lit room behind, the logo and
// tagline on the left, the framed portrait on the right.
// Usage: node scripts/og/build.mjs   (needs Google Chrome installed)
import { chromium } from 'playwright'
import { copyFileSync, readFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
// Pictures go in as data, since a page made from a string can't load files from disk
const types = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' }
const img = (name) => `data:${types[extname(name)]};base64,${readFileSync(join(root, 'public/images', name)).toString('base64')}`

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Cormorant+Garamond:ital,wght@1,500&display=swap" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #0A0E18; font-family: 'Cormorant Garamond', Georgia, serif; }
  .room { position: absolute; inset: 0; background: url('${img('room-lit.webp')}') center 40% / cover; filter: brightness(0.42) saturate(0.95); }
  .shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(10,14,24,0.92) 0%, rgba(10,14,24,0.75) 45%, rgba(10,14,24,0.2) 75%, rgba(10,14,24,0.5) 100%); }
  .frame { position: absolute; right: 70px; top: 38px; height: 554px; filter: drop-shadow(0 24px 40px rgba(0,0,0,0.75));
           -webkit-mask-image: radial-gradient(ellipse 72% 76% at 50% 50%, #000 78%, transparent 100%); }
  .text { position: absolute; left: 80px; top: 0; bottom: 0; width: 640px; display: flex; flex-direction: column; justify-content: center; gap: 26px; }
  .logo { width: 330px; }
  .line { width: 120px; height: 1px; background: linear-gradient(90deg, #D9B26A, transparent); }
  .tagline { font-style: italic; font-size: 54px; line-height: 1.12; color: #F2DDB0; text-shadow: 0 2px 16px rgba(0,0,0,0.6); }
  .kicker { font-family: Cinzel, Georgia, serif; font-weight: 700; font-size: 18px; letter-spacing: 0.18em; color: #D9B26A; white-space: nowrap; }
</style></head><body>
  <div class="room"></div><div class="shade"></div>
  <img class="frame" src="${img('frame-front.webp')}">
  <div class="text">
    <img class="logo" src="${img('logo.webp')}">
    <div class="line"></div>
    <div class="tagline">Pictures were never meant to stay still.</div>
    <div class="kicker">MOVING PORTRAIT FRAMES · WIZARDIFY.ME</div>
  </div>
</body></html>`

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
const out = join(root, 'app/opengraph-image.jpg')
await page.screenshot({ path: out, type: 'jpeg', quality: 88 })
copyFileSync(out, join(root, 'app/twitter-image.jpg'))
await browser.close()
console.log('app/opengraph-image.jpg, app/twitter-image.jpg')
