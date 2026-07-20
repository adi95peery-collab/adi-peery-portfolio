// GitHub Pages serves this site from a sub-path (base: '/adi-peery-portfolio'
// in astro.config.mjs), so hardcoded absolute paths like href="/about" or
// src="/assets/x.png" would 404. Route them through this helper instead.
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string) {
  return `${base}${path}`;
}
