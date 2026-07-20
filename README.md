# Adi Peery — Portfolio (Figma → static site)

A pixel-faithful conversion of the "Adi Peery — Portfolio" Figma file into a
deployable **static site** (Astro + plain CSS), verified against the design with
an automated pixel-diff harness.

## Pages

| Route | Source (Figma) | Verified diff vs design |
|---|---|---|
| `/` | Homepage | ~1.3% (hero 58px text floor) |
| `/about` | About Me | ~1.2% |
| `/work/smart-stock` | Smart Stock case study (12,575px) | ~0.4% |
| `/work/baby-boost` | Baby Boost case study (14,992px) | ~0.9% |
| `/components` | Components / style guide | ~0.7% |

Residual diff is sub-pixel anti-aliasing / rasterization difference between
Figma and Chrome — renders are visually 1:1. See "Fidelity" below.

## Commands

```bash
npm install
npx playwright install chromium   # one-time, for the visual harness

npm run dev            # local dev server (http://localhost:4321)
npm run build          # → ./dist  (static, deploy anywhere)
npm run preview        # serve the built ./dist
npm run test:visual    # build + pixel-diff every section against Figma goldens
```

## How it's built (fidelity approach)

- **Text-forward sections** (home, about, footers, headers) are hand-authored
  HTML/CSS using design tokens pulled 1:1 from Figma variables
  (`src/styles/tokens.css`). Fonts are **self-hosted** (Inter, Lexend) for
  deterministic rendering; `font-optical-sizing: none` matches Figma's Inter.
- **Vectors** (AP logo, arrows) are exported as SVG, optimized with SVGO, and
  inlined.
- **Case study text** (headings, body, chips, captions, hero titles) is **real
  HTML/CSS**: crisp, selectable, real padding/margins. The design uses **SF Pro
  Display** (Apple-only, not web-licensable), so the site self-hosts **Geist** — a
  free, near-identical grotesque — via `--font-sf`, rendering consistently on every
  platform. Genuine visuals (photos, app-screen mockups, dashboards, illustrations,
  the components board) stay **2× image exports** placed via HTML.
- **Animations** (`src/scripts/motion.ts`, GSAP): scroll-reveal, hero entrance,
  and the AP logo draw-on. All gated on `prefers-reduced-motion`.
- **Responsive**: only a 1440px desktop design exists, so mobile/tablet layouts
  are hand-derived (fluid scale-down + reflow). Desktop is the 1:1 reference.

## The verification harness (`tests/visual/`)

Playwright renders each page/section in a pinned Chromium (1440 viewport, scale
1, reduced-motion) and diffs it against a committed Figma-export "golden" with
`pixelmatch`, emitting `expected` / `actual` / `diff` images. `targets.ts` lists
what's checked and the per-section pass threshold. Goldens live in
`tests/visual/goldens/`. This is what makes fidelity provable and repeatable.

## Deploy

The build output in `./dist` is fully static. Any of:

- **Netlify**: drag-and-drop `dist/`, or connect the repo (build `npm run build`,
  publish `dist`).
- **Cloudflare Pages**: framework preset "Astro", build `npm run build`, output `dist`.
- **GitHub Pages**: push `dist/` to a `gh-pages` branch (or use an action).

Before deploying, set the real domain in `astro.config.mjs` (`site`),
`public/robots.txt`, and `public/sitemap.xml`.

## Known follow-ups

- **Fonts**: case studies use **Geist** as a stand-in for Apple's SF Pro Display
  (which can't be shipped as a webfont). Swap `--font-sf` if a licensed SF Pro
  webfont is ever obtained.
- **Video**: the case studies contain video regions. They are currently shown as
  the exact poster frames baked into the section exports. To play real video,
  drop the source `.mp4` files into `public/assets/<case>/` and overlay `<video>`
  elements at the video regions (the mp4 bytes can't be extracted from Figma via
  the MCP tools — they need to be supplied directly).
- **SF Pro Rounded** appears in one label in the design; it's Apple-licensed, so
  the site falls back to a rounded web stack. Swap in a licensed rounded webfont
  if exact matching is required.
- Figma **asset URLs expire in ~7 days** — all committed assets are the
  downloaded bytes, not remote URLs, so this doesn't affect the built site.
