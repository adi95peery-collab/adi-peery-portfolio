# Project Handoff — Adi Peery Portfolio (Figma → static site)

This document is the single source of truth for continuing work on this project on
another machine. Read it top-to-bottom, then see `SETUP-WINDOWS.md` for install
steps. A fresh Claude Code session pointed at this repo + this file will be fully
up to speed.

---

## 1. What this project is

A pixel-faithful conversion of the **"Adi Peery — Portfolio"** Figma file into a
deployable **static website** (Astro + plain CSS), with an automated **pixel-diff
verification harness** that proves each page matches the design.

- **Local path (old Mac):** `~/adi-peery-portfolio`
- **Stack:** Astro 5 (static output), plain CSS with design tokens, GSAP (motion),
  self-hosted fonts. No Tailwind, no framework runtime.
- **Deploys as:** static files in `dist/` → any host (Netlify / Cloudflare Pages /
  GitHub Pages).

## 2. Figma source (for re-pulling design context)

- **File key:** `DyF8mmxLD9LMgEXvaME6qS`
- **Page:** "Site" (node `2:60`) — the only page in the file.
- **Frames / node IDs:**
  - Homepage `126:6795` (1440×1799) — Header `126:6796`, Hero `234:12418`, Selected Work `126:6804`, Footer `126:6957`
  - About Me `126:17087` (1440×1057) — About Hero `126:17089`
  - Smart Stock case study `198:19039` (1440×12,575) — page `126:6998`; sections: Hero `126:6999`, overview `126:7016`, Challenge `126:7036`, Research `126:7049`, Ideation `126:9071` (subs 126:9072/9086/9310/9320/9511/9892), Design System `126:9899`, Impact `126:10052`
  - Baby Boost case study `198:27241` (1440×14,992) — page `198:36651`; sections: Hero `198:36652`, overview `198:37805`, Research `198:38103`, Ideation `198:39496` (subs 198:39497/39534/40797/42371/42417), Impact `198:43562`
  - Components / style guide `126:18139` (content 1847×1471)
- **To re-pull:** connect the Figma MCP (see SETUP), then `get_design_context` /
  `get_screenshot` / `download_assets` with the file key + node id. The
  `figma:figma-design-to-code` skill MUST be loaded before `get_design_context`.

## 3. Current status — DONE & verified

All 5 pages + a 404 build and pass the harness (12/12 targets green):

| Page | Route | How it's built | Harness diff |
|---|---|---|---|
| Homepage | `/` | **real HTML/CSS** (Inter) | ~1.3% (hero text floor) |
| About | `/about` | **real HTML/CSS** (Inter) | ~1.2% |
| Smart Stock | `/work/smart-stock` | **hybrid**: real Geist text + image showcases | 0.32% (re-baselined) |
| Baby Boost | `/work/baby-boost` | **hybrid**: real Geist text + image showcases | 0.22% (re-baselined) |
| Components | `/components` | image board + real heading | 0.71% |

Residual % is sub-pixel anti-aliasing (Figma vs Chrome rasterizers) — visually 1:1.

### Case studies: what's real HTML vs image
- **Real HTML/CSS text** (Geist font, correct padding/margins, selectable):
  - Smart Stock: Hero title, Project Overview, The Challenge, Impact
    (`src/components/smart-stock/*.astro`)
  - Baby Boost: Project Overview + Understanding Parents' Needs, Impact
    (`src/components/baby-boost/*.astro`)
- **Pixel-exact image exports** (genuine screenshots/artwork, in `public/assets/<case>/`):
  app-screen mockups, dashboards, device frames, illustrations, the research
  mind-map, wireframes, the style-guide board, and the Baby Boost hero composite.

## 4. Fonts — IMPORTANT

- **Homepage / About** use **Inter** (the design's actual font there),
  self-hosted via `@fontsource-variable/inter`.
- **Case studies** were designed in **SF Pro Display** — Apple's system font,
  which **cannot be licensed/shipped as a webfont**. We substitute **Geist**
  (`@fontsource-variable/geist`), a free, near-identical grotesque, applied on
  **all platforms** for consistency, via the `--font-sf` token in
  `src/styles/tokens.css`. Swap that one token if a real SF Pro webfont is ever
  licensed.
- Critical fidelity fix: `font-optical-sizing: none` on `body` (Figma's Inter has
  no opsz axis). This alone took the homepage diff from 5.9% → 0.8%.

## 5. The verification harness (`tests/visual/`)

- Playwright renders each page/section in a pinned Chromium (1440 viewport, scale
  1, `reducedMotion: reduce`) and diffs vs a committed **golden** with `pixelmatch`.
- `tests/visual/targets.ts` — list of what's checked + per-target `maxRatio`.
- `tests/visual/goldens/` — the reference PNGs (Figma exports; case-study goldens
  were **re-baselined to the approved rebuilt render** so they guard future changes).
- `tests/visual/lib/compare.ts` — pure-pngjs compare (no `sharp` — it breaks under
  the Playwright runner). ±1px size tolerance. Tall full pages use a slow-scroll to
  force paint before capture.
- Run: `npm run test:visual`. Diffs/artifacts land in `test-results/fidelity/`.

## 6. Key decisions & learnings (why things are the way they are)

- **Images for dense case-study visuals**: app screens/dashboards/illustrations are
  real product screenshots — impractical to rebuild as HTML, so exported at 2× and
  placed via `<CaseStudySection>` at exact Figma heights (`aspect-ratio`).
- **Rebuilt case-study TEXT as real HTML** (user request — the image text felt
  "wrong font/padding"): the win was real CSS spacing + selectable text + the
  correct (Geist≈SF Pro) font.
- **`font-optical-sizing: none`**, self-hosted fonts, and pixelmatch threshold 0.2
  (ignores AA) are what make diffs deterministic.
- **Only a 1440px desktop design exists** → mobile/tablet layouts are hand-derived
  (fluid scale-down + reflow), not verifiable as 1:1.
- Figma **asset URLs expire ~7 days** — all committed assets are downloaded bytes.
- Figma **download_assets caps the long edge ~4096px** → very tall sections were
  split into sub-blocks before export.

## 7. Open follow-ups / next steps

1. **Video**: case studies have video regions currently shown as baked poster
   frames. Real `.mp4` can't be pulled from Figma via MCP — drop source files into
   `public/assets/<case>/` and overlay `<video>` at those regions.
2. **Baby Boost hero**: still a pixel-exact image composite; could rebuild its
   title as real text for parity with the Smart Stock hero.
3. **Image weight**: `public/assets` is ~22 MB (2× PNGs). Add WebP + `srcset` to
   cut it.
4. **Research / Ideation / Design-System sections** remain image showcases (genuine
   screenshots/diagrams) — rebuild further only if desired.
5. **Deploy**: set the real domain in `astro.config.mjs`, `public/robots.txt`,
   `public/sitemap.xml`, then deploy `dist/`.
6. Not yet git-committed — consider `git init` + a remote for ongoing history.

## 8. Continuing with Claude on the new PC

- The raw transcript of the conversation that built this is in
  `.handoff/session-transcript.jsonl` (large; reference only — it will not
  auto-resume across machines/paths).
- The durable **memory notes** are in `.handoff/memory/`. To have them auto-load in
  future Claude Code sessions on Windows, copy them into
  `C:\Users\<you>\.claude\projects\<encoded-project-path>\memory\` (see
  SETUP-WINDOWS.md), or just keep this `HANDOFF.md` in the repo — a new session that
  reads it has everything it needs.
- The `.handoff/tool-results/` folder has the large Figma metadata/design-context
  dumps captured during the build (handy if you want the raw structure without
  re-pulling from Figma).
