import type { Language } from '../data/types';

export const localized = (language: Language, en: string, bn?: string) =>
  language === 'bn' && bn ? bn : en;
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
export const formatDate = (date: string, language: Language = 'en') =>
  new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Dhaka',
  }).format(new Date(`${date}T12:00:00+06:00`));
export const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
export const downloadText = (name: string, content: string, type = 'text/plain') => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const assetUrl = (url?: string): string => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!base) return url;
  if (url.startsWith(base)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};
