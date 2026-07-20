import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export interface CompareResult {
  golden: string;
  diffPixels: number;
  totalPixels: number;
  ratio: number;          // 0..1 fraction of pixels that differ
  actualPath: string;
  diffPath: string;
  goldenDims: { w: number; h: number };
  actualDims: { w: number; h: number };
  resized: boolean;       // true when render size ≠ golden size (a layout defect)
}

/**
 * Blit `src` onto a fresh golden-sized canvas at (0,0), clipping overflow and
 * leaving uncovered pixels transparent. Pure pngjs — no native deps (sharp trips
 * a Node ESM/CJS module bug under the Playwright runner).
 */
function fitToSize(src: PNG, w: number, h: number): PNG {
  const out = new PNG({ width: w, height: h });
  out.data.fill(0);
  const copyW = Math.min(src.width, w);
  const copyH = Math.min(src.height, h);
  for (let y = 0; y < copyH; y++) {
    for (let x = 0; x < copyW; x++) {
      const si = (src.width * y + x) << 2;
      const di = (w * y + x) << 2;
      out.data[di] = src.data[si];
      out.data[di + 1] = src.data[si + 1];
      out.data[di + 2] = src.data[si + 2];
      out.data[di + 3] = src.data[si + 3];
    }
  }
  return out;
}

/**
 * Compare a captured screenshot buffer against a committed Figma-export golden.
 * Writes `<name>.actual.png` and `<name>.diff.png` into outDir.
 */
export async function compareToGolden(
  name: string,
  actualBuffer: Buffer,
  goldenPath: string,
  outDir: string,
  opts: { threshold?: number } = {},
): Promise<CompareResult> {
  const threshold = opts.threshold ?? 0.1;

  if (!fs.existsSync(goldenPath)) {
    throw new Error(
      `Golden not found: ${goldenPath}\nCapture it from Figma first (get_screenshot → save here).`,
    );
  }

  const golden = PNG.sync.read(fs.readFileSync(goldenPath));
  const rawActual = PNG.sync.read(actualBuffer);

  // Figma's PNG export rounds fractional frame sizes (e.g. 1799.18 → 1800), and
  // element captures can be ±1px from sub-pixel layout. Treat ≤1px as fine; only
  // flag larger deltas as a real layout-size defect.
  const dw = Math.abs(rawActual.width - golden.width);
  const dh = Math.abs(rawActual.height - golden.height);
  const sizeDiffers = rawActual.width !== golden.width || rawActual.height !== golden.height;
  const resized = dw > 1 || dh > 1;
  const actual = sizeDiffers ? fitToSize(rawActual, golden.width, golden.height) : rawActual;

  const { width, height } = golden;
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(golden.data, actual.data, diff.data, width, height, {
    threshold,
    includeAA: false,
    alpha: 0.5,
    diffColor: [255, 0, 128],
    aaColor: [255, 255, 0],
  });

  fs.mkdirSync(outDir, { recursive: true });
  const actualPath = path.join(outDir, `${name}.actual.png`);
  const diffPath = path.join(outDir, `${name}.diff.png`);
  fs.writeFileSync(actualPath, PNG.sync.write(actual));
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  return {
    golden: goldenPath,
    diffPixels,
    totalPixels: width * height,
    ratio: diffPixels / (width * height),
    actualPath,
    diffPath,
    goldenDims: { w: golden.width, h: golden.height },
    actualDims: { w: rawActual.width, h: rawActual.height },
    resized,
  };
}
