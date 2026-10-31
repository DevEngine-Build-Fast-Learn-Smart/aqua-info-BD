import { useSearchParams, useParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { contentSections, sectionById, type ContentSection } from '../../data/catalog';
import type { Entry } from '../../data/types';
import { useRemoteList } from '../../lib/useRemoteList';
import { LoadingSkeleton, RequestError } from '../../components/ui/DataState';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { EntryCard } from './EntryCard';
import { usePageMeta } from '../../lib/usePageMeta';
export default function EntryListPage({ section: sectionId }: { section?: ContentSection }) {
  const { data, t, siteName } = useSite();
  const { topic } = useParams();
  const [params, setParams] = useSearchParams();
  const section = sectionId ? sectionById(sectionId) : undefined;
  const selected = data.categories.find(
    (category) => category.section === sectionId && category.slug === topic,
  );
  const staticTopic = section?.topics.find((item) => item.slug === topic);
  const page = Math.max(1, Number(params.get('page')) || 1),
    query = params.get('q') || '';
  const isEvents = sectionId === 'events',
    period = isEvents ? (topic === 'archive' ? 'archive' : 'upcoming') : undefined;
  const topicFilter = isEvents && (!topic || topic === 'archive') ? undefined : topic;
  const result = useRemoteList<Entry>('/entries/', {
    section: sectionId,
    topic: topicFilter,
    period,
    search: query,
    page,
    ordering: isEvents ? (period === 'archive' ? '-event_start' : 'event_start') : '-date',
  });
  const title = topic
    ? t(selected?.name || staticTopic?.name || 'Content', selected?.nameBn || staticTopic?.nameBn)
    : section
      ? t(section.name, section.nameBn)
      : t('Search ', 'খুঁজুন: ') + siteName;
  usePageMeta(title, section?.description);
  function search(value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set('q', value);
    else next.delete('q');
    next.delete('page');
    setParams(next, { replace: true });
  }
  if (topic && !selected && !staticTopic)
    return (
      <div className="container simple-page">
        <h1>{t('Page not found', 'পাতাটি পাওয়া যায়নি')}</h1>
        <Link to={'/' + sectionId}>{t('Back to section', 'বিভাগে ফিরুন')}</Link>
      </div>
    );
  return (
    <section className="container client-list-page">
      <header className="client-page-heading">
        <span className="eyebrow">
          {siteName} / {section ? t(section.name, section.nameBn) : t('DISCOVER', 'অনুসন্ধান')}
        </span>
        <h1>{title}</h1>
        <p>
          {section?.description ||
            t(
              'Find news, guides, podcasts, publications and opportunities.',
              'সংবাদ, নির্দেশিকা, পডকাস্ট, প্রকাশনা ও সুযোগ খুঁজুন।',
            )}
        </p>
      </header>
      {section && (
        <nav className="client-topic-tabs" aria-label="Section topics">
          <Link className={!topic ? 'active' : ''} to={'/' + section.id}>
            {t('All', 'সব')}
          </Link>
          {section.topics
            .filter((item) => item.path !== '/' + section.id)
            .map((item) => (
              <Link className={topic === item.slug ? 'active' : ''} to={item.path} key={item.slug}>
                {t(item.name, item.nameBn)}
              </Link>
            ))}
        </nav>
      )}
      <div className="client-list-tools">
        <label className="client-search-field">
          <Search size={19} />
          <input
            type="search"
            value={query}
            onChange={(event) => search(event.target.value)}
            placeholder={t('Search this collection…', 'এই বিভাগে খুঁজুন…')}
            aria-label={t('Search content', 'বিষয়বস্তু খুঁজুন')}
          />
        </label>
        <span className="caption">
          {result.count} {t('results', 'ফলাফল')}
        </span>
      </div>
      {!section && (
        <nav className="client-topic-tabs" aria-label="Browse sections">
          {contentSections.map((item) => (
            <Link to={'/' + item.id} key={item.id}>
              {t(item.name, item.nameBn)}
            </Link>
          ))}
        </nav>
      )}
      {result.loading ? (
        <LoadingSkeleton />
      ) : result.error ? (
        <RequestError message={result.error} retry={result.retry} />
      ) : result.results.length ? (
        <div className="entry-grid">
          {result.results.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <EmptyState
          section={query ? 'search' : sectionId}
          title={query ? t('No matching results found.', 'কোনো মিল পাওয়া যায়নি।') : undefined}
          description={
            query
              ? t(
                  'Please try a different keyword or browse another section.',
                  'অন্য শব্দ দিয়ে খুঁজুন অথবা অন্য বিভাগ দেখুন।',
                )
              : undefined
          }
        />
      )}
      <Pagination
        page={page}
        count={result.count}
        onChange={(value) => {
          const next = new URLSearchParams(params);
          next.set('page', String(value));
          setParams(next);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
      />
    </section>
  );
}
