import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, Headphones, Share2 } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import type { Entry } from '../../data/types';
import { entryPath, sectionById, type ContentSection } from '../../data/catalog';
import { useRemoteRecord } from '../../lib/useRemoteRecord';
import { useRemoteList } from '../../lib/useRemoteList';
import { usePageMeta } from '../../lib/usePageMeta';
import { assetUrl, formatDate, today } from '../../lib/utils';
import { LoadingSkeleton, RequestError } from '../../components/ui/DataState';
import { ContentGallery } from './ContentGallery';
import { EntryCard } from './EntryCard';
export default function EntryPage({ section }: { section: ContentSection }) {
  const { slug } = useParams();
  const { data, t, language, notify } = useSite();
  const result = useRemoteRecord<Entry>(`/entries/${encodeURIComponent(slug || '')}/`);
  const entry = result.record;
  const related = useRemoteList<Entry>('/entries/', { section, page_size: 4 });
  usePageMeta(
    entry?.seoTitle || (entry ? t(entry.title, entry.titleBn) : undefined),
    entry?.seoDescription || entry?.excerpt,
    entry?.image,
    {
      type: 'article',
      publishedAt: entry?.date,
      updatedAt: entry?.updatedAt || entry?.date,
      authorName: entry?.authorDetails
        ? t(entry.authorDetails.name, entry.authorDetails.nameBn)
        : entry?.author,
      sectionName: section,
    },
  );
  if (result.loading) return <LoadingSkeleton />;
  if (result.error)
    return (
      <div className="container simple-page">
        <RequestError message={result.error} retry={result.retry} />
        <Link className="text-link" to={'/' + section}>
          <ArrowLeft size={16} />
          {t('Back to section', 'বিভাগে ফিরুন')}
        </Link>
      </div>
    );
  if (!entry || entry.section !== section)
    return (
      <section className="container simple-page">
        <h1>{t('Content not found', 'বিষয়বস্তু পাওয়া যায়নি')}</h1>
        <Link to={'/' + section}>{t('Back to section', 'বিভাগে ফিরুন')}</Link>
      </section>
    );
  const category = data.categories.find((item) => item.id === entry.category),
    expired = !!entry.deadline && entry.deadline < today();
  const body = t(entry.body, entry.bodyBn),
    author = entry.authorDetails;
  const eventDate = (value: string) =>
    new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-GB', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Asia/Dhaka',
    }).format(new Date(value));
  async function share() {
    try {
      if (navigator.share)
        await navigator.share({ title: entry!.title, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        notify(t('Link copied.', 'লিংক কপি হয়েছে।'));
      }
    } catch {
      /* Share can be cancelled. */
    }
  }
  return (
    <>
      <article className="container client-story">
        <nav className="client-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">{t('Home', 'হোম')}</Link>
          <span>/</span>
          <Link to={'/' + section}>
            {t(sectionById(section)?.name || '', sectionById(section)?.nameBn)}
          </Link>
          {category && (
            <>
              <span>/</span>
              <Link to={`/${section}/${category.slug}`}>{t(category.name, category.nameBn)}</Link>
            </>
          )}
        </nav>
        <header className="client-story-header">
          <span className="eyebrow">
            {t(category?.name || sectionById(section)?.name || '', category?.nameBn)}
          </span>
          <h1>{t(entry.title, entry.titleBn)}</h1>
          {entry.excerpt && (
            <p className="client-story-deck">{t(entry.excerpt, entry.excerptBn)}</p>
          )}
          <div className="client-story-byline">
            <div>
              {author ? (
                <Link to={'/about/team/' + author.id}>{t(author.name, author.nameBn)}</Link>
              ) : (
                <strong>{entry.author}</strong>
              )}
              <span>
                {formatDate(entry.date, language)}
                {entry.readTime && ` · ${entry.readTime} ${t('min read', 'মিনিট পড়া')}`}
              </span>
            </div>
            <button className="button button-outline button-small" onClick={share}>
              <Share2 size={16} />
              {t('Share', 'শেয়ার')}
            </button>
          </div>
        </header>
        {entry.image && (
          <figure className="client-story-cover">
            <img
              src={assetUrl(entry.image)}
              alt={entry.imageAlt || t(entry.title, entry.titleBn)}
            />
            <figcaption>{entry.imageAlt}</figcaption>
          </figure>
        )}
        <div className="client-story-layout">
          <div className="client-story-body">
            {section === 'podcast' && (
              <section
                className="podcast-player"
                aria-label={t('Podcast player', 'পডকাস্ট প্লেয়ার')}
              >
                <span className="eyebrow">
                  <Headphones size={16} />
                  {entry.episodeNumber
                    ? `${t('EPISODE', 'পর্ব')} ${entry.episodeNumber}`
                    : t('LISTEN', 'শুনুন')}
                  {entry.duration && ` · ${entry.duration}`}
                </span>
                {entry.embedUrl && (
                  <iframe
                    src={entry.embedUrl}
                    title={t(entry.title, entry.titleBn)}
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                )}
                {entry.audioUrl && (
                  <audio controls preload="none" src={entry.audioUrl}>
                    Your browser does not support audio playback.{' '}
                    <a href={entry.audioUrl}>Open audio</a>
                  </audio>
                )}
                {entry.audioUrl && (
                  <a
                    className="text-link"
                    href={entry.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('Open hosted audio', 'অডিও খুলুন')}
                    <ArrowUpRight size={16} />
                  </a>
                )}
              </section>
            )}
            {section === 'events' && (
              <div className="entry-facts">
                <h2>
                  <CalendarDays size={22} />
                  {t('Event details', 'অনুষ্ঠানের তথ্য')}
                </h2>
                {entry.eventStart && (
                  <p>
                    <strong>{t('Starts', 'শুরু')}:</strong> {eventDate(entry.eventStart)}{' '}
                    (Asia/Dhaka)
                  </p>
                )}
                {entry.eventEnd && (
                  <p>
                    <strong>{t('Ends', 'শেষ')}:</strong> {eventDate(entry.eventEnd)}
                  </p>
                )}
                <p>
                  {entry.venue}
                  {entry.location && ` · ${entry.location}`} · {entry.eventFormat}
                </p>
                {entry.registrationUrl && (
                  <a
                    className="button button-primary"
                    href={entry.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('Registration & details', 'নিবন্ধন ও বিস্তারিত')}
                    <ArrowUpRight size={17} />
                  </a>
                )}
              </div>
            )}
            {section === 'careers' && (
              <div className="entry-facts">
                <h2>{entry.organization}</h2>
                {[entry.employmentType, entry.location, entry.salary]
                  .filter(Boolean)
                  .map((value) => (
                    <p key={value}>{value}</p>
                  ))}
                {entry.deadline && (
                  <p>
                    <strong>{t('Deadline', 'শেষ তারিখ')}:</strong>{' '}
                    {formatDate(entry.deadline, language)}{' '}
                    {expired && <span className="status-badge">{t('Closed', 'সময় শেষ')}</span>}
                  </p>
                )}
                {entry.applicationUrl && !expired && (
                  <a
                    className="button button-primary"
                    href={entry.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('Apply / official details', 'আবেদন ও অফিসিয়াল তথ্য')}
                    <ArrowUpRight size={17} />
                  </a>
                )}
              </div>
            )}
            {body
              .split(/\n\s*\n/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            {section === 'publications' && (entry.doi || entry.citation) && (
              <aside className="publication-citation">
                <h2>{t('Publication details', 'প্রকাশনার তথ্য')}</h2>
                {entry.doi && (
                  <p>
                    <strong>DOI:</strong> {entry.doi}
                  </p>
                )}
                {entry.citation && <p>{entry.citation}</p>}
              </aside>
            )}
            <ContentGallery images={entry.gallery} />
            <div className="client-story-links">
              {entry.fileUrl && (
                <a
                  className="button button-primary"
                  href={entry.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download size={17} />
                  {t('Open document / resource', 'নথি ও উপকরণ খুলুন')}
                </a>
              )}
              {entry.recordingUrl && (
                <a
                  className="button button-outline"
                  href={entry.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('Event recording', 'অনুষ্ঠানের রেকর্ডিং')}
                  <ArrowUpRight size={17} />
                </a>
              )}
              {entry.sourceUrl && (
                <a
                  className="text-link"
                  href={entry.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('Original source', 'মূল উৎস')}
                  <ArrowUpRight size={17} />
                </a>
              )}
            </div>
            {author && (
              <aside className="entry-author-bio">
                {author.image && <img src={assetUrl(author.image)} alt={author.imageAlt} />}
                <div>
                  <span className="eyebrow">{t('ABOUT THE CONTRIBUTOR', 'লেখক পরিচিতি')}</span>
                  <h2>
                    <Link to={'/about/team/' + author.id}>{t(author.name, author.nameBn)}</Link>
                  </h2>
                  <p>{t(author.bio, author.bioBn)}</p>
                </div>
              </aside>
            )}
          </div>
          <aside className="client-story-aside">
            <span className="eyebrow">{t('IN THIS SECTION', 'এই বিভাগে')}</span>
            {related.results
              .filter((item) => item.id !== entry.id)
              .slice(0, 3)
              .map((item) => (
                <Link to={entryPath(item)} key={item.id}>
                  <h3>{t(item.title, item.titleBn)}</h3>
                  <ArrowUpRight size={17} />
                </Link>
              ))}
            <Link className="text-link" to={'/' + section}>
              {t('Explore this section', 'সব দেখুন')}
              <ArrowUpRight size={16} />
            </Link>
          </aside>
        </div>
      </article>
      <section className="container section-space">
        <h2>{t('More to explore', 'আরও পড়ুন')}</h2>
        <div className="entry-grid">
          {related.results
            .filter((item) => item.id !== entry.id)
            .slice(0, 3)
            .map((item) => (
              <EntryCard key={item.id} entry={item} />
            ))}
        </div>
      </section>
    </>
  );
}
