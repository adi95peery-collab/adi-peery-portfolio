import { defineConfig, devices } from '@playwright/test';

/**
 * Fidelity harness config.
 *
 * The baseline we diff against is the *Figma export* (committed under
 * tests/visual/goldens/), NOT a previously-captured Playwright screenshot — so
 * we use a custom pixelmatch comparison (see tests/visual/lib/compare.ts) rather
 * than toHaveScreenshot().
 *
 * Rendering is pinned (fixed viewport, deviceScaleFactor 1, animations off, fonts
 * waited on) so diffs reflect real design deltas, not environment noise.
 */
export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: './test-results',

  use: {
    baseURL: 'http://localhost:4321',
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    // Skip JS/CSS motion so captures reflect the final static layout (matches the
    // design). Real visitors without this preference get the animations.
    reducedMotion: 'reduce',
    // Kill caret blink / hover states / animation frames for stable captures.
    launchOptions: { args: ['--force-color-profile=srgb', '--disable-lcd-text'] },
  },

  projects: [
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    },
  ],

  // Build + serve the real static output so we diff production HTML/CSS, not dev.
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
  },
});
