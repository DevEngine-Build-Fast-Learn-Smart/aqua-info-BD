import type { SiteData } from './types';
import { defaultFooter } from './footer';

/** Structural branding only. Published content always comes from Django. */
export const emptySiteData: SiteData = {
  version: 1,
  articles: [],
  videos: [],
  categories: [],
  resources: [],
  market: [],
  sections: [],
  settings: {
    logoUrl: '/assets/logo.png',
    tagline: 'Beyond the Water',
    taglineBn: 'জলের সীমানা ছাড়িয়ে',
    email: '',
    description: '',
    leadArticleId: '',
    footer: defaultFooter,
  },
  counts: { published: 0, drafts: 0, videos: 0, articles: 0 },
  features: { market: false, newsletter: false, contact: true },
};
