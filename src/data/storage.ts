import { seedData } from './seed';
import type { SiteData } from './types';

export const STORAGE_KEY = 'aqua-info-bd:site:v1';
export function readSiteData(): SiteData {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (isSiteData(saved)) return saved;
  } catch {
    /* Recover from unavailable or outdated browser storage. */
  }
  return structuredClone(seedData);
}
export function isSiteData(value: unknown): value is SiteData {
  if (!value || typeof value !== 'object') return false;
  const data = value as SiteData;
  return (
    data.version === 1 &&
    ['articles', 'categories', 'videos', 'resources', 'market', 'sections'].every((key) =>
      Array.isArray(data[key as keyof SiteData]),
    ) &&
    !!data.settings &&
    typeof data.settings.tagline === 'string'
  );
}
export function writeSiteData(data: SiteData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
