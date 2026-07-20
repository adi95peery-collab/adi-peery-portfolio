// Quick multi-viewport screenshotter for eyeballing responsive layouts.
// Usage: node scripts/shoot.mjs <path> <w1,w2,...>
// Requires the preview server running on :4321.
import { chromium } from 'playwright';
import fs from 'node:fs';

const route = process.argv[2] ?? '/';
const widths = (process.argv[3] ?? '1440,768,390').split(',').map(Number);
const outDir = '.design-refs/_scratch';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:4321${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(200);
  const safe = route.replace(/[^\w]+/g, '_') || 'home';
  const file = `${outDir}/${safe}__${w}.png`;
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
  console.log(`saved ${file}`);
  await page.close();
}
await browser.close();
