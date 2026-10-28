import { useEffect, useRef } from 'react';

/** Observe newly rendered cards as well as route changes; no scroll polling is needed. */
export function useScrollReveal<T extends HTMLElement>(route: string) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) return;
    const observed = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('motion-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -24px 0px' },
    );
    const scan = () =>
      root
        .querySelectorAll<HTMLElement>(
          '.article-card, .video-card, .resource-card, .section-heading, .economy-feature, .economy-aside, .dispatch-panel, .admin-panel, .admin-metric, .admin-page-header, .team-summary, .team-role-guide > article',
        )
        .forEach((element, index) => {
          if (observed.has(element)) return;
          observed.add(element);
          element.style.setProperty('--motion-delay', `${(index % 3) * 55}ms`);
          element.classList.add('motion-ready');
          observer.observe(element);
        });
    scan();
    const mutation = new MutationObserver(scan);
    mutation.observe(root, { childList: true, subtree: true });
    const reduce = () => {
      if (preference.matches) {
        root
          .querySelectorAll('.motion-ready')
          .forEach((element) => element.classList.add('motion-visible'));
        observer.disconnect();
      }
    };
    preference.addEventListener('change', reduce);
    return () => {
      observer.disconnect();
      mutation.disconnect();
      preference.removeEventListener('change', reduce);
    };
  }, [route]);
  return ref;
}
