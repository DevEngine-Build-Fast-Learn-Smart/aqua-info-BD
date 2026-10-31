import defaults from './footer-default.json';
import type { FooterSettings } from './types';
export const defaultFooter: FooterSettings = defaults;
export function validFooterHref(href: string) {
  if (!href || /[\s\\]/.test(href)) return false;
  if (href.startsWith('#') || (href.startsWith('/') && !href.startsWith('//'))) return true;
  try {
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(new URL(href).protocol);
  } catch {
    return false;
  }
}
