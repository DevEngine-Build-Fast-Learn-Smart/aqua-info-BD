import { useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { ArticleCard } from './ArticleCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { MarketStrip } from './MarketStrip';
import { useRemoteList } from '../../lib/useRemoteList';
import { useSavedArticles } from '../../lib/useSavedArticles';
import type { Article } from '../../data/types';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSkeleton, RequestError } from '../../components/ui/DataState';
export default function ArchivePage({ savedOnly = false }: { savedOnly?: boolean }) {
  const { data, saved, t } = useSite();
  const location = useLocation();
  const category = data.categories.find((c) => `/${c.id}` === location.pathname);
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const remote = useRemoteList<Article>(
    '/articles/',
    {
      category: category?.id,
      search: query,
      ordering: sort === 'newest' ? '-date' : 'title',
      page,
    },
    !savedOnly,
  );
  const reading = useSavedArticles(saved, savedOnly);
  const articles = useMemo(
    () =>
      reading.articles
        .filter(
          (a) =>
            a.status === 'published' &&
            (!category || a.category === category.id) &&
            (!savedOnly || saved.includes(a.id)) &&
            `${a.title} ${a.titleBn} ${a.excerpt} ${a.author}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === 'newest' ? b.date.localeCompare(a.date) : a.title.localeCompare(b.title),
        ),
    [reading.articles, category, query, saved, savedOnly, sort],
  );
  const visibleArticles = savedOnly ? articles.slice((page - 1) * 24, page * 24) : remote.results;
  const count = savedOnly ? articles.length : remote.count;
  const loading = savedOnly ? reading.loading : remote.loading;
  const error = savedOnly ? reading.error : remote.error;
  return (
    <>
      <MarketStrip />
      <div className="container archive-page">
        <div className="page-intro">
          <Link className="eyebrow breadcrumb" to="/home">
            {t('THE JOURNAL', 'জার্নাল')}
            <ArrowRight size={12} />
            {t(
              savedOnly ? 'READING LIST' : 'THE NEWS DESK',
              savedOnly ? 'পাঠতালিকা' : 'সংবাদ ডেস্ক',
            )}
          </Link>
          <h1>
            {savedOnly
              ? t('Your Reading List', 'আপনার পাঠতালিকা')
              : category
                ? t(category.name, category.nameBn)
                : t('The News Desk', 'সংবাদ ডেস্ক')}
          </h1>
          <p>
            {savedOnly
              ? t(
                  'Stories you’ve set aside for a more considered moment.',
                  'সময় নিয়ে পড়ার জন্য সংরক্ষিত গল্প।',
                )
              : category?.description ||
                t(
                  'Reporting, research, and perspectives from Bangladesh’s changing waters.',
                  'বাংলাদেশের পরিবর্তনশীল জলজ পরিবেশের প্রতিবেদন, গবেষণা ও দৃষ্টিভঙ্গি।',
                )}
          </p>
        </div>
        <div className="archive-controls">
          <label className="search-field">
            <Search size={18} />
            <input
              aria-label="Filter stories"
              placeholder={t('Find a story in this collection…', 'এই সংগ্রহে খুঁজুন…')}
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
            />
          </label>
          <label className="sort-control">
            <SlidersHorizontal size={16} />
            <span className="sr-only">Sort stories</span>
            <select
              value={sort}
              onChange={(event) => {
                setPage(1);
                setSort(event.target.value);
              }}
            >
              <option value="newest">{t('Newest first', 'নতুন আগে')}</option>
              <option value="title">{t('By title', 'শিরোনাম অনুযায়ী')}</option>
            </select>
          </label>
          <span className="caption">
            {count} {t('stories', 'টি প্রতিবেদন')}
          </span>
        </div>
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <RequestError message={error} retry={savedOnly ? reading.retry : remote.retry} />
        ) : visibleArticles.length ? (
          <div className="archive-grid">
            {visibleArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t(
              savedOnly && !query ? 'A little space for your next good read.' : 'No stories found.',
              'কোনো প্রতিবেদন পাওয়া যায়নি।',
            )}
            description={t(
              savedOnly && !query
                ? 'Use the bookmark beside any story to save it here.'
                : 'Try another search or explore the latest field reports.',
              'অন্য শব্দ দিয়ে খুঁজুন অথবা সর্বশেষ প্রতিবেদন দেখুন।',
            )}
          />
        )}
        <Pagination page={page} count={count} onChange={setPage} />
      </div>
    </>
  );
}
