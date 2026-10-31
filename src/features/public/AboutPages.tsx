import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import type { Author, Entry, SitePage } from '../../data/types';
import { useRemoteList } from '../../lib/useRemoteList';
import { useRemoteRecord } from '../../lib/useRemoteRecord';
import { usePageMeta } from '../../lib/usePageMeta';
import { LoadingSkeleton, RequestError } from '../../components/ui/DataState';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { ContentGallery } from './ContentGallery';
import { EntryCard } from './EntryCard';
import { assetUrl } from '../../lib/utils';
import ContactPage from './ContactPage';
export function AboutPage({ pageId = 'about' }: { pageId?: SitePage['id'] }) {
  const { data, t, siteName } = useSite();
  const page = data.pages.find((item) => item.id === pageId && item.status === 'published');
  const title = page
    ? t(page.title, page.titleBn)
    : pageId === 'about'
      ? t('About ', 'পরিচিতি: ') + siteName
      : pageId === 'team'
        ? t('Our Team & Contributors', 'আমাদের দল ও লেখক')
        : t('Contact & Editorial Policy', 'যোগাযোগ ও সম্পাদকীয় নীতি');
  usePageMeta(page?.seoTitle || title, page?.seoDescription);
  return (
    <>
      <section className="container client-about-page">
        <span className="eyebrow">
          {siteName} / {t('ABOUT US', 'আমাদের সম্পর্কে')}
        </span>
        <h1>{title}</h1>
        <div className="client-prose">
          {page?.body ? (
            t(page.body, page.bodyBn)
              .split(/\n\s*\n/)
              .filter(Boolean)
              .map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p>
              {t(
                'The editorial team is preparing this page.',
                'সম্পাদকীয় দল এই পাতাটি প্রস্তুত করছে।',
              )}
            </p>
          )}
        </div>
        <ContentGallery images={page?.gallery} />
        {pageId === 'about' && (
          <nav className="client-about-links">
            <Link to="/about/team">
              {t('Meet the team & contributors', 'আমাদের দল ও লেখক')}
              <ArrowUpRight size={18} />
            </Link>
            <Link to="/about/contact-editorial-policy">
              {t(
                'Contact, editorial standards & submissions',
                'যোগাযোগ, সম্পাদকীয় নীতি ও লেখা জমা',
              )}
              <ArrowUpRight size={18} />
            </Link>
          </nav>
        )}
      </section>
      {pageId === 'team' && <AuthorsDirectory />}
      {pageId === 'editorial-policy' && <ContactPage />}
    </>
  );
}
function AuthorsDirectory() {
  const { t } = useSite();
  const [page, setPage] = useState(1);
  const result = useRemoteList<Author>('/authors/', { page });
  return (
    <section className="container section-space">
      {result.loading ? (
        <LoadingSkeleton />
      ) : result.error ? (
        <RequestError message={result.error} retry={result.retry} />
      ) : result.results.length ? (
        <div className="author-grid">
          {result.results.map((author) => (
            <article className="author-card" key={author.id}>
              {author.image && (
                <img src={assetUrl(author.image)} alt={author.imageAlt} loading="lazy" />
              )}
              <span className="eyebrow">
                {author.isTeam
                  ? t('EDITORIAL TEAM', 'সম্পাদকীয় দল')
                  : t('CONTRIBUTOR', 'লেখক ও বিশেষজ্ঞ')}
              </span>
              <h2>
                <Link to={'/about/team/' + author.id}>{t(author.name, author.nameBn)}</Link>
              </h2>
              <p className="author-role">{t(author.role, author.roleBn)}</p>
              <p>{t(author.bio, author.bioBn)}</p>
              <Link className="text-link" to={'/about/team/' + author.id}>
                {t('Profile & contributions', 'পরিচিতি ও লেখা')}
                <ArrowUpRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          section="authors"
          title={t('Team profiles are being prepared.', 'দলের পরিচিতি প্রস্তুত হচ্ছে।')}
          description={t(
            'Public team and contributor profiles will appear here once the editorial team publishes them.',
            'সম্পাদকীয় দল প্রকাশ করলে এখানে দল ও লেখকদের পরিচিতি দেখা যাবে।',
          )}
        />
      )}
      <Pagination page={page} count={result.count} onChange={setPage} />
    </section>
  );
}
export function AuthorPage() {
  const { id } = useParams(),
    { t } = useSite();
  const [page, setPage] = useState(1);
  const result = useRemoteRecord<Author>('/authors/' + encodeURIComponent(id || '') + '/');
  const entries = useRemoteList<Entry>('/entries/', { author: id, page }, !!id);
  const author = result.record;
  usePageMeta(author ? t(author.name, author.nameBn) : undefined, author?.bio);
  if (result.loading) return <LoadingSkeleton />;
  if (result.error) return <RequestError message={result.error} retry={result.retry} />;
  if (!author) return null;
  return (
    <section className="container client-about-page">
      <div className="author-profile-heading">
        {author.image && <img src={assetUrl(author.image)} alt={author.imageAlt} />}
        <div>
          <span className="eyebrow">
            {author.isTeam ? t('OUR TEAM', 'আমাদের দল') : t('CONTRIBUTOR', 'লেখক')}
          </span>
          <h1>{t(author.name, author.nameBn)}</h1>
          <p>{t(author.role, author.roleBn)}</p>
          {author.website && (
            <a
              className="text-link"
              href={author.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Website', 'ওয়েবসাইট')}
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </div>
      <div className="client-prose">
        {t(author.bio, author.bioBn)
          .split('\n\n')
          .map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
      </div>
      <h2>{t('Contributions', 'প্রকাশিত লেখা')}</h2>
      {entries.loading ? (
        <LoadingSkeleton />
      ) : entries.error ? (
        <RequestError message={entries.error} retry={entries.retry} />
      ) : !entries.results.length ? (
        <EmptyState
          section="authors"
          title={t('No published contributions yet.', 'এখনো কোনো লেখা প্রকাশিত হয়নি।')}
        />
      ) : (
        <div className="entry-grid">
          {entries.results.map((entry) => (
            <EntryCard entry={entry} key={entry.id} />
          ))}
        </div>
      )}
      <Pagination page={page} count={entries.count} onChange={setPage} />
    </section>
  );
}
export function NotFoundPage() {
  const { t } = useSite();
  usePageMeta(t('Page not found', 'পাতাটি পাওয়া যায়নি'), undefined, undefined, { noIndex: true });
  return (
    <section className="container simple-page">
      <span className="eyebrow">404</span>
      <h1>{t('This page could not be found.', 'পাতাটি পাওয়া যায়নি।')}</h1>
      <Link className="button button-primary" to="/">
        {t('Return home', 'হোমে ফিরুন')}
      </Link>
    </section>
  );
}
