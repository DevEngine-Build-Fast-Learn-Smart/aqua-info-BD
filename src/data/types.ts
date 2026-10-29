export type Language = 'en' | 'bn';
export type Status = 'published' | 'draft';
export interface Category {
  articleCount?: number;
  id: string;
  name: string;
  nameBn: string;
  description: string;
}
export interface Article {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  excerpt: string;
  excerptBn: string;
  body: string;
  bodyBn: string;
  category: string;
  author: string;
  location: string;
  image: string;
  imageAlt: string;
  date: string;
  readTime: number;
  status: Status;
}
export interface Video {
  mediaUrl?: string;
  descriptionBn?: string;
  id: string;
  title: string;
  titleBn: string;
  description: string;
  image: string;
  duration: string;
  location: string;
  status: Status;
}
export interface Resource {
  body?: string;
  bodyBn?: string;
  fileUrl?: string;
  id: string;
  title: string;
  titleBn: string;
  description: string;
  type: 'calculator' | 'guide' | 'worksheet';
  status: Status;
}
export interface MarketRate {
  id: string;
  species: string;
  speciesBn: string;
  price: number;
  change: number;
}
export interface HomeSection {
  id: string;
  name: string;
  nameBn: string;
  enabled: boolean;
}
export interface SiteSettings {
  footer?: FooterSettings;
  logoUrl?: string;
  tagline: string;
  taglineBn: string;
  email: string;
  description: string;
  leadArticleId: string;
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
  folio: string;
  folioBn: string;
  edition: string;
  editionBn: string;
  headline: string;
  headlineBn: string;
  subheadline: string;
  subheadlineBn: string;
  description: string;
  descriptionBn: string;
  signupTitle: string;
  signupTitleBn: string;
  aboutText: string;
  aboutTextBn: string;
  email: string;
  bottomText: string;
  bottomTextBn: string;
  copyright: string;
  copyrightBn: string;
  showNewsletter: boolean;
  showSignature: boolean;
  showBackToTop: boolean;
  columns: FooterColumn[];
}
export interface SiteData {
  counts?: { published: number; drafts: number; videos: number; articles: number };
  features?: { market: boolean; newsletter: boolean; contact: boolean };
  version: 1;
  articles: Article[];
  categories: Category[];
  videos: Video[];
  resources: Resource[];
  market: MarketRate[];
  sections: HomeSection[];
  settings: SiteSettings;
}
