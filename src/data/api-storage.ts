import { api } from '../lib/api';
import type { SiteData } from './types';

const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const changed = (before: Record<string, unknown>, after: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(after).filter(([key, value]) => key !== 'id' && !equal(before[key], value)),
  );

/** Persist only edited fields through permission-checked resource endpoints. */
export async function persistSiteChanges(previous: SiteData, next: SiteData): Promise<SiteData> {
  const result = structuredClone(next);
  if (!equal(previous.market, next.market))
    throw new Error('Market data is under development, coming soon.');
  for (const collection of ['articles', 'categories', 'videos', 'resources'] as const) {
    const oldItems = previous[collection];
    const newItems = next[collection];
    for (const old of oldItems) {
      if (!newItems.some((item) => item.id === old.id))
        await api(`/admin/${collection}/${encodeURIComponent(old.id)}/`, { method: 'DELETE' });
    }
    for (const item of newItems) {
      const old = oldItems.find((value) => value.id === item.id);
      if (old && equal(old, item)) continue;
      const body = old
        ? changed(
            old as unknown as Record<string, unknown>,
            item as unknown as Record<string, unknown>,
          )
        : ({ ...item } as Record<string, unknown>);
      if (!old && collection !== 'categories') delete body.id;
      delete body.articleCount;
      const saved = await api<typeof item>(
        old ? `/admin/${collection}/${encodeURIComponent(item.id)}/` : `/admin/${collection}/`,
        { method: old ? 'PATCH' : 'POST', body },
      );
      const list = result[collection] as { id: string }[];
      const index = list.findIndex((value) => value.id === item.id);
      list[index] = saved;
    }
  }
  const settings = changed(
    previous.settings as unknown as Record<string, unknown>,
    next.settings as unknown as Record<string, unknown>,
  );
  if ('footer' in settings)
    await api('/admin/footer/', { method: 'PATCH', body: { footer: settings.footer } });
  const homepage: Record<string, unknown> = {};
  if ('leadArticleId' in settings) homepage.leadArticleId = settings.leadArticleId;
  if (!equal(previous.sections, next.sections)) homepage.sections = next.sections;
  if (Object.keys(homepage).length)
    await api('/admin/homepage/', { method: 'PATCH', body: homepage });
  delete settings.footer;
  delete settings.leadArticleId;
  if (Object.keys(settings).length)
    await api('/admin/settings/', { method: 'PATCH', body: settings });
  return result;
}
