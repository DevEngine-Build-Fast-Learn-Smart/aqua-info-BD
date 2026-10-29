import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { useSite } from '../../app/SiteProvider';
import type { Article } from '../../data/types';
import { useRemoteList } from '../../lib/useRemoteList';
import { RequestError } from '../../components/ui/DataState';
import { articleTitle } from '../../lib/utils';
export function SearchDialog({ onClose }: { onClose: () => void }) {
  const { data, language, t } = useSite();
  const [query, setQuery] = useState('');
  const result = useRemoteList<Article>('/articles/', { search: query, page_size: 8 });
  const results = result.results;
  return (
    <Modal title={t('Explore the journal', 'জার্নালে খুঁজুন')} onClose={onClose} wide>
      <label className="search-field">
        <Search size={21} />
        <input
          autoFocus
          placeholder={t(
            'Search stories, species, research…',
            'প্রতিবেদন, প্রজাতি, গবেষণা খুঁজুন…',
          )}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <kbd>ESC</kbd>
      </label>
      <p className="eyebrow search-label">
        {query
          ? `${result.count} ${t('STORIES FOUND', 'টি প্রতিবেদন')}`
          : t('FROM THE EDITORIAL DESK', 'সম্পাদকীয় ডেস্ক থেকে')}
      </p>
      <div className="search-results">
        {result.loading ? (
          <p className="muted">{t('Searching…', 'খোঁজা হচ্ছে…')}</p>
        ) : result.error ? (
          <RequestError message={result.error} retry={result.retry} />
        ) : results.length ? (
          results.map((article) => (
            <Link key={article.id} to={`/articles/${article.slug}`} onClick={onClose}>
              <div>
                <span className="eyebrow">
                  {data.categories.find((c) => c.id === article.category)?.name}
                </span>
                <h3>{articleTitle(article, language)}</h3>
              </div>
              <ArrowUpRight size={20} />
            </Link>
          ))
        ) : (
          <p className="muted">
            {t(
              'No stories found. Try a different keyword.',
              'কোনো প্রতিবেদন পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।',
            )}
          </p>
        )}
      </div>
      {result.count > 8 && (
        <Link className="text-link" to={`/news?q=${encodeURIComponent(query)}`} onClick={onClose}>
          {t('View all matching stories', 'সব প্রতিবেদন দেখুন')}
          <ArrowUpRight size={16} />
        </Link>
      )}
    </Modal>
  );
}
