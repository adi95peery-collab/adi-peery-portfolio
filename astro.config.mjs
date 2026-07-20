// @ts-check
import { defineConfig } from 'astro/config';

// Static site — outputs plain HTML/CSS/JS to ./dist, deployable to any host
// (Netlify, Cloudflare Pages, GitHub Pages, etc.).
export default defineConfig({
  output: 'static',
  // GitHub Pages project site: served from /adi-peery-portfolio/, not the domain root.
  site: 'https://adi95peery-collab.github.io',
  base: '/adi-peery-portfolio',
  build: {
    // Emit a real .css file (not inlined) so the pixel-diff harness and browser
    // caching behave deterministically.
    inlineStylesheets: 'never',
    assets: '_assets',
  },
  devToolbar: { enabled: false },
  // Fidelity-first: we hand-author CSS; no framework-injected resets.
  scopedStyleStrategy: 'class',
});
