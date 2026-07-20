import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';
import { targets } from './targets';
import { compareToGolden, type CompareResult } from './lib/compare';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GOLDEN_DIR = path.join(__dirname, 'goldens');
const OUT_DIR = path.join(__dirname, '..', '..', 'test-results', 'fidelity');

const summary: Array<CompareResult & { name: string; pass: boolean; maxRatio: number }> = [];

test.describe('Design fidelity vs Figma', () => {
  for (const t of targets) {
    const goldenPath = path.join(GOLDEN_DIR, t.golden);
    const maxRatio = t.maxRatio ?? 0.01;

    test(`${t.name} (≤ ${(maxRatio * 100).toFixed(1)}% diff)`, async ({ page }, testInfo) => {
      // A golden is required. Skip (not fail) if it hasn't been captured yet, so
      // partial suites run cleanly while a page is still being built.
      test.skip(!fs.existsSync(goldenPath), `No golden yet: ${t.golden}`);

      if (t.viewportWidth) await page.setViewportSize({ width: t.viewportWidth, height: 900 });
      await page.goto(t.route, { waitUntil: 'networkidle' });
      await page.evaluate(() => (document as any).fonts?.ready);

      if (t.selector) {
        // Element capture: just make sure images are decoded; no page scrolling
        // (a leftover fractional scroll offset shifts the element's raster).
        await page.evaluate(async () => {
          await Promise.all(
            Array.from(document.images).map((img) =>
              img.complete && img.naturalWidth > 0
                ? Promise.resolve()
                : new Promise((res) => { img.onload = img.onerror = res; }),
            ),
          );
        });
        await page.waitForTimeout(150);
      } else {
        // Very tall full pages: Chromium's full-page screenshot can skip painting
        // off-screen regions. Slow-scroll to force paint + lazy load, await every
        // image, then return to top before capturing.
        await page.evaluate(async () => {
          const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
          const vh = window.innerHeight;
          for (let y = 0; y < document.body.scrollHeight; y += Math.round(vh * 0.8)) {
            window.scrollTo(0, y);
            await sleep(50);
          }
          window.scrollTo(0, document.body.scrollHeight);
          await sleep(80);
          await Promise.all(
            Array.from(document.images).map((img) =>
              img.complete && img.naturalWidth > 0
                ? Promise.resolve()
                : new Promise((res) => { img.onload = img.onerror = res; }),
            ),
          );
          window.scrollTo(0, 0);
          await sleep(120);
        });
      }

      const capture = t.selector ? page.locator(t.selector) : page;
      const buffer = t.selector
        ? await capture.screenshot({ animations: 'disabled' })
        : await page.screenshot({ fullPage: true, animations: 'disabled' });

      const result = await compareToGolden(t.name, buffer, goldenPath, OUT_DIR, {
        // 0.2 per-pixel color distance: ignores sub-pixel anti-aliasing between
        // Figma's and Chrome's text rasterizers (visually identical) while still
        // catching real color/layout/spacing defects. The diff-ratio limit below
        // is what actually gates fidelity.
        threshold: t.threshold ?? 0.2,
      });

      const pass = result.ratio <= maxRatio && !result.resized;
      summary.push({ ...result, name: t.name, pass, maxRatio });

      // Attach all three images to the HTML report for eyeballing.
      await testInfo.attach(`${t.name}-golden`, { path: goldenPath, contentType: 'image/png' });
      await testInfo.attach(`${t.name}-actual`, { path: result.actualPath, contentType: 'image/png' });
      await testInfo.attach(`${t.name}-diff`, { path: result.diffPath, contentType: 'image/png' });

      const pct = (result.ratio * 100).toFixed(3);
      console.log(
        `[fidelity] ${t.name}: ${pct}% diff (${result.diffPixels}/${result.totalPixels})` +
          (result.resized
            ? `  ⚠ SIZE MISMATCH golden ${result.goldenDims.w}×${result.goldenDims.h} vs actual ${result.actualDims.w}×${result.actualDims.h}`
            : ''),
      );

      expect(
        result.resized,
        `Rendered size ${result.actualDims.w}×${result.actualDims.h} ≠ golden ${result.goldenDims.w}×${result.goldenDims.h}`,
      ).toBe(false);
      expect(result.ratio, `${pct}% differing pixels (limit ${(maxRatio * 100).toFixed(1)}%)`).toBeLessThanOrEqual(maxRatio);
    });
  }

  test.afterAll(() => {
    if (!summary.length) return;
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
    const rows = summary
      .map((s) => `  ${s.pass ? '✅' : '❌'} ${s.name.padEnd(24)} ${(s.ratio * 100).toFixed(3)}% (limit ${(s.maxRatio * 100).toFixed(1)}%)`)
      .join('\n');
    console.log(`\n──── Fidelity summary ────\n${rows}\n──────────────────────────`);
  });
});
