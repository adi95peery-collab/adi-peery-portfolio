// Client-side motion: scroll reveals, hero entrance, and the AP logo draw.
// Progressive enhancement — everything is fully visible without JS, and all
// motion is skipped under prefers-reduced-motion (which also keeps the visual
// harness deterministic).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initMotion(): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // Signal CSS to set reveal elements' initial (hidden) state — avoids FOUC.
  document.documentElement.classList.add('motion');
  gsap.registerPlugin(ScrollTrigger);

  // --- Scroll reveals ----------------------------------------------------
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // --- AP logo draw-on ---------------------------------------------------
  const logoPath = document.querySelector<SVGPathElement>('.logo__mark path');
  if (logoPath) {
    const len = logoPath.getTotalLength();
    gsap.set(logoPath, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(logoPath, { strokeDashoffset: 0, duration: 1.5, ease: 'power1.inOut', delay: 0.15 });
  }
}
