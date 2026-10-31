import type { ContentSection } from './catalog';
export type Language = 'en' | 'bn';
export type Status = 'published' | 'draft';
export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  caption: string;
  captionBn: string;
}
export interface Category {
  id: string;
  section: ContentSection;
  slug: string;
  name: string;
  nameBn: string;
  description: string;
  position: number;
  entryCount?: number;
}
export interface Author {
  id: string;
  name: string;
  nameBn: string;
  role: string;
  roleBn: string;
  bio: string;
  bioBn: string;
  image: string;
  imageAlt: string;
  website: string;
  isTeam: boolean;
  isActive: boolean;
  position: number;
}
export interface Entry {
  gallery: GalleryImage[];
  updatedAt?: string;
  id: string;
  section: ContentSection;
  slug: string;
  title: string;
  titleBn: string;
  excerpt: string;
  excerptBn: string;
  body: string;
  bodyBn: string;
  category: string;
  author: string;
  authorProfile: string | null;
  authorDetails?: Author | null;
  location: string;
  image: string;
  imageAlt: string;
  date: string;
  readTime: number;
  status: Status;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  sourceUrl: string;
  audioUrl: string;
  embedUrl: string;
  duration: string;
  episodeNumber: number | null;
  fileUrl: string;
  doi: string;
  citation: string;
  organization: string;
  employmentType: string;
  salary: string;
  deadline: string | null;
  applicationUrl: string;
  eventStart: string | null;
  eventEnd: string | null;
  venue: string;
  eventFormat: 'online' | 'in-person' | 'hybrid';
  registrationUrl: string;
  recordingUrl: string;
}
export interface SitePage {
  gallery: GalleryImage[];
  id: 'about' | 'team' | 'editorial-policy';
  title: string;
  titleBn: string;
  body: string;
  bodyBn: string;
  seoTitle: string;
  seoDescription: string;
  status: Status;
}
export interface HomeSection {
  id: string;
  name: string;
  nameBn: string;
  enabled: boolean;
}
export interface FooterLink {
  id: string;
  label: string;
  labelBn: string;
  href: string;
}
export interface FooterColumn {
  id: string;
  title: string;
  titleBn: string;
  links: FooterLink[];
}
export interface FooterSettings {
  description: string;
  descriptionBn: string;
  email: string;
  location?: string;
  locationBn?: string;
  bottomText: string;
  bottomTextBn: string;
  copyright: string;
  copyrightBn: string;
  showBackToTop: boolean;
  columns: FooterColumn[];
}
export interface WeatherHourly {
  time: string;
  temperature: number;
  condition: string;
  conditionBn?: string;
  code?: number;
  icon?: string;
  isDay?: boolean;
}
export interface WeatherData {
  enabled: boolean;
  provider?: string;
  city?: string;
  cityBn?: string;
  temperature?: number;
  apparentTemperature?: number;
  tempMax?: number;
  tempMin?: number;
  condition?: string;
  conditionBn?: string;
  code?: number;
  icon?: string;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  pressure?: number;
  precipitation?: number;
  sunrise?: string;
  sunset?: string;
  isDay?: boolean;
  hourly?: WeatherHourly[];
  lat?: number;
  lon?: number;
}
export interface SiteSettings {
  siteTitle: string;
  siteTitleBn: string;
  logoUrl: string;
  tagline: string;
  taglineBn: string;
  email: string;
  description: string;
  featuredEntryId: string | null;
  footer: FooterSettings;
  weatherEnabled?: boolean;
  weatherDefaultCity?: string;
  weatherDefaultCityBn?: string;
  weatherUseDefaultApi?: boolean;
  weatherApiProvider?: string;
  weatherApiKey?: string;
  weatherApiEndpoint?: string;
}
export interface SiteData {
  overview?: {
    live: number;
    scheduled: number;
    drafts: number;
    upcomingEvents: number;
    openCareers: number;
    sections: {
      section: ContentSection;
      total: number;
      live: number;
      drafts: number;
      scheduled: number;
    }[];
    recentEntries: Entry[];
    pendingDrafts: Entry[];
  };
  version: 2;
  entries: Entry[];
  latest: Entry[];
  featured: Entry[];
  highlights: Partial<Record<ContentSection, Entry[]>>;
  categories: Category[];
  authors: Author[];
  pages: SitePage[];
  sections: HomeSection[];
  settings: SiteSettings;
  counts: {
    published: number;
    drafts: number;
    entries: number;
    bySection: Partial<Record<ContentSection, number>>;
  };
}
