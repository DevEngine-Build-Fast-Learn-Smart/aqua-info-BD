import { api } from '../lib/api';
import type { SiteData } from './types';
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
export async function persistSiteChanges(previous: SiteData, next: SiteData): Promise<SiteData> {
  if (!equal(previous.settings.footer, next.settings.footer))
    await api('/admin/footer/', { method: 'PATCH', body: { footer: next.settings.footer } });
  const homepage: Record<string, unknown> = {};
  if (previous.settings.featuredEntryId !== next.settings.featuredEntryId)
    homepage.featuredEntryId = next.settings.featuredEntryId || null;
  if (!equal(previous.sections, next.sections)) homepage.sections = next.sections;
  if (Object.keys(homepage).length)
    await api('/admin/homepage/', { method: 'PATCH', body: homepage });
  const settings: Record<string, unknown> = {};
  for (const key of [
    'siteTitle',
    'siteTitleBn',
    'logoUrl',
    'tagline',
    'taglineBn',
    'email',
    'description',
    'weatherEnabled',
    'weatherDefaultCity',
    'weatherDefaultCityBn',
    'weatherUseDefaultApi',
    'weatherApiProvider',
    'weatherApiKey',
    'weatherApiEndpoint',
  ] as const)
    if (previous.settings[key] !== next.settings[key]) settings[key] = next.settings[key];
  if (Object.keys(settings).length)
    await api('/admin/settings/', { method: 'PATCH', body: settings });
  return next;
}
