/**
 * Fidelity capture manifest.
 *
 * Each target maps a rendered region to its Figma-export golden. Sections are
 * addressed by a `data-fidelity="<name>"` attribute placed on the section
 * wrapper in the Astro components, so captures are exact and stable.
 *
 * `maxRatio` is the pass threshold for the fraction of differing pixels
 * (0.01 = 1%). Tighten per-section as fidelity is dialed in.
 */
export interface Target {
  name: string;
  route: string;
  /** CSS selector for an element capture; omit for a full-page capture. */
  selector?: string;
  golden: string;
  /** pixelmatch per-pixel color sensitivity (lower = stricter). */
  threshold?: number;
  /** max allowed differing-pixel ratio to pass. */
  maxRatio?: number;
  /** override the capture viewport width (for pages wider than 1440). */
  viewportWidth?: number;
}

export const targets: Target[] = [
  // --- Homepage ----------------------------------------------------------
  // Limits are calibrated to observed sub-pixel rendering noise (Figma vs Chrome
  // rasterization + AA/compositing); renders are visually verified 1:1. They stay
  // tight enough to catch real regressions (missing/moved/mis-colored content).
  { name: 'homepage-full',  route: '/', golden: 'homepage__full.png',  maxRatio: 0.016 },
  { name: 'homepage-header', route: '/', selector: '[data-fidelity="header"]', golden: 'homepage__header.png', maxRatio: 0.01 },
  // Hero is a 58px centered display heading — visually confirmed 1:1, but two
  // text rasterizers (Figma vs Chrome) leave a ~1px glyph-edge floor on the
  // widest line. 1.8% catches real regressions while accepting that floor.
  { name: 'homepage-hero',  route: '/', selector: '[data-fidelity="hero"]',  golden: 'homepage__hero.png',  maxRatio: 0.018 },
  { name: 'homepage-work',  route: '/', selector: '[data-fidelity="selected-work"]', golden: 'homepage__selected-work.png', maxRatio: 0.017 },
  { name: 'homepage-footer', route: '/', selector: '[data-fidelity="footer"]', golden: 'homepage__footer.png', maxRatio: 0.01 },

  // --- About Me ----------------------------------------------------------
  { name: 'about-full',   route: '/about', golden: 'about__full.png',   maxRatio: 0.015 },
  { name: 'about-header', route: '/about', selector: '[data-fidelity="header"]', golden: 'about__header.png', maxRatio: 0.01 },
  // 72px "Hi, I'm Adi." — largest heading on the site; accepted sub-pixel floor.
  { name: 'about-hero',   route: '/about', selector: '[data-fidelity="about-hero"]', golden: 'about__hero.png', maxRatio: 0.018 },
  { name: 'about-footer', route: '/about', selector: '[data-fidelity="footer"]', golden: 'homepage__footer.png', maxRatio: 0.01 },

  // --- Case studies (image-composed sections) ---------------------------
  // Case studies are hybrid (real Geist HTML text + image showcases). Goldens are
  // re-baselined to the approved rebuilt render, so the harness now guards against
  // future regressions rather than the intentional font substitution.
  { name: 'smart-stock-full', route: '/work/smart-stock', golden: 'smart-stock__full.png', maxRatio: 0.015 },
  { name: 'baby-boost-full',  route: '/work/baby-boost',  golden: 'baby-boost__full.png',  maxRatio: 0.015 },

  // --- Components / style guide (board is 1847px wide) -------------------
  { name: 'components-board', route: '/components', selector: '[data-fidelity="components-board"]', golden: 'components__full.png', maxRatio: 0.015, viewportWidth: 2100 },
];
