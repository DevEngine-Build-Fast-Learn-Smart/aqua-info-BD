import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { sectionById, entryPath, type ContentSection } from '../../data/catalog';
import type { Entry } from '../../data/types';
import { useRemoteList } from '../../lib/useRemoteList';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { EmptyState } from '../../components/ui/EmptyState';
import { AdminPageHeader } from './AdminPageHeader';
import { LoadingSkeleton, RequestError } from '../../components/ui/DataState';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
export default function ContentListPage({ section }: { section: ContentSection }) {
  const { data, refresh, notify } = useSite();
  const config = sectionById(section)!;
  const [query, setQuery] = useState(''),
    [status, setStatus] = useState(''),
    [category, setCategory] = useState(''),
    [page, setPage] = useState(1),
    [removing, setRemoving] = useState<Entry | null>(null),
    [busy, setBusy] = useState(false);
  const result = useRemoteList<Entry>('/admin/entries/', {
    section,
    search: query,
    status,
    category,
    page,
  });
  async function remove() {
    if (!removing) return;
    setBusy(true);
    try {
      await api('/admin/entries/' + removing.id + '/', { method: 'DELETE' });
      setRemoving(null);
      if (page > 1 && result.results.length === 1) setPage(page - 1);
      await refresh();
      notify('Content deleted.');
    } catch (reason) {
      throw reason instanceof Error ? reason : new Error('Could not delete content.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <AdminPageHeader
        eyebrow={'CONTENT / ' + config.name.toUpperCase()}
        title={config.name}
        description={config.description}
      >
        <Link className="button button-primary" to={`/admin/${section}/new`}>
          <Plus size={17} />
          Create{' '}
          {section === 'podcast'
            ? 'episode'
            : section === 'events'
              ? 'event'
              : section === 'careers'
                ? 'opportunity'
                : 'content'}
        </Link>
      </AdminPageHeader>
      <section className="admin-panel">
        <div className="cms-list-toolbar">
          <label className="client-search-field">
            <Search size={18} />
            <input
              type="search"
              aria-label="Search this section"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search titles, authors or organizations…"
            />
          </label>
          <select
            aria-label="Publication status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published / scheduled</option>
          </select>
          <select
            aria-label="Content category"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {data.categories
              .filter((item) => item.section === section)
              .map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>
        {result.loading ? (
          <LoadingSkeleton />
        ) : result.error ? (
          <RequestError message={result.error} retry={result.retry} />
        ) : (
          <div className="cms-content-list">
            {result.results.map((entry) => (
              <article key={entry.id}>
                <div>
                  <span className={`status-badge status-${entry.status}`}>{entry.status}</span>
                  {entry.featured && <span className="cms-featured-label">Featured</span>}
                  <h2>
                    <Link to={`/admin/${section}/${entry.id}`}>{entry.title}</Link>
                  </h2>
                  <p>
                    {data.categories.find((item) => item.id === entry.category)?.name} ·{' '}
                    {formatDate(entry.date)}
                    {entry.organization && ' · ' + entry.organization}
                  </p>
                </div>
                <div className="cms-row-actions">
                  {entry.status === 'published' && (
                    <Link
                      className="icon-button"
                      to={entryPath(entry)}
                      target="_blank"
                      aria-label={'View ' + entry.title}
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  )}
                  <Link
                    className="icon-button"
                    to={`/admin/${section}/${entry.id}`}
                    aria-label={'Edit ' + entry.title}
                  >
                    <Pencil size={17} />
                  </Link>
                  <button
                    className="icon-button"
                    onClick={() => setRemoving(entry)}
                    aria-label={'Delete ' + entry.title}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
            {!result.results.length && (
              <EmptyState
                section={section}
                title="No entries have been added yet."
                description="Create the first item to begin. Draft content remains private until you publish it."
              />
            )}
          </div>
        )}
        <Pagination page={page} count={result.count} onChange={setPage} />
      </section>
      {removing && (
        <ConfirmDeleteDialog
          name={removing.title}
          note={undefined}
          onClose={() => !busy && setRemoving(null)}
          onConfirm={remove}
        />
      )}
    </>
  );
}
