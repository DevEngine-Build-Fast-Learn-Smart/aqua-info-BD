import type { FooterSettings } from './types';

/** Defaults also keep existing browser content compatible with the footer editor. */
export const defaultFooter: FooterSettings = {
  folio: 'THE JOURNAL OF OUR CHANGING WATERS',
  folioBn: 'আমাদের পরিবর্তনশীল জলজ জগতের জার্নাল',
  edition: 'BANGLADESH / BEYOND THE WATER',
  editionBn: 'বাংলাদেশ / জলের সীমানা ছাড়িয়ে',
  headline: 'A wider view.',
  headlineBn: 'আরও বিস্তৃত দৃষ্টিভঙ্গি।',
  subheadline: 'A deeper understanding.',
  subheadlineBn: 'আরও গভীর উপলব্ধি।',
  description:
    'Field perspectives, practical knowledge, and stories from the water. A thoughtful read for your Friday.',
  descriptionBn: 'মাঠের দৃষ্টিভঙ্গি, ব্যবহারিক জ্ঞান ও জলের গল্প। আপনার শুক্রবারের চিন্তাশীল পাঠ।',
  signupTitle: 'Good perspectives travel.',
  signupTitleBn: 'ভালো দৃষ্টিভঙ্গি ছড়িয়ে পড়ে।',
  aboutText: '',
  aboutTextBn: '',
  email: '',
  bottomText: 'Rooted in Bangladesh. Connected by water.',
  bottomTextBn: 'বাংলাদেশের শিকড়ে। জলের সংযোগে।',
  copyright: 'All rights reserved.',
  copyrightBn: 'সর্বস্বত্ব সংরক্ষিত।',
  showNewsletter: true,
  showSignature: true,
  showBackToTop: true,
  columns: [
    {
      id: 'field',
      title: 'IN THE FIELD',
      titleBn: 'মাঠ পর্যায়ে',
      links: [
        {
          id: 'f1',
          label: 'Aquaculture & Farming',
          labelBn: 'মৎস্য চাষ',
          href: '/aquaculture-farming',
        },
        {
          id: 'f2',
          label: 'Coastal Fisheries',
          labelBn: 'উপকূলীয় মৎস্য',
          href: '/coastal-fisheries',
        },
        {
          id: 'f3',
          label: 'Aquatic Science & Research',
          labelBn: 'জলজ বিজ্ঞান ও গবেষণা',
          href: '/aquatic-science-research',
        },
      ],
    },
    {
      id: 'knowledge',
      title: 'GO A LITTLE DEEPER',
      titleBn: 'আরও গভীরে জানুন',
      links: [
        {
          id: 'f4',
          label: 'Knowledge & worksheets',
          labelBn: 'জ্ঞান ও কার্যপত্র',
          href: '/knowledge-hub',
        },
        { id: 'f5', label: 'Visual field reports', labelBn: 'ভিডিও প্রতিবেদন', href: '/videos' },
        { id: 'f6', label: 'The blue economy', labelBn: 'সুনীল অর্থনীতি', href: '/blue-economy' },
        { id: 'f7', label: 'Market benchmark', labelBn: 'বাজারদর', href: '/market' },
      ],
    },
    {
      id: 'publication',
      title: 'THE PUBLICATION',
      titleBn: 'প্রকাশনা',
      links: [
        { id: 'f8', label: 'Our perspective', labelBn: 'আমাদের দৃষ্টিভঙ্গি', href: '/about' },
        {
          id: 'f9',
          label: 'The Friday Dispatch',
          labelBn: 'শুক্রবারের বার্তা',
          href: '/subscription',
        },
        { id: 'f10', label: 'Your reading list', labelBn: 'আপনার পাঠতালিকা', href: '/saved' },
        { id: 'f11', label: 'The editorial desk', labelBn: 'সম্পাদকীয় ডেস্ক', href: '/admin/' },
      ],
    },
  ],
};

export function validFooterHref(href: string) {
  const value = href.trim();
  if (/^\/(?!\/)/.test(value) || value.startsWith('#')) return !/[\s\\]/.test(value);
  try {
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
