import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, FileText, Plus, Search, Trash2 } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { AdminPageHeader } from './AdminPageHeader';
import { assetUrl, formatDate } from '../../lib/utils';
import { Modal } from '../../components/ui/Modal';
import { useRemoteList } from '../../lib/useRemoteList';
import { api } from '../../lib/api';
import type { Article } from '../../data/types';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSkeleton, RequestError } from '../../components/ui/DataState';
export default function ArticlesPage() {
  const { data, refresh, notify } = useSite();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || 'all';
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const result = useRemoteList<Article>('/admin/articles/', {
    search: query,
    category: category === 'all' ? undefined : category,
    status: status === 'all' ? undefined : status,
    page,
  });
  const articles = result.results;
  async function remove() {
    try {
      await api(`/admin/articles/${removeId}/`, { method: 'DELETE' });
      setRemoveId(null);
      notify('Story removed.');
      await refresh();
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'The story could not be removed.');
    }
  }
  return (
    <>
      <AdminPageHeader
        eyebrow="02 / STORIES & FIELD REPORTS"
        title="Good stories start here."
        description="A single library for every story, from the first draft to the front page."
      >
        <Link className="button button-primary" to="/admin/articles/new">
          <Plus size={17} />
          Create a story
        </Link>
      </AdminPageHeader>
      <section className="admin-panel">
        <div className="content-tabs" role="group" aria-label="Filter by status">
          {['all', 'published', 'draft'].map((value) => (
            <button
              key={value}
              className={status === value ? 'active' : ''}
              onClick={() => {
                setPage(1);
                setParams(value === 'all' ? {} : { status: value });
              }}
            >
              {value === 'all' ? 'All stories' : value === 'draft' ? 'Drafts' : 'Published'}
              <span>
                {value === 'all'
                  ? data.counts?.articles || 0
                  : value === 'published'
                    ? data.counts?.published || 0
                    : data.counts?.drafts || 0}
              </span>
            </button>
          ))}
        </div>
        <div className="admin-filters">
          <label className="search-field">
            <Search size={17} />
            <input
              placeholder="Search by title or author…"
              aria-label="Search stories"
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
            />
          </label>
          <select
            aria-label="Filter category"
            value={category}
            onChange={(event) => {
              setPage(1);
              setCategory(event.target.value);
            }}
          >
            <option value="all">All editorial categories</option>
            {data.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span>{result.count} stories</span>
        </div>
        {result.error && <RequestError message={result.error} retry={result.retry} />}
        {result.loading && <LoadingSkeleton />}
        <div className="table-scroll" hidden={result.loading || !!result.error}>
          <table className="data-table editorial-table stories-table">
            <thead>
              <tr>
                <th>STORY & AUTHOR</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>PUBLISHED DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>
                    <Link className="story-table-title" to={`/admin/articles/${article.id}`}>
                      <img src={assetUrl(article.image || '/assets/logo.png')} alt="" />
                      <span>
                        <strong>{article.title}</strong>
                        <small>{article.author}</small>
                      </span>
                    </Link>
                  </td>
                  <td>{data.categories.find((c) => c.id === article.category)?.name}</td>
                  <td>
                    <span className={`status-badge ${article.status}`}>{article.status}</span>
                  </td>
                  <td className="date-cell">{formatDate(article.date)}</td>
                  <td>
                    <div className="table-actions">
                      <Link
                        className="icon-button"
                        to={`/admin/articles/${article.id}`}
                        aria-label={`Edit ${article.title}`}
                      >
                        <ArrowUpRight size={17} />
                      </Link>
                      <button
                        className="icon-button danger-hover"
                        aria-label={`Delete ${article.title}`}
                        onClick={() => setRemoveId(article.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!result.loading && !result.error && !articles.length && (
          <div className="admin-empty">
            <FileText size={30} />
            <h3>No stories in this view.</h3>
            <p>Change your filters or start a new story.</p>
          </div>
        )}
        <Pagination page={page} count={result.count} onChange={setPage} />
      </section>
      {removeId && (
        <Modal title="Remove this story?" onClose={() => setRemoveId(null)}>
          <p>
            This removes “{articles.find((a) => a.id === removeId)?.title}” from the publication and
            public website.
          </p>
          <div className="modal-actions">
            <button className="button button-outline" onClick={() => setRemoveId(null)}>
              Keep story
            </button>
            <button className="button button-danger" onClick={remove}>
              Remove story
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
