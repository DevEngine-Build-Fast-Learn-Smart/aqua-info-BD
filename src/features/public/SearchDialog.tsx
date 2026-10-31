import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight, ArrowRight, LoaderCircle, X } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { useSite } from '../../app/SiteProvider';
import { useRemoteList } from '../../lib/useRemoteList';
import type { Entry } from '../../data/types';
import { entryPath, sectionById, contentSections } from '../../data/catalog';
export function SearchDialog({ onClose }: { onClose: () => void }) {
  const { t, siteName } = useSite();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const result = useRemoteList<Entry>('/entries/', { search: query, page_size: 8 }, !!query.trim());
  function submit(event: FormEvent) {
    event.preventDefault();
    navigate('/search?q=' + encodeURIComponent(query.trim()));
    onClose();
  }
  return (
    <Modal wide title={t('Search ', 'খুঁজুন: ') + siteName} onClose={onClose}>
      <div className="search-experience">
        <p className="search-introduction">
          {t(
            'Find a fresh perspective. Search stories, episodes, research and opportunities.',
            'প্রতিবেদন, পডকাস্ট, গবেষণা ও সুযোগের মধ্যে নতুন ভাবনা খুঁজুন।',
          )}
        </p>
        <form className="search-dialog-form" onSubmit={submit}>
          <Search size={25} />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('What would you like to explore?', 'আপনি কী খুঁজতে চান?')}
            aria-label={t('Search website', 'ওয়েবসাইটে খুঁজুন')}
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => setQuery('')}
            >
              <X size={18} />
            </button>
          )}
          <button type="submit" className="search-submit" aria-label="Search">
            <ArrowRight size={21} />
          </button>
        </form>
        {!query.trim() ? (
          <div className="search-discover">
            <span className="eyebrow">{t('BROWSE BY SECTION', 'বিভাগ অনুযায়ী দেখুন')}</span>
            <div>
              {contentSections.map((section) => (
                <Link to={'/' + section.id} key={section.id} onClick={onClose}>
                  {t(section.name, section.nameBn)}
                  <ArrowUpRight size={15} />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="client-search-results" aria-live="polite">
            {result.loading ? (
              <p className="search-loading">
                <LoaderCircle className="spin" size={20} />
                {t('Finding relevant content…', 'সংশ্লিষ্ট বিষয়বস্তু খোঁজা হচ্ছে…')}
              </p>
            ) : result.error ? (
              <p role="alert" className="form-error">
                {result.error}
              </p>
            ) : result.results.length ? (
              <>
                <div className="search-results-label">
                  <span className="eyebrow">{t('SEARCH RESULTS', 'অনুসন্ধানের ফলাফল')}</span>
                  <span>
                    {result.count} {t('found', 'ফলাফল')}
                  </span>
                </div>
                {result.results.map((entry) => (
                  <Link key={entry.id} to={entryPath(entry)} onClick={onClose}>
                    <span className="eyebrow">
                      {t(
                        sectionById(entry.section)?.name || '',
                        sectionById(entry.section)?.nameBn,
                      )}
                    </span>
                    <strong>{t(entry.title, entry.titleBn)}</strong>
                    <ArrowUpRight size={19} />
                  </Link>
                ))}
              </>
            ) : (
              <EmptyState
                section="search"
                title={t('No matching content found.', 'কোনো মিল পাওয়া যায়নি।')}
                description={t(
                  'Try a shorter phrase or a different keyword.',
                  'ছোট বাক্য বা অন্য শব্দ দিয়ে খুঁজুন।',
                )}
              />
            )}
          </div>
        )}
        {query.trim() && (
          <Link
            className="search-view-all"
            to={'/search?q=' + encodeURIComponent(query.trim())}
            onClick={onClose}
          >
            {t('View all results', 'সব ফলাফল দেখুন')}
            <ArrowRight size={18} />
          </Link>
        )}
        <div className="search-footer-hint">
          <span>
            {t('Search across all eight content sections', 'সব বিষয়ভিত্তিক বিভাগে অনুসন্ধান')}
          </span>
          <span>
            <kbd>esc</kbd> {t('to close', 'বন্ধ করুন')}
          </span>
        </div>
      </div>
    </Modal>
  );
}
