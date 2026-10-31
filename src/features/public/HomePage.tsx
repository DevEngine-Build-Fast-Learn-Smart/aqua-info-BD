import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../app/SiteProvider';
import { contentSections, sectionById } from '../../data/catalog';
import { EntryCard } from './EntryCard';
import { SectionHeading } from './SectionHeading';
import { usePageMeta } from '../../lib/usePageMeta';
import { EmptyState } from '../../components/ui/EmptyState';
import { Reveal } from '../../components/ui/Reveal';
export default function HomePage() {
  const { data, t, siteName } = useSite();
  usePageMeta(t('Home', 'হোম'), data.settings.description);
  return (
    <div className="client-homepage">
      <section className="container client-intro">
        <div>
          <span className="eyebrow">
            {siteName} / {t('BEYOND THE WATER', 'জলের সীমানা ছাড়িয়ে')}
          </span>
          <h1>
            {t('A shared perspective on', 'জলজ জগতের')}
            <br />
            <em>{t('our aquatic world.', 'এক নতুন দৃষ্টিভঙ্গি।')}</em>
          </h1>
        </div>
        <div>
          <p>
            {t(
              'News, practical knowledge and conversations connecting aquaculture, fisheries and the people shaping their future.',
              'মৎস্য ও অ্যাকুয়াকালচারের সংবাদ, ব্যবহারিক জ্ঞান ও মানুষের ভাবনার সংযোগ।',
            )}
          </p>
          <a href="#latest" className="text-link">
            {t('Explore the latest updates', 'সর্বশেষ খবর দেখুন')}
            <ArrowDownRight size={18} />
          </a>
        </div>
      </section>
      {data.sections
        .filter((section) => section.enabled)
        .map((item) => {
          const section = sectionById(item.id);
          const entries =
            item.id === 'featured'
              ? data.featured
              : item.id === 'latest'
                ? data.latest
                : section
                  ? data.highlights[section.id] || []
                  : [];
          return (
            <Reveal key={item.id} className={`client-home-section home-${item.id}`}>
              <section
                className="container section-space"
                id={item.id === 'latest' ? 'latest' : item.id}
              >
                <SectionHeading
                  eyebrow={
                    item.id === 'featured'
                      ? t('SELECTED BY THE EDITORIAL DESK', 'সম্পাদকীয় ডেস্কের নির্বাচন')
                      : siteName
                  }
                  title={t(item.name, item.nameBn)}
                  subtitle={section?.description}
                  to={section ? '/' + section.id : undefined}
                  action={t('View all', 'সব দেখুন')}
                />
                {entries.length ? (
                  <div className={item.id === 'featured' ? 'featured-entry-grid' : 'entry-grid'}>
                    {entries.slice(0, item.id === 'latest' ? 8 : 4).map((entry, index) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        prominent={item.id === 'featured' && index === 0}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    section={item.id}
                    title={t(
                      `No ${item.name.toLowerCase()} available yet.`,
                      `এখনো ${item.nameBn} প্রকাশিত হয়নি।`,
                    )}
                    action={section ? t('Visit this section', 'বিভাগটি দেখুন') : undefined}
                    to={section ? '/' + section.id : undefined}
                  />
                )}
              </section>
            </Reveal>
          );
        })}
      {!data.sections.length && (
        <section className="container section-space">
          <div className="topic-directory">
            {contentSections.map((section) => (
              <Link to={'/' + section.id} key={section.id}>
                <span>{t(section.name, section.nameBn)}</span>
                <ArrowUpRight size={19} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
